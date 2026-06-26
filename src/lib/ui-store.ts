import { create } from "zustand";

interface UiState {
  aboutOpen: boolean;
  settingsOpen: boolean;
  setAboutOpen: (value: boolean) => void;
  setSettingsOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  aboutOpen: false,
  settingsOpen: false,
  setAboutOpen: (value) => set({ aboutOpen: value }),
  setSettingsOpen: (value) => set({ settingsOpen: value }),
}));
