import type { BackendClient } from "./types";
import { mockBackend } from "./mock";

// Swap this assignment to a real implementation (Tauri invoke/events or HTTP)
// once the orchestrator runtime contract is finalised. The rest of the app
// only depends on the `BackendClient` interface.
export const backend: BackendClient = mockBackend;

export * from "./types";
