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
  commands: ObsidianCommand[];
  possiblePrefixes: Set<string>[];
  prefixesToAssign: string[];
  parentPrefix: string[];
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

    // TODO: Prioritize name letters
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

/**
 * Transform raw commands into a standardized format
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
export function filterCommandsByIntent(
  commands: ObsidianCommand[],
  pattern: RegExp
): ObsidianCommand[] {
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
  commands: Record<string, any>,
  topLevelMappings: TopLevelMapping[],
  intentMappings: IntentMapping[],
  CommandTrie: any
): any {
  const commandTrie = new CommandTrie();
  const commandsToCurate = shuckCommands(commands);
  console.log('all commands:', commands);

  const curatedCommands: CuratedCommand[] = [...topLevelMappings];

  for (const { prefix, name, pattern, icon } of intentMappings) {
    // Push top level intent mapping
    curatedCommands.push({ prefix, name, icon } as CuratedCommand);

    const bucket = filterCommandsByIntent(commandsToCurate, pattern);

    // Push array of commands with determined prefixes
    curatedCommands.push(...determinePrefixes(prefix, bucket));
  }

  // Track curated command IDs
  const curatedIds = new Set(curatedCommands.map(command => command.id));
  const remainingCommands = Object.entries(commands).filter(([id]) => !curatedIds.has(id));
  console.log('remainingCommands', remainingCommands);

  return buildCommandTrie(curatedCommands, commandTrie);
}

/**
 * Creates buckets of commands grouped by their category
 * @param commands - Commands from Obsidian
 * @returns Object of commands grouped by category
 */
export function createCategoryBuckets(commands: Record<string, ObsidianCommand>): CategoryBuckets {
  return Object.entries(commands).reduce((buckets: CategoryBuckets, [id, command]) => {
    const [category] = id.split(':');
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
export function categorizeCommands(commands: Record<string, ObsidianCommand>, CommandTrie: any) {
  log('all commands', commands);
  const commandTrie = new CommandTrie();
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
    // const commandsWithPrefixes = determinePrefixes(prefixArray, commands);
    categorizedCommands.push(...determinePrefixes(prefixArray, commands));
  }

  return buildCommandTrie(categorizedCommands, commandTrie);
}
