import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
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

  update(update: ViewUpdate) {
    // @ts-ignore - not typed
    const insertMode = update?.view?.cm?.state?.vim?.insertMode;
    EditorListener.state.insertMode = insertMode;
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
