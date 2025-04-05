export const obsidianCommands = {
  'editor:save-file': {
    id: 'editor:save-file',
    name: 'Save current file',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'S',
      },
    ],
    prefix: ['e', 'f'],
  },
  'editor:download-attachments': {
    id: 'editor:download-attachments',
    name: 'Download attachments for current file',
    prefix: ['e', 'd'],
  },
  'editor:follow-link': {
    id: 'editor:follow-link',
    name: 'Follow link under cursor',
    icon: 'lucide-link',
    hotkeys: [
      {
        modifiers: ['Alt'],
        key: 'Enter',
      },
    ],
    prefix: ['e', 'u'],
  },
  'editor:open-link-in-new-leaf': {
    id: 'editor:open-link-in-new-leaf',
    name: 'Open link under cursor in new tab',
    icon: 'lucide-link',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'Enter',
      },
    ],
    prefix: ['e', 'n'],
  },
  'editor:open-link-in-new-window': {
    id: 'editor:open-link-in-new-window',
    name: 'Open link under cursor in new window',
    icon: 'lucide-link',
    hotkeys: [
      {
        modifiers: ['Mod', 'Alt', 'Shift'],
        key: 'Enter',
      },
    ],
    prefix: ['e', 'w'],
  },
  'workspace:toggle-pin': {
    id: 'workspace:toggle-pin',
    name: 'Toggle pin',
    icon: 'lucide-pin',
    prefix: ['k', 'p'],
  },
  'editor:open-link-in-new-split': {
    id: 'editor:open-link-in-new-split',
    name: 'Open link under cursor to the right',
    icon: 'lucide-link',
    hotkeys: [
      {
        modifiers: ['Mod', 'Alt'],
        key: 'Enter',
      },
    ],
    prefix: ['e', 'N'],
  },
  'editor:focus-top': {
    id: 'editor:focus-top',
    name: 'Focus on tab group above',
    prefix: ['e', 'g'],
  },
  'editor:focus-bottom': {
    id: 'editor:focus-bottom',
    name: 'Focus on tab group below',
    prefix: ['e', 'G'],
  },
  'editor:focus-left': {
    id: 'editor:focus-left',
    name: 'Focus on tab group to the left',
    prefix: ['e', 'o'],
  },
  'editor:focus-right': {
    id: 'editor:focus-right',
    name: 'Focus on tab group to the right',
    prefix: ['e', 'O'],
  },
  'workspace:split-vertical': {
    id: 'workspace:split-vertical',
    name: 'Split right',
    icon: 'lucide-separator-vertical',
    prefix: ['k', 'v'],
  },
  'workspace:split-horizontal': {
    id: 'workspace:split-horizontal',
    name: 'Split down',
    icon: 'lucide-separator-horizontal',
    prefix: ['k', 'h'],
  },
  'workspace:toggle-stacked-tabs': {
    id: 'workspace:toggle-stacked-tabs',
    name: 'Toggle stacked tabs',
    icon: 'lucide-layers',
    prefix: ['k', 's'],
  },
  'workspace:edit-file-title': {
    id: 'workspace:edit-file-title',
    name: 'Rename file',
    icon: 'lucide-edit-3',
    hotkeys: [
      {
        modifiers: [],
        key: 'F2',
      },
    ],
    prefix: ['k', 'r'],
  },
  'workspace:copy-path': {
    id: 'workspace:copy-path',
    name: 'Copy file path',
    icon: 'lucide-copy',
    prefix: ['k', 'f'],
  },
  'workspace:copy-url': {
    id: 'workspace:copy-url',
    name: 'Copy Obsidian URL',
    icon: 'lucide-copy',
    prefix: ['k', 'u'],
  },
  'workspace:undo-close-pane': {
    id: 'workspace:undo-close-pane',
    name: 'Undo close tab',
    icon: 'lucide-undo-2',
    hotkeys: [
      {
        modifiers: ['Mod', 'Shift'],
        key: 'T',
      },
    ],
    prefix: ['k', 'U'],
  },
  'workspace:export-pdf': {
    id: 'workspace:export-pdf',
    name: 'Export to PDF...',
    prefix: ['k', 'e'],
  },
  'editor:rename-heading': {
    id: 'editor:rename-heading',
    name: 'Rename this heading...',
    icon: 'lucide-edit-3',
    prefix: ['e', 'h'],
  },
  'workspace:open-in-new-window': {
    id: 'workspace:open-in-new-window',
    name: 'Open current tab in new window',
    icon: 'lucide-maximize',
    prefix: ['k', 'i'],
  },
  'workspace:move-to-new-window': {
    id: 'workspace:move-to-new-window',
    name: 'Move current tab to new window',
    icon: 'lucide-maximize',
    prefix: ['k', 'm'],
  },
  'workspace:next-tab': {
    id: 'workspace:next-tab',
    name: 'Go to next tab',
    icon: 'lucide-arrow-right',
    hotkeys: [
      {
        modifiers: ['Ctrl'],
        key: 'Tab',
      },
      {
        modifiers: ['Meta', 'Shift'],
        key: ']',
      },
    ],
    prefix: ['k', 'n'],
  },
  'workspace:goto-tab-1': {
    id: 'workspace:goto-tab-1',
    name: 'Go to tab #1',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '1',
      },
    ],
    prefix: ['k', '1'],
  },
  'workspace:goto-tab-2': {
    id: 'workspace:goto-tab-2',
    name: 'Go to tab #2',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '2',
      },
    ],
    prefix: ['k', '2'],
  },
  'workspace:goto-tab-3': {
    id: 'workspace:goto-tab-3',
    name: 'Go to tab #3',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '3',
      },
    ],
    prefix: ['k', '3'],
  },
  'workspace:goto-tab-4': {
    id: 'workspace:goto-tab-4',
    name: 'Go to tab #4',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '4',
      },
    ],
    prefix: ['k', '4'],
  },
  'workspace:goto-tab-5': {
    id: 'workspace:goto-tab-5',
    name: 'Go to tab #5',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '5',
      },
    ],
    prefix: ['k', '5'],
  },
  'workspace:goto-tab-6': {
    id: 'workspace:goto-tab-6',
    name: 'Go to tab #6',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '6',
      },
    ],
    prefix: ['k', '6'],
  },
  'workspace:goto-tab-7': {
    id: 'workspace:goto-tab-7',
    name: 'Go to tab #7',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '7',
      },
    ],
    prefix: ['k', '7'],
  },
  'workspace:goto-tab-8': {
    id: 'workspace:goto-tab-8',
    name: 'Go to tab #8',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '8',
      },
    ],
    prefix: ['k', '8'],
  },
  'workspace:goto-last-tab': {
    id: 'workspace:goto-last-tab',
    name: 'Go to last tab',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '9',
      },
    ],
    prefix: ['k', 'l'],
  },
  'workspace:previous-tab': {
    id: 'workspace:previous-tab',
    name: 'Go to previous tab',
    icon: 'lucide-arrow-left',
    hotkeys: [
      {
        modifiers: ['Ctrl', 'Shift'],
        key: 'Tab',
      },
      {
        modifiers: ['Meta', 'Shift'],
        key: '[',
      },
    ],
    prefix: ['k', 'P'],
  },
  'workspace:new-tab': {
    id: 'workspace:new-tab',
    name: 'New tab',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'T',
      },
    ],
    prefix: ['k', 'N'],
  },
  'workspace:close': {
    id: 'workspace:close',
    name: 'Close current tab',
    icon: 'lucide-x',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'W',
      },
    ],
    prefix: ['k', 'c'],
  },
  'workspace:close-window': {
    id: 'workspace:close-window',
    name: 'Close window',
    icon: 'lucide-x',
    hotkeys: [
      {
        modifiers: ['Mod', 'Shift'],
        key: 'W',
      },
    ],
    prefix: ['k', 'w'],
  },
  'workspace:close-others': {
    id: 'workspace:close-others',
    name: 'Close all other tabs',
    icon: 'lucide-x',
    prefix: ['k', 'a'],
  },
  'workspace:close-tab-group': {
    id: 'workspace:close-tab-group',
    name: 'Close this tab group',
    icon: 'lucide-x',
    prefix: ['k', 'C'],
  },
  'workspace:close-others-tab-group': {
    id: 'workspace:close-others-tab-group',
    name: 'Close others in tab group',
    icon: 'lucide-x',
    prefix: ['k', 'I'],
  },
  'workspace:show-trash': {
    id: 'workspace:show-trash',
    name: 'Show trash',
    prefix: ['k', 'S'],
  },
  'app:go-back': {
    id: 'app:go-back',
    name: 'Navigate back',
    icon: 'lucide-arrow-left',
    hotkeys: [
      {
        modifiers: ['Mod', 'Alt'],
        key: 'ArrowLeft',
      },
    ],
    prefix: ['a', 'b'],
  },
  'app:go-forward': {
    id: 'app:go-forward',
    name: 'Navigate forward',
    icon: 'lucide-arrow-right',
    hotkeys: [
      {
        modifiers: ['Mod', 'Alt'],
        key: 'ArrowRight',
      },
    ],
    prefix: ['a', 'g'],
  },
  'app:open-vault': {
    id: 'app:open-vault',
    name: 'Open another vault',
    icon: 'vault',
    prefix: ['a', 'v'],
  },
  'theme:use-dark': {
    id: 'theme:use-dark',
    name: 'Use dark mode',
    prefix: ['h', 'd'],
  },
  'theme:use-light': {
    id: 'theme:use-light',
    name: 'Use light mode',
    prefix: ['h', 'l'],
  },
  'theme:switch': {
    id: 'theme:switch',
    name: 'Change theme',
    prefix: ['h', 's'],
  },
  'app:open-settings': {
    id: 'app:open-settings',
    name: 'Open settings',
    icon: 'lucide-settings',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: ',',
      },
    ],
    prefix: ['a', 'o'],
  },
  'app:show-release-notes': {
    id: 'app:show-release-notes',
    name: 'Show release notes',
    prefix: ['a', 'n'],
  },
  'markdown:toggle-preview': {
    id: 'markdown:toggle-preview',
    name: 'Toggle reading view',
    icon: 'lucide-book-open',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'E',
      },
    ],
    prefix: ['m', 't'],
  },
  'markdown:add-metadata-property': {
    id: 'markdown:add-metadata-property',
    name: 'Add file property',
    icon: 'lucide-plus-circle',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: ';',
      },
    ],
    prefix: ['m', 'a'],
  },
  'markdown:add-alias': {
    id: 'markdown:add-alias',
    name: 'Add alias',
    icon: 'lucide-forward',
    prefix: ['m', 'A'],
  },
  'markdown:edit-metadata-property': {
    id: 'markdown:edit-metadata-property',
    name: 'Edit file property',
    icon: 'lucide-package-open',
    prefix: ['m', 'e'],
  },
  'markdown:clear-metadata-properties': {
    id: 'markdown:clear-metadata-properties',
    name: 'Clear file properties',
    icon: 'lucide-package-x',
    prefix: ['m', 'c'],
  },
  'app:delete-file': {
    id: 'app:delete-file',
    name: 'Delete current file',
    icon: 'lucide-trash-2',
    prefix: ['a', 'c'],
  },
  'app:toggle-ribbon': {
    id: 'app:toggle-ribbon',
    name: 'Toggle ribbon',
    prefix: ['a', 'r'],
  },
  'app:toggle-left-sidebar': {
    id: 'app:toggle-left-sidebar',
    name: 'Toggle left sidebar',
    prefix: ['a', 'l'],
  },
  'app:toggle-right-sidebar': {
    id: 'app:toggle-right-sidebar',
    name: 'Toggle right sidebar',
    prefix: ['a', 'R'],
  },
  'app:toggle-default-new-pane-mode': {
    id: 'app:toggle-default-new-pane-mode',
    name: 'Toggle default mode for new tabs',
    prefix: ['a', 'p'],
  },
  'app:open-help': {
    id: 'app:open-help',
    name: 'Open help',
    icon: 'question-mark-glyph',
    hotkeys: [
      {
        modifiers: [],
        key: 'F1',
      },
    ],
    prefix: ['a', 'h'],
  },
  'app:reload': {
    id: 'app:reload',
    name: 'Reload app without saving',
    icon: 'lucide-rotate-ccw',
    prefix: ['a', 'w'],
  },
  'app:show-debug-info': {
    id: 'app:show-debug-info',
    name: 'Show debug info',
    prefix: ['a', 'i'],
  },
  'app:open-sandbox-vault': {
    id: 'app:open-sandbox-vault',
    name: 'Open sandbox vault',
    prefix: ['a', 'V'],
  },
  'window:toggle-always-on-top': {
    id: 'window:toggle-always-on-top',
    name: 'Toggle window always on top',
    prefix: ['W', 't'],
  },
  'window:zoom-in': {
    id: 'window:zoom-in',
    name: 'Zoom in',
    prefix: ['W', 'i'],
  },
  'window:zoom-out': {
    id: 'window:zoom-out',
    name: 'Zoom out',
    prefix: ['W', 'o'],
  },
  'window:reset-zoom': {
    id: 'window:reset-zoom',
    name: 'Reset zoom',
    prefix: ['W', 'r'],
  },
  'file-explorer:new-file': {
    id: 'file-explorer:new-file',
    name: 'Create new note',
    icon: 'lucide-file-plus',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'N',
      },
    ],
    prefix: ['f', 'n'],
  },
  'file-explorer:new-file-in-current-tab': {
    id: 'file-explorer:new-file-in-current-tab',
    name: 'Create new note in current tab',
    icon: 'lucide-file-plus',
    prefix: ['f', 'i'],
  },
  'file-explorer:new-file-in-new-pane': {
    id: 'file-explorer:new-file-in-new-pane',
    name: 'Create note to the right',
    icon: 'lucide-file-plus',
    hotkeys: [
      {
        modifiers: ['Mod', 'Shift'],
        key: 'N',
      },
    ],
    prefix: ['f', 'p'],
  },
  'open-with-default-app:open': {
    id: 'open-with-default-app:open',
    name: 'Open in default app',
    icon: 'lucide-arrow-up-right',
    prefix: ['o', 'o'],
  },
  'file-explorer:move-file': {
    id: 'file-explorer:move-file',
    name: 'Move current file to another folder',
    icon: 'lucide-folder-tree',
    prefix: ['f', 'm'],
  },
  'file-explorer:duplicate-file': {
    id: 'file-explorer:duplicate-file',
    name: 'Duplicate current file',
    icon: 'lucide-files',
    prefix: ['f', 'd'],
  },
  'open-with-default-app:show': {
    id: 'open-with-default-app:show',
    name: 'Reveal in Finder',
    icon: 'lucide-files',
    prefix: ['o', 's'],
  },
  'editor:toggle-source': {
    id: 'editor:toggle-source',
    name: 'Toggle Live Preview/Source mode',
    icon: 'lucide-code-2',
    prefix: ['e', 'p'],
  },
  'editor:open-search': {
    id: 'editor:open-search',
    name: 'Search current file',
    icon: 'lucide-search',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'F',
      },
    ],
    prefix: ['e', 'F'],
  },
  'editor:open-search-replace': {
    id: 'editor:open-search-replace',
    name: 'Search & replace in current file',
    icon: 'lucide-search',
    hotkeys: [
      {
        modifiers: ['Mod', 'Alt'],
        key: 'F',
      },
    ],
    prefix: ['e', '&'],
  },
  'editor:focus': {
    id: 'editor:focus',
    name: 'Focus on last note',
    prefix: ['e', 'l'],
  },
  'editor:toggle-fold-properties': {
    id: 'editor:toggle-fold-properties',
    name: 'Toggle fold properties in current file',
    icon: 'lucide-diff',
    prefix: ['e', 'P'],
  },
  'editor:toggle-fold': {
    id: 'editor:toggle-fold',
    name: 'Toggle fold on the current line',
    icon: 'lucide-diff',
    allowProperties: true,
    prefix: ['e', 'L'],
  },
  'editor:fold-all': {
    id: 'editor:fold-all',
    name: 'Fold all headings and lists',
    icon: 'lucide-minimize-2',
    allowPreview: true,
    allowProperties: true,
    prefix: ['e', 'H'],
  },
  'editor:unfold-all': {
    id: 'editor:unfold-all',
    name: 'Unfold all headings and lists',
    icon: 'lucide-maximize-2',
    allowPreview: true,
    allowProperties: true,
    prefix: ['e', 'U'],
  },
  'editor:fold-less': {
    id: 'editor:fold-less',
    name: 'Fold less',
    icon: 'lucide-unfold-vertical',
  },
  'editor:fold-more': {
    id: 'editor:fold-more',
    name: 'Fold more',
    icon: 'lucide-fold-vertical',
    prefix: ['e', 'm'],
  },
  'editor:insert-wikilink': {
    id: 'editor:insert-wikilink',
    name: 'Add internal link',
    icon: 'bracket-glyph',
    prefix: ['e', 'W'],
  },
  'editor:insert-embed': {
    id: 'editor:insert-embed',
    name: 'Add embed',
    icon: 'lucide-sticky-note',
    prefix: ['e', 'e'],
  },
  'editor:insert-link': {
    id: 'editor:insert-link',
    name: 'Insert Markdown link',
    icon: 'lucide-link',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'K',
      },
    ],
    prefix: ['e', 'M'],
  },
  'editor:insert-tag': {
    id: 'editor:insert-tag',
    name: 'Add tag',
    icon: 'lucide-tag',
    prefix: ['e', 'i'],
  },
  'editor:set-heading': {
    id: 'editor:set-heading',
    name: 'Toggle heading',
    icon: 'heading-glyph',
    prefix: ['e', 's'],
  },
  'editor:set-heading-0': {
    id: 'editor:set-heading-0',
    name: 'Remove heading',
    icon: 'heading-glyph',
    prefix: ['e', '0'],
  },
  'editor:set-heading-1': {
    id: 'editor:set-heading-1',
    name: 'Set as heading 1',
    icon: 'heading-glyph',
    prefix: ['e', '1'],
  },
  'editor:set-heading-2': {
    id: 'editor:set-heading-2',
    name: 'Set as heading 2',
    icon: 'heading-glyph',
    prefix: ['e', '2'],
  },
  'editor:set-heading-3': {
    id: 'editor:set-heading-3',
    name: 'Set as heading 3',
    icon: 'heading-glyph',
    prefix: ['e', '3'],
  },
  'editor:set-heading-4': {
    id: 'editor:set-heading-4',
    name: 'Set as heading 4',
    icon: 'heading-glyph',
    prefix: ['e', '4'],
  },
  'editor:set-heading-5': {
    id: 'editor:set-heading-5',
    name: 'Set as heading 5',
    icon: 'heading-glyph',
    prefix: ['e', '5'],
  },
  'editor:set-heading-6': {
    id: 'editor:set-heading-6',
    name: 'Set as heading 6',
    icon: 'heading-glyph',
    prefix: ['e', '6'],
  },
  'editor:toggle-bold': {
    id: 'editor:toggle-bold',
    name: 'Toggle bold',
    icon: 'lucide-bold',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'B',
      },
    ],
    prefix: ['e', 'b'],
  },
  'editor:toggle-italics': {
    id: 'editor:toggle-italics',
    name: 'Toggle italic',
    icon: 'lucide-italic',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'I',
      },
    ],
    prefix: ['e', 'I'],
  },
  'editor:toggle-strikethrough': {
    id: 'editor:toggle-strikethrough',
    name: 'Toggle strikethrough',
    icon: 'lucide-strikethrough',
    prefix: ['e', 'S'],
  },
  'editor:toggle-highlight': {
    id: 'editor:toggle-highlight',
    name: 'Toggle highlight',
    icon: 'lucide-highlighter',
    prefix: ['e', 't'],
  },
  'editor:toggle-code': {
    id: 'editor:toggle-code',
    name: 'Toggle code',
    icon: 'lucide-code-2',
    prefix: ['e', 'c'],
  },
  'editor:toggle-inline-math': {
    id: 'editor:toggle-inline-math',
    name: 'Toggle inline math',
    icon: 'lucide-sigma',
    prefix: ['e', 'T'],
  },
  'editor:toggle-blockquote': {
    id: 'editor:toggle-blockquote',
    name: 'Toggle blockquote',
    icon: 'lucide-quote',
    prefix: ['e', 'B'],
  },
  'editor:toggle-comments': {
    id: 'editor:toggle-comments',
    name: 'Toggle comment',
    icon: 'lucide-percent',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: '/',
      },
    ],
    prefix: ['e', 'C'],
  },
  'editor:clear-formatting': {
    id: 'editor:clear-formatting',
    name: 'Clear formatting',
    icon: 'lucide-eraser',
  },
  'editor:toggle-bullet-list': {
    id: 'editor:toggle-bullet-list',
    name: 'Toggle bullet list',
    icon: 'lucide-list',
  },
  'editor:toggle-numbered-list': {
    id: 'editor:toggle-numbered-list',
    name: 'Toggle numbered list',
    icon: 'lucide-list-ordered',
  },
  'editor:toggle-checklist-status': {
    id: 'editor:toggle-checklist-status',
    name: 'Toggle checkbox status',
    icon: 'lucide-check-square',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'l',
      },
    ],
  },
  'editor:cycle-list-checklist': {
    id: 'editor:cycle-list-checklist',
    name: 'Cycle bullet/checkbox',
    icon: 'lucide-check-square',
  },
  'editor:insert-callout': {
    id: 'editor:insert-callout',
    name: 'Insert callout',
    icon: 'lucide-quote',
  },
  'editor:insert-codeblock': {
    id: 'editor:insert-codeblock',
    name: 'Insert code block',
    icon: 'lucide-code',
  },
  'editor:insert-horizontal-rule': {
    id: 'editor:insert-horizontal-rule',
    name: 'Insert horizontal rule',
    icon: 'lucide-minus',
    prefix: ['e', 'r'],
  },
  'editor:insert-mathblock': {
    id: 'editor:insert-mathblock',
    name: 'Insert math block',
    icon: 'lucide-sigma-square',
  },
  'editor:insert-table': {
    id: 'editor:insert-table',
    name: 'Insert table',
    icon: 'lucide-table',
  },
  'editor:insert-footnote': {
    id: 'editor:insert-footnote',
    name: 'Insert footnote',
    icon: 'lucide-file-signature',
  },
  'editor:swap-line-up': {
    id: 'editor:swap-line-up',
    name: 'Move line up',
    icon: 'lucide-corner-right-up',
    repeatable: true,
  },
  'editor:swap-line-down': {
    id: 'editor:swap-line-down',
    name: 'Move line down',
    icon: 'lucide-corner-right-down',
    repeatable: true,
    prefix: ['e', 'D'],
  },
  'editor:attach-file': {
    id: 'editor:attach-file',
    name: 'Insert attachment',
    icon: 'lucide-paperclip',
    prefix: ['e', 'a'],
  },
  'editor:delete-paragraph': {
    id: 'editor:delete-paragraph',
    name: 'Delete paragraph',
    icon: 'lucide-scissors',
    repeatable: true,
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'D',
      },
    ],
  },
  'editor:add-cursor-below': {
    id: 'editor:add-cursor-below',
    name: 'Add cursor below',
    icon: 'lucide-mouse-pointer-click',
    repeatable: true,
    prefix: ['e', 'A'],
  },
  'editor:add-cursor-above': {
    id: 'editor:add-cursor-above',
    name: 'Add cursor above',
    icon: 'lucide-mouse-pointer-click',
    repeatable: true,
  },
  'editor:toggle-spellcheck': {
    id: 'editor:toggle-spellcheck',
    name: 'Toggle spellcheck',
  },
  'editor:table-row-before': {
    id: 'editor:table-row-before',
    name: 'Table: Add row before',
    icon: 'lucide-arrow-up',
    prefix: ['e', 'R'],
  },
  'editor:table-row-after': {
    id: 'editor:table-row-after',
    name: 'Table: Add row after',
    icon: 'lucide-arrow-down',
  },
  'editor:table-row-up': {
    id: 'editor:table-row-up',
    name: 'Table: Move row up',
    icon: 'lucide-arrow-up',
  },
  'editor:table-row-down': {
    id: 'editor:table-row-down',
    name: 'Table: Move row down',
    icon: 'lucide-arrow-down',
  },
  'editor:table-row-copy': {
    id: 'editor:table-row-copy',
    name: 'Table: Duplicate row',
    icon: 'lucide-copy',
  },
  'editor:table-row-delete': {
    id: 'editor:table-row-delete',
    name: 'Table: Delete row',
    icon: 'lucide-trash-2',
  },
  'editor:table-col-before': {
    id: 'editor:table-col-before',
    name: 'Table: Add column before',
    icon: 'lucide-arrow-left',
  },
  'editor:table-col-after': {
    id: 'editor:table-col-after',
    name: 'Table: Add column after',
    icon: 'lucide-arrow-right',
  },
  'editor:table-col-left': {
    id: 'editor:table-col-left',
    name: 'Table: Move column left',
    icon: 'lucide-arrow-left',
  },
  'editor:table-col-right': {
    id: 'editor:table-col-right',
    name: 'Table: Move column right',
    icon: 'lucide-arrow-right',
  },
  'editor:table-col-copy': {
    id: 'editor:table-col-copy',
    name: 'Table: Duplicate column',
    icon: 'lucide-copy',
  },
  'editor:table-col-delete': {
    id: 'editor:table-col-delete',
    name: 'Table: Delete column',
    icon: 'lucide-trash-2',
  },
  'editor:table-col-align-left': {
    id: 'editor:table-col-align-left',
    name: 'Table: Align left',
    icon: 'lucide-align-left',
  },
  'editor:table-col-align-center': {
    id: 'editor:table-col-align-center',
    name: 'Table: Align center',
    icon: 'lucide-align-center',
  },
  'editor:table-col-align-right': {
    id: 'editor:table-col-align-right',
    name: 'Table: Align right',
    icon: 'lucide-align-right',
  },
  'editor:context-menu': {
    id: 'editor:context-menu',
    name: 'Show context menu under cursor',
    icon: 'lucide-menu',
  },
  'file-explorer:open': {
    id: 'file-explorer:open',
    name: 'Files: Show file explorer',
    icon: 'lucide-files',
    prefix: ['f', 'o'],
  },
  'file-explorer:reveal-active-file': {
    id: 'file-explorer:reveal-active-file',
    name: 'Files: Reveal current file in navigation',
    icon: 'lucide-navigation',
    prefix: ['f', 'r'],
  },
  'file-explorer:new-folder': {
    id: 'file-explorer:new-folder',
    name: 'Files: Create new folder',
    icon: 'lucide-folder-plus',
    prefix: ['f', 'N'],
  },
  'global-search:open': {
    id: 'global-search:open',
    name: 'Search: Search in all files',
    icon: 'lucide-search',
    hotkeys: [
      {
        modifiers: ['Mod', 'Shift'],
        key: 'F',
      },
    ],
    prefix: ['g', 'o'],
  },
  'switcher:open': {
    id: 'switcher:open',
    name: 'Quick switcher: Open quick switcher',
    icon: 'lucide-navigation',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'O',
      },
    ],
    prefix: ['S', 'o'],
  },
  'graph:open': {
    id: 'graph:open',
    name: 'Graph view: Open graph view',
    icon: 'lucide-git-fork',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'G',
      },
    ],
    prefix: ['G', 'v'],
  },
  'graph:open-local': {
    id: 'graph:open-local',
    name: 'Graph view: Open local graph',
    icon: 'lucide-git-fork',
    prefix: ['G', 'l'],
  },
  'graph:animate': {
    id: 'graph:animate',
    name: 'Graph view: Start graph timelapse animation',
    icon: 'lucide-wand',
    prefix: ['G', 'a'],
  },
  'backlink:open': {
    id: 'backlink:open',
    name: 'Backlinks: Show backlinks',
    icon: 'lucide-link',
    prefix: ['b', 's'],
  },
  'backlink:open-backlinks': {
    id: 'backlink:open-backlinks',
    name: 'Backlinks: Open backlinks for the current note',
    icon: 'lucide-link',
    prefix: ['b', 'f'],
  },
  'backlink:toggle-backlinks-in-document': {
    id: 'backlink:toggle-backlinks-in-document',
    name: 'Backlinks: Toggle backlinks in document',
    icon: 'lucide-link',
    prefix: ['b', 'i'],
  },
  'canvas:new-file': {
    id: 'canvas:new-file',
    name: 'Canvas: Create new canvas',
    icon: 'lucide-layout-dashboard',
    prefix: ['c', 'n'],
  },
  'canvas:export-as-image': {
    id: 'canvas:export-as-image',
    name: 'Canvas: Export as image',
    icon: 'lucide-image',
    prefix: ['c', 'e'],
  },
  'canvas:jump-to-group': {
    id: 'canvas:jump-to-group',
    name: 'Canvas: Jump to group',
    icon: 'lucide-move',
    prefix: ['c', 'j'],
  },
  'canvas:convert-to-file': {
    id: 'canvas:convert-to-file',
    name: 'Canvas: Convert to file...',
    icon: 'lucide-file-input',
    prefix: ['c', 'f'],
  },
  'outgoing-links:open': {
    id: 'outgoing-links:open',
    name: 'Outgoing links: Show outgoing links',
    icon: 'lucide-link',
    prefix: ['O', 's'],
  },
  'outgoing-links:open-for-current': {
    id: 'outgoing-links:open-for-current',
    name: 'Outgoing links: Open outgoing links for the current file',
    icon: 'lucide-link',
    prefix: ['O', 'f'],
  },
  'tag-pane:open': {
    id: 'tag-pane:open',
    name: 'Tags view: Show tags',
    icon: 'lucide-tag',
    prefix: ['T', 'o'],
  },
  'properties:open': {
    id: 'properties:open',
    name: 'Properties view: Show all properties',
    icon: 'lucide-archive',
    prefix: ['p', 'a'],
  },
  'properties:open-local': {
    id: 'properties:open-local',
    name: 'Properties view: Show file properties',
    icon: 'lucide-info',
    prefix: ['p', 'l'],
  },
  'daily-notes': {
    id: 'daily-notes',
    name: "Daily notes: Open today's daily note",
    icon: 'lucide-calendar-days',
    prefix: ['d', 't'],
  },
  'daily-notes:goto-prev': {
    id: 'daily-notes:goto-prev',
    name: 'Daily notes: Open previous daily note',
    icon: 'lucide-calendar-minus',
    prefix: ['d', 'p'],
  },
  'daily-notes:goto-next': {
    id: 'daily-notes:goto-next',
    name: 'Daily notes: Open next daily note',
    icon: 'lucide-calendar-plus',
    prefix: ['d', 'g'],
  },
  'insert-template': {
    id: 'insert-template',
    name: 'Templates: Insert template',
    icon: 'lucide-copy',
    prefix: ['t', 'i'],
  },
  'insert-current-date': {
    id: 'insert-current-date',
    name: 'Templates: Insert current date',
    icon: 'lucide-calendar-days',
    prefix: ['i', 'i'],
  },
  'insert-current-time': {
    id: 'insert-current-time',
    name: 'Templates: Insert current time',
    icon: 'lucide-clock',
    prefix: ['I', 'i'],
  },
  'note-composer:merge-file': {
    id: 'note-composer:merge-file',
    name: 'Note composer: Merge current file with another file...',
    icon: 'lucide-git-merge',
    prefix: ['n', 'm'],
  },
  'note-composer:split-file': {
    id: 'note-composer:split-file',
    name: 'Note composer: Extract current selection...',
    icon: 'lucide-scissors',
    prefix: ['n', 's'],
  },
  'note-composer:extract-heading': {
    id: 'note-composer:extract-heading',
    name: 'Note composer: Extract this heading...',
    icon: 'lucide-scissors',
    prefix: ['n', 'h'],
  },
  'command-palette:open': {
    id: 'command-palette:open',
    name: 'Command palette: Open command palette',
    icon: 'lucide-terminal-square',
    hotkeys: [
      {
        modifiers: ['Mod'],
        key: 'P',
      },
    ],
    showOnMobileToolbar: true,
    prefix: ['C', 'o'],
  },
  'bookmarks:open': {
    id: 'bookmarks:open',
    name: 'Bookmarks: Show bookmarks',
    icon: 'lucide-bookmark',
    prefix: ['B', 'o'],
  },
  'bookmarks:bookmark-current-view': {
    id: 'bookmarks:bookmark-current-view',
    name: 'Bookmarks: Bookmark...',
    icon: 'lucide-bookmark-plus',
    prefix: ['B', 'v'],
  },
  'bookmarks:bookmark-current-search': {
    id: 'bookmarks:bookmark-current-search',
    name: 'Bookmarks: Bookmark current search...',
    icon: 'lucide-search',
    prefix: ['B', 's'],
  },
  'bookmarks:unbookmark-current-view': {
    id: 'bookmarks:unbookmark-current-view',
    name: 'Bookmarks: Remove bookmark for the current file',
    icon: 'lucide-bookmark-plus',
    prefix: ['B', 'r'],
  },
  'bookmarks:bookmark-current-section': {
    id: 'bookmarks:bookmark-current-section',
    name: 'Bookmarks: Bookmark block under cursor...',
    icon: 'lucide-bookmark-plus',
    prefix: ['B', 'S'],
  },
  'bookmarks:bookmark-current-heading': {
    id: 'bookmarks:bookmark-current-heading',
    name: 'Bookmarks: Bookmark heading under cursor...',
    icon: 'lucide-bookmark-plus',
    prefix: ['B', 'h'],
  },
  'bookmarks:bookmark-all-tabs': {
    id: 'bookmarks:bookmark-all-tabs',
    name: 'Bookmarks: Bookmark all tabs...',
    icon: 'lucide-bookmark-plus',
    prefix: ['B', 'a'],
  },
  'markdown-importer:open': {
    id: 'markdown-importer:open',
    name: 'Format converter: Open format converter',
    icon: 'lucide-download',
    prefix: ['M', 'o'],
  },
  'zk-prefixer': {
    id: 'zk-prefixer',
    name: 'Unique note creator: Create new unique note',
    icon: 'box-glyph',
    prefix: ['z', 'z'],
  },
  'random-note': {
    id: 'random-note',
    name: 'Random note: Open random note',
    icon: 'dice-glyph',
    prefix: ['r', 'r'],
  },
  'outline:open': {
    id: 'outline:open',
    name: 'Outline: Show outline',
    icon: 'lucide-list',
    prefix: ['u', 's'],
  },
  'outline:open-for-current': {
    id: 'outline:open-for-current',
    name: 'Outline: Open outline of the current file',
    icon: 'lucide-list',
    prefix: ['u', 'f'],
  },
  'slides:start': {
    id: 'slides:start',
    name: 'Slides: Start presentation',
    icon: 'lucide-monitor',
    prefix: ['s', 's'],
  },
  'audio-recorder:start': {
    id: 'audio-recorder:start',
    name: 'Audio recorder: Start recording audio',
    icon: 'lucide-play-circle',
    prefix: ['A', 's'],
  },
  'audio-recorder:stop': {
    id: 'audio-recorder:stop',
    name: 'Audio recorder: Stop recording audio',
    icon: 'lucide-stop-circle',
    prefix: ['A', 'S'],
  },
  'workspaces:load': {
    id: 'workspaces:load',
    name: 'Workspaces: Load workspace layout',
    icon: 'lucide-layout',
  },
  'workspaces:save': {
    id: 'workspaces:save',
    name: 'Workspaces: Save layout',
    icon: 'lucide-save',
  },
  'workspaces:save-and-load': {
    id: 'workspaces:save-and-load',
    name: 'Workspaces: Save and load another layout',
    icon: 'lucide-layout',
  },
  'workspaces:open-modal': {
    id: 'workspaces:open-modal',
    name: 'Workspaces: Manage workspace layouts',
    icon: 'lucide-layout',
  },
  'file-recovery:open': {
    id: 'file-recovery:open',
    name: 'File recovery: Open saved snapshots',
    icon: 'lucide-rotate-ccw',
    prefix: ['F', 'o'],
  },
  'publish:view-changes': {
    id: 'publish:view-changes',
    name: 'Publish: Publish changes...',
    icon: 'lucide-send',
    prefix: ['P', 'v'],
  },
  'publish:publish-file': {
    id: 'publish:publish-file',
    name: 'Publish: Publish current file',
    icon: 'lucide-send',
    prefix: ['P', 'f'],
  },
  'publish:open-in-live-site': {
    id: 'publish:open-in-live-site',
    name: 'Publish: Open in live site',
    icon: 'lucide-globe',
    prefix: ['P', 'o'],
  },
  'sync:setup': {
    id: 'sync:setup',
    name: 'Sync: Set up Sync',
    icon: 'lucide-settings',
    prefix: ['y', 'u'],
  },
  'sync:view-version-history': {
    id: 'sync:view-version-history',
    name: 'Sync: Open version history for the current file',
    icon: 'lucide-history',
    prefix: ['y', 'f'],
  },
  'sync:open-sync-view': {
    id: 'sync:open-sync-view',
    name: 'Sync: Show Sync history',
    icon: 'lucide-rotate-ccw',
    prefix: ['y', 'v'],
  },
  'sync:open-sync-log': {
    id: 'sync:open-sync-log',
    name: 'Sync: Open activity log',
    icon: 'lucide-align-left',
    prefix: ['y', 'l'],
  },
  'webviewer:open': {
    id: 'webviewer:open',
    name: 'Web viewer: Open web viewer',
    prefix: ['w', 'w'],
  },
  'webviewer:open-history': {
    id: 'webviewer:open-history',
    name: 'Web viewer: Show history',
    icon: 'lucide-clock',
    prefix: ['w', 'h'],
  },
  'webviewer:toggle-reader-mode': {
    id: 'webviewer:toggle-reader-mode',
    name: 'Web viewer: Toggle reader mode',
    icon: 'glasses',
    prefix: ['w', 'm'],
  },
  'webviewer:focus-address-bar': {
    id: 'webviewer:focus-address-bar',
    name: 'Web viewer: Focus address bar',
    icon: 'text-cursor-input',
    prefix: ['w', 'f'],
  },
  'webviewer:zoom-in': {
    id: 'webviewer:zoom-in',
    name: 'Web viewer: Zoom in',
    icon: 'zoom-in',
    prefix: ['w', 'i'],
  },
  'webviewer:zoom-reset': {
    id: 'webviewer:zoom-reset',
    name: 'Web viewer: Reset zoom',
    icon: 'rotate-cw',
    prefix: ['w', 'r'],
  },
  'webviewer:zoom-out': {
    id: 'webviewer:zoom-out',
    name: 'Web viewer: Zoom out',
    icon: 'zoom-in',
    prefix: ['w', 'o'],
  },
  'webviewer:search': {
    id: 'webviewer:search',
    name: 'Web viewer: Search the web',
    icon: 'search',
    prefix: ['w', 'W'],
  },
  'webviewer:save-to-vault': {
    id: 'webviewer:save-to-vault',
    name: 'Web viewer: Save to vault',
    icon: 'lucide-file-down',
    prefix: ['w', 'v'],
  },
  'templater-obsidian:insert-templater': {
    id: 'templater-obsidian:insert-templater',
    name: 'Templater: Open insert template modal',
    icon: 'templater-icon',
    hotkeys: [
      {
        modifiers: ['Alt'],
        key: 'e',
      },
    ],
    prefix: ['l', 'o'],
  },
  'templater-obsidian:replace-in-file-templater': {
    id: 'templater-obsidian:replace-in-file-templater',
    name: 'Templater: Replace templates in the active file',
    icon: 'templater-icon',
    hotkeys: [
      {
        modifiers: ['Alt'],
        key: 'r',
      },
    ],
    prefix: ['l', 'r'],
  },
  'templater-obsidian:jump-to-next-cursor-location': {
    id: 'templater-obsidian:jump-to-next-cursor-location',
    name: 'Templater: Jump to next cursor location',
    icon: 'text-cursor',
    hotkeys: [
      {
        modifiers: ['Alt'],
        key: 'Tab',
      },
    ],
    prefix: ['l', 'j'],
  },
  'templater-obsidian:create-new-note-from-template': {
    id: 'templater-obsidian:create-new-note-from-template',
    name: 'Templater: Create new note from template',
    icon: 'templater-icon',
    hotkeys: [
      {
        modifiers: ['Alt'],
        key: 'n',
      },
    ],
    prefix: ['l', 'f'],
  },
};
