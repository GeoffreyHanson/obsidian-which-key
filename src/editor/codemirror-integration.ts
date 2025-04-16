import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { SharedState } from '../state/shared-state';

/**
 * This plugin intercepts key presses in the editor
 */
export class WhichKeyEditorPlugin implements PluginValue {
  private static sharedState: SharedState;
  private view: EditorView;

  static setKeyManager(sharedState: SharedState) {
    WhichKeyEditorPlugin.sharedState = sharedState;
  }

  constructor(view: EditorView) {
    this.view = view;
    // Needed to pick up key presses inside the editor
    view.dom.addEventListener('keydown', WhichKeyEditorPlugin.sharedState.handleKeyPress, true);
  }

  /**
   * Update the insert mode state
   * @param update - View update
   */
  update(update: ViewUpdate) {
    // @ts-ignore - not typed
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
