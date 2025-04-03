import {
  determinePrefixes,
  extractIdFirstLetters,
  extractNameFirstLetters,
  generateSortedPrefixes,
  assignPrefixesToCommands,
  type PrefixAssignmentContext,
  type ObsidianCommand,
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
});
