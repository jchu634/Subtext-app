import { createStore } from "@xstate/store";

export const store = createStore({
  context: { extendedSubtitlesFormats: false, name: "David" },
  // Transitions
  on: {
    toggleExtentedSubtitles: {
      extendedSubtitlesFormats: (context) => !context.extendedSubtitlesFormats,
    },
    changeName: {
      name: (context, event: { newName: string }) => event.newName,
    },
  },
});
