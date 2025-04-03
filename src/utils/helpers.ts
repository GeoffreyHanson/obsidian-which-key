const { log } = console;

export interface ObsidianCommand {
  id: string;
  name: string;
  prefix?: string[];
  icon?: string;
  hotkeys?: string[];
}

export interface PrefixAssignmentContext {
  commands: ObsidianCommand[];
  possiblePrefixes: Set<string>[];
  prefixesToAssign: string[];
  parentPrefix: string[];
}

/**
 * Extract first letters from command ID (after the colon and split by hyphens)
 * @param id - Command ID string
 * @returns Array of lowercase first letters
 */
export function extractIdFirstLetters(id: string): string[] {
  const idWithoutCategory = id.split(':').pop() || id;
  return idWithoutCategory.split('-').map(word => word[0]?.toLowerCase() || '');
}

/**
 * Extract first letters from command name
 * @param name - Command name string
 * @returns Array of lowercase first letters (prioritizing numbers)
 */
export function extractNameFirstLetters(name: string): string[] {
  const nameWithoutCategory = name.split(':').pop() || name;
  return nameWithoutCategory
    .trim()
    .split(' ')
    .map(word => {
      if (!word) return '';
      // Prioritize numbers
      const number = word.match(/[0-9]/)?.[0];
      if (number) return number;
      return word[0]?.toLowerCase() || '';
    });
}

/**
 * Sorts prefixes by descending frequency, including lower & uppercase variants
 * @param prefixCounts - Frequency counts of prefixes
 * @returns Array of prefixes sorted in descending order by frequency and including uppercase variants
 */
export function generateSortedPrefixes(prefixCounts: Record<string, number>): string[] {
  return Object.entries(prefixCounts)
    .sort(([, a], [, b]) => a - b)
    .flatMap(([prefix]) => [prefix, prefix.toUpperCase()]);
}

/**
 * Assign prefixes to commands based on availability and priority
 * @param context - The context object containing all necessary data
 * @returns Updated commands array with assigned prefixes
 */
export function assignPrefixesToCommands(context: PrefixAssignmentContext): ObsidianCommand[] {
  const { commands, possiblePrefixes, prefixesToAssign, parentPrefix } = context;

  // Process prefixes from least common to most common
  for (const prefix of prefixesToAssign) {
    // Loop through commands, indexing against possiblePrefixes
    for (let i = 0; i < commands.length; i++) {
      // Skip commands that already have a prefix
      if (commands[i].prefix) continue;

      // Check if this command can use this prefix
      if (possiblePrefixes[i].has(prefix.toLowerCase())) {
        commands[i].prefix = [...parentPrefix, prefix];
        break; // Move to next prefix after assigning this one
      }
    }
  }

  return commands;
}

/**
 * Determine prefixes for commands
 * @param prefixArray - Array with intent prefix
 * @param commands - Array of commands to determine prefixes for
 * @returns Array of commands with determined prefixes
 */
export function determinePrefixes(
  prefixArray: string[],
  commands: ObsidianCommand[]
): ObsidianCommand[] {
  // Count prefix frequency
  const prefixCounts: Record<string, number> = {};

  // Generate possible prefixes for each command
  const possiblePrefixes = commands.map(command => {
    const { id, name } = command;

    // Get candidate letters from the command's ID and name; deduplicate
    const firstLetters = new Set([...extractIdFirstLetters(id), ...extractNameFirstLetters(name)]);

    // Update frequency counts
    for (const letter of firstLetters) {
      prefixCounts[letter] = (prefixCounts[letter] || 0) + 1;
    }

    return firstLetters;
  });

  // Generate sorted list of prefixes to try assigning
  const prefixesToAssign = generateSortedPrefixes(prefixCounts); // e.g. ['a', 'A']
  log('sortedPrefixCounts', prefixesToAssign);

  // Assign prefixes to commands
  const updatedCommands = assignPrefixesToCommands({
    commands,
    possiblePrefixes,
    prefixesToAssign,
    parentPrefix: prefixArray,
  });

  /* Log unassigned commands for debugging */
  const unassignedCommands = updatedCommands.filter(command => !command.prefix);
  log('unassignedCommands', unassignedCommands);

  log('commands with prefixes:', updatedCommands);
  return updatedCommands;
}
