import { setIcon } from 'obsidian';
import { KEYS } from '../utils/constants';
import { CommandNode } from '../types';

export class WhichKeyUI {
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

  /**
   * Display possible commands based on the key pressed
   * @param possibleCommands - Commands to show
   * @param keysPressed - Keys pressed
   */
  showCommands(
    possibleCommands: Array<{ key: string; command: CommandNode }>,
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
