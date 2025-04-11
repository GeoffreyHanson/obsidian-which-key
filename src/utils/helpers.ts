const { log } = console;

export interface ObsidianCommand {
  id: string;
  name: string;
  prefix?: string[];
  icon?: string;
  hotkeys?: { modifiers: string[]; key: string }[];
  allowProperties?: boolean;
  allowPreview?: boolean;
  repeatable?: boolean;
  showOnMobileToolbar?: boolean;
}

export interface PrefixAssignmentContext {
  parentPrefix: string[];
  commandBucket: ObsidianCommand[];
  prefixesToAssign: Set<string>;
  preferredPrefixes: Set<string>[];
  fallbackPrefixes: Set<string>[];
}

export interface IntentMapping {
  prefix: string[];
  name: string;
  id?: string;
  icon?: string;
  pattern: RegExp;
}

export interface CuratedCommand {
  id?: string;
  name: string;
  prefix: string[];
  icon?: string;
  hotkeys?: { modifiers: string[]; key: string }[];
  allowProperties?: boolean;
  allowPreview?: boolean;
  repeatable?: boolean;
  showOnMobileToolbar?: boolean;
}

export interface LeanCommand {
  id: string;
  name: string;
  icon?: string;
  hotkeys?: { modifiers: string[]; key: string }[];
  prefix?: string[];
}

export interface TopLevelMapping {
  prefix: string[];
  name: string;
  id: string;
  icon?: string;
}

interface CategoryBuckets {
  [category: string]: ObsidianCommand[];
}

interface CategoryMapping {
  formattedName: string;
  commands: ObsidianCommand[];
}

interface CategoryMappings {
  [prefix: string]: CategoryMapping;
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
    .filter(word => word && word.match(/[a-zA-Z0-9]/))
    .map(word => {
      // Prioritize numbers
      const number = word.match(/[0-9]/)?.[0];
      if (number) return number;

      return word[0]?.toLowerCase() || '';
    });
}

/**
 * Extract remaining letters from the first word of the command name
 * @param name - Command name
 * @returns Array of remaining letters, lowercase
 */
export function extractNameRemainingLetters(name: string): string[] {
  const nameWithoutCategory = name.split(':').pop() || name;
  return (
    nameWithoutCategory
      .trim()
      .split(' ')[0]
      .split('')
      .slice(1)
      .map(letter => letter.toLowerCase()) || ''
  );
}

/**
 * Sorts prefixes by frequency, including lower & uppercase variants
 * @param prefixCounts - Frequency counts of prefixes
 * @param ascending - Whether to sort in ascending or descending order
 * @returns Array of prefixes sorted by frequency and including uppercase variants
 */
export function generateSortedPrefixes(
  prefixCounts: Record<string, number>,
  ascending = true
): string[] {
  return Object.entries(prefixCounts)
    .sort(([, a], [, b]) => (ascending ? a - b : b - a))
    .flatMap(([prefix]) => [prefix, prefix.toUpperCase()]);
}

/**
 * Assign prefixes to commands based on availability and priority
 * @param context - The context object containing all necessary data
 * @returns Updated commands array with assigned prefixes
 */
export function assignPrefixesToCommands(context: PrefixAssignmentContext): ObsidianCommand[] {
  const { parentPrefix, commandBucket, prefixesToAssign, preferredPrefixes, fallbackPrefixes } =
    context;

  // First try preferred prefixes, then fallback prefixes
  for (const prefixOptions of [preferredPrefixes, fallbackPrefixes]) {
    for (const prefix of prefixesToAssign) {
      // Try to assign this prefix to an unassigned command
      for (let i = 0; i < commandBucket.length; i++) {
        // Skip commands that already have a prefix
        if (commandBucket[i].prefix) continue;

        // Check if this command can use this prefix with current source
        if (prefixOptions[i].has(prefix.toLowerCase())) {
          commandBucket[i].prefix = [...parentPrefix, prefix];
          prefixesToAssign.delete(prefix);
          break; // Move to next prefix after assigning this one
        }
      }
    }
  }

  return commandBucket;
}

/**
 * Determine prefixes for commands
 * @param prefixArray - Array with intent prefix
 * @param commandBucket - Array of commands to determine prefixes for
 * @returns Array of commands with determined prefixes
 */
export function determinePrefixes(
  prefixArray: string[],
  commandBucket: LeanCommand[]
): LeanCommand[] {
  log('commandBucket', commandBucket);

  // Count prefix frequency
  const prefixCounts: Record<string, number> = {};
  const fallbackCounts: Record<string, number> = {};

  // Generate possible prefixes for each command
  const preferredPrefixes = commandBucket.map((command: ObsidianCommand) => {
    const { id, name } = command;

    // Get candidate letters from the command's ID and name; deduplicate
    const firstLetters = new Set([...extractNameFirstLetters(name), ...extractIdFirstLetters(id)]);

    // Update frequency counts
    for (const letter of firstLetters) {
      prefixCounts[letter] = (prefixCounts[letter] || 0) + 1;
    }

    return firstLetters;
  });

  const fallbackPrefixes = commandBucket.map((command: ObsidianCommand) => {
    const { name } = command;
    const fallbackFirstLetters = new Set([...extractNameRemainingLetters(name)]);

    for (const letter of fallbackFirstLetters) {
      fallbackCounts[letter] = (fallbackCounts[letter] || 0) + 1;
    }

    return fallbackFirstLetters;
  });

  // Generate sorted lists of prefixes to try assigning
  const sortedPreferredPrefixes = generateSortedPrefixes(prefixCounts);
  const sortedFallbackPrefixes = generateSortedPrefixes(fallbackCounts, false);
  const prefixesToAssign = new Set([...sortedPreferredPrefixes, ...sortedFallbackPrefixes]);

  // Assign prefixes to commands
  const updatedCommands = assignPrefixesToCommands({
    parentPrefix: prefixArray,
    commandBucket,
    prefixesToAssign,
    preferredPrefixes,
    fallbackPrefixes,
  });

  /* Log unassigned commands for debugging */
  const unassignedCommands = updatedCommands.filter(command => !command.prefix);
  log('unassignedCommands', unassignedCommands);

  log('commands with prefixes:', updatedCommands);
  return updatedCommands;
}

/**
 * Remove keys & callbacks from command object
 * @param commands - Raw commands object from Obsidian
 * @returns Array of standardized commands
 */
export function shuckCommands(commands: Record<string, any>): ObsidianCommand[] {
  return Object.values(commands).map(({ name, id, icon, hotkeys }) => ({
    name,
    id,
    icon,
    hotkeys,
  }));
}

/**
 * Filter commands based on intent mapping pattern
 * @param commands - Array of commands to filter
 * @param pattern - RegExp pattern to match command IDs
 * @returns Array of filtered commands
 */
export function filterCommandsByIntent(commands: LeanCommand[], pattern: RegExp): LeanCommand[] {
  return commands.filter(command => pattern.test(command.id));
}

/**
 * Build a command trie from curated commands
 * @param commands - Array of curated commands
 * @param commandTrie - CommandTrie instance to populate
 * @returns Populated CommandTrie instance
 */
export function buildCommandTrie(commands: CuratedCommand[], commandTrie: any): any {
  commands.forEach(command => {
    if (command.prefix) {
      commandTrie.insertVimCommand(command);
    } else {
      console.log('Skipping command without prefix:', command.name);
    }
  });
  log('commandTrie', commandTrie);
  return commandTrie;
}

/**
 * Curate commands by applying intent mappings and building a command trie
 * @param commands - Raw commands from Obsidian
 * @param topLevelMappings - Array of top-level command mappings
 * @param intentMappings - Array of intent-based command mappings
 * @param CommandTrie - CommandTrie class constructor
 * @returns Populated CommandTrie instance
 */
export function curateCommands(
  commands: ObsidianCommand[],
  topLevelMappings: TopLevelMapping[],
  intentMappings: IntentMapping[],
  commandTrie: any
): any {
  console.log('all commands (curate):', commands);

  const curatedCommands: CuratedCommand[] = [...topLevelMappings];

  for (const { prefix, name, pattern, icon } of intentMappings) {
    // Group commands by intent. If a command fits multiple intents, it will be included in each bucket
    const bucket = filterCommandsByIntent(commands, pattern);

    if (bucket.length > 0) {
      // Push top level intent mapping
      curatedCommands.push({ prefix, name, icon } as CuratedCommand);
      // Push intent bucket of commands with determined prefixes
      curatedCommands.push(...determinePrefixes(prefix, bucket));
    }
  }

  // Anything that hasn't been categorized gets pushed to misc
  const curatedIds = new Set(curatedCommands.map(command => command.id));
  const remainingCommands = commands.filter(command => !curatedIds.has(command.id));

  if (remainingCommands.length > 0) {
    curatedCommands.push({
      prefix: ['M'],
      name: 'Miscellaneous',
      id: undefined,
      icon: 'circle-help',
    });
    curatedCommands.push(...determinePrefixes(['M'], remainingCommands));
  }

  return buildCommandTrie(curatedCommands, commandTrie);
}

/**
 * Creates buckets of commands grouped by their category
 * @param commands - Commands from Obsidian
 * @returns Object of commands grouped by category
 */
export function createCategoryBuckets(commands: ObsidianCommand[]): CategoryBuckets {
  return commands.reduce((buckets: CategoryBuckets, command) => {
    const category = command?.id?.split(':')[0] || '';
    (buckets[category] = buckets[category] || []).push(command);
    return buckets;
  }, {});
}

/**
 * Generates prefix options for a category
 * @param category - Category name
 * @returns Array of possible prefix characters
 */
export function generateCategoryPrefixOptions(category: string): string[] {
  const firstLetterOptions = category
    .split('-')
    .flatMap(word => [word[0].toLowerCase(), word[0].toUpperCase()]);
  const remainingLetters = category
    .split('-')[0] // First word of category
    .split('')
    .slice(1)
    .flatMap(letter => [letter.toLowerCase(), letter.toUpperCase()]);
  return [...firstLetterOptions, ...remainingLetters];
}

/**
 * Assigns prefixes to categories
 * @param sortedCategories - Array of category and command tuples
 * @returns Object mapping prefixes to category names and command buckets
 */
export function assignCategoryPrefixes(
  sortedCategories: [string, ObsidianCommand[]][]
): CategoryMappings {
  const categoryMappings: CategoryMappings = {};

  for (const [category, commands] of sortedCategories) {
    const prefixOptions = generateCategoryPrefixOptions(category);
    const formattedName = category.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());

    // Find first available prefix
    for (const prefix of prefixOptions) {
      if (categoryMappings[prefix]) continue;

      categoryMappings[prefix] = {
        formattedName,
        commands,
      };

      break;
    }
  }
  log('categoryMappings', categoryMappings);
  return categoryMappings;
}

/**
 * Categorize commands and build command trie
 * @param commands - Raw commands from Obsidian
 * @param CommandTrie - CommandTrie class instance
 * @returns Populated CommandTrie instance
 */
export function categorizeCommands(commands: LeanCommand[], commandTrie: any) {
  log('all commands (categorize)', commands);
  // Group commands by category
  const categoryBuckets = createCategoryBuckets(commands);

  // Sort categories alphabetically
  const sortedCategories = Object.entries(categoryBuckets).sort(([a], [b]) => a.localeCompare(b));

  // Assign prefixes for categories
  const categoryMappings = assignCategoryPrefixes(sortedCategories);

  // Build command list for trie
  const categorizedCommands: CuratedCommand[] = [];

  for (const [prefix, { formattedName, commands }] of Object.entries(categoryMappings)) {
    const prefixArray = [prefix];

    // Add category command
    categorizedCommands.push({
      name: formattedName,
      prefix: prefixArray,
    });

    // Add sub-commands with prefixes
    categorizedCommands.push(...determinePrefixes(prefixArray, commands));
  }

  return buildCommandTrie(categorizedCommands, commandTrie);
}
