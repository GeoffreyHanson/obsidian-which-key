import {
  determinePrefixes,
  extractIdFirstLetters,
  extractNameFirstLetters,
  generateSortedPrefixes,
  assignPrefixesToCommands,
  type PrefixAssignmentContext,
  type ObsidianCommand,
  type CuratedCommand,
  shuckCommands as shuckCommands,
  buildCommandTrie,
  filterCommandsByIntent,
  createCategoryBuckets,
  generateCategoryPrefixOptions,
  assignCategoryPrefixes,
} from './helpers';

describe('Helper Functions', () => {
  describe('extractIdFirstLetters', () => {
    it('should handle single word after colon', () => {
      const id = 'app:open';
      const result = extractIdFirstLetters(id);
      expect(result).toEqual(['o']);
    });

    it('should handle multiple hyphens', () => {
      const id = 'editor:toggle-bold-text-formatting';
      const result = extractIdFirstLetters(id);
      expect(result).toEqual(['t', 'b', 't', 'f']);
    });

    it('should handle no colon in ID', () => {
      const id = 'simple-command';
      const result = extractIdFirstLetters(id);
      expect(result).toEqual(['s', 'c']);
    });
  });

  describe('extractNameFirstLetters', () => {
    it('should extract first letter from each word', () => {
      const name = 'Open Recent File';
      const result = extractNameFirstLetters(name);
      expect(result).toEqual(['o', 'r', 'f']);
    });

    it('should prioritize numbers in a given string', () => {
      const name = 'Heading #2 Style';
      const result = extractNameFirstLetters(name);
      expect(result).toEqual(['h', '2', 's']);
    });

    it('should extract text after colon', () => {
      const name = 'Table: Insert Column';
      const result = extractNameFirstLetters(name);
      expect(result).toEqual(['i', 'c']);
    });
  });

  describe('generateSortedPrefixes', () => {
    it('should sort prefixes by frequency in ascending order', () => {
      const prefixCounts = {
        a: 5,
        b: 2,
        c: 10,
      };

      const result = generateSortedPrefixes(prefixCounts);

      // Should start with 'b' (highest count) and its lowercase variant
      expect(result[0]).toBe('b');
      expect(result[1]).toBe('B');

      // Should end with 'C' (lowest count) and its uppercase variant
      expect(result.at(-1)).toBe('C');
      expect(result.at(-2)).toBe('c');
    });

    it('should include both uppercase and lowercase variants of each prefix', () => {
      const prefixCounts = {
        x: 1,
        y: 1,
      };

      const result = generateSortedPrefixes(prefixCounts);

      // Should contain all variants
      expect(result).toContain('X');
      expect(result).toContain('x');
      expect(result).toContain('Y');
      expect(result).toContain('y');

      // Should have uppercase first for each prefix
      expect(result.indexOf('x')).toBeLessThan(result.indexOf('X'));
      expect(result.indexOf('y')).toBeLessThan(result.indexOf('Y'));
    });

    it('should handle single prefix', () => {
      const prefixCounts = { s: 1 };
      const result = generateSortedPrefixes(prefixCounts);
      expect(result).toEqual(['s', 'S']);
    });
  });

  describe('assignPrefixesToCommands', () => {
    it('should assign prefixes based on availability', () => {
      const commands: ObsidianCommand[] = [
        { id: 'file:open', name: 'Open' },
        { id: 'file:save', name: 'Save' },
      ];

      const possiblePrefixes = [new Set(['o', 'o']), new Set(['s', 's'])];

      const prefixesToAssign = ['o', 'O', 's', 'S'];
      const parentPrefix = ['f'];

      const context: PrefixAssignmentContext = {
        commands,
        possiblePrefixes,
        prefixesToAssign,
        parentPrefix,
      };

      const result = assignPrefixesToCommands(context);

      expect(result[0].prefix).toEqual(['f', 'o']);
      expect(result[1].prefix).toEqual(['f', 's']);
    });

    it('should assign prefixes from least to most common', () => {
      const commands: ObsidianCommand[] = [
        { id: 'cmd:rare', name: 'Rare Command' },
        { id: 'cmd:common', name: 'Common Command' },
      ];

      const possiblePrefixes = [
        new Set(['r', 'r', 'c']), // First command can use 'r' or 'c'
        new Set(['c', 'c', 'c']), // Second command can only use 'c'
      ];

      // 'c' is more common (appears in both sets), 'r' is less common
      const prefixesToAssign = ['r', 'R', 'c', 'C'];
      const parentPrefix = ['x'];

      const context: PrefixAssignmentContext = {
        commands,
        possiblePrefixes,
        prefixesToAssign,
        parentPrefix,
      };

      const result = assignPrefixesToCommands(context);

      // Should assign 'r' to the first command since it's less common
      // and 'c' to the second command
      expect(result[0].prefix).toEqual(['x', 'r']);
      expect(result[1].prefix).toEqual(['x', 'c']);
    });

    it('should skip commands that already have a prefix', () => {
      const commands: ObsidianCommand[] = [
        { id: 'cmd:first', name: 'First Command', prefix: ['x', 'y'] },
        { id: 'cmd:second', name: 'Second Command' },
      ];

      const possiblePrefixes = [new Set(['f']), new Set(['s'])];

      const prefixesToAssign = ['f', 's'];
      const parentPrefix = ['z'];

      const context: PrefixAssignmentContext = {
        commands,
        possiblePrefixes,
        prefixesToAssign,
        parentPrefix,
      };

      const result = assignPrefixesToCommands(context);

      // First command should keep its existing prefix
      expect(result[0].prefix).toEqual(['x', 'y']);
      // Second command should get a new prefix
      expect(result[1].prefix).toEqual(['z', 's']);
    });

    it('should handle case-insensitive prefix matching', () => {
      const commands: ObsidianCommand[] = [{ id: 'app:test', name: 'Test App' }];

      const possiblePrefixes = [
        new Set(['t']), // Lowercase 't'
      ];

      const prefixesToAssign = ['T']; // Uppercase 'T'
      const parentPrefix = ['a'];

      const context: PrefixAssignmentContext = {
        commands,
        possiblePrefixes,
        prefixesToAssign,
        parentPrefix,
      };

      const result = assignPrefixesToCommands(context);

      // Should match uppercase 'T' with lowercase 't' in the set
      expect(result[0].prefix).toEqual(['a', 'T']);
    });
  });

  describe('determinePrefixes', () => {
    it('should prioritize numbers in command names', () => {
      const commands = [
        { id: 'heading:level-1', name: 'Heading 1' },
        { id: 'heading:level-2', name: 'Heading 2' },
      ];

      const result = determinePrefixes(['h'], commands);

      expect(result[0].prefix).toEqual(['h', '1']);
      expect(result[1].prefix).toEqual(['h', '2']);
    });

    it('should fallback to uppercase letters when options are limited', () => {
      const commands = [
        { id: 'app:open', name: 'Open' },
        { id: 'app:other', name: 'Other' },
      ];

      const result = determinePrefixes(['a'], commands);

      expect(result[0].prefix).toEqual(['a', 'o']);
      expect(result[1].prefix).toEqual(['a', 'O']);
    });
  });

  describe('shuckCommands', () => {
    it('should shuck key and keep value', () => {
      const rawCommands = {
        cmd1: { name: 'Command 1', id: 'cmd1', icon: 'icon1', hotkeys: ['Ctrl+A'] },
        cmd2: { name: 'Command 2', id: 'cmd2', icon: 'icon2', hotkeys: ['Ctrl+B'] },
      };

      const result = shuckCommands(rawCommands);

      expect(result).toEqual([
        { name: 'Command 1', id: 'cmd1', icon: 'icon1', hotkeys: ['Ctrl+A'] },
        { name: 'Command 2', id: 'cmd2', icon: 'icon2', hotkeys: ['Ctrl+B'] },
      ]);
    });
  });

  describe('filterCommandsByIntent', () => {
    it('should filter commands based on intent pattern', () => {
      const commands = [
        { id: 'editor:toggle-bold', name: 'Toggle Bold' },
        { id: 'editor:toggle-italic', name: 'Toggle Italic' },
        { id: 'app:open-settings', name: 'Open Settings' },
      ];

      const pattern = /editor/;
      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('editor:toggle-bold');
      expect(result[1].id).toBe('editor:toggle-italic');
    });

    it('should return empty array when no matches found', () => {
      const commands = [
        { id: 'app:open-vault', name: 'Open Vault' },
        { id: 'app:close', name: 'Close' },
      ];

      const pattern = /editor/;
      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(0);
    });

    it('should handle complex regex patterns', () => {
      const commands = [
        { id: 'editor:format-text', name: 'Format Text' },
        { id: 'editor:format-code', name: 'Format Code' },
        { id: 'editor:insert-link', name: 'Insert Link' },
        { id: 'app:format-vault', name: 'Format Vault' },
      ];

      const pattern = /^editor:format/;
      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('editor:format-text');
      expect(result[1].id).toBe('editor:format-code');
    });
  });

  describe('buildCommandTrie', () => {
    it('should insert commands with prefixes into trie', () => {
      const commands: CuratedCommand[] = [
        { id: 'cmd1', name: 'Command 1', prefix: ['a'] },
        { id: 'cmd2', name: 'Command 2', prefix: ['b'] },
      ];

      const mockTrie = {
        insertVimCommand: jest.fn(),
      };

      buildCommandTrie(commands, mockTrie);

      expect(mockTrie.insertVimCommand).toHaveBeenCalledTimes(2);
      expect(mockTrie.insertVimCommand).toHaveBeenCalledWith(commands[0]);
      expect(mockTrie.insertVimCommand).toHaveBeenCalledWith(commands[1]);
    });
  });

  describe('filterCommandsByIntent', () => {
    it('should filter commands based on pattern', () => {
      const commands: ObsidianCommand[] = [
        { id: 'search:find', name: 'Find', prefix: ['s', 'f'] },
        { id: 'search:replace', name: 'Replace', prefix: ['s', 'r'] },
        { id: 'file:open', name: 'Open File', prefix: ['f', 'o'] },
      ];

      const pattern = /search:/;

      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('search:find');
      expect(result[1].id).toBe('search:replace');
    });

    it('should handle complex patterns with negative lookahead', () => {
      const commands: ObsidianCommand[] = [
        { id: 'search:find', name: 'Find', prefix: ['s', 'f'] },
        { id: 'search:bookmarks', name: 'Search Bookmarks', prefix: ['s', 'b'] },
        { id: 'file:open', name: 'Open File', prefix: ['f', 'o'] },
      ];

      const pattern = /search:(?!.*bookmarks)/;

      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('search:find');
    });

    it('should handle patterns with multiple alternatives', () => {
      const commands: ObsidianCommand[] = [
        { id: 'file:open', name: 'Open File', prefix: ['f', 'o'] },
        { id: 'template:insert', name: 'Insert Template', prefix: ['t', 'i'] },
        { id: 'canvas:new', name: 'New Canvas', prefix: ['c', 'n'] },
      ];

      const pattern = /(?:file:|template:)(?!.*canvas)/;

      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('file:open');
      expect(result[1].id).toBe('template:insert');
    });

    it('should match patterns anywhere in command ID', () => {
      const commands: ObsidianCommand[] = [
        { id: 'core:toggle-link', name: 'Toggle Link', prefix: ['t', 'l'] },
        { id: 'editor:follow-link', name: 'Follow Link', prefix: ['f', 'l'] },
        { id: 'file:open', name: 'Open File', prefix: ['f', 'o'] },
      ];

      const pattern = /link/;

      const result = filterCommandsByIntent(commands, pattern);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('core:toggle-link');
      expect(result[1].id).toBe('editor:follow-link');
    });
  });

  // describe('curateCommands', () => {
  // });

  describe('createCategoryBuckets', () => {
    it('should group commands by category', () => {
      const commands = {
        'editor:copy': { id: 'editor:copy', name: 'Copy' },
        'editor:paste': { id: 'editor:paste', name: 'Paste' },
        'file:open': { id: 'file:open', name: 'Open file' },
        'file:save': { id: 'file:save', name: 'Save file' },
      };

      const result = createCategoryBuckets(commands);

      expect(Object.keys(result)).toHaveLength(2);

      expect(result.editor).toHaveLength(2);
      expect(result.file).toHaveLength(2);

      expect(result.editor[0].name).toBe('Copy');
      expect(result.editor[1].name).toBe('Paste');

      expect(result.file[0].name).toBe('Open file');
      expect(result.file[1].name).toBe('Save file');
    });
  });

  describe('generateCategoryPrefixOptions', () => {
    test('should handle single word category', () => {
      const result = generateCategoryPrefixOptions('editor');
      expect(result).toEqual(['e', 'E', 'd', 'i', 't', 'o', 'r']);
    });

    test('should handle multiple hyphens', () => {
      const result = generateCategoryPrefixOptions('quick-brown-fox');
      expect(result).toEqual(['q', 'Q', 'b', 'B', 'f', 'F', 'u', 'i', 'c', 'k']);
    });
  });

  describe('assignCategoryPrefixes', () => {
    test('should assign unique prefixes to categories', () => {
      const sortedCategories: [string, ObsidianCommand[]][] = [
        ['editor', [{ id: 'editor:format', name: 'Format' }]],
        ['file', [{ id: 'file:open', name: 'Open' }]],
      ];

      const result = assignCategoryPrefixes(sortedCategories);

      expect(Object.keys(result)).toContain('e');
      expect(Object.keys(result)).toContain('f');
      expect(result.e.formattedName).toBe('Editor');
      expect(result.f.formattedName).toBe('File');
      expect(result.e.commands).toEqual([{ id: 'editor:format', name: 'Format' }]);
      expect(result.f.commands).toEqual([{ id: 'file:open', name: 'Open' }]);
    });

    test('should handle prefix collisions by using next available prefix', () => {
      const sortedCategories: [string, ObsidianCommand[]][] = [
        ['editor', [{ id: 'editor:format', name: 'Format' }]],
        ['explorer', [{ id: 'explorer:open', name: 'Open' }]],
      ];

      const prefixMap = assignCategoryPrefixes(sortedCategories);
      const prefixes = Object.keys(prefixMap);

      // Should assign different prefixes despite both starting with 'e'
      expect(prefixes[0]).toBe('e');
      expect(prefixes[1]).toBe('E');
    });

    test('should handle hyphenated category names', () => {
      const sortedCategories: [string, ObsidianCommand[]][] = [
        ['file-explorer', [{ id: 'file-explorer:open', name: 'Open' }]],
      ];

      const result = assignCategoryPrefixes(sortedCategories);

      expect(Object.keys(result)).toContain('f');
      expect(result.f.formattedName).toBe('File explorer');
      expect(result.f.commands).toEqual([{ id: 'file-explorer:open', name: 'Open' }]);
    });

    test('should handle multiple commands in a category', () => {
      const sortedCategories: [string, ObsidianCommand[]][] = [
        [
          'file',
          [
            { id: 'file:open', name: 'Open' },
            { id: 'file:save', name: 'Save' },
            { id: 'file:close', name: 'Close' },
          ],
        ],
      ];

      const result = assignCategoryPrefixes(sortedCategories);

      expect(Object.keys(result)).toContain('f');
      expect(result.f.commands).toHaveLength(3);
      expect(result.f.commands).toEqual([
        { id: 'file:open', name: 'Open' },
        { id: 'file:save', name: 'Save' },
        { id: 'file:close', name: 'Close' },
      ]);
    });
  });

  // describe('categorizeCommands', () => {});
});
