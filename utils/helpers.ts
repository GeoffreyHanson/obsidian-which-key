const { log } = console;
/**
 * Determine prefixes for commands
 * @param prefixArray - Array with intent prefix
 * @param commands - Array of commands to determine prefixes for
 * @returns Array of commands with determined prefixes
 */
export function determinePrefixes(prefixArray, commands) {
  // Counts for all commands in a given bucket
  const prefixCounts = {};

  /** Set of possible prefixes for each command */
  const possiblePrefixes = commands.map(command => {
    const { id, name } = command;

    // Split on : or - and grab the first letter of each word
    // const idFirstLetters = id.split(/[:-]/g).map(word => word[0].toLowerCase());
    const idFirstLetters = id
      .split(':')
      .at(-1)
      .split('-')
      .map(word => word[0].toLowerCase());

    // Ignore command category and split on space
    const nameFirstLetters = name
      .split(':')
      .at(-1)
      .trim()
      .split(' ')
      .map((word: string) => {
        // Prioritize numbers
        const number = word.match(/[0-9]/)?.[0];
        if (number) return number;
        // Skip special characters
        // if (word[0].match(/[^a-zA-Z0-9]/)) continue;
        return word[0].toLowerCase();
      });

    const firstLetters = new Set([...nameFirstLetters, ...idFirstLetters]);

    // Update counts
    for (const letter of firstLetters) {
      prefixCounts[letter] = (prefixCounts[letter] || 0) + 1;
    }

    // log('prefixCounts', prefixCounts, prefixArray);
    return new Set(firstLetters);
  });

  const prefixesToAssign = Object.entries(prefixCounts)
    .sort(([, a], [, b]) => b - a)
    .flatMap(([prefix]) => [prefix.toUpperCase(), prefix]);

  log('sortedPrefixCounts', prefixesToAssign);
  // Decrement through sorted prefix counts, assigning prefixes starting with the least common
  for (let i = prefixesToAssign.length - 1; i >= 0; i--) {
    const prefix = prefixesToAssign[i];

    for (let j = 0; j < commands.length; j++) {
      if (
        !commands[j].prefix &&
        possiblePrefixes[j].has(prefix.toLowerCase()) &&
        Number.isNumber(prefix)
      ) {
        commands[j].prefix = [...prefixArray, prefix];
        break;
      } else if (!commands[j].prefix && possiblePrefixes[j].has(prefix.toLowerCase())) {
        commands[j].prefix = [...prefixArray, prefix];
        break;
      }
    }
  }

  const unassignedCommands = commands.filter(command => !command.prefix);
  log('unassignedCommands', unassignedCommands);

  log('commands with prefixes:', commands);
  return commands;
}
