export const topLevelMappings = [
  {
    prefix: [' '],
    name: 'Open Quick Switcher',
    id: 'switcher:open',
    icon: 'square-chevron-right',
  },
  {
    prefix: ['/'],
    name: 'Open Global Search',
    id: 'global-search:open',
    icon: 'globe',
  },
  {
    prefix: ['e'],
    name: 'Toggle left sidebar',
    id: 'app:toggle-left-sidebar',
    icon: 'panel-left',
  },
  {
    prefix: ['p'],
    name: 'Open command palette',
    id: 'command-palette:open',
    icon: 'square-terminal',
  },
  {
    prefix: ['|'],
    name: 'Split right',
    id: 'workspace:split-vertical',
    icon: 'separator-vertical',
  },
  {
    prefix: ['-'],
    name: 'Split down',
    id: 'workspace:split-horizontal',
    icon: 'separator-horizontal',
  },
];

export const intentMappings = [
  {
    prefix: ['s'],
    name: 'Search',
    id: undefined,
    icon: 'search',
    commands: id => id.includes('search') && !id.includes('bookmarks'),
  },
  {
    prefix: ['f'],
    name: 'File',
    id: undefined,
    icon: 'file',
    commands: id =>
      ((id.includes('file') || id.includes('attach')) && !id.includes('canvas')) ||
      id.includes('template'),
  },
  {
    prefix: ['l'],
    name: 'Links',
    id: undefined,
    icon: 'link',
    commands: id => id.includes('link'),
  },
  {
    prefix: ['B'],
    name: 'Bookmarks',
    id: undefined,
    icon: 'bookmark',
    commands: id => id.includes('bookmarks'),
  },
  {
    prefix: ['Tab'],
    name: 'Tab navigation',
    id: undefined,
    icon: 'arrow-right-to-line',
    commands: id =>
      (id.includes('tab') &&
        !(id.includes('table') || id.includes('bookmarks') || id.includes('file-explorer'))) ||
      (id.includes('close') && id.includes('workspace') && !id.includes('window')) ||
      id.includes('focus') ||
      id === 'workspace:toggle-pin',
  },
  {
    prefix: ['v'],
    name: 'Vault',
    id: undefined,
    icon: 'vault',
    commands: id => id.includes('vault'),
  },
  {
    prefix: ['t'],
    name: 'Text',
    id: undefined,
    icon: 'text',
    commands: id =>
      (id.includes('toggle') && id.includes('editor')) ||
      id.includes('heading') ||
      (id.includes('fold') && !id.includes('file')) ||
      id.includes('clear-formatting') ||
      id.includes('cycle-list-checklist') ||
      id.includes('swap-line') ||
      id.includes('add-cursor') ||
      id.includes('delete-paragraph') ||
      id.includes('context-menu'),
  },
  {
    prefix: ['T'],
    name: 'Table',
    id: undefined,
    icon: 'table',
    commands: id => id.includes('table'),
  },
  {
    prefix: ['n'],
    name: 'Navigate',
    id: undefined,
    icon: 'navigation',
    commands: id => id === 'app:go-back' || id === 'app:go-forward',
  },
  {
    prefix: ['m'],
    name: 'Markdown',
    id: undefined,
    icon: 'a-large-small',
    commands: id => id.includes('markdown'),
  },
  {
    prefix: ['w'],
    name: 'Windows',
    id: undefined,
    icon: 'app-window',
    commands: id => id.includes('window'),
  },
  {
    prefix: ['u'],
    name: 'UI',
    id: undefined,
    icon: 'palette',
    commands: id => id.includes('theme'),
  },
  {
    prefix: ['a'],
    name: 'App',
    id: undefined,
    icon: 'dock',
    commands: id =>
      (id.includes('app') && !id.includes('vault') && !id.includes('go')) ||
      (id.includes('export') && !id.includes('canvas')) ||
      (id.includes('copy') && id.includes('workspace')) ||
      id === 'workspace:show-trash' ||
      (id.includes('editor') && id.includes('focus')) ||
      id.includes('tag-pane') ||
      id.includes('outline'),
  },
  {
    prefix: ['i'],
    name: 'Insert',
    id: undefined,
    icon: 'between-horizontal-start',
    commands: id => id.includes('insert'),
  },

  // Core Plugins
  {
    prefix: ['c'],
    name: 'Canvas',
    id: undefined,
    icon: 'brush',
    commands: id => id.includes('canvas'),
  },
  {
    prefix: ['d'],
    name: 'Daily Notes',
    id: undefined,
    icon: 'calendar',
    commands: id => id.includes('daily-notes'),
  },
  {
    prefix: ['g'],
    name: 'Graph',
    id: undefined,
    icon: 'brain-circuit',
    commands: id => id.includes('graph') && !id.includes('editor'),
  },
  {
    prefix: ['s'],
    name: 'Sync',
    id: undefined,
    icon: 'folder-sync',
    commands: id => id.includes('sync'),
  },
];
