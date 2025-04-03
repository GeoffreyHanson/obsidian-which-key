import { determinePrefixes } from './helpers';

describe('Helper Functions', () => {
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
