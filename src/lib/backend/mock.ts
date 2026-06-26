import type {
  BackendClient,
  JobConfig,
  JobProgress,
  Language,
  ProgressListener,
  SubmitJobResult,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MODELS = ["Whisper (CPU)", "Whisper (CUDA)"];

const SIZES: Record<string, string[]> = {
  "Whisper (CPU)": ["tiny", "base", "small", "medium", "large"],
  "Whisper (CUDA)": ["tiny", "base", "small", "medium", "large", "large-v2"],
};

const LANGUAGES: Language[] = [
  { code: "auto", lang: "Auto Detect" },
  { code: "en", lang: "English" },
  { code: "es", lang: "Spanish" },
  { code: "fr", lang: "French" },
  { code: "de", lang: "German" },
  { code: "it", lang: "Italian" },
  { code: "pt", lang: "Portuguese" },
  { code: "ru", lang: "Russian" },
  { code: "ja", lang: "Japanese" },
  { code: "ko", lang: "Korean" },
  { code: "zh", lang: "Chinese" },
  { code: "ar", lang: "Arabic" },
  { code: "hi", lang: "Hindi" },
];

const listeners = new Map<string, Set<ProgressListener>>();
const timers = new Map<string, ReturnType<typeof setInterval>>();

function emit(progress: JobProgress) {
  listeners.get(progress.jobId)?.forEach((l) => l(progress));
}

function deriveJobName(config: JobConfig): string {
  const first = config.filePaths[0]?.split(/[\\/]/).pop() ?? "Job";
  const base = first.slice(0, 24);
  return config.filePaths.length > 1
    ? `${base} + ${config.filePaths.length - 1} more`
    : base;
}

export const mockBackend: BackendClient = {
  async getAvailableModels() {
    await delay(200);
    return MODELS;
  },

  async getModelSizes(model) {
    await delay(200);
    return SIZES[model] ?? ["tiny", "base", "small"];
  },

  async getSupportedLanguages() {
    await delay(200);
    return LANGUAGES;
  },

  async submitJob(config: JobConfig): Promise<SubmitJobResult> {
    await delay(300);
    const jobId = Math.random().toString(36).slice(2, 10);
    const jobName = deriveJobName(config);

    emit({
      jobId,
      jobName,
      percentage: 0,
      status: "Pending",
      message: "Job submitted, awaiting progress...",
    });

    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(100, pct + 4 + Math.random() * 12);
      const status = pct >= 100 ? "Complete" : "Running";
      emit({ jobId, jobName, percentage: pct, status });
      if (status === "Complete") {
        clearInterval(interval);
        timers.delete(jobId);
      }
    }, 700);
    timers.set(jobId, interval);

    return { jobId };
  },

  onJobProgress(jobId, listener) {
    if (!listeners.has(jobId)) listeners.set(jobId, new Set());
    listeners.get(jobId)!.add(listener);
    return () => {
      listeners.get(jobId)?.delete(listener);
    };
  },

  async cancelJob(jobId) {
    const t = timers.get(jobId);
    if (t) {
      clearInterval(t);
      timers.delete(jobId);
    }
    emit({
      jobId,
      jobName: "",
      percentage: 0,
      status: "Error",
      message: "Job cancelled",
    });
  },

  async setMultiJob() {
    // no-op in mock
  },

  async getDefaultSaveLocation() {
    return "Default Location";
  },
};
