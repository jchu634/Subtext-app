import { createStore } from "@xstate/store";

interface file {
  fullPath: String;
  fileName: String;
}

export const store = createStore({
  context: { extendedSubtitlesFormats: false, files:[], saveLocation: "" },
  // Transitions
  on: {
    toggleExtentedSubtitles: {
      extendedSubtitlesFormats: (context) => !context.extendedSubtitlesFormats,
    },
    // changeName: {
    //   name: (context, event: { newName: string }) => event.newName,
    // },
    // addFiles: {
    //   files: (context, event: {newFiles: file[]}) => {
    //     const allFiles = context.files.concat(event.newFiles)
    //     const uniquefiles = allFiles.filter(
    //         (file, index, self) =>
    //           index === self.findIndex((f) => f.fullPath === file.fullPath),
    //       );
    //   })
    // },
    changeSaveLocation: {
      saveLocation: (context, event: { newLocation: string }) => {
        if (event.newLocation) {
          return event.newLocation;
        } else {
          return context.saveLocation; // Return the current save location if the new location is invalid
        }
      },
    },
  },
});
