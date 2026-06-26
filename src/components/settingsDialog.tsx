import { Cog } from "lucide-react";
import { useTheme } from "next-themes";
import { open } from "@tauri-apps/plugin-dialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { backend } from "@/lib/backend";
import { useStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export default function SettingsDialog() {
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const { theme, setTheme } = useTheme();

  const extended = useStore((s) => s.extendedSubtitlesFormats);
  const toggleExtended = useStore((s) => s.toggleExtendedSubtitles);
  const multiJob = useStore((s) => s.multiJob);
  const setMultiJob = useStore((s) => s.setMultiJob);
  const saveLocation = useStore((s) => s.saveLocation);
  const setSaveLocation = useStore((s) => s.setSaveLocation);

  async function pickFolder() {
    const folder = await open({ directory: true });
    if (typeof folder === "string") {
      setSaveLocation(folder);
    }
  }

  async function handleMultiJob(checked: boolean) {
    try {
      await backend.setMultiJob(checked);
      setMultiJob(checked);
    } catch (e) {
      console.error("Failed to toggle multi-job", e);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-foreground hover:bg-white/10"
        onClick={() => setSettingsOpen(true)}
      >
        <Cog className="size-6" />
      </Button>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="flex max-h-[85vh] min-w-[80vw] flex-col gap-6 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Settings</DialogTitle>
            <DialogDescription className="sr-only">
              Application settings
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-row flex-wrap items-center gap-3">
              <Label className="min-w-40">Save Location:</Label>
              <p className="rounded-md border border-border px-2 py-1 text-sm">
                {saveLocation || "Default Location"}
              </p>
              <Button onClick={pickFolder}>Change Location</Button>
            </div>

            <div className="flex flex-row flex-wrap items-center gap-3">
              <Label className="min-w-40">UI Mode:</Label>
              <div className="flex gap-1">
                {THEME_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      theme === opt.value &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              <Label className="flex-1">
                Enable Extended Subtitle Formats
              </Label>
              <Switch checked={extended} onCheckedChange={() => toggleExtended()} />
            </div>

            <div className="flex flex-row items-center gap-4">
              <Label className="flex-1">
                Enable Simultaneous Multiple Jobs
              </Label>
              <Switch
                checked={multiJob}
                onCheckedChange={handleMultiJob}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
