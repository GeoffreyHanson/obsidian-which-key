import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Plugin,
  PluginSettingTab,
  Setting,
} from 'obsidian';
import {
  EditorView,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

const { log } = console;

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};

// Define types for the WhichKey mappings
interface WhichKeyCommand {
  name: string;
  commandId?: string;
  children?: Record<string, WhichKeyCommand>;
}

interface WhichKeyMappings {
  [key: string]: WhichKeyCommand;
}

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

function processCommands(app: App) {
  const commands = app.commands.commands;
  log('COMMANDS:', commands);
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
      callback:
        command.callback || command.editorCallback || command.checkCallback, // Assign the correct function
    };
  });

  log(categorizedCommands);
  return categorizedCommands;
}

function findWhichKeyCommand(sequence: string): WhichKeyCommand | null {
  let node: WhichKeyCommand | WhichKeyMappings = whichKeyMappings;
  for (const key of sequence.split('')) {
    if ((node as WhichKeyMappings)[key]) {
      const nextNode: WhichKeyCommand = (node as WhichKeyMappings)[key];
      node = nextNode.children ?? nextNode;

      log('NODE:', node);
      for (const nodeKey in node) {
        if (typeof node === 'object' && nodeKey in node) {
          const item = (node as any)[nodeKey];
          if (item && item.name) {
            log(nodeKey, item.name);
          }
        }
      }
    } else {
      return null;
    }
  }
  return 'commandId' in node ? (node as WhichKeyCommand) : null;
}

/**
 * Shared key handler function to process key events for both editor and global contexts
 * This function centralizes the logic for handling key presses in both the editor and global contexts,
 * reducing code duplication and making it easier to maintain.
 * 
 * @param event - The keyboard event to process
 * @param context - An object containing the necessary context for processing the event
 */
function handleKeyPress(
  event: KeyboardEvent,
  context: {
    app: App;
    recordingSequence: boolean;
    setRecordingSequence: (value: boolean) => void;
    currentKeySequence: string;
    setCurrentKeySequence: (value: string) => void;
    interceptKeyPress: (event: KeyboardEvent) => void;
    isActive: () => boolean;
  }
) {
  const { key } = event;
  const {
    app,
    recordingSequence,
    setRecordingSequence,
    currentKeySequence,
    setCurrentKeySequence,
    interceptKeyPress,
    isActive
  } = context;

  // Check if we should start recording a sequence
  if (key === ' ' && !recordingSequence && isActive()) {
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
  const newKeySequence = currentKeySequence + key;
  setCurrentKeySequence(newKeySequence);

  const matchedCommand = findWhichKeyCommand(newKeySequence);

  if (matchedCommand) {
    // Execute the command if it has a commandId
    if (matchedCommand.commandId) {
      log('executing!');
      app.commands.executeCommandById(matchedCommand.commandId);
    }
    setRecordingSequence(false);
    setCurrentKeySequence('');
  } else if (
    !Object.keys(whichKeyMappings).some((cmd) =>
      cmd.startsWith(newKeySequence)
    )
  ) {
    // Reset if no potential matches
    setRecordingSequence(false);
    setCurrentKeySequence('');
  }
}

/**
 * This plugin intercepts key presses while in vim mode
 */
class CodeMirrorPlugin implements PluginValue {
  private static app: App;

  static setApp(app: App) {
    CodeMirrorPlugin.app = app;
  }

  constructor(view: EditorView) {
    // Listens for key presses in vim mode
    view.dom.addEventListener('keydown', this.handleEditorKeyPress, true);
  }

  insertMode = false;
  recordingSequence = false;
  currentKeySequence = '';

  interceptKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  handleEditorKeyPress = (event: KeyboardEvent) => {
    handleKeyPress(event, {
      app: CodeMirrorPlugin.app,
      recordingSequence: this.recordingSequence,
      setRecordingSequence: (value) => {
        this.recordingSequence = value;
      },
      currentKeySequence: this.currentKeySequence,
      setCurrentKeySequence: (value) => {
        this.currentKeySequence = value;
      },
      interceptKeyPress: this.interceptKeyPress,
      isActive: () => !this.insertMode
    });
  };

  update(update: ViewUpdate) {
    // @ts-expect-error, not typed
    this.insertMode = update?.view?.cm?.state?.vim?.insertMode;
    log('CM insertMode', this.insertMode);
  }
  destroy() {
    // view.dom.removeEventListener("keydown", this.handleKeyPress, true);
    // document.removeEventListener("keydown", this.interceptKeyPress, true);
  }
}

export const codeMirrorPlugin = (app: App) => {
  CodeMirrorPlugin.setApp(app);
  return ViewPlugin.fromClass(CodeMirrorPlugin);
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  recordingSequence = false;
  currentKeySequence = '';

  interceptKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  handleGlobalKeyPress = (event: KeyboardEvent) => {
    handleKeyPress(event, {
      app: this.app,
      recordingSequence: this.recordingSequence,
      setRecordingSequence: (value) => {
        this.recordingSequence = value;
      },
      currentKeySequence: this.currentKeySequence,
      setCurrentKeySequence: (value) => {
        this.currentKeySequence = value;
      },
      interceptKeyPress: this.interceptKeyPress,
      isActive: () => {
        // Check if we're not in an editor view
        const focusedEditor = !!this.app.workspace.getActiveViewOfType(MarkdownView);
        return !focusedEditor;
      }
    });
  };

  async onload() {
    log('loading...');
    await this.loadSettings();

    processCommands(this.app);

    this.registerEditorExtension(codeMirrorPlugin(this.app));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'keydown', this.handleGlobalKeyPress);

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
        const markdownView =
          this.app.workspace.getActiveViewOfType(MarkdownView);
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
    this.registerInterval(
      window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
    );
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
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder('Enter your secret')
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
