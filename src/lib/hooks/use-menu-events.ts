import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import { useUiStore } from "@/lib/ui-store";

export function useMenuEvents() {
  const setAboutOpen = useUiStore((s) => s.setAboutOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen<string>("app://menu", (event) => {
      if (event.payload === "about") setAboutOpen(true);
      else if (event.payload === "settings") setSettingsOpen(true);
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
  }, [setAboutOpen, setSettingsOpen]);
}
