import { createStore } from "@xstate/store";

interface file {
  fullPath: string;
  fileName: string;
}

export type ProgressType = {
  jobName: string;
  percentage: number;
  status: "Pending" | "Running" | "Complete" | "Error";
  message?: string;
};
export interface JobProgressState {
  [sse_id: string]: ProgressType;
}

export const store = createStore({
  context: {
    extendedSubtitlesFormats: false,
    files: new Set<file>(),
    jobProgress: {} as JobProgressState,
    saveLocation: "default",
    appVersion: "1.0.0 Beta",
  },
  // Transitions
  on: {
    TOGGLE_EXTENDED_SUBTITLES: {
      extendedSubtitlesFormats: (context) => !context.extendedSubtitlesFormats,
    },
    ADD_FILES: {
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
    ADD_FILE: {
      files: (context, event: { newFile: file }) => {
        const fileMap = new Map<string, file>();

        Array.from(context.files).forEach((file) => {
          fileMap.set(file.fullPath, file);
        });

        fileMap.set(event.newFile.fullPath, event.newFile);
        return new Set(fileMap.values());
      },
    },
    REMOVE_FILES: {
      files: (context, event: { removeFiles: file[] }) => {
        const removalPaths = new Set(event.removeFiles.map((f) => f.fullPath));
        return new Set(
          Array.from(context.files).filter(
            (item) => !removalPaths.has(item.fullPath),
          ),
        );
      },
    },
    REMOVE_FILE: {
      files: (context, event: { removeFile: file }) => {
        return new Set(
          Array.from(context.files).filter(
            (item) => item.fullPath !== event.removeFile.fullPath,
          ),
        );
      },
    },
    CLEAR_FILES: {
      files: (context) => new Set<file>(), // eslint-disable-line
    },
    ADD_JOB: {
      jobProgress: (context, event: { job: JobProgressState }) => {
        return {
          ...context.jobProgress,
          ...event.job,
        };
      },
    },
    UPDATE_JOB_PROGRESS: {
      jobProgress: (context, event: { job: JobProgressState }) => {
        return {
          ...context.jobProgress,
          ...event.job, // Update existing jobs with new values from event.job
        };
      },
    },
    CLEAR_INACTIVE_JOBS: {
      jobProgress: (context) => {
        const activeJobs: JobProgressState = {};
        for (const jobId in context.jobProgress) {
          if (
            Object.prototype.hasOwnProperty.call(context.jobProgress, jobId)
          ) {
            const job = context.jobProgress[jobId];
            if (job.status !== "Complete" && job.status !== "Error") {
              activeJobs[jobId] = job;
            }
          }
        }
        return activeJobs;
      },
    },
    RESET_JOB_PROGRESS: {
      jobProgress: () => ({}),
    },
    CHANGE_SAVE_LOCATION: {
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
