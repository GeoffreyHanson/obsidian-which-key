const { log } = console;
import { WhichKeyCommand, CategorizedCommand } from './types';
import { KEYS } from './utils/constants';

export class TrieNode {
  children: Record<string, TrieNode>;
  name?: string;
  id?: string;
  icon?: string;
  isEndOfCommand: boolean;

  constructor() {
    this.children = {};
    this.isEndOfCommand = false;
  }
}
export class CommandTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  /** Get command id for a prefix */
  getCommandId(prefix: string[]): string | null {
    let current = this.root;
    log('getting command for prefix:', prefix);

    for (const key of prefix) {
      if (!(key in current.children)) {
        log('no child found for key:', key);
        return null;
      }
      current = current.children[key];
    }

    return current.id || null;
  }

  /** Get all possible completions for a prefix */
  getPossibleCommands(prefix?: string[]): Array<{ key: string; command: WhichKeyCommand }> {
    let current = this.root;

    // If prefix exists, walk down to the prefix node
    if (prefix?.length) {
      for (const key of prefix) {
        if (!(key in current.children)) {
          return [];
        }
        current = current.children[key];
      }
    }

    // Get all possible children from current node
    const possibilities: Array<{ key: string; command: WhichKeyCommand }> = [];
    Object.entries(current.children).forEach(([key, node]) => {
      if (node.name) {
        possibilities.push({
          key,
          command: {
            name: node.name,
            id: node.id,
            icon: node.icon,
          },
        });
      }
    });

    // log('possible commands:', possibilities);
    return possibilities;
  }

  // Inserts nested commands into the trie under each category
  insertCommands(category: string, commands: Record<string, CategorizedCommand>) {
    // Get first letter of each word as prefix options
    const primaryCategoryOptions = category
      .split('-')
      .map(word => [word[0].toLowerCase(), word[0].toUpperCase()])
      .flat();

    // Letters of the first word except for the first
    const secondaryCategoryOptions = category.split('-')[0].split('').slice(1);

    const categoryPrefixOptions = [...primaryCategoryOptions, ...secondaryCategoryOptions];

    const current = this.root;
    let categoryNode = null;
    let foundCategory = false;

    for (const prefix of categoryPrefixOptions) {
      if (!(prefix in current.children)) {
        current.children[prefix] = new TrieNode();
        categoryNode = current.children[prefix];

        categoryNode.name = category;
        categoryNode.id = undefined;
        categoryNode.isEndOfCommand = false;

        foundCategory = true;
        break;
      }
    }

    if (!foundCategory) {
      log(`Category skipped - no available prefix: ${category}`);
      return;
    }

    // Insert commands into the category node
    Object.entries(commands).forEach(([abvCommandName, command]) => {
      // const sequenceOptions = command.name.split(' ').map(word => word[0].toLowerCase());
      const primaryPrefixOptions = command.name
        .split(KEYS.SPACE)
        .map(word => [word[0].toLowerCase(), word[0].toUpperCase()])
        .flat();

      const secondaryPrefixOption = command.name.split(KEYS.SPACE)[0].split('').slice(1);

      const sequenceOptions = [...primaryPrefixOptions, ...secondaryPrefixOption];

      let current = categoryNode;

      if (!current) {
        log(`Command skipped - category node missing: ${category}:${abvCommandName}`);
        return; // Skip if category node doesn't exist
      }

      // Find the first available sequence option
      let foundCommandSlot = false;

      for (const prefix of sequenceOptions) {
        // Check if this slot is available
        if (!(prefix in current.children)) {
          // Found an open slot, create the node
          current.children[prefix] = new TrieNode();
          current = current.children[prefix];
          foundCommandSlot = true;
          break; // Exit loop after finding the first available slot
        }
      }

      if (!foundCommandSlot) {
        log(`Command skipped - no available prefix: ${category}:${abvCommandName}`);
        return;
      }

      // Now set the command properties on the current node
      current.name = command.name;
      current.id = command.id;
      current.isEndOfCommand = true;
    });
  }

  // insertCommand({ prefix, name, commandId }) {
  insertCommand({
    name,
    id,
    icon,
    prefix,
  }: {
    name: string;
    id?: string;
    icon?: string;
    prefix?: string[];
  }) {
    let current = this.root;

    if (prefix) {
      for (const key of prefix) {
        if (!(key in current.children)) {
          current.children[key] = new TrieNode();
        }
        current = current.children[key];
      }
    }

    current.name = name;
    current.id = id || undefined;
    current.icon = icon || 'keyboard';
    // current.isEndOfCommand = !!id;
    current.isEndOfCommand = !!current.children;
  }
}
