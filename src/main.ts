import { MarkdownView, Plugin } from 'obsidian';
import { initializeEditorListener } from './editor/editor-listener';
import { CommandTrie } from './lib/trie';
import { DEFAULT_SETTINGS, WhichKeySettings } from './settings/settings-tab';
import { SharedState } from './state/shared-state';
import { WhichKeyUI } from './ui/which-key-ui';
import { intentMappings, topLevelMappings } from './utils/constants';
import { categorizeCommands, curateCommands, shuckCommands } from './utils/helpers';

// Extend the App interface to include commands & executeCommandById
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
  state: SharedState;
  curatedTrie: CommandTrie;
  categorizedTrie: CommandTrie;

  /**
   * Handle key presses on the document when the editor is not focused
   * @param event - Keyboard event
   * @returns void
   */
  handleGlobalKeyPress = (event: KeyboardEvent): void => {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editorHasFocus = activeView?.editor?.hasFocus();
    if (editorHasFocus) {
      return;
    }

    // If the hotkey is pressed, update the key sequence
    if (this.state.isRecording) {
      this.state.updateKeySequence(event);
    }
  };

  async onload() {
    await this.loadSettings();

    const leanCommands = shuckCommands(this.app.commands.commands);

    // Create command tries
    this.curatedTrie = curateCommands(
      leanCommands,
      topLevelMappings,
      intentMappings,
      new CommandTrie()
    );
    this.categorizedTrie = categorizeCommands(leanCommands, new CommandTrie());

    // Initialize shared state
    const activeTrie = this.settings.categorizedCommands ? this.categorizedTrie : this.curatedTrie;
    this.state = new SharedState(this.app, activeTrie, new WhichKeyUI());

    this.registerEditorExtension(initializeEditorListener(this.state));

    document.addEventListener('keydown', this.handleGlobalKeyPress, true);

    this.addCommand({
      id: 'open-which-key',
      name: 'Open WhichKey',
      callback: () => this.state.startRecording(),
    });

    // To be re-enabled for hotkey overrides/categorized commands
    // this.addSettingTab(new WhichKeySettingsTab(this.app, this));
  }

  onunload() {
    document.removeEventListener('keydown', this.handleGlobalKeyPress, true);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);

    // Update shared state with new settings
    const activeTrie = this.settings.categorizedCommands ? this.categorizedTrie : this.curatedTrie;
    this.state.updateCommandTrie(activeTrie);
  }
}
