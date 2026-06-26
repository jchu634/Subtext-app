export type JobStatus = "Pending" | "Running" | "Complete" | "Error";

export interface Language {
  code: string;
  lang: string;
}

export interface SubtitleFormat {
  value: string;
  active: boolean;
  isExtended: boolean;
}

export interface JobConfig {
  filePaths: string[];
  model: string;
  modelSize: string;
  language: string;
  embedSubtitles: boolean;
  overWriteFiles: boolean;
  outputFormats: string[];
  saveLocation: string;
}

export interface JobProgress {
  jobId: string;
  jobName: string;
  percentage: number;
  status: JobStatus;
  message?: string;
}

export type ProgressListener = (progress: JobProgress) => void;

export interface SubmitJobResult {
  jobId: string;
}

export interface BackendClient {
  getAvailableModels(): Promise<string[]>;
  getModelSizes(model: string): Promise<string[]>;
  getSupportedLanguages(model: string): Promise<Language[]>;
  submitJob(config: JobConfig): Promise<SubmitJobResult>;
  onJobProgress(jobId: string, listener: ProgressListener): () => void;
  cancelJob?(jobId: string): Promise<void>;
  setMultiJob(enabled: boolean): Promise<void>;
  getDefaultSaveLocation(): Promise<string>;
}
