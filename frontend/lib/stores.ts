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
    appVersion: "1.0.0 Beta",
  },
  // Transitions
  on: {
    toggleExtentedSubtitles: {
      extendedSubtitlesFormats: (context) => !context.extendedSubtitlesFormats,
    },
    addFiles: {
      files: (context, event: { newFiles: file[] }) => {
        const fileMap = new Map<string, file>();

        // Process existing files
        Array.from(context.files).forEach((file) => {
          fileMap.set(file.fullPath, file);
        });

        // Process new files
        event.newFiles.forEach((file) => {
          fileMap.set(file.fullPath, file);
        });

        return new Set(fileMap.values());
      },
    },
    addFile: {
      files: (context, event: { newFile: file }) => {
        const fileMap = new Map<string, file>();

        Array.from(context.files).forEach((file) => {
          fileMap.set(file.fullPath, file);
        });

        fileMap.set(event.newFile.fullPath, event.newFile);
        return new Set(fileMap.values());
      },
    },
    removeFiles: {
      files: (context, event: { removeFiles: file[] }) => {
        const removalPaths = new Set(event.removeFiles.map((f) => f.fullPath));
        return new Set(
          Array.from(context.files).filter(
            (item) => !removalPaths.has(item.fullPath),
          ),
        );
      },
    },
    removeFile: {
      files: (context, event: { removeFile: file }) => {
        return new Set(
          Array.from(context.files).filter(
            (item) => item.fullPath !== event.removeFile.fullPath,
          ),
        );
      },
    },
    clearFiles: {
      files: (context) => new Set<file>(), // eslint-disable-line
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
