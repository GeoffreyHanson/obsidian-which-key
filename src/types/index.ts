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
