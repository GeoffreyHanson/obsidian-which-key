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

interface CategorizedCommand {
  name: string;
  commandId: string;
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

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};

class TrieNode {
  children: Record<string, TrieNode>;
  name?: string;
  commandId?: string;
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
  getCommandId(prefix: string) {
    let current = this.root;

    for (const key of prefix) {
      if (!(key in current.children)) {
        return null;
      }
      current = current.children[key];
    }
    return current.commandId;
  }

  /** Get all possible completions for a prefix */
  getPossibleCommands(prefix: string): Array<{ key: string; command: WhichKeyCommand }> {
    let current = this.root;

    // If prefix is activation, no need to walk
    if (prefix !== ' ') {
      // Walk down to prefix node
      for (const key of prefix) {
        if (!(key in current.children)) {
          return [];
        }
        current = current.children[key];
      }
    }

    const possibilities: Array<{ key: string; command: WhichKeyCommand }> = [];

    Object.entries(current.children).forEach(([key, node]) => {
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
        categoryNode.commandId = undefined;
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
        .split(' ')
        .map(word => [word[0].toLowerCase(), word[0].toUpperCase()])
        .flat();

      const secondaryPrefixOption = command.name.split(' ')[0].split('').slice(1);

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
      current.commandId = command.commandId;
      current.isEndOfCommand = true;
    });
  }

  // insertVimCommand({ prefix, name, commandId }) {
  insertVimCommand({ name, id, prefix }) {
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
    current.commandId = id;
    current.isEndOfCommand = true;
  }
}

// BUGFIX: Some prefixes are being popped before assignment when they're the only option for some commands
// TODO: Prioritize numbers, filter out and, to, in, etc
function determinePrefixes(parentPrefix, commands) {
  // Get counts for all commands in the bucket
  log('bucketed commands:', commands);
  const prefixCounts = {};
  const possiblePrefixes = commands.map(command => {
    const { id } = command;

    // Split on : or -
    const firstLetters = id.split(/[:-]/g).map(letter => letter[0]);

    // Update counts
    firstLetters.map(letter => (prefixCounts[letter] = (prefixCounts[letter] || 0) + 1));
    return firstLetters;
  });

  log('prefixCounts', prefixCounts);
  log('possiblePrefixes', possiblePrefixes);

  // Loop through sorted prefix count, assign prefix to command
  // This ascribes the least common prefix to a command

  // Decrement through prefix counts, assigning prefixes starting with lowest frequency
  const sortedPrefixCounts = Object.entries(prefixCounts).sort(([, a], [, b]) => b - a);

  for (let i = sortedPrefixCounts.length - 1; i >= 0; i--) {
    const [prefix] = sortedPrefixCounts[i];

    for (let j = 0; j < commands.length; j++) {
      if (!commands[j].prefix && possiblePrefixes[j].includes(prefix)) {
        commands[j].prefix = [parentPrefix, prefix];
        break;
      }
    }
  }

  log('commands with prefixes:', commands);
  return commands;
}

function curateCommands(app: App) {
  const { commands } = app.commands;
  const commandTrie = new CommandTrie();
  log('all commands:', commands);

  const topLevelMappings = [
    {
      prefix: ' ',
      name: 'Open Quick Switcher',
      id: 'switcher:open',
    },
    {
      prefix: '/',
      name: 'Open Global Search',
      id: 'global-search:open',
    },
    {
      prefix: 'e',
      name: 'Toggle left sidebar',
      id: 'app:toggle-left-sidebar',
    },
    {
      prefix: 'p',
      name: 'Open command palette',
      id: 'command-palette:open',
    },
    {
      prefix: '|',
      name: 'Split right',
      id: 'workspace:split-vertical',
    },
    {
      prefix: '-',
      name: 'Split down',
      id: 'workspace:split-horizontal',
    },
  ];

  const nestedMappings = [
    {
      prefix: 's',
      name: 'Search',
      commands: id => id.includes('search') && !id.includes('bookmarks'),
    },
    { prefix: 'f', name: 'File', commands: id => id.includes('file') && !id.includes('canvas') },
    { prefix: 'b', name: 'Backlink search', commands: id => id.includes('backlink') },
    { prefix: 'B', name: 'Bookmarks', commands: id => id.includes('bookmarks') },
    {
      prefix: 'Tab',
      name: 'Tab navigation',
      commands: id =>
        id.includes('tab') &&
        !(id.includes('table') || id.includes('bookmarks') || id.includes('file-explorer')),
    },
    { prefix: 'v', name: 'Vault', commands: id => id.includes('vault') },
    { prefix: 't', name: 'Text', commands: id => id.includes('toggle') && id.includes('editor') },
    { prefix: 'T', name: 'Table', commands: id => id.includes('table') },
    {
      prefix: 'n',
      name: 'Navigate',
      commands: id => id === 'app:go-back' || id === 'app:go-forward',
    },
    { prefix: 'm', name: 'Markdown', commands: id => id.includes('markdown') },
    { prefix: 'w', name: 'Windows', commands: id => id.includes('window') },
    { prefix: 'c', name: 'Canvas', commands: id => id.includes('canvas') },
  ];

  // const suggestedMappings = [
  //   { prefix: 's', name: 'Search', match: id => id.includes('search') && !id.includes('bookmark') },
  //   { prefix: '/', name: 'Global Search', match: id => id.includes('global-search') },
  //   { prefix: 'f', name: 'File Management', match: id => ['file', 'save', 'attachments', 'rename', 'duplicate', 'delete-file', 'open-with-default-app', 'export-pdf'].some(k => id.includes(k)) },
  //   { prefix: 'b', name: 'Backlinks & Links', match: id => ['backlink', 'outgoing-links'].some(k => id.includes(k)) },
  //   { prefix: 'B', name: 'Bookmarks', match: id => id.includes('bookmark') },
  //   { prefix: 'Tab', name: 'Tabs', match: id => id.includes('tab') && !id.includes('table') && !id.includes('bookmarks') && !id.includes('file-explorer') },
  //   { prefix: 'v', name: 'Vault & Windows', match: id => ['vault', 'window', 'open-sandbox'].some(k => id.includes(k)) },
  //   { prefix: 't', name: 'Toggle & Text', match: id => (id.includes('toggle') && id.includes('editor')) || ['bold', 'italic', 'highlight', 'strikethrough', 'code', 'inline-math', 'blockquote', 'comments', 'clear-formatting'].some(k => id.includes(k)) },
  //   { prefix: 'T', name: 'Tables', match: id => id.includes('table') },
  //   { prefix: 'n', name: 'Navigation', match: id => ['navigate', 'go-back', 'go-forward', 'switcher', 'graph', 'outline', 'focus-', 'canvas:jump'].some(k => id.includes(k)) },
  //   { prefix: 'm', name: 'Markdown & Metadata', match: id => ['markdown', 'metadata', 'alias', 'property'].some(k => id.includes(k)) },
  //   { prefix: 'p', name: 'Pane & Splits', match: id => ['split', 'pane', 'stacked', 'pin'].some(k => id.includes(k)) },
  //   { prefix: 'c', name: 'Canvas', match: id => id.includes('canvas') },
  //   { prefix: 'd', name: 'Daily & Templates', match: id => ['daily-notes', 'template', 'templater', 'current-date', 'current-time'].some(k => id.includes(k)) },
  //   { prefix: 'o', name: 'Open/Create', match: id => ['new-file', 'new-folder', 'open-link', 'follow-link', 'insert', 'embed', 'wikilink', 'callout', 'codeblock', 'horizontal-rule', 'mathblock', 'footnote', 'attach-file'].some(k => id.includes(k)) },
  //   { prefix: 'z', name: 'Zoom', match: id => id.includes('zoom') },
  //   { prefix: 'r', name: 'Recovery & Sync', match: id => ['recovery', 'sync', 'reload', 'undo-close', 'version-history'].some(k => id.includes(k)) },
  //   { prefix: 'h', name: 'Help & Debug', match: id => ['help', 'debug', 'release-notes'].some(k => id.includes(k)) },
  //   { prefix: 'x', name: 'Misc UI Toggle', match: id => ['ribbon', 'sidebar', 'theme', 'settings', 'always-on-top', 'default-new-pane-mode'].some(k => id.includes(k)) },
  //   { prefix: 'q', name: 'Quick Actions', match: id => ['command-palette', 'composer', 'swap-line', 'delete-paragraph', 'cursor'].some(k => id.includes(k)) },
  // ];

  const curatedCommands = [...topLevelMappings];
  for (const { prefix, name, commands: condition } of nestedMappings) {
    curatedCommands.push({ prefix, name });
    const bucket = [];
    for (const [id, command] of Object.entries(commands)) {
      if (condition(id)) {
        bucket.push(command);
      }
    }
    // Push array of commands with determined prefixes
    curatedCommands.push(...determinePrefixes(prefix, bucket));
  }

  const curatedIds = new Set(topLevelMappings.map(mapping => mapping.commandId));

  const remainingCommands = Object.entries(commands).filter(([id]) => !curatedIds.has(id));

  curatedCommands.forEach(command => {
    commandTrie.insertVimCommand(command);
  });

  log('commandTrie', commandTrie);
  return commandTrie;
}

// TODO: Add setting to enable
// Categorize commands and insert them into the trie
function categorizeCommands(app: App) {
  const { commands } = app.commands;
  const commandTrie = new CommandTrie();
  log('all commands:', commands);

  const categorizedCommands: CategorizedCommands = {};

  Object.entries(commands).forEach(([id, command]: [string, ObsidianCommand]) => {
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
  // log('sortedCommands', sortedCommands);

  // Insert commands into the trie
  sortedCommands.forEach(([category, relevantCommands]) => {
    commandTrie.insertCommands(category, relevantCommands);
  });

  // return commandTrie;
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
  const commandId = commandTrie.getCommandId(currentKeySequence);

  if (commandId) {
    app.commands.executeCommandById(commandId);
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

    log(this.app);

    // Create the command trie
    this.commandTrie = curateCommands(this.app);
    // this.commandTrie = categorizeCommands(this.app);

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
