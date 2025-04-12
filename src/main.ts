import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Plugin,
  PluginSettingTab,
  setIcon,
  Setting,
} from 'obsidian';
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { categorizeCommands, curateCommands, shuckCommands } from 'src/utils/helpers';
import { KEYS, topLevelMappings, intentMappings } from './utils/constants';

const { log } = console;

interface WhichKeySettings {
  categorizedCommands: boolean;
}

// Define types for the WhichKey mappings
interface WhichKeyCommand {
  name: string;
  id?: string;
  icon?: string;
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

interface CategorizedCommand {
  name: string;
  id: string;
  icon: string;
  hotkeys: string[];
  callback?: any;
}

interface CategorizedCommands {
  [category: string]: Record<string, CategorizedCommand>;
}

// Extend the App interface to include commands
declare module 'obsidian' {
  interface App {
    commands: ObsidianCommands;
  }
}

const DEFAULT_SETTINGS: WhichKeySettings = {
  categorizedCommands: false,
};

class TrieNode {
  children: Record<string, TrieNode>;
  name?: string;
  id?: string;
  icon?: string;
  isEndOfCommand: boolean;

  constructor() {
    this.children = {};
    this.isEndOfCommand = false;
  }
}

class CommandTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  /** Get command id for a prefix */
  getCommandId(prefix: string[]): string | null {
    let current = this.root;
    log('getting command for prefix:', prefix);

    for (const key of prefix) {
      if (!(key in current.children)) {
        log('no child found for key:', key);
        return null;
      }
      current = current.children[key];
    }

    return current.id || null;
  }

  /** Get all possible completions for a prefix */
  getPossibleCommands(prefix?: string[]): Array<{ key: string; command: WhichKeyCommand }> {
    let current = this.root;

    // If prefix exists, walk down to the prefix node
    if (prefix?.length) {
      for (const key of prefix) {
        if (!(key in current.children)) {
          return [];
        }
        current = current.children[key];
      }
    }

    // Get all possible children from current node
    const possibilities: Array<{ key: string; command: WhichKeyCommand }> = [];
    Object.entries(current.children).forEach(([key, node]) => {
      if (node.name) {
        possibilities.push({
          key,
          command: {
            name: node.name,
            id: node.id,
            icon: node.icon,
          },
        });
      }
    });

    // log('possible commands:', possibilities);
    return possibilities;
  }

  // Inserts nested commands into the trie under each category
  insertCommands(category: string, commands: Record<string, CategorizedCommand>) {
    // Get first letter of each word as prefix options
    const primaryCategoryOptions = category
      .split('-')
      .map(word => [word[0].toLowerCase(), word[0].toUpperCase()])
      .flat();

    // Letters of the first word except for the first
    const secondaryCategoryOptions = category.split('-')[0].split('').slice(1);

    const categoryPrefixOptions = [...primaryCategoryOptions, ...secondaryCategoryOptions];

    const current = this.root;
    let categoryNode = null;
    let foundCategory = false;

    for (const prefix of categoryPrefixOptions) {
      if (!(prefix in current.children)) {
        current.children[prefix] = new TrieNode();
        categoryNode = current.children[prefix];

        categoryNode.name = category;
        categoryNode.id = undefined;
        categoryNode.isEndOfCommand = false;

        foundCategory = true;
        break;
      }
    }

    if (!foundCategory) {
      log(`Category skipped - no available prefix: ${category}`);
      return;
    }

    // Insert commands into the category node
    Object.entries(commands).forEach(([abvCommandName, command]) => {
      // const sequenceOptions = command.name.split(' ').map(word => word[0].toLowerCase());
      const primaryPrefixOptions = command.name
        .split(KEYS.SPACE)
        .map(word => [word[0].toLowerCase(), word[0].toUpperCase()])
        .flat();

      const secondaryPrefixOption = command.name.split(KEYS.SPACE)[0].split('').slice(1);

      const sequenceOptions = [...primaryPrefixOptions, ...secondaryPrefixOption];

      let current = categoryNode;

      if (!current) {
        log(`Command skipped - category node missing: ${category}:${abvCommandName}`);
        return; // Skip if category node doesn't exist
      }

      // Find the first available sequence option
      let foundCommandSlot = false;

      for (const prefix of sequenceOptions) {
        // Check if this slot is available
        if (!(prefix in current.children)) {
          // Found an open slot, create the node
          current.children[prefix] = new TrieNode();
          current = current.children[prefix];
          foundCommandSlot = true;
          break; // Exit loop after finding the first available slot
        }
      }

      if (!foundCommandSlot) {
        log(`Command skipped - no available prefix: ${category}:${abvCommandName}`);
        return;
      }

      // Now set the command properties on the current node
      current.name = command.name;
      current.id = command.id;
      current.isEndOfCommand = true;
    });
  }

  // insertVimCommand({ prefix, name, commandId }) {
  insertVimCommand({
    name,
    id,
    icon,
    prefix,
  }: {
    name: string;
    id?: string;
    icon?: string;
    prefix?: string[];
  }) {
    let current = this.root;

    if (prefix) {
      for (const key of prefix) {
        if (!(key in current.children)) {
          current.children[key] = new TrieNode();
        }
        current = current.children[key];
      }
    }

    current.name = name;
    current.id = id || undefined;
    current.icon = icon || 'keyboard';
    // current.isEndOfCommand = !!id;
    current.isEndOfCommand = !!current.children;
  }
}

class WhichKeyUI {
  private app: App;
  private container: HTMLElement;
  visible = false;

  constructor(app: App) {
    this.app = app;
  }

  private createContainer() {
    this.container = document.createElement('div');
    this.container.addClass('which-key-container', 'dialog');

    const keyPressed = document.createElement('div');
    keyPressed.addClass('which-key-pressed');
    this.container.appendChild(keyPressed);

    const possibleCommands = document.createElement('div');
    possibleCommands.addClass('which-key-commands');
    this.container.appendChild(possibleCommands);

    document.body.appendChild(this.container);
  }

  // UI methods focus purely on display
  showCommands(
    possibleCommands: Array<{ key: string; command: WhichKeyCommand }>,
    keysPressed?: string[]
  ) {
    keysPressed = keysPressed ? ['Leader', ...keysPressed] : ['Leader'];

    if (!this.container) {
      this.createContainer();
    }

    this.container.style.display = 'block';
    this.visible = true;

    const title = this.container.querySelector('.which-key-pressed');
    if (title) {
      title.textContent = `${keysPressed.join(' » ')}`;
    }

    const commandsEl = this.container.querySelector('.which-key-commands');
    if (commandsEl) {
      commandsEl.textContent = '';

      possibleCommands.forEach(({ key, command }) => {
        // Change space for display
        if (key === KEYS.SPACE) key = '␣';

        const lucideIcon = command?.icon?.replace('lucide-', '');
        const cmdEl = document.createElement('div');
        cmdEl.addClass('which-key-command');

        const prefixEl = document.createElement('span');
        const arrowEl = document.createElement('span');
        const iconEl = document.createElement('span');
        const nameEl = document.createElement('span');

        prefixEl.addClass('which-key-prefix');
        arrowEl.addClass('which-key-command-arrow');
        iconEl.addClass('which-key-command-icon');
        nameEl.addClass('which-key-name');

        prefixEl.textContent = key;
        nameEl.textContent = `${command.id ? '' : '+'}${command.name}`;

        cmdEl.appendChild(prefixEl);
        cmdEl.appendChild(arrowEl);
        setIcon(arrowEl, 'arrow-right');
        cmdEl.appendChild(iconEl);
        setIcon(iconEl, lucideIcon);
        cmdEl.appendChild(nameEl);

        commandsEl.appendChild(cmdEl);
      });
    }
  }

  hideCommands() {
    if (this.container) {
      this.container.style.display = 'none';
      this.visible = false;
    }
  }
}

/**
 * Manages the state for key sequence recording and processing
 */
class SharedState {
  private app: App;
  private ui: WhichKeyUI;
  currentKeySequence: string[] = [];
  isRecording = false;
  insertMode = false;
  commandTrie: CommandTrie;

  constructor(app: App, commandTrie: CommandTrie, ui: WhichKeyUI) {
    this.app = app;
    this.commandTrie = commandTrie;
    this.ui = ui;
  }

  startRecording() {
    this.isRecording = true;
    this.currentKeySequence = [];
    const commands = this.commandTrie.getPossibleCommands();
    this.ui.showCommands(commands);
  }

  private resetState() {
    this.isRecording = false;
    this.currentKeySequence = [];
    this.ui.hideCommands();
  }

  interceptKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Handles key presses in the editor. Prevents Tab, Space, etc while recording
   * @param event - Keyboard event
   */
  handleEditorKeyPress = (event: KeyboardEvent) => {
    log('handleKeyPress', event);
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editorHasFocus = activeView?.editor.hasFocus();
    // CodeMirror's vim plugin state
    const vim = activeView?.editor?.cm?.cm?.state;

    // For vim, ignore key presses when editing the note title or when in insert mode
    if (vim && (!editorHasFocus || this.insertMode)) {
      return;
    }

    if (this.isRecording) {
      this.updateKeySequence(event);
    }
    // Start recording when space is pressed and using vim
    else if (vim && !this.insertMode && event.key === KEYS.SPACE) {
      this.startRecording();
      this.interceptKeyPress(event);
    }
  };

  updateKeySequence(event: KeyboardEvent) {
    const { key } = event;

    if (key === KEYS.ESCAPE) {
      this.resetState();
      return;
    }

    // Ignore shift to allow capital letters for command categories
    if (key === KEYS.SHIFT) return;

    // If not recording and key isn't Space, exit
    if (!this.isRecording) return;

    this.interceptKeyPress(event);

    this.currentKeySequence.push(key);

    // Show possible completions
    const commands = this.commandTrie.getPossibleCommands(this.currentKeySequence);
    this.ui.showCommands(commands, this.currentKeySequence);

    // Check if sequence resolves to a command
    const commandId = this.commandTrie.getCommandId(this.currentKeySequence);

    if (commandId) {
      this.app.commands.executeCommandById(commandId);
      this.resetState();
    } else if (commands.length === 0) {
      // No possible completions, reset
      this.resetState();
    }
  }
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

  constructor(view: EditorView) {
    this.view = view;
    // Needed to handle key presses inside the editor
    view.dom.addEventListener(
      'keydown',
      WhichKeyEditorPlugin.sharedState.handleEditorKeyPress,
      true
    );
  }

  /**
   * Update the insert mode state
   * @param update - View update
   */
  update(update: ViewUpdate) {
    // @ts-expect-error, not typed
    const insertMode = update?.view?.cm?.state?.vim?.insertMode;
    WhichKeyEditorPlugin.sharedState.insertMode = insertMode;
  }

  destroy() {
    this.view.dom.removeEventListener(
      'keydown',
      WhichKeyEditorPlugin.sharedState.handleEditorKeyPress,
      true
    );
  }
}

export const codeMirrorPlugin = (keyManager: SharedState) => {
  WhichKeyEditorPlugin.setKeyManager(keyManager);
  return ViewPlugin.fromClass(WhichKeyEditorPlugin);
};

export default class WhichKey extends Plugin {
  settings: WhichKeySettings;
  sharedState: SharedState;
  commandTrie: CommandTrie;

  handleGlobalKeyPress = (event: KeyboardEvent) => {
    // Don't handle key presses when editor has focus
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editorHasFocus = activeView?.editor?.hasFocus();
    if (editorHasFocus) {
      return;
    }

    // If the hotkey is pressed, update the key sequence
    if (this.sharedState.isRecording) {
      this.sharedState.updateKeySequence(event);
    }
  };

  async onload() {
    log('loading...');
    await this.loadSettings();

    log(this.app);

    const leanCommands = shuckCommands(this.app.commands.commands);

    // Create the command trie
    this.commandTrie = this.settings.categorizedCommands
      ? categorizeCommands(leanCommands, new CommandTrie())
      : curateCommands(leanCommands, topLevelMappings, intentMappings, new CommandTrie());

    // Initialize shared state with the command trie
    const ui = new WhichKeyUI(this.app);
    this.sharedState = new SharedState(this.app, this.commandTrie, ui);

    this.registerEditorExtension(codeMirrorPlugin(this.sharedState));

    document.addEventListener('keydown', this.handleGlobalKeyPress);

    this.addCommand({
      id: 'open-which-key',
      name: 'Open WhichKey',
      callback: () => this.sharedState.startRecording(),
    });

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

    this.addSettingTab(new WhichKeySettingsTab(this.app, this));

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

class WhichKeySettingsTab extends PluginSettingTab {
  plugin: WhichKey;

  constructor(app: App, plugin: WhichKey) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Use Categorized Commands (Experimental)')
      .setDesc('Sort commands by category rather than by intent.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.categorizedCommands).onChange(async value => {
          this.plugin.settings.categorizedCommands = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
