import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { App, MarkdownView, Plugin, PluginSettingTab, setIcon, Setting } from 'obsidian';
import { categorizeCommands, curateCommands, shuckCommands } from 'src/utils/helpers';
import { intentMappings, KEYS, topLevelMappings } from './utils/constants';
import { ObsidianCommands, WhichKeyCommand } from './types';
import { CommandTrie } from './lib/trie';

const { log } = console;

interface WhichKeySettings {
  categorizedCommands: boolean;
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

class WhichKeyUI {
  private container: HTMLElement;
  visible = false;

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
        if (lucideIcon) setIcon(iconEl, lucideIcon);
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
  handleKeyPress = (event: KeyboardEvent) => {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editorHasFocus = activeView?.editor.hasFocus();
    // @ts-ignore - accessing internal CodeMirror state
    const vim = activeView?.editor?.cm?.cm?.state;

    if (this.isRecording) {
      this.updateKeySequence(event);
    }
    // Start recording when space is pressed and using vim
    else if (vim && editorHasFocus && !this.insertMode && event.key === KEYS.SPACE) {
      this.startRecording();
      this.interceptKeyPress(event);
    }
  };

  updateKeySequence(event: KeyboardEvent) {
    const { key } = event;

    // Reset state when escape is pressed
    if (key === KEYS.ESCAPE) {
      this.resetState();
      return;
    }

    // Ignore shift to allow capital letters for command categories
    if (key === KEYS.SHIFT) return;

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
    view.dom.addEventListener('keydown', WhichKeyEditorPlugin.sharedState.handleKeyPress, true);
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
      WhichKeyEditorPlugin.sharedState.handleKeyPress,
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
    this.sharedState = new SharedState(this.app, this.commandTrie, new WhichKeyUI());

    this.registerEditorExtension(codeMirrorPlugin(this.sharedState));

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
