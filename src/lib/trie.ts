const { log } = console;
import { PossibleCommands } from '../types';

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
  getPossibleCommands(prefix?: string[]): PossibleCommands {
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
    const possibilities: PossibleCommands = [];
    Object.entries(current.children).forEach(([key, node]) => {
      possibilities.push({
        key,
        command: {
          name: node.name || '',
          id: node.id,
          icon: node.icon,
        },
      });
    });

    return possibilities;
  }

  /**
   * Insert a command into the trie
   * @param name - Command name
   * @param id - Command id
   * @param icon - Command icon
   * @param prefix - Command prefix
   */
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
    current.id = id;
    current.icon = icon;
    current.isEndOfCommand = !!id;
  }
}
