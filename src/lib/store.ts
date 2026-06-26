import { create } from "zustand";
import type { JobStatus } from "@/lib/backend";

export interface FileEntry {
  fullPath: string;
  fileName: string;
}

export interface JobProgressEntry {
  jobId: string;
  jobName: string;
  percentage: number;
  status: JobStatus;
  message?: string;
}

interface AppState {
  files: FileEntry[];
  jobProgress: Record<string, JobProgressEntry>;
  extendedSubtitlesFormats: boolean;
  multiJob: boolean;
  saveLocation: string;

  addFiles: (files: FileEntry[]) => void;
  addFile: (file: FileEntry) => void;
  removeFiles: (files: FileEntry[]) => void;
  removeFile: (file: FileEntry) => void;
  clearFiles: () => void;

  addJob: (entry: JobProgressEntry) => void;
  updateJobProgress: (jobId: string, patch: Partial<JobProgressEntry>) => void;
  clearInactiveJobs: () => void;

  toggleExtendedSubtitles: () => void;
  toggleMultiJob: () => void;
  setMultiJob: (value: boolean) => void;
  setSaveLocation: (value: string) => void;
}

export const useStore = create<AppState>((set) => ({
  files: [],
  jobProgress: {},
  extendedSubtitlesFormats: false,
  multiJob: false,
  saveLocation: "Default Location",

  addFiles: (incoming) =>
    set((s) => {
      const byPath = new Map(s.files.map((f) => [f.fullPath, f]));
      incoming.forEach((f) => byPath.set(f.fullPath, f));
      return { files: Array.from(byPath.values()) };
    }),

  addFile: (file) =>
    set((s) => {
      if (s.files.some((f) => f.fullPath === file.fullPath)) return s;
      return { files: [...s.files, file] };
    }),

  removeFiles: (toRemove) =>
    set((s) => {
      const removePaths = new Set(toRemove.map((f) => f.fullPath));
      return { files: s.files.filter((f) => !removePaths.has(f.fullPath)) };
    }),

  removeFile: (file) =>
    set((s) => ({
      files: s.files.filter((f) => f.fullPath !== file.fullPath),
    })),

  clearFiles: () => set({ files: [] }),

  addJob: (entry) =>
    set((s) => ({
      jobProgress: { ...s.jobProgress, [entry.jobId]: entry },
    })),

  updateJobProgress: (jobId, patch) =>
    set((s) => {
      const existing = s.jobProgress[jobId];
      if (!existing) return s;
      return {
        jobProgress: { ...s.jobProgress, [jobId]: { ...existing, ...patch } },
      };
    }),

  clearInactiveJobs: () =>
    set((s) => {
      const active: Record<string, JobProgressEntry> = {};
      for (const [id, job] of Object.entries(s.jobProgress)) {
        if (job.status !== "Complete" && job.status !== "Error") {
          active[id] = job;
        }
      }
      return { jobProgress: active };
    }),

  toggleExtendedSubtitles: () =>
    set((s) => ({ extendedSubtitlesFormats: !s.extendedSubtitlesFormats })),

  toggleMultiJob: () => set((s) => ({ multiJob: !s.multiJob })),
  setMultiJob: (value) => set({ multiJob: value }),
  setSaveLocation: (value) => set({ saveLocation: value }),
}));
