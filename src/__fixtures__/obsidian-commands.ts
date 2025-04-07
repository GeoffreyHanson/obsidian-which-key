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
  },
  'editor:download-attachments': {
    id: 'editor:download-attachments',
    name: 'Download attachments for current file',
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
  },
  'workspace:toggle-pin': {
    id: 'workspace:toggle-pin',
    name: 'Toggle pin',
    icon: 'lucide-pin',
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
  },
  'editor:focus-top': {
    id: 'editor:focus-top',
    name: 'Focus on tab group above',
  },
  'editor:focus-bottom': {
    id: 'editor:focus-bottom',
    name: 'Focus on tab group below',
  },
  'editor:focus-left': {
    id: 'editor:focus-left',
    name: 'Focus on tab group to the left',
  },
  'editor:focus-right': {
    id: 'editor:focus-right',
    name: 'Focus on tab group to the right',
  },
  'workspace:split-vertical': {
    id: 'workspace:split-vertical',
    name: 'Split right',
    icon: 'lucide-separator-vertical',
  },
  'workspace:split-horizontal': {
    id: 'workspace:split-horizontal',
    name: 'Split down',
    icon: 'lucide-separator-horizontal',
  },
  'workspace:toggle-stacked-tabs': {
    id: 'workspace:toggle-stacked-tabs',
    name: 'Toggle stacked tabs',
    icon: 'lucide-layers',
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
  },
  'workspace:copy-path': {
    id: 'workspace:copy-path',
    name: 'Copy file path',
    icon: 'lucide-copy',
  },
  'workspace:copy-url': {
    id: 'workspace:copy-url',
    name: 'Copy Obsidian URL',
    icon: 'lucide-copy',
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
  },
  'workspace:export-pdf': {
    id: 'workspace:export-pdf',
    name: 'Export to PDF...',
  },
  'editor:rename-heading': {
    id: 'editor:rename-heading',
    name: 'Rename this heading...',
    icon: 'lucide-edit-3',
  },
  'workspace:open-in-new-window': {
    id: 'workspace:open-in-new-window',
    name: 'Open current tab in new window',
    icon: 'lucide-maximize',
  },
  'workspace:move-to-new-window': {
    id: 'workspace:move-to-new-window',
    name: 'Move current tab to new window',
    icon: 'lucide-maximize',
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
  },
  'workspace:close-others': {
    id: 'workspace:close-others',
    name: 'Close all other tabs',
    icon: 'lucide-x',
  },
  'workspace:close-tab-group': {
    id: 'workspace:close-tab-group',
    name: 'Close this tab group',
    icon: 'lucide-x',
  },
  'workspace:close-others-tab-group': {
    id: 'workspace:close-others-tab-group',
    name: 'Close others in tab group',
    icon: 'lucide-x',
  },
  'workspace:show-trash': {
    id: 'workspace:show-trash',
    name: 'Show trash',
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
  },
  'app:open-vault': {
    id: 'app:open-vault',
    name: 'Open another vault',
    icon: 'vault',
  },
  'theme:use-dark': {
    id: 'theme:use-dark',
    name: 'Use dark mode',
  },
  'theme:use-light': {
    id: 'theme:use-light',
    name: 'Use light mode',
  },
  'theme:switch': {
    id: 'theme:switch',
    name: 'Change theme',
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
  },
  'app:show-release-notes': {
    id: 'app:show-release-notes',
    name: 'Show release notes',
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
  },
  'markdown:add-alias': {
    id: 'markdown:add-alias',
    name: 'Add alias',
    icon: 'lucide-forward',
  },
  'markdown:edit-metadata-property': {
    id: 'markdown:edit-metadata-property',
    name: 'Edit file property',
    icon: 'lucide-package-open',
  },
  'markdown:clear-metadata-properties': {
    id: 'markdown:clear-metadata-properties',
    name: 'Clear file properties',
    icon: 'lucide-package-x',
  },
  'app:delete-file': {
    id: 'app:delete-file',
    name: 'Delete current file',
    icon: 'lucide-trash-2',
  },
  'app:toggle-ribbon': {
    id: 'app:toggle-ribbon',
    name: 'Toggle ribbon',
  },
  'app:toggle-left-sidebar': {
    id: 'app:toggle-left-sidebar',
    name: 'Toggle left sidebar',
  },
  'app:toggle-right-sidebar': {
    id: 'app:toggle-right-sidebar',
    name: 'Toggle right sidebar',
  },
  'app:toggle-default-new-pane-mode': {
    id: 'app:toggle-default-new-pane-mode',
    name: 'Toggle default mode for new tabs',
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
  },
  'app:reload': {
    id: 'app:reload',
    name: 'Reload app without saving',
    icon: 'lucide-rotate-ccw',
  },
  'app:show-debug-info': {
    id: 'app:show-debug-info',
    name: 'Show debug info',
  },
  'app:open-sandbox-vault': {
    id: 'app:open-sandbox-vault',
    name: 'Open sandbox vault',
  },
  'window:toggle-always-on-top': {
    id: 'window:toggle-always-on-top',
    name: 'Toggle window always on top',
  },
  'window:zoom-in': {
    id: 'window:zoom-in',
    name: 'Zoom in',
  },
  'window:zoom-out': {
    id: 'window:zoom-out',
    name: 'Zoom out',
  },
  'window:reset-zoom': {
    id: 'window:reset-zoom',
    name: 'Reset zoom',
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
  },
  'file-explorer:new-file-in-current-tab': {
    id: 'file-explorer:new-file-in-current-tab',
    name: 'Create new note in current tab',
    icon: 'lucide-file-plus',
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
  },
  'open-with-default-app:open': {
    id: 'open-with-default-app:open',
    name: 'Open in default app',
    icon: 'lucide-arrow-up-right',
  },
  'file-explorer:move-file': {
    id: 'file-explorer:move-file',
    name: 'Move current file to another folder',
    icon: 'lucide-folder-tree',
  },
  'file-explorer:duplicate-file': {
    id: 'file-explorer:duplicate-file',
    name: 'Duplicate current file',
    icon: 'lucide-files',
  },
  'open-with-default-app:show': {
    id: 'open-with-default-app:show',
    name: 'Reveal in Finder',
    icon: 'lucide-files',
  },
  'editor:toggle-source': {
    id: 'editor:toggle-source',
    name: 'Toggle Live Preview/Source mode',
    icon: 'lucide-code-2',
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
  },
  'editor:focus': {
    id: 'editor:focus',
    name: 'Focus on last note',
  },
  'editor:toggle-fold-properties': {
    id: 'editor:toggle-fold-properties',
    name: 'Toggle fold properties in current file',
    icon: 'lucide-diff',
  },
  'editor:toggle-fold': {
    id: 'editor:toggle-fold',
    name: 'Toggle fold on the current line',
    icon: 'lucide-diff',
    allowProperties: true,
  },
  'editor:fold-all': {
    id: 'editor:fold-all',
    name: 'Fold all headings and lists',
    icon: 'lucide-minimize-2',
    allowPreview: true,
    allowProperties: true,
  },
  'editor:unfold-all': {
    id: 'editor:unfold-all',
    name: 'Unfold all headings and lists',
    icon: 'lucide-maximize-2',
    allowPreview: true,
    allowProperties: true,
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
  },
  'editor:insert-wikilink': {
    id: 'editor:insert-wikilink',
    name: 'Add internal link',
    icon: 'bracket-glyph',
  },
  'editor:insert-embed': {
    id: 'editor:insert-embed',
    name: 'Add embed',
    icon: 'lucide-sticky-note',
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
  },
  'editor:insert-tag': {
    id: 'editor:insert-tag',
    name: 'Add tag',
    icon: 'lucide-tag',
  },
  'editor:set-heading': {
    id: 'editor:set-heading',
    name: 'Toggle heading',
    icon: 'heading-glyph',
  },
  'editor:set-heading-0': {
    id: 'editor:set-heading-0',
    name: 'Remove heading',
    icon: 'heading-glyph',
  },
  'editor:set-heading-1': {
    id: 'editor:set-heading-1',
    name: 'Set as heading 1',
    icon: 'heading-glyph',
  },
  'editor:set-heading-2': {
    id: 'editor:set-heading-2',
    name: 'Set as heading 2',
    icon: 'heading-glyph',
  },
  'editor:set-heading-3': {
    id: 'editor:set-heading-3',
    name: 'Set as heading 3',
    icon: 'heading-glyph',
  },
  'editor:set-heading-4': {
    id: 'editor:set-heading-4',
    name: 'Set as heading 4',
    icon: 'heading-glyph',
  },
  'editor:set-heading-5': {
    id: 'editor:set-heading-5',
    name: 'Set as heading 5',
    icon: 'heading-glyph',
  },
  'editor:set-heading-6': {
    id: 'editor:set-heading-6',
    name: 'Set as heading 6',
    icon: 'heading-glyph',
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
  },
  'editor:toggle-strikethrough': {
    id: 'editor:toggle-strikethrough',
    name: 'Toggle strikethrough',
    icon: 'lucide-strikethrough',
  },
  'editor:toggle-highlight': {
    id: 'editor:toggle-highlight',
    name: 'Toggle highlight',
    icon: 'lucide-highlighter',
  },
  'editor:toggle-code': {
    id: 'editor:toggle-code',
    name: 'Toggle code',
    icon: 'lucide-code-2',
  },
  'editor:toggle-inline-math': {
    id: 'editor:toggle-inline-math',
    name: 'Toggle inline math',
    icon: 'lucide-sigma',
  },
  'editor:toggle-blockquote': {
    id: 'editor:toggle-blockquote',
    name: 'Toggle blockquote',
    icon: 'lucide-quote',
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
  },
  'editor:attach-file': {
    id: 'editor:attach-file',
    name: 'Insert attachment',
    icon: 'lucide-paperclip',
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
  },
  'file-explorer:reveal-active-file': {
    id: 'file-explorer:reveal-active-file',
    name: 'Files: Reveal current file in navigation',
    icon: 'lucide-navigation',
  },
  'file-explorer:new-folder': {
    id: 'file-explorer:new-folder',
    name: 'Files: Create new folder',
    icon: 'lucide-folder-plus',
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
  },
  'graph:open-local': {
    id: 'graph:open-local',
    name: 'Graph view: Open local graph',
    icon: 'lucide-git-fork',
  },
  'graph:animate': {
    id: 'graph:animate',
    name: 'Graph view: Start graph timelapse animation',
    icon: 'lucide-wand',
  },
  'backlink:open': {
    id: 'backlink:open',
    name: 'Backlinks: Show backlinks',
    icon: 'lucide-link',
  },
  'backlink:open-backlinks': {
    id: 'backlink:open-backlinks',
    name: 'Backlinks: Open backlinks for the current note',
    icon: 'lucide-link',
  },
  'backlink:toggle-backlinks-in-document': {
    id: 'backlink:toggle-backlinks-in-document',
    name: 'Backlinks: Toggle backlinks in document',
    icon: 'lucide-link',
  },
  'canvas:new-file': {
    id: 'canvas:new-file',
    name: 'Canvas: Create new canvas',
    icon: 'lucide-layout-dashboard',
  },
  'canvas:export-as-image': {
    id: 'canvas:export-as-image',
    name: 'Canvas: Export as image',
    icon: 'lucide-image',
  },
  'canvas:jump-to-group': {
    id: 'canvas:jump-to-group',
    name: 'Canvas: Jump to group',
    icon: 'lucide-move',
  },
  'canvas:convert-to-file': {
    id: 'canvas:convert-to-file',
    name: 'Canvas: Convert to file...',
    icon: 'lucide-file-input',
  },
  'outgoing-links:open': {
    id: 'outgoing-links:open',
    name: 'Outgoing links: Show outgoing links',
    icon: 'lucide-link',
  },
  'outgoing-links:open-for-current': {
    id: 'outgoing-links:open-for-current',
    name: 'Outgoing links: Open outgoing links for the current file',
    icon: 'lucide-link',
  },
  'tag-pane:open': {
    id: 'tag-pane:open',
    name: 'Tags view: Show tags',
    icon: 'lucide-tag',
  },
  'properties:open': {
    id: 'properties:open',
    name: 'Properties view: Show all properties',
    icon: 'lucide-archive',
  },
  'properties:open-local': {
    id: 'properties:open-local',
    name: 'Properties view: Show file properties',
    icon: 'lucide-info',
  },
  'daily-notes': {
    id: 'daily-notes',
    name: "Daily notes: Open today's daily note",
    icon: 'lucide-calendar-days',
  },
  'daily-notes:goto-prev': {
    id: 'daily-notes:goto-prev',
    name: 'Daily notes: Open previous daily note',
    icon: 'lucide-calendar-minus',
  },
  'daily-notes:goto-next': {
    id: 'daily-notes:goto-next',
    name: 'Daily notes: Open next daily note',
    icon: 'lucide-calendar-plus',
  },
  'insert-template': {
    id: 'insert-template',
    name: 'Templates: Insert template',
    icon: 'lucide-copy',
  },
  'insert-current-date': {
    id: 'insert-current-date',
    name: 'Templates: Insert current date',
    icon: 'lucide-calendar-days',
  },
  'insert-current-time': {
    id: 'insert-current-time',
    name: 'Templates: Insert current time',
    icon: 'lucide-clock',
  },
  'note-composer:merge-file': {
    id: 'note-composer:merge-file',
    name: 'Note composer: Merge current file with another file...',
    icon: 'lucide-git-merge',
  },
  'note-composer:split-file': {
    id: 'note-composer:split-file',
    name: 'Note composer: Extract current selection...',
    icon: 'lucide-scissors',
  },
  'note-composer:extract-heading': {
    id: 'note-composer:extract-heading',
    name: 'Note composer: Extract this heading...',
    icon: 'lucide-scissors',
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
  },
  'bookmarks:open': {
    id: 'bookmarks:open',
    name: 'Bookmarks: Show bookmarks',
    icon: 'lucide-bookmark',
  },
  'bookmarks:bookmark-current-view': {
    id: 'bookmarks:bookmark-current-view',
    name: 'Bookmarks: Bookmark...',
    icon: 'lucide-bookmark-plus',
  },
  'bookmarks:bookmark-current-search': {
    id: 'bookmarks:bookmark-current-search',
    name: 'Bookmarks: Bookmark current search...',
    icon: 'lucide-search',
  },
  'bookmarks:unbookmark-current-view': {
    id: 'bookmarks:unbookmark-current-view',
    name: 'Bookmarks: Remove bookmark for the current file',
    icon: 'lucide-bookmark-plus',
  },
  'bookmarks:bookmark-current-section': {
    id: 'bookmarks:bookmark-current-section',
    name: 'Bookmarks: Bookmark block under cursor...',
    icon: 'lucide-bookmark-plus',
  },
  'bookmarks:bookmark-current-heading': {
    id: 'bookmarks:bookmark-current-heading',
    name: 'Bookmarks: Bookmark heading under cursor...',
    icon: 'lucide-bookmark-plus',
  },
  'bookmarks:bookmark-all-tabs': {
    id: 'bookmarks:bookmark-all-tabs',
    name: 'Bookmarks: Bookmark all tabs...',
    icon: 'lucide-bookmark-plus',
  },
  'markdown-importer:open': {
    id: 'markdown-importer:open',
    name: 'Format converter: Open format converter',
    icon: 'lucide-download',
  },
  'zk-prefixer': {
    id: 'zk-prefixer',
    name: 'Unique note creator: Create new unique note',
    icon: 'box-glyph',
  },
  'random-note': {
    id: 'random-note',
    name: 'Random note: Open random note',
    icon: 'dice-glyph',
  },
  'outline:open': {
    id: 'outline:open',
    name: 'Outline: Show outline',
    icon: 'lucide-list',
  },
  'outline:open-for-current': {
    id: 'outline:open-for-current',
    name: 'Outline: Open outline of the current file',
    icon: 'lucide-list',
  },
  'slides:start': {
    id: 'slides:start',
    name: 'Slides: Start presentation',
    icon: 'lucide-monitor',
  },
  'audio-recorder:start': {
    id: 'audio-recorder:start',
    name: 'Audio recorder: Start recording audio',
    icon: 'lucide-play-circle',
  },
  'audio-recorder:stop': {
    id: 'audio-recorder:stop',
    name: 'Audio recorder: Stop recording audio',
    icon: 'lucide-stop-circle',
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
  },
  'publish:view-changes': {
    id: 'publish:view-changes',
    name: 'Publish: Publish changes...',
    icon: 'lucide-send',
  },
  'publish:publish-file': {
    id: 'publish:publish-file',
    name: 'Publish: Publish current file',
    icon: 'lucide-send',
  },
  'publish:open-in-live-site': {
    id: 'publish:open-in-live-site',
    name: 'Publish: Open in live site',
    icon: 'lucide-globe',
  },
  'sync:setup': {
    id: 'sync:setup',
    name: 'Sync: Set up Sync',
    icon: 'lucide-settings',
  },
  'sync:view-version-history': {
    id: 'sync:view-version-history',
    name: 'Sync: Open version history for the current file',
    icon: 'lucide-history',
  },
  'sync:open-sync-view': {
    id: 'sync:open-sync-view',
    name: 'Sync: Show Sync history',
    icon: 'lucide-rotate-ccw',
  },
  'sync:open-sync-log': {
    id: 'sync:open-sync-log',
    name: 'Sync: Open activity log',
    icon: 'lucide-align-left',
  },
  'webviewer:open': {
    id: 'webviewer:open',
    name: 'Web viewer: Open web viewer',
  },
  'webviewer:open-history': {
    id: 'webviewer:open-history',
    name: 'Web viewer: Show history',
    icon: 'lucide-clock',
  },
  'webviewer:toggle-reader-mode': {
    id: 'webviewer:toggle-reader-mode',
    name: 'Web viewer: Toggle reader mode',
    icon: 'glasses',
  },
  'webviewer:focus-address-bar': {
    id: 'webviewer:focus-address-bar',
    name: 'Web viewer: Focus address bar',
    icon: 'text-cursor-input',
  },
  'webviewer:zoom-in': {
    id: 'webviewer:zoom-in',
    name: 'Web viewer: Zoom in',
    icon: 'zoom-in',
  },
  'webviewer:zoom-reset': {
    id: 'webviewer:zoom-reset',
    name: 'Web viewer: Reset zoom',
    icon: 'rotate-cw',
  },
  'webviewer:zoom-out': {
    id: 'webviewer:zoom-out',
    name: 'Web viewer: Zoom out',
    icon: 'zoom-in',
  },
  'webviewer:search': {
    id: 'webviewer:search',
    name: 'Web viewer: Search the web',
    icon: 'search',
  },
  'webviewer:save-to-vault': {
    id: 'webviewer:save-to-vault',
    name: 'Web viewer: Save to vault',
    icon: 'lucide-file-down',
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
  },
  'which-key-plugin:open-sample-modal-simple': {
    id: 'which-key-plugin:open-sample-modal-simple',
    name: 'WhichKey: Open sample modal (simple)',
  },
  'which-key-plugin:sample-editor-command': {
    id: 'which-key-plugin:sample-editor-command',
    name: 'WhichKey: Sample editor command',
  },
  'which-key-plugin:open-sample-modal-complex': {
    id: 'which-key-plugin:open-sample-modal-complex',
    name: 'WhichKey: Open sample modal (complex)',
  },
};
