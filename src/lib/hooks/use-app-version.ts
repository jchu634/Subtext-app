import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";

export function useAppVersion() {
  const [version, setVersion] = useState("2.0.0");
  useEffect(() => {
    getVersion()
      .then(setVersion)
      .catch(() => {
        // Not running inside Tauri; keep default.
      });
  }, []);
  return version;
}
