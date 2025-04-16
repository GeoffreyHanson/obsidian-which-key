import { App, PluginSettingTab, Setting } from 'obsidian';
import WhichKey from '../main';

export interface WhichKeySettings {
  categorizedCommands: boolean;
}

export const DEFAULT_SETTINGS: WhichKeySettings = {
  categorizedCommands: false,
};

export class WhichKeySettingsTab extends PluginSettingTab {
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
