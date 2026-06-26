import { useEffect, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

import { useStore, type FileEntry } from "@/lib/store";

export function useDragDrop() {
  const addFiles = useStore((s) => s.addFiles);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (event.payload.type === "over" || event.payload.type === "enter") {
          setIsDragging(true);
        } else if (event.payload.type === "drop") {
          const entries: FileEntry[] = event.payload.paths.map((p) => ({
            fullPath: p,
            fileName: p.split(/[\\/]/).pop() ?? p,
          }));
          if (entries.length) addFiles(entries);
          setIsDragging(false);
        } else if (event.payload.type === "leave") {
          setIsDragging(false);
        }
      })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        // Not running inside Tauri (e.g. plain browser dev). Ignore.
      });

    return () => {
      unlisten?.();
    };
  }, [addFiles]);

  return isDragging;
}
