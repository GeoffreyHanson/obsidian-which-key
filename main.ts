import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';

const { log } = console;

interface MyPluginSettings {
  mySetting: string;
}

// Define types for the WhichKey mappings
interface WhichKeyCommand {
  name: string;
  commandId?: string;
  children?: Record<string, WhichKeyCommand>;
}

// Define types for Obsidian commands
interface ObsidianCommand {
  id: string;
  name: string;
  icon?: string;
  hotkeys?: string[];
  callback?: (...args: any[]) => any;
  editorCallback?: (editor: Editor, view: MarkdownView) => any;
  checkCallback?: (checking: boolean) => boolean | void;
}

interface ObsidianCommands {
  commands: Record<string, ObsidianCommand>;
  executeCommandById(id: string): boolean;
}

// Extend the App interface to include commands
declare module 'obsidian' {
  interface App {
    commands: ObsidianCommands;
  }
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};

class TrieNode {
  children: Map<string, TrieNode>;
  name?: string;
  commandId?: string;
  isEndOfCommand: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfCommand = false;
  }
}

class CommandTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  // Currently only used for category insertion
  insert(sequence: string, command: WhichKeyCommand) {
    let current = this.root;

    for (const key of sequence) {
      if (!current.children.has(key)) {
        current.children.set(key, new TrieNode());
      }
      const next = current.children.get(key);
      if (next) {
        current = next;
      } else {
        // Handle the unlikely case where the node doesn't exist
        return;
      }
    }

    current.name = command.name;
    current.commandId = command.commandId;
    current.isEndOfCommand = true;
  }

  // Used directly before execution
  search(sequence: string): WhichKeyCommand | null {
    let current = this.root;

    for (const key of sequence) {
      if (!current.children.has(key)) {
        return null;
      }
      const next = current.children.get(key);
      if (!next) {
        return null;
      }
      current = next;
    }
    const result = current.isEndOfCommand
      ? { name: current.name || '', commandId: current.commandId }
      : null;
    return result;
  }

  // Get all possible completions for a prefix
  getPossibleCommands(prefix: string): Array<{ key: string; command: WhichKeyCommand }> {
    let current = this.root;

    // If prefix is activation, no need to walk
    if (prefix !== ' ') {
      // Walk down to prefix node
      for (const key of prefix) {
        if (!current.children.has(key)) {
          return [];
        }
        const next = current.children.get(key);
        if (!next) {
          return [];
        }
        current = next;
      }
    }

    const possibilities: Array<{ key: string; command: WhichKeyCommand }> = [];
    // Loop across children
    current.children.forEach((node, key) => {
      if (node.name) {
        possibilities.push({
          key,
          command: {
            name: node.name,
            commandId: node.commandId,
          },
        });
      }
    });

    return possibilities;
  }

  // Inserts nested commands into the trie under each category
  insertCommands(category: string, commands) {
    // Get first letter of each word as prefix options
    const categoryPrefixOptions = category.split('-').map(word => word[0].toUpperCase());

    // Check if the prefix exists
    const categoryNode = this.root.children.get(categoryPrefixOptions[0]);
    if (!categoryNode) {
      this.insert(categoryPrefixOptions[0], {
        name: category,
        commandId: undefined,
      });
    }
    // TODO: Defaulting behavior for categories
    // else if (categoryNode && this.root.children.get(categoryPrefixOptions[1])) {

    // Insert commands into the category node
    Object.entries(commands).forEach(([abvCommandName, command]) => {
      const sequenceOptions = abvCommandName.split('-').map(word => word[0].toLowerCase());
      let current = this.root.children.get(categoryPrefixOptions[0]);

      // Only insert as many keys as needed
      // If the prefix doesn't exist, create it
      if (!current?.children.has(sequenceOptions[0])) {
        current?.children.set(sequenceOptions[0], new TrieNode());
      }
      // TODO: Defaulting behavior for nested commands
      // If the node already exists for this prefix, exit the loop
      else if (sequenceOptions[1] && current.children.has(sequenceOptions[1])) {
        return;
      }
      const next = current?.children.get(sequenceOptions[0]);
      if (next) {
        current = next;
      } else {
        return;
      }

      current.name = command.name;
      current.commandId = command.commandId;
      current.isEndOfCommand = true;
    });
  }
}

function interceptKeyPress(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
}

// Categorize commands and insert them into the trie
function categorizeCommands(app: App) {
  const { commands } = app.commands;
  const commandTrie = new CommandTrie();
  log('all commands:', commands);

  const categorizedCommands = {};

  Object.entries(commands).forEach(entry => {
    const [id, command] = entry;
    const [category, subCommand] = id.split(':');

    // If the category doesn't exist, create it
    if (!categorizedCommands[category]) {
      categorizedCommands[category] = {};
    }

    categorizedCommands[category][subCommand] = {
      name: command.name,
      commandId: command.id,
      icon: command.icon ?? '',
      hotkeys: command.hotkeys ?? [],
      callback: command.callback || command.editorCallback || command.checkCallback,
    };
  });

  // Sort categories based on number of commands
  const sortedCommands = Object.entries(categorizedCommands).sort(
    ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
  );

  sortedCommands.forEach(([category, relevantCommands]) => {
    commandTrie.insertCommands(category, relevantCommands);
  });

  log(commandTrie);
  return commandTrie;
}

/**
 * Shared key handler function to process key events for both editor and global contexts
 */
function updateKeySequence(
  event: KeyboardEvent,
  context: {
    app: App;
    commandTrie: CommandTrie;
    recordingSequence: boolean;
    setRecordingSequence: (value: boolean) => void;
    currentKeySequence: string;
    setCurrentKeySequence: (value: string) => void;
    interceptKeyPress: (event: KeyboardEvent) => void;
    showPossibleCommands: (prefix: string) => void;
  }
) {
  const { key } = event;
  let { currentKeySequence } = context;
  const {
    app,
    commandTrie,
    recordingSequence,
    setRecordingSequence,
    setCurrentKeySequence,
    interceptKeyPress,
    showPossibleCommands,
  } = context;

  // Check if we should start recording a sequence
  if (key === ' ' && !recordingSequence) {
    log('Space pressed, start recording');
    setRecordingSequence(true);
    setCurrentKeySequence(' ');

    // Show root level commands
    // TODO: Remove this abstraction
    showPossibleCommands('');

    interceptKeyPress(event);
    return;
  }

  // If the key pressed isn't space not recording, exit & intercept press
  if (!recordingSequence) return;
  interceptKeyPress(event);

  // If recording, add the new key & update state
  currentKeySequence = currentKeySequence === ' ' ? key : currentKeySequence + key;
  setCurrentKeySequence(currentKeySequence);

  // Show possible completions for the current sequence
  showPossibleCommands(currentKeySequence);

  // Check if the sequence resolves to a command
  const command = commandTrie.search(currentKeySequence);
  if (command && command.commandId) {
    // Execute the command
    app.commands.executeCommandById(command.commandId);
    setRecordingSequence(false);
    setCurrentKeySequence('');
  } else if (commandTrie.getPossibleCommands(currentKeySequence).length === 0) {
    // No possible completions, reset
    setRecordingSequence(false);
    setCurrentKeySequence('');
  }
}

class WhichKeyUI {
  private app: App;
  private container: HTMLElement;
  private visible = false;
  private sharedState: SharedState;

  constructor(app: App, sharedState: SharedState) {
    this.app = app;
    this.sharedState = sharedState;
    // this.createContainer();
  }

  private createContainer() {
    this.container = document.createElement('div');
    this.container.addClass('which-key-container');

    // Container Title
    const keyPressed = document.createElement('div');
    keyPressed.addClass('which-key-pressed');
    this.container.appendChild(keyPressed);

    // Possible Commands
    const possibleCommands = document.createElement('div');
    possibleCommands.addClass('which-key-commands');
    this.container.appendChild(possibleCommands);

    // Add container to the DOM
    document.body.appendChild(this.container);
  }

  showCommands(commands: Array<{ key: string; command: WhichKeyCommand }>, prefix: string) {
    if (!this.container) {
      this.createContainer();
    }

    this.container.style.display = 'block';
    this.visible = true;

    const title = this.container.querySelector('.which-key-pressed');
    if (title) {
      title.textContent = `Key sequence: ${prefix || 'Space'}`;
    }

    const commandsEl = this.container.querySelector('.which-key-commands');
    if (commandsEl) {
      commandsEl.innerHTML = '';

      commands.forEach(({ key, command }) => {
        const cmdEl = document.createElement('div');
        cmdEl.addClass('which-key-command');
        cmdEl.innerHTML = `${key}: ${prefix ? '' : '+'}${command.name}`;
        commandsEl.appendChild(cmdEl);
      });
    }
  }

  // update(key: string) {
  //   log('update', key);
  //   this.showCommands(this.sharedState.commandTrie.getPossibleCommands(key), key);
  // }
}

/**
 * Manages the state for key sequence recording and processing
 */
class SharedState {
  private app: App;
  private isRecording = false;
  private currentKeySequence = '';
  private _insertMode = false;
  private ui: WhichKeyUI;
  commandTrie: CommandTrie;

  constructor(app: App, commandTrie: CommandTrie) {
    this.app = app;
    this.commandTrie = commandTrie;
  }

  setUI(ui: WhichKeyUI) {
    this.ui = ui;
  }

  get insertMode(): boolean {
    return this._insertMode;
  }

  set insertMode(value: boolean) {
    this._insertMode = value;
  }

  interceptKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // This should handle the editor not being focused
  handleKeyPress = (event: KeyboardEvent) => {
    // TODO: Trim context, most of this should be state
    const context = {
      app: this.app,
      commandTrie: this.commandTrie,
      recordingSequence: this.isRecording,
      setRecordingSequence: (value: boolean) => {
        this.isRecording = value;
      },
      currentKeySequence: this.currentKeySequence,
      setCurrentKeySequence: (value: string) => {
        this.currentKeySequence = value;
      },
      interceptKeyPress: this.interceptKeyPress,
      showPossibleCommands: (prefix: string) => {
        const commands = this.commandTrie.getPossibleCommands(prefix);
        this.ui.showCommands(commands, prefix);
      },
    };

    updateKeySequence(event, context);
  };
}

/**
 * This plugin intercepts key presses while in vim mode
 */
class WhichKeyEditorPlugin implements PluginValue {
  private static sharedState: SharedState;
  private view: EditorView;

  static setKeyManager(sharedState: SharedState) {
    WhichKeyEditorPlugin.sharedState = sharedState;
  }

  // Event listener for vim mode
  constructor(view: EditorView) {
    this.view = view;
    view.dom.addEventListener('keydown', this.handleVimKeyPress, true);
  }

  // Only handle key presses when not in insert mode
  handleVimKeyPress = (event: KeyboardEvent) => {
    const { key } = event;
    // Ignore shift to allow capital letters for command categories
    // TODO: Ignore esc, backspace, etc.
    if (key === 'Shift') {
      return;
    }
    if (!WhichKeyEditorPlugin.sharedState.insertMode) {
      WhichKeyEditorPlugin.sharedState.handleKeyPress(event);
    }
  };

  update(update: ViewUpdate) {
    // @ts-expect-error, not typed
    const insertMode = update?.view?.cm?.state?.vim?.insertMode;
    WhichKeyEditorPlugin.sharedState.insertMode = insertMode;
  }

  destroy() {
    this.view.dom.removeEventListener('keydown', this.handleVimKeyPress, true);
  }
}

export const codeMirrorPlugin = (keyManager: SharedState) => {
  WhichKeyEditorPlugin.setKeyManager(keyManager);
  return ViewPlugin.fromClass(WhichKeyEditorPlugin);
};

export default class WhichKey extends Plugin {
  settings: MyPluginSettings;
  sharedState: SharedState;
  commandTrie: CommandTrie;

  async onload() {
    log('loading...');
    await this.loadSettings();

    // Create the command trie
    this.commandTrie = categorizeCommands(this.app);

    // Initialize shared state with the command trie
    this.sharedState = new SharedState(this.app, this.commandTrie);

    // Create and set up the UI
    const ui = new WhichKeyUI(this.app, this.sharedState);
    this.sharedState.setUI(ui);

    this.registerEditorExtension(codeMirrorPlugin(this.sharedState));

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-sample-modal-simple',
      name: 'Open sample modal (simple)',
      callback: () => {
        new SampleModal(this.app).open();
      },
    });

    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: 'sample-editor-command',
      name: 'Sample editor command',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        console.log(editor.getSelection());
        editor.replaceSelection('Sample Editor Command');
      },
    });

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            new SampleModal(this.app).open();
          }

          // This command will only show up in Command Palette when the check function returns true
          return true;
        }
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: WhichKey;

  constructor(app: App, plugin: WhichKey) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc("It's a secret")
      .addText(text =>
        text
          .setPlaceholder('Enter your secret')
          .setValue(this.plugin.settings.mySetting)
          .onChange(async value => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
