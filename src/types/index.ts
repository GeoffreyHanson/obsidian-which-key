import { Editor, MarkdownView } from 'obsidian';

// Define types for the WhichKey mappings
export interface WhichKeyCommand {
  name: string;
  id?: string;
  icon?: string;
  children?: Record<string, WhichKeyCommand>;
}

export interface CategorizedCommand {
  name: string;
  id: string;
  icon: string;
  hotkeys: string[];
  callback?: any;
}

export interface ObsidianCommand {
  id: string;
  name: string;
  icon?: string;
  hotkeys?: { modifiers: string[]; key: string }[];
  callback?: (...args: any[]) => any;
  editorCallback?: (editor: Editor, view: MarkdownView) => any;
  checkCallback?: (checking: boolean) => boolean | void;
}

export interface ObsidianCommands {
  commands: Record<string, ObsidianCommand>;
  executeCommandById(id: string): boolean;
}

export interface TopLevelMapping {
  prefix: string[];
  name: string;
  id: string;
  icon?: string;
}

export interface CategoryMapping {
  formattedName: string;
  commands: LeanCommand[];
}

export interface CategoryMappings {
  [prefix: string]: CategoryMapping;
}

export interface CategoryBuckets {
  [category: string]: LeanCommand[];
}

export interface LeanCommand {
  id: string;
  name: string;
  prefix?: string[];
  icon?: string;
  hotkeys?: { modifiers: string[]; key: string }[];
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

/** Category commands */
export interface CategoryCommand {
  name: string;
  prefix: string[];
  id: undefined;
  icon?: string;
}

/** Intent buckets for curated commands */
export interface IntentMapping {
  prefix: string[];
  name: string;
  id?: undefined;
  icon?: string;
  pattern: RegExp;
}

export interface PrefixAssignmentContext {
  parentPrefix: string[];
  commandBucket: LeanCommand[];
  prefixesToAssign: Set<string>;
  preferredPrefixes: Set<string>[];
  fallbackPrefixes: Set<string>[];
}
