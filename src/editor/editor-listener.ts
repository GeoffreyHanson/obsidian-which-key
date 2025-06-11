import { EditorView, PluginValue, ViewPlugin } from '@codemirror/view';
import { SharedState } from '../state/shared-state';

/**
 * Intercepts key presses in the editor
 */
export class EditorListener implements PluginValue {
  private static state: SharedState;
  private view: EditorView;

  static setState(state: SharedState) {
    EditorListener.state = state;
  }

  constructor(view: EditorView) {
    this.view = view;
    // Needed to pick up key presses inside the editor
    view.dom.addEventListener('keydown', EditorListener.state.handleKeyPress, true);
  }

  destroy() {
    this.view.dom.removeEventListener('keydown', EditorListener.state.handleKeyPress, true);
  }
}

/**
 * Initialize CodeMirror plugin for instantiation
 * @param state - The key manager
 * @returns The editor listener
 */
export const initializeEditorListener = (state: SharedState) => {
  EditorListener.setState(state);
  return ViewPlugin.fromClass(EditorListener);
};
