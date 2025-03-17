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

// TODO: Process customized commands ahead of non-customized
/** Process commands before they are added to the WhichKey mappings */
function categorizeCommands(app: App) {
  const { commands } = app.commands;
  const categorizedCommands: Record<string, any> = {}; // Stores grouped commands

  Object.entries(commands).forEach(([id, command]) => {
    const [category, subCommand] = id.split(':'); // Extract prefix

    if (!categorizedCommands[category]) {
      categorizedCommands[category] = { name: `+${category}` }; // Initialize category
    }

    // Format for WhichKey display
    categorizedCommands[category][subCommand] = {
      name: command.name,
      commandId: command.id,
      icon: command.icon ?? '', // Some commands may not have an icon
      hotkeys: command.hotkeys ?? [], // Store associated hotkeys
      callback: command.callback || command.editorCallback || command.checkCallback, // Assign the correct function
    };
  });

  log(categorizedCommands);
  return categorizedCommands;
}

function resolveCommandId(keySequence: string): WhichKeyCommand | null {
  log('sequence', keySequence);
  let possibleKeyMappings: WhichKeyCommand | WhichKeyMappings = whichKeyMappings;

  for (const key of keySequence.split('')) {
    log('key', key);

    if (key in possibleKeyMappings) {
      const currentNode = possibleKeyMappings[key];
      possibleKeyMappings = currentNode.children ?? currentNode;
      log('nextNode', currentNode);
      log('possibilities:', possibleKeyMappings);

      for (const nodeKey in possibleKeyMappings) {
        // if (typeof possibleKeyMappings === 'object' && nodeKey in possibleKeyMappings) {
        if (nodeKey in possibleKeyMappings) {
          const item = (possibleKeyMappings as any)[nodeKey];
          if (item && item.name) {
            log('nodeKey:', nodeKey, 'item name:', item.name);
          }
        }
      }
    } else {
      return null;
    }
  }

  return 'commandId' in possibleKeyMappings ? (possibleKeyMappings as WhichKeyCommand) : null;
}

/**
 * Shared key handler function to process key events for both editor and global contexts
 * This function centralizes the logic for handling key presses in both the editor and global contexts,
 * reducing code duplication and making it easier to maintain.
 *
 * @param event - The keyboard event to process
 * @param context - An object containing the necessary context for processing the event
 */
function updateKeySequence(
  event: KeyboardEvent,
  context: {
    app: App;
    recordingSequence: boolean;
    setRecordingSequence: (value: boolean) => void;
    currentKeySequence: string;
    setCurrentKeySequence: (value: string) => void;
    interceptKeyPress: (event: KeyboardEvent) => void;
  }
) {
  const { key } = event;
  let { currentKeySequence } = context;
  const { app, recordingSequence, setRecordingSequence, setCurrentKeySequence, interceptKeyPress } =
    context;

  // Check if we should start recording a sequence
  if (key === ' ' && !recordingSequence) {
    log('Space Pressed');
    setRecordingSequence(true);

    // Log curated shortcuts
    for (const shortcutType in whichKeyMappings) {
      log(shortcutType, whichKeyMappings[shortcutType].name);
    }

    interceptKeyPress(event);
    return;
  }

  if (!recordingSequence) return;

  interceptKeyPress(event);

  currentKeySequence += key;
  setCurrentKeySequence(currentKeySequence);

  const getCommand = resolveCommandId(currentKeySequence);

  if (!getCommand) {
    return;
  }

  if (getCommand?.commandId) {
    app.commands.executeCommandById(getCommand.commandId);
  }

  setRecordingSequence(false);
  setCurrentKeySequence('');
}

/**
 * Manages the state for key sequence recording and processing
 */
class SharedState {
  private app: App;
  private isRecording = false;
  private currentKeySequence = '';
  private insertMode = false;

  constructor(app: App) {
    this.app = app;
  }

  setInsertMode(value: boolean) {
    this.insertMode = value;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getCurrentKeySequence(): string {
    return this.currentKeySequence;
  }

  interceptKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  handleKeyPress = (event: KeyboardEvent) => {
    const context = {
      app: this.app,
      recordingSequence: this.isRecording,
      setRecordingSequence: (value: boolean) => {
        this.isRecording = value;
      },
      currentKeySequence: this.currentKeySequence,
      setCurrentKeySequence: (value: string) => {
        this.currentKeySequence = value;
      },
      interceptKeyPress: this.interceptKeyPress,
    };

    updateKeySequence(event, context);
  };
}

/**
 * This plugin intercepts key presses while in vim mode
 */
class CodeMirrorPlugin implements PluginValue {
  private static sharedState: SharedState;

  static setKeyManager(sharedState: SharedState) {
    CodeMirrorPlugin.sharedState = sharedState;
  }

  // Event listener for vim mode
  constructor(view: EditorView) {
    view.dom.addEventListener('keydown', this.handleEditorKeyPress, true);
  }

  handleEditorKeyPress = (event: KeyboardEvent) => {
    CodeMirrorPlugin.sharedState.handleKeyPress(event);
  };

  update(update: ViewUpdate) {
    // @ts-expect-error, not typed
    const insertMode = update?.view?.cm?.state?.vim?.insertMode;
    CodeMirrorPlugin.sharedState.setInsertMode(insertMode);
    log('CM insertMode', insertMode);
  }

  destroy() {
    // view.dom.removeEventListener("keydown", this.handleKeyPress, true);
    // document.removeEventListener("keydown", this.interceptKeyPress, true);
  }
}

export const codeMirrorPlugin = (keyManager: SharedState) => {
  CodeMirrorPlugin.setKeyManager(keyManager);
  return ViewPlugin.fromClass(CodeMirrorPlugin);
};

export default class WhichKey extends Plugin {
  settings: MyPluginSettings;
  sharedState: SharedState;

  async onload() {
    log('loading...');
    await this.loadSettings();

    categorizeCommands(this.app);

    // Initialize shared state
    this.sharedState = new SharedState(this.app);
    this.registerEditorExtension(codeMirrorPlugin(this.sharedState));

    // TODO: Adding to the whole document can be overbearing. Perhaps add event listeners to individual elements instead.
    const isEditorFocused = !!this.app.workspace.getActiveViewOfType(MarkdownView);
    if (isEditorFocused) {
      this.registerDomEvent(document, 'keydown', this.sharedState.handleKeyPress);
    }

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
