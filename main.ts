import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view'

const { log } = console;

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

const whichKeyMappings = {
    " ": { name: "Quick switcher: Open quick switcher", commandId: "switcher:open", },
    "/": { name: "Search All Files", commandId: "global-search:open" },
    "e": { name: "Toggle left sidebar", commandId: "app:toggle-left-sidebar" },
    "f": { name: "+Files", children: {
        "n": { name: "New File", commandId: "file-explorer:new-file" },
        "m": { name: "Move File", commandId: "file-explorer:move-file" },
        "r": { name: "Reveal File", commandId: "file-explorer:reveal-active-file" },
    }},
    "s": { name: "+Search", children: {
        "f": { name: "Search File", commandId: "editor:open-search" },
        "a": { name: "Search All Files", commandId: "global-search:open" },
    }},
    "w": { name: "+Workspace", children: {
        "n": { name: "Next Tab", commandId: "workspace:next-tab" },
        "p": { name: "Previous Tab", commandId: "workspace:previous-tab" },
        "s": { name: "Split Right", commandId: "workspace:split-vertical" },
    }},
    "b": { name: "+Bookmarks", children: {
        "o": { name: "Open Bookmarks", commandId: "bookmarks:open" },
        "a": { name: "Bookmark All Tabs", commandId: "bookmarks:bookmark-all-tabs" },
    }},
    "g": { name: "+Graph", children: {
        "o": { name: "Open Graph", commandId: "graph:open" },
        "a": { name: "Animate Graph", commandId: "graph:animate" },
    }},
};

function processCommands(app: App) {
  const commands = app.commands.commands;
  log("COMMANDS:", commands);
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

function findWhichKeyCommand(sequence: string) {
  let node = whichKeyMappings;
  for (const key of sequence.split("")) {
    if (node[key]) {
      node = node[key].children ?? node[key];

      log('NODE:', node);
      for (const key in node) {
        log(key, node[key].name);
      }
    } else {
      return null;
    }
  }
  return node.commandId ? node : null;
}

function processKeyInput(keySequence: string) {
  const command = findWhichKeyCommand(keySequence);
  if (command && command.commandId) {
    log("executing!");
    this.app.commands.executeCommandById(command.commandId);
  }
}

class CodeMirrorPlugin implements PluginValue {
  constructor(view: EditorView) {
    view.dom.addEventListener("keydown", this.handleKeyPress, true)
  }

  recordingSequence = false;
  currentKeySequence = ""

  interceptKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  handleKeyPress = (event: KeyboardEvent) => {
    const { key } = event
    
    if (key === " " && !this.recordingSequence) {
      log("Space Pressed");
      this.recordingSequence = true;

        // Log curated shortcuts
        for (const shortcutType in whichKeyMappings) {
          log(shortcutType, whichKeyMappings[shortcutType].name);
        }

      this.interceptKeyPress(event);
      return;
    }

    if (!this.recordingSequence) return;

    this.interceptKeyPress(event);
    this.currentKeySequence += key;

    const matchedCommand = findWhichKeyCommand(this.currentKeySequence);

    if (matchedCommand) {
      processKeyInput(this.currentKeySequence);
      this.recordingSequence = false;
      this.currentKeySequence = "";
    } else if (!Object.keys(whichKeyMappings).some(cmd => cmd.startsWith(this.currentKeySequence))) {
      this.recordingSequence = false;
      this.currentKeySequence = "";
    }
  }
  
  update(update: ViewUpdate) {}
  destroy() {
      // view.dom.removeEventListener("keydown", this.handleKeyPress, true);
      // document.removeEventListener("keydown", this.interceptKeyPress, true);
  }
}

export const codeMirrorPlugin = ViewPlugin.fromClass(CodeMirrorPlugin);

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  recordingSequence = false;
  currentKeySequence = ""

  async onload() {
    log('loading...')
    await this.loadSettings();

    processCommands(this.app);
    
    this.registerEditorExtension(codeMirrorPlugin);

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-sample-modal-simple',
      name: 'Open sample modal (simple)',
      callback: () => {
        new SampleModal(this.app).open();
      }
    });

    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: 'sample-editor-command',
      name: 'Sample editor command',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        console.log(editor.getSelection());
        editor.replaceSelection('Sample Editor Command');
      }
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
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
	  console.log('click', evt);
    });

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
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}
