import { createStore } from "@xstate/store";

interface file {
  fullPath: string;
  fileName: string;
}

export const store = createStore({
  context: {
    extendedSubtitlesFormats: false,
    files: new Set<file>(),
    saveLocation: "default",
  },
  // Transitions
  on: {
    toggleExtentedSubtitles: {
      extendedSubtitlesFormats: (context) => !context.extendedSubtitlesFormats,
    },
    addFiles: {
      files: (context, event: { newFiles: file[] }) => {
        return new Set<file>([...context.files, ...event.newFiles]);
      },
    },
    addFile: {
      files: (context, event: { newFile: file }) => {
        context.files.add(event.newFile);
        return context.files;
      },
    },
    removeFiles: {
      files: (context, event: { removeFiles: file[] }) => {
        const removalSet = new Set(event.removeFiles);

        return new Set(
          Array.from(context.files).filter((item) => !removalSet.has(item)),
        );
      },
    },
    removeFile: {
      files: (context, event: { removeFile: file }) => {
        context.files.delete(event.removeFile);

        return context.files;
      },
    },
    clearFiles: {
      files: (context) => new Set<file>(),
    },
    changeSaveLocation: {
      saveLocation: (context, event: { newLocation: string }) => {
        if (event.newLocation) {
          return event.newLocation[0];
        } else {
          return context.saveLocation; // Return the current save location if the new location is invalid
        }
      },
    },
  },
});
