import { App, MarkdownView } from 'obsidian';
import { CommandTrie } from '../lib/trie';
import { WhichKeyUI } from '../ui/which-key-ui';
import { KEYS } from '../utils/constants';

/**
 * Manages centralized state for key sequence recording, processing, and display
 */
export class SharedState {
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

  /**
   * Update the active command trie
   * @param commandTrie - The command trie
   */
  updateCommandTrie(commandTrie: CommandTrie) {
    this.commandTrie = commandTrie;
  }

  /**
   * Start recording key presses
   */
  startRecording() {
    this.isRecording = true;
    this.currentKeySequence = [];
    const commands = this.commandTrie.getPossibleCommands();
    this.ui.showCommands(commands);
  }

  /**
   * Stop recording key presses, reset relevant state
   */
  stopRecording() {
    this.isRecording = false;
    this.currentKeySequence = [];
    this.ui.hideCommands();
  }

  /**
   * Intercept key presses, preventing default behavior
   * @param event - Keyboard event
   */
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
    // @ts-ignore - Accessing internal CodeMirror state
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

  /**
   * Update the key sequence array & execute if possible
   * @param event - Keyboard event
   */
  updateKeySequence(event: KeyboardEvent) {
    const { key } = event;

    // Reset state when escape is pressed
    if (key === KEYS.ESCAPE) {
      this.stopRecording();
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
      this.stopRecording();
    } else if (commands.length === 0) {
      // No possible completions, reset
      this.stopRecording();
    }
  }
}
