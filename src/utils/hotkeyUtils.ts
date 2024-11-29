// src/utils/hotkeyUtils.ts
import { App, Hotkey, Modifier, Platform } from 'obsidian';
// import type { hotkeyDict, hotkeyEntry } from 'src/Interfaces';

interface HotkeyDict {
	[command: string]: {
		id: string;
		pluginName: string;
		cmdName: string;
		hotkeys: HotkeyEntry[];
	};
}   

interface HotkeyEntry {
	modifiers: string;
	key: string;
	isCustom: boolean;
}

/** Retrieves and organizes hotkeys for all commands registered in the application. */
export function getHotkeysV2(app: any) {
	let hotKeyDict = {};
	const { hotkeyManager } = app;
	// const hkm = app.hotkeyManager;

	// Iterate through each command and fetch associated hotkeys.
	Object.entries(app.commands.commands).forEach(([id, command]) => {
		let isBuiltInCommand = command.name.split(':').length === 1;
		let pluginName: string = isBuiltInCommand
			? command.id.charAt(0).toUpperCase() + command.id.split(':')[0].slice(1)
			: command.name.split(':', 2)[0];

		let cmdName: string = isBuiltInCommand
			? command.name
			: command.name.split(':').slice(1).join(':');
			
		let hotkeys: Hotkey[] = (hotkeyManager.getHotkeys(command.id) ||
			hotkeyManager.getDefaultHotkeys(command.id) ||
			[]);

		// Generate hotkey entries and add them to the dictionary.
		hotkeys.forEach((hotkey) => {
			let hotkeyObj = prepareHotkey(hotkey, app);
			if (!hotKeyDict[id]) {
				hotKeyDict[id] = {
					id,
					pluginName,
					cmdName,
					hotkeys: [hotkeyObj],
				};
			} else {
				hotKeyDict[id].hotkeys.push(hotkeyObj);
			}
		});
	});
	return hotKeyDict;
}

// Prepares a hotkey entry by normalizing its modifiers and checking if it's customized.
function prepareHotkey(hotkey: Hotkey, app: App) {
	let hotkeyObj: HotkeyEntry = {
		modifiers: getConvertedModifiers(hotkey.modifiers).join(','),
		key: hotkey.key,
		isCustom: isCustomizedHotkey(hotkey, app)
	};
	return hotkeyObj;
}

// Determines whether a hotkey is customized based on the application's hotkey manager.
export function isCustomizedHotkey(hotkey: Hotkey, app: any): boolean {
	let customKeys = app.hotkeyManager.customKeys[hotkey.key];
	return customKeys?.some((customKey: any) =>
		customKey.modifiers.length === hotkey.modifiers.length &&
		customKey.modifiers.every((mod: any, index: any) => mod === hotkey.modifiers[index])
	);
}

// Fetches the command name by its ID, useful for linking hotkeys to their commands.
export function getCommandNameById(id: string, app: any): string {
	let cmd = app.commands.commands[id];
	return cmd ? cmd.name : '';
}

// Converts standard modifier keys to OS-specific modifier keys. 
export function getConvertedModifiers(modifiers: Modifier[]): string[] {
	return modifiers.map(modifier => {
		if (modifier === 'Mod') {
			return Platform.isMacOS ? 'Cmd' : 'Ctrl';
		} else if (modifier === 'Meta') {
			return Platform.isMacOS ? 'Cmd' : 'Win';
		}
		return modifier;
	});
}

// Sorts modifiers in a consistent order, typically used for display or comparison purposes.
export function sortModifiers(modifiers: string[]): string[] {
	const priority = { 'Cmd': 1, 'Ctrl': 2, 'Alt': 3, 'Shift': 4 };
	return modifiers.sort((a, b) => priority[a] - priority[b]);
}

// Formats a list of modifiers into a string, optionally sorting them for consistency.
export function bakeModifierToString(modifiers: string[], sort: boolean = true): string {
	if (sort) {
		modifiers = sortModifiers(modifiers);
	}
	return modifiers.join(' + ');
}

// Splits a string of modifiers into an array, typically used for parsing configurations.
export function unbakeModifiersToArray(modifiers: string, delimiter: string = ','): Modifier[] {
	return modifiers.split(delimiter) as Modifier[];
}

// Prepares a string of modifiers for display by sorting and formatting them correctly.
export function prepareModifiersString(modifiers: string[]): string {
	return modifiers.length ? bakeModifierToString(modifiers) : '';
}
