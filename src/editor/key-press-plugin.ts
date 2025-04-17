import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { SharedState } from '../state/shared-state';

/**
 * This plugin intercepts key presses in the editor
 */
export class KeyPressViewPlugin implements PluginValue {
  private static sharedState: SharedState;
  private view: EditorView;

  static setKeyManager(sharedState: SharedState) {
    KeyPressViewPlugin.sharedState = sharedState;
  }

  constructor(view: EditorView) {
    this.view = view;
    // Needed to pick up key presses inside the editor
    view.dom.addEventListener('keydown', KeyPressViewPlugin.sharedState.handleKeyPress, true);
  }

  /**
   * Update the insert mode state
   * @param update - View update
   */
  update(update: ViewUpdate) {
    // @ts-ignore - not typed
    const insertMode = update?.view?.cm?.state?.vim?.insertMode;
    KeyPressViewPlugin.sharedState.insertMode = insertMode;
  }

  destroy() {
    this.view.dom.removeEventListener(
      'keydown',
      KeyPressViewPlugin.sharedState.handleKeyPress,
      true
    );
  }
}

export const createKeyPressPlugin = (keyManager: SharedState) => {
  KeyPressViewPlugin.setKeyManager(keyManager);
  return ViewPlugin.fromClass(KeyPressViewPlugin);
};
