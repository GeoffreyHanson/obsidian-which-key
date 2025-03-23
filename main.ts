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

interface WhichKeyMappings {
  [key: string]: WhichKeyCommand;
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

const whichKeyMappings: WhichKeyMappings = {
  ' ': {
    name: 'Quick switcher: Open quick switcher',
    commandId: 'switcher:open',
  },
  '/': { name: 'Search All Files', commandId: 'global-search:open' },
  e: { name: 'Toggle left sidebar', commandId: 'app:toggle-left-sidebar' },
  f: {
    name: '+Files',
    children: {
      d: { name: 'New Directory', commandId: 'file-explorer:new-folder' },
      n: { name: 'New File', commandId: 'file-explorer:new-file' },
      m: { name: 'Move File', commandId: 'file-explorer:move-file' },
      o: { name: 'Open File', commandId: 'file-explorer:open' },
      r: {
        name: 'Reveal File',
        commandId: 'file-explorer:reveal-active-file',
      },
    },
  },
  s: {
    name: '+Search',
    children: {
      f: { name: 'Search File', commandId: 'editor:open-search' },
      a: { name: 'Search All Files', commandId: 'global-search:open' },
    },
  },
  w: {
    name: '+Workspace',
    children: {
      n: { name: 'Next Tab', commandId: 'workspace:next-tab' },
      p: { name: 'Previous Tab', commandId: 'workspace:previous-tab' },
      s: { name: 'Split Right', commandId: 'workspace:split-vertical' },
    },
  },
  b: {
    name: '+Bookmarks',
    children: {
      o: { name: 'Open Bookmarks', commandId: 'bookmarks:open' },
      a: {
        name: 'Bookmark All Tabs',
        commandId: 'bookmarks:bookmark-all-tabs',
      },
    },
  },
  g: {
    name: '+Graph',
    children: {
      o: { name: 'Open Graph', commandId: 'graph:open' },
      a: { name: 'Animate Graph', commandId: 'graph:animate' },
    },
  },
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

  search(sequence: string): WhichKeyCommand | null {
    log('in search:', sequence);
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
    log('current', current);
    const result = current.isEndOfCommand
      ? { name: current.name || '', commandId: current.commandId }
      : null;
    log('search result', result);
    return result;
  }

  // Get all possible completions for a prefix
  getPossibleCommands(prefix: string): Array<{ key: string; command: WhichKeyCommand }> {
    let current = this.root;

    // If prefix is activation, don't walk
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
      log('node:', node, 'key:', key);
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

  insertCommands(category: string, commands: Array<Record<string, ObsidianCommand>>) {
    // Get first letter of each word as prefix options
    const categoryPrefixOptions = category.split('-').map(word => word[0].toLowerCase());
    log(categoryPrefixOptions);

    // Check if the prefix exists
    const categoryNode = this.root.children.get(categoryPrefixOptions[0]);
    if (!categoryNode) {
      this.insert(categoryPrefixOptions[0], {
        name: category,
        commandId: undefined,
      });
    }
    // else if (categoryNode && this.root.children.get(categoryPrefixOptions[1])) {

    // Insert commands into the category node
    Object.entries(commands).forEach(([abvCommandName, command]) => {
      log('insert command:', abvCommandName, command);
      const sequenceOptions = abvCommandName.split('-').map(word => word[0].toLowerCase());
      log('sequence options:', sequenceOptions);
      // let current = this.root;
      let current = this.root.children.get(categoryPrefixOptions[0]);

      // Only insert as many keys as needed
      // If the prefix doesn't exist, create it
      if (!current?.children.has(sequenceOptions[0])) {
        current?.children.set(sequenceOptions[0], new TrieNode());
      }
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

  // Add method to handle nested commands
  insertNestedCommand(prefix: string, command: ObsidianCommand) {
    // Get category from command ID
    const [category, commandName] = command.id.split(':');

    try {
      // First, organize commands by category
      // TODO: To uppercase and handle shift
      const categoryPrefix = category[0].toLowerCase();

      // Ensure the category node exists and has metadata
      const categoryNodeExists = this.root.children.get(categoryPrefix);
      // Create a new category node if it doesn't exist
      if (!categoryNodeExists) {
        this.insert(categoryPrefix, {
          name: `+${category}`, // Use + prefix for categories
          commandId: undefined, // Categories don't have commands
        });
      }

      // For the action, just take the first letter of the first word
      // TODO: Construct possible prefixes to send
      const firstWord = command.name.split(/\s+/)[0];
      const commandPrefix = firstWord ? firstWord[0].toLowerCase() : '';

      if (categoryPrefix && commandPrefix) {
        // Create a two-level sequence
        this.insert(`${categoryPrefix}${commandPrefix}`, {
          name: command.name,
          commandId: command.id,
        });
      }
    } catch (err) {
      log('Error processing command', command.id, err);
    }
  }
}

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

  // Sort categories based on command number
  // We don't want to use the key from any of these
  const sortedCommands = Object.entries(categorizedCommands).sort(
    ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
  );
  log('sorted commands', sortedCommands);

  sortedCommands.forEach(([category, relevantCommands]) => {
    commandTrie.insertCommands(category, relevantCommands);
  });

  // TODO: Add categorized commands to trie
  // Object.entries(commands).forEach(([id, command]) => {
  //   try {
  //     // Insert the command into the trie
  //     commandTrie.insertNestedCommand(id, {
  //       id: command.id,
  //       name: command.name,
  //       icon: command.icon,
  //       hotkeys: command.hotkeys,
  //       // TODO: Probably don't need this
  //       callback: command.callback || command.editorCallback || command.checkCallback,
  //     });
  //   } catch (err) {
  //     log('Error categorizing command', id, err);
  //   }
  // });

  // log('Command Trie built successfully');
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
    log('Space Pressed - Starting WhichKey');
    setRecordingSequence(true);
    setCurrentKeySequence(' ');

    // Show root level commands
    showPossibleCommands('');

    interceptKeyPress(event);
    return;
  }

  if (!recordingSequence) return;

  interceptKeyPress(event);

  // If we're already recording, add the new key
  if (currentKeySequence === ' ') {
    // First key after space
    currentKeySequence = key;
  } else {
    // Subsequent keys
    currentKeySequence += key;
  }

  setCurrentKeySequence(currentKeySequence);

  // Show possible completions for the current sequence
  showPossibleCommands(currentKeySequence);
  log('command to search', currentKeySequence);
  // Check if the sequence resolves to a command
  const command = commandTrie.search(currentKeySequence);
  log('trie command', command);
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
        cmdEl.innerHTML = `${key}: ${command.name}`;
        commandsEl.appendChild(cmdEl);
      });

      // If we're showing root commands and there are none from the trie yet,
      // fallback to our predefined mappings
      if (prefix === '' && commands.length === 0) {
        for (const key in commands) {
          const command = document.createElement('div');
          command.addClass('which-key-command');
          command.innerHTML = `${key} ➜ ${whichKeyMappings[key].name}`;
          commandsEl.appendChild(command);
        }
      }
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

  // Only handle key presses when in not in insert mode or when the editor is not focused
  // insert mode handled by the CodeMirrorPlugin
  // This should handle the editor not being focused
  handleKeyPress = (event: KeyboardEvent) => {
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
        // Show available commands for the current prefix
        log('showPossibleCommands prefix:', prefix);
        const commands = this.commandTrie.getPossibleCommands(prefix);
        log('showPossibleCommands commands:', commands);
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
    view.dom.addEventListener('keydown', this.handleEditorKeyPress, true);
  }

  handleEditorKeyPress = (event: KeyboardEvent) => {
    // Only handle key presses when not in insert mode
    if (!WhichKeyEditorPlugin.sharedState.insertMode) {
      WhichKeyEditorPlugin.sharedState.handleKeyPress(event);
    }
  };

  update(update: ViewUpdate) {
    // @ts-expect-error, not typed
    const insertMode = update?.view?.cm?.state?.vim?.insertMode;
    WhichKeyEditorPlugin.sharedState.insertMode = insertMode;
    log('CM insertMode', insertMode);
  }

  destroy() {
    this.view.dom.removeEventListener('keydown', this.handleEditorKeyPress, true);
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
