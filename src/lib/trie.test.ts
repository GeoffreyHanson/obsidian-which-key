import { CommandTrie } from './trie';

describe('CommandTrie', () => {
  let trie: CommandTrie;

  beforeEach(() => {
    trie = new CommandTrie();
  });

  describe('insertCommand', () => {
    it('should insert a command with prefix', () => {
      trie.insertCommand({
        name: 'Test Command',
        id: 'test:command',
        icon: 'test-icon',
        prefix: ['t', 'c'],
      });

      const result = trie.getPossibleCommands(['t']);
      expect(result).toEqual([
        {
          key: 'c',
          command: {
            name: 'Test Command',
            id: 'test:command',
            icon: 'test-icon',
          },
        },
      ]);
    });
  });

  describe('getCommandId', () => {
    beforeEach(() => {
      trie.insertCommand({
        name: 'Test Command',
        id: 'test:command',
        prefix: ['t', 'c'],
      });
    });

    it('should return command id for valid prefix', () => {
      const result = trie.getCommandId(['t', 'c']);
      expect(result).toBe('test:command');
    });

    it('should return null for invalid prefix', () => {
      const result = trie.getCommandId(['x', 'y']);
      expect(result).toBeNull();
    });
  });

  describe('getPossibleCommands', () => {
    beforeEach(() => {
      // Insert multiple commands
      trie.insertCommand({
        name: 'Test Command 1',
        id: 'test:command1',
        prefix: ['t', '1'],
      });
      trie.insertCommand({
        name: 'Test Command 2',
        id: 'test:command2',
        prefix: ['t', '2'],
      });
    });

    it('should return all commands at root level when no prefix given', () => {
      const results = trie.getPossibleCommands();
      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('t');
    });

    it('should return matching commands for given prefix', () => {
      const results = trie.getPossibleCommands(['t']);
      expect(results).toHaveLength(2);
      expect(results.map(r => r.key).sort()).toEqual(['1', '2']);
    });

    it('should return empty array for non-existent prefix', () => {
      const results = trie.getPossibleCommands(['x']);
      expect(results).toEqual([]);
    });
  });
});
