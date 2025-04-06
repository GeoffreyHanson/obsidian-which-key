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
  categorizeCommands,
  curateCommands,
} from './helpers';
import { obsidianCommands } from '../__fixtures__/obsidian-commands';
import { intentMappings, topLevelMappings } from '../utils/constants';
import { patterns } from '../utils/constants';

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

    // Filter intent patterns
    it('should filter canvas commands', () => {
      const commandIdsToMatch = [
        'canvas:convert-to-file',
        'canvas:export-as-image',
        'canvas:jump-to-group',
        'canvas:new-file',
      ];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, patterns.c).map(
        command => command.id
      );

      expect(filteredIds.length).toBe(commandIdsToMatch.length);
      commandIdsToMatch.forEach(id => {
        expect(filteredIds).toContain(id);
      });
    });

    it('should filter graph commands', () => {
      const commandIdsToMatch = ['graph:animate', 'graph:open', 'graph:open-local'];

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, patterns.g).map(
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

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, patterns.s).map(
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

      const filteredIds = filterCommandsByIntent(commandsWithoutIds, patterns.S).map(
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
        insertVimCommand: jest.fn(),
      };

      buildCommandTrie(commands, mockTrie);

      expect(mockTrie.insertVimCommand).toHaveBeenCalledTimes(2);
      expect(mockTrie.insertVimCommand).toHaveBeenCalledWith(commands[0]);
      expect(mockTrie.insertVimCommand).toHaveBeenCalledWith(commands[1]);
    });
  });

  // describe('curateCommands', () => {
  //   class MockCommandTrie {
  //     commands: CuratedCommand[] = [];
  //     insertVimCommand(command: CuratedCommand) {
  //       this.commands.push(command);
  //     }
  //   }

  // it('should sort commands by intent and identify unsorted commands', () => {
  //   const result = curateCommands(
  //     obsidianCommands,
  //     topLevelMappings,
  //     intentMappings,
  //     MockCommandTrie
  //   );

  //   // Get all command IDs from the input
  //   const allCommandIds = new Set(Object.keys(obsidianCommands));

  //   // Get all curated command IDs (excluding top-level mappings)
  //   const curatedCommandIds = new Set(
  //     result.commands
  //       .filter((cmd: CuratedCommand) => cmd.id && !topLevelMappings.some(m => m.id === cmd.id))
  //       .map((cmd: CuratedCommand) => cmd.id as string)
  //   );

  //   // Find commands that weren't sorted by intent
  //   const uncategorizedCommands = Array.from(allCommandIds)
  //     .filter(id => !curatedCommandIds.has(id))
  //     .map(id => ({
  //       id,
  //       command: obsidianCommands[id as keyof typeof obsidianCommands],
  //       matchedIntent: intentMappings.find(m => m.pattern.test(id))?.name || 'none',
  //     }));

  //   if (uncategorizedCommands.length > 0) {
  //     console.log(
  //       'Commands not categorized by any intent:',
  //       uncategorizedCommands.map(cmd => ({
  //         id: cmd.id,
  //         name: cmd.command.name,
  //         matchedIntent: cmd.matchedIntent,
  //       }))
  //     );
  //   }

  //   // The test should fail if there are any uncategorized commands
  //   expect(uncategorizedCommands).toHaveLength(0);

  //   // Group commands by their intent categories for analysis
  //   const commandsByCategory = new Map<string, CuratedCommand[]>();
  //   result.commands
  //     .filter((cmd: CuratedCommand) => cmd.id && !topLevelMappings.some(m => m.id === cmd.id))
  //     .forEach((cmd: CuratedCommand) => {
  //       const category = intentMappings.find(intent => intent.pattern.test(cmd.id || ''))?.name;
  //       if (category) {
  //         if (!commandsByCategory.has(category)) {
  //           commandsByCategory.set(category, []);
  //         }
  //         commandsByCategory.get(category)?.push(cmd);
  //       }
  //     });

  //   // Log commands by category for analysis
  //   console.log(
  //     'Commands by category:',
  //     Array.from(commandsByCategory.entries()).map(([category, commands]) => ({
  //       category,
  //       count: commands.length,
  //       prefix: intentMappings.find(intent => intent.name === category)?.prefix[0],
  //       commands: commands.map(c => c.name),
  //     }))
  //   );
  // });
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
    class MockCommandTrie {
      commands: CuratedCommand[] = [];
      insertVimCommand(command: CuratedCommand) {
        this.commands.push(command);
      }
    }

    it('should assign all categories to buckets with prefixes', () => {
      const result = categorizeCommands(obsidianCommands, MockCommandTrie);

      // Get top level commands (categories)
      const topLevelCommands = result.commands.filter(
        (cmd: CuratedCommand) => cmd.prefix?.length === 1
      );
      const subCommands = result.commands.filter((cmd: CuratedCommand) => cmd.prefix?.length === 2);

      // Verify we have both top level and sub commands
      expect(topLevelCommands.length).toBeGreaterThan(0);
      expect(subCommands.length).toBeGreaterThan(0);

      // Verify each category has a corresponding top-level command with a prefix
      const assignedCategories = new Set(subCommands.map((cmd: CuratedCommand) => cmd.prefix[0]));

      // Every category should have a prefix assigned
      expect(assignedCategories.size).toBeGreaterThan(0);

      // Verify each sub-command has a valid parent category prefix
      subCommands.forEach((cmd: CuratedCommand) => {
        expect(assignedCategories.has(cmd.prefix[0])).toBe(true);
      });

      // Verify no duplicate prefixes at category level
      const uniquePrefixes = new Set(topLevelCommands.map((cmd: CuratedCommand) => cmd.prefix[0]));
      expect(uniquePrefixes.size).toBe(topLevelCommands.length);

      // Verify each command has required properties
      result.commands.forEach((cmd: CuratedCommand) => {
        expect(cmd).toHaveProperty('prefix');
        expect(cmd).toHaveProperty('name');
        expect(Array.isArray(cmd.prefix)).toBe(true);
        expect(cmd.prefix.length).toBeGreaterThan(0);
      });
    });

    // it('should assign prefixes to all commands within each category', () => {
    //   const result = categorizeCommands(obsidianCommands, MockCommandTrie);

    //   // Group commands by their top-level category prefix
    //   const commandsByCategory = new Map<string, CuratedCommand[]>();
    //   result.commands.forEach((cmd: CuratedCommand) => {
    //     if (!cmd.prefix || cmd.prefix.length === 0) return;
    //     const categoryPrefix = cmd.prefix[0];
    //     if (!commandsByCategory.has(categoryPrefix)) {
    //       commandsByCategory.set(categoryPrefix, []);
    //     }
    //     commandsByCategory.get(categoryPrefix)?.push(cmd);
    //   });

    //   // For each category, verify all commands have complete prefixes
    //   commandsByCategory.forEach((commands, categoryPrefix) => {
    //     // Category should have at least one command
    //     expect(commands.length).toBeGreaterThan(0);

    //     // All commands in category should have a complete prefix (length 2)
    //     const unassignedCommands = commands.filter(cmd => !cmd.prefix || cmd.prefix.length !== 2);
    //     if (unassignedCommands.length > 0) {
    //       console.log(
    //         `Category ${categoryPrefix} has commands without complete prefixes:`,
    //         unassignedCommands.map(cmd => cmd.name)
    //       );
    //     }
    //     expect(unassignedCommands.length).toBe(0);

    //     // All commands should have the category prefix as their first prefix
    //     commands.forEach(cmd => {
    //       expect(cmd.prefix[0]).toBe(categoryPrefix);
    //     });
    //   });
    // });
  });
});
