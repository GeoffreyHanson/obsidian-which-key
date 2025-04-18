import { Plugin, MarkdownView } from 'obsidian';
import { categorizeCommands, curateCommands, shuckCommands } from './utils/helpers';
import { intentMappings, topLevelMappings } from './utils/constants';
import { CommandTrie } from './lib/trie';
import { WhichKeyUI } from './ui/which-key-ui';
import { SharedState } from './state/shared-state';
import { createKeyPressPlugin } from './editor/key-press-plugin';
import { DEFAULT_SETTINGS, WhichKeySettings, WhichKeySettingsTab } from './settings/settings-tab';

const { log } = console;

// Extend the App interface to include commands
declare module 'obsidian' {
  interface App {
    commands: {
      commands: { [commandId: string]: { id: string; name: string; callback: () => void } };
      executeCommandById(id: string): boolean;
    };
  }
}

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
    await this.loadSettings();

    log(this.app);

    const leanCommands = shuckCommands(this.app.commands.commands);

    // Create the command trie
    this.commandTrie = this.settings.categorizedCommands
      ? categorizeCommands(leanCommands, new CommandTrie())
      : curateCommands(leanCommands, topLevelMappings, intentMappings, new CommandTrie());

    // Initialize shared state with the command trie
    this.sharedState = new SharedState(this.app, this.commandTrie, new WhichKeyUI());

    this.registerEditorExtension(createKeyPressPlugin(this.sharedState));

    document.addEventListener('keydown', this.handleGlobalKeyPress, true);

    this.addCommand({
      id: 'open-which-key',
      name: 'Open WhichKey',
      callback: () => this.sharedState.startRecording(),
    });

    this.addSettingTab(new WhichKeySettingsTab(this.app, this));
  }

  onunload() {
    document.removeEventListener('keydown', this.handleGlobalKeyPress, true);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
