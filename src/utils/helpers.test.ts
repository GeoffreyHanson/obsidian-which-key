import {
  determinePrefixes,
  extractIdFirstLetters,
  extractNameFirstLetters,
  extractNameRemainingLetters,
  generateSortedPrefixes,
  assignPrefixesToCommands,
  shuckCommands as shuckCommands,
  buildCommandTrie,
  filterCommandsByIntent,
  createCategoryBuckets,
  generateCategoryPrefixOptions,
  assignCategoryPrefixes,
  categorizeCommands,
  curateCommands,
} from './helpers';
import {
  type PrefixAssignmentContext,
  type CuratedCommand,
  type ObsidianCommand,
  LeanCommand,
  PossibleCommands,
} from '../types';
import { obsidianCommands } from '../__fixtures__/obsidian-commands';
import { intentMappings, intentRegexes, topLevelMappings } from '../utils/constants';
import { CommandTrie } from '../lib/trie';

const commandsWithoutIds = shuckCommands(obsidianCommands);

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
    it('should extract text after colon and the first letter from each word', () => {
      const name = 'Table: Insert Column';
      const result = extractNameFirstLetters(name);
      expect(result).toEqual(['i', 'c']);
    });

    it('should prioritize numbers in a given string', () => {
      const name = 'Heading #2 Style';
      const result = extractNameFirstLetters(name);
      expect(result).toEqual(['h', '2', 's']);
    });
  });

  describe('extractNameRemainingLetters', () => {
    it('should extract remaining letters from the first word of the command name', () => {
      const name = 'Table: Insert Column';
      const result = extractNameRemainingLetters(name);
      expect(result).toEqual(['n', 's', 'e', 'r', 't']);
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

      const preferredPrefixes = [new Set(['o', 'o']), new Set(['s', 's'])];
      const fallbackPrefixes = [new Set(['p', 'e', 'n']), new Set(['a', 'v', 'e'])];

      const prefixesToAssign = new Set(['o', 'O', 's', 'S', 'a', 'A', 'v', 'V', 'e', 'E']);
      const parentPrefix = ['f'];
      const context: PrefixAssignmentContext = {
        parentPrefix: parentPrefix,
        commandBucket: commands,
        prefixesToAssign,
        preferredPrefixes,
        fallbackPrefixes,
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

      const preferredPrefixes = [
        new Set(['r', 'r', 'c']), // First command can use 'r' or 'c'
        new Set(['c', 'c', 'c']), // Second command can only use 'c'
      ];
      const fallbackPrefixes = [new Set(['a', 'r', 'e']), new Set(['o', 'm', 'n'])];

      // 'c' is more common (appears in both sets), 'r' is less common
      const prefixesToAssign = new Set([
        'r',
        'R',
        'c',
        'C',
        'a',
        'A',
        'e',
        'E',
        'o',
        'O',
        'm',
        'M',
        'n',
        'N',
      ]);
      const parentPrefix = ['x'];

      const context: PrefixAssignmentContext = {
        commandBucket: commands,
        preferredPrefixes: preferredPrefixes,
        fallbackPrefixes,
        prefixesToAssign,
        parentPrefix: parentPrefix,
      };

      const result = assignPrefixesToCommands(context);

      // Should assign 'r' to the first command since it's less common
      // and 'c' to the second command
      expect(result[0].prefix).toEqual(['x', 'r']);
      expect(result[1].prefix).toEqual(['x', 'c']);
    });

    it('should skip commands that already have a prefix', () => {
      const commands: LeanCommand[] = [
        { id: 'cmd:first', name: 'First Command', prefix: ['x', 'y'] },
        { id: 'cmd:second', name: 'Second Command' },
      ];

      const preferredPrefixes = [new Set(['f']), new Set(['s'])];
      const fallbackPrefixes = [new Set(['i', 'r', 's', 't']), new Set(['e', 'c', 'o', 'n', 'd'])];

      const prefixesToAssign = new Set([
        'f',
        'F',
        's',
        'S',
        'i',
        'I',
        'r',
        'R',
        's',
        'S',
        't',
        'T',
        'e',
        'E',
        'c',
        'C',
        'o',
        'O',
        'n',
        'N',
        'd',
        'D',
      ]);
      const parentPrefix = ['z'];

      const context: PrefixAssignmentContext = {
        commandBucket: commands,
        preferredPrefixes,
        fallbackPrefixes,
        prefixesToAssign,
        parentPrefix: parentPrefix,
      };

      const result = assignPrefixesToCommands(context);

      // First command should keep its existing prefix
      expect(result[0].prefix).toEqual(['x', 'y']);
      // Second command should get a new prefix
      expect(result[1].prefix).toEqual(['z', 's']);
    });

    it('should handle case-insensitive prefix matching', () => {
      const commands: ObsidianCommand[] = [{ id: 'app:test', name: 'Test App' }];

      const preferredPrefixes = [new Set(['t', 'a'])];
      const fallbackPrefixes = [new Set(['e', 's'])];

      // if 't' has already been assigned
      const prefixesToAssign = new Set(['T', 'a', 'A', 'e', 'E', 's', 'S']);
      const parentPrefix = ['a'];

      const context: PrefixAssignmentContext = {
        commandBucket: commands,
        preferredPrefixes,
        fallbackPrefixes,
        prefixesToAssign,
        parentPrefix: parentPrefix,
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
        cmd1: {
          name: 'Command 1',
          id: 'cmd1',
          icon: 'icon1',
          hotkeys: [{ modifiers: ['Ctrl'], key: 'A' }],
        },
        cmd2: {
          name: 'Command 2',
          id: 'cmd2',
          icon: 'icon2',
          hotkeys: [{ modifiers: ['Ctrl'], key: 'B' }],
        },
      };

      const result = shuckCommands(rawCommands);

      expect(result).toEqual([
        {
          name: 'Command 1',
          id: 'cmd1',
          icon: 'icon1',
          hotkeys: [{ modifiers: ['Ctrl'], key: 'A' }],
        },
        {
          name: 'Command 2',
          id: 'cmd2',
          icon: 'icon2',
          hotkeys: [{ modifiers: ['Ctrl'], key: 'B' }],
        },
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

    // Filter intent patterns
    it('should filter bookmark commands', () => {
      const commandIdsToMatch = [
        'bookmarks:open',
        'bookmarks:bookmark-all-tabs',
        'bookmarks:bookmark-current-heading',
        'bookmarks:bookmark-current-search',
        'bookmarks:bookmark-current-section',
        'bookmarks:bookmark-current-view',
        'bookmarks:unbookmark-current-view',
      ];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, intentRegexes.b).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });

    it('should filter canvas commands', () => {
      const commandIdsToMatch = [
        'canvas:convert-to-file',
        'canvas:export-as-image',
        'canvas:jump-to-group',
        'canvas:new-file',
      ];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, intentRegexes.c).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });

    it('should filter daily notes commands', () => {
      const commandIdsToMatch = ['daily-notes', 'daily-notes:goto-next', 'daily-notes:goto-prev'];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, intentRegexes.d).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });

    it('should filter graph commands', () => {
      const commandIdsToMatch = ['graph:animate', 'graph:open', 'graph:open-local'];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, intentRegexes.g).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });

    it('should filter search commands', () => {
      const commandIdsToMatch = [
        'editor:open-search',
        'editor:open-search-replace',
        'global-search:open',
        'switcher:open',
        'command-palette:open',
        'webviewer:search',
      ];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, intentRegexes.s).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });

    it('should filter sync commands', () => {
      const commandIdsToMatch = [
        'sync:open-sync-log',
        'sync:open-sync-view',
        'sync:setup',
        'sync:view-version-history',
      ];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, intentRegexes.S).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });
  });

  describe('buildCommandTrie', () => {
    it('should insert commands with prefixes into trie', () => {
      const commands: CuratedCommand[] = [
        { id: 'cmd1', name: 'Command 1', prefix: ['a'] },
        { id: 'cmd2', name: 'Command 2', prefix: ['b'] },
      ];

      const mockTrie = {
        insertCommand: jest.fn(),
      };

      buildCommandTrie(commands, mockTrie);

      expect(mockTrie.insertCommand).toHaveBeenCalledTimes(2);
      expect(mockTrie.insertCommand).toHaveBeenCalledWith(commands[0]);
      expect(mockTrie.insertCommand).toHaveBeenCalledWith(commands[1]);
    });
  });

  describe('curateCommands', () => {
    it('should properly organize commands by intent categories', () => {
      const leanCommands = shuckCommands(obsidianCommands);

      const result = curateCommands(
        leanCommands,
        topLevelMappings,
        intentMappings,
        new CommandTrie()
      );

      // Test specific command categorization
      // Editor commands
      const editorCommands = result.getPossibleCommands(['t']); // 't' is for text/editor commands
      expect(editorCommands).toContainEqual(
        expect.objectContaining({
          command: expect.objectContaining({
            id: 'editor:toggle-bold',
            name: 'Toggle bold',
          }),
        })
      );

      // File commands
      const fileCommands = result.getPossibleCommands(['f']); // 'f' is for file commands
      expect(fileCommands).toContainEqual(
        expect.objectContaining({
          command: expect.objectContaining({
            id: 'file-explorer:new-file',
            name: 'Create new note',
          }),
        })
      );

      // Search commands
      const searchCommands = result.getPossibleCommands(['s']); // 's' is for search
      expect(searchCommands).toContainEqual(
        expect.objectContaining({
          command: expect.objectContaining({
            id: 'global-search:open',
            name: 'Search: Search in all files',
          }),
        })
      );

      // Test that related commands stay grouped
      const tableCommands = result.getPossibleCommands(['T']); // 'T' for table commands
      expect(tableCommands).toContainEqual(
        expect.objectContaining({
          command: expect.objectContaining({
            id: 'editor:table-row-before',
          }),
        })
      );
      expect(tableCommands).toContainEqual(
        expect.objectContaining({
          command: expect.objectContaining({
            id: 'editor:table-col-after',
          }),
        })
      );

      // Verify top level command prefixes are unique
      const allCommands = result.getPossibleCommands();
      const prefixes = new Set(allCommands.map((command: PossibleCommands[number]) => command.key));
      expect(prefixes.size).toBe(allCommands.length);
    });

    it('should handle command conflicts and assign unique prefixes', () => {
      // Test with a subset of commands that would naturally conflict
      const conflictingCommands = {
        'editor:toggle-bold': obsidianCommands['editor:toggle-bold'],
        'editor:toggle-bullet-list': obsidianCommands['editor:toggle-bullet-list'],
        // Both would want to use 't' and 'b' prefixes
      };

      const trie = new CommandTrie();
      const result = curateCommands(
        shuckCommands(conflictingCommands),
        topLevelMappings,
        intentMappings,
        trie
      );

      // Verify each command got a unique prefix
      const commands = result.getPossibleCommands();
      const prefixes = commands.map((command: PossibleCommands[number]) => command.key);
      const uniquePrefixes = new Set(prefixes);
      expect(uniquePrefixes.size).toBe(prefixes.length);
    });
  });

  describe('createCategoryBuckets', () => {
    it('should group commands by category using real data', () => {
      const commands = shuckCommands(obsidianCommands);

      const result = createCategoryBuckets(commands);

      expect(result).toHaveProperty('editor');
      expect(result).toHaveProperty('workspace');
      expect(result).toHaveProperty('app');

      // Test that categories contain respective commands
      expect(result.editor.some(command => command.id === 'editor:save-file')).toBe(true);
      expect(result.workspace.some(command => command.id === 'workspace:split-vertical')).toBe(
        true
      );

      // Test that the formatting of commands is preserved
      const saveCommand = result.editor.find(command => command.id === 'editor:save-file');
      expect(saveCommand).toMatchObject({
        id: 'editor:save-file',
        name: 'Save current file',
      });
    });
  });

  describe('generateCategoryPrefixOptions', () => {
    test('should handle single word category', () => {
      const result = generateCategoryPrefixOptions('editor');
      expect(result).toEqual(['e', 'E', 'd', 'D', 'i', 'I', 't', 'T', 'o', 'O', 'r', 'R']);
    });

    test('should handle multiple hyphens', () => {
      const result = generateCategoryPrefixOptions('quick-brown-fox');
      expect(result).toEqual([
        'q',
        'Q',
        'b',
        'B',
        'f',
        'F',
        'u',
        'U',
        'i',
        'I',
        'c',
        'C',
        'k',
        'K',
      ]);
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

  describe('categorizeCommands', () => {
    it('should create and return all expected categories', () => {
      const leanCommands = shuckCommands(obsidianCommands);
      const trie = new CommandTrie();
      const result = categorizeCommands(leanCommands, trie);

      // Get all top-level categories
      const categories = result.getPossibleCommands();

      // Define expected categories based on the command structure
      const expectedCategories = [
        'App',
        'Audio recorder',
        'Backlink',
        'Bookmarks',
        'Canvas',
        'Command palette',
        'Daily notes',
        'Editor',
        'File explorer',
        'File recovery',
        'Global search',
        'Graph',
        'Insert current date',
        'Insert current time',
        'Insert template',
        'Markdown',
        'Markdown importer',
        'Note composer',
        'Open with default app',
        'Outgoing links',
        'Outline',
        'Properties',
        'Publish',
        'Random note',
        'Slides',
        'Switcher',
        'Sync',
        'Tag pane',
        'Templater obsidian',
        'Theme',
        'Webviewer',
        'Window',
        'Workspace',
        'Workspaces',
        'Zk prefixer',
      ];

      // Verify each expected category exists
      expectedCategories.forEach(categoryName => {
        expect(categories).toContainEqual(
          expect.objectContaining({
            command: expect.objectContaining({
              name: categoryName,
            }),
          })
        );
      });

      // Verify we found all categories (no extras or missing ones)
      const foundCategoryNames = categories.map(
        (category: PossibleCommands[number]) => category.command.name
      );
      expect(foundCategoryNames.sort()).toEqual(expectedCategories.sort());
    });
  });
});
