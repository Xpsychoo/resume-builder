import type { DesignSettings, ListKey, Profile, Resume, SectionSetting } from "@/lib/resume";

export type ListItem<K extends ListKey> = Resume[K][number];

/** Every way the editor can change the resume. Implemented by the Builder. */
export interface ResumeActions {
  setProfile(field: keyof Profile, value: string): void;
  setSummary(value: string): void;
  addItem(key: ListKey): void;
  updateItem<K extends ListKey>(key: K, id: string, patch: Partial<ListItem<K>>): void;
  removeItem(key: ListKey, id: string): void;
  moveItem(key: ListKey, from: number, to: number): void;
  setSections(sections: SectionSetting[]): void;
  setSettings(patch: Partial<DesignSettings>): void;
}
