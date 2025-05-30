"use client";
import { Cog } from "lucide-react";
import { useTheme } from "next-themes";
import { useSelector } from "@xstate/store/react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { funnel } from "@/lib/fonts";

// Query Stuff
import { useQueryClient, useMutation } from "@tanstack/react-query";

async function returnPathDirectories() {
  const folder = await window.pywebview.api.spawnFolderDialog();
  if (typeof folder == null) {
    // User cancelled operation
    return;
  }
  store.send({ type: "CHANGE_SAVE_LOCATION", newLocation: folder });
  return folder;
}

export default function SettingsDialog() {
  // eslint-disable-next-line
  const queryClient = useQueryClient();

  const { theme, setTheme } = useTheme();
  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );
  const useMultiJob = useSelector(store, (state) => state.context.multiJob);
  const saveLocation = useSelector(
    store,
    (state) => state.context.saveLocation,
  );

  const suppressDragDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      document.addEventListener("dragenter", suppressDragDrop, true);
      document.addEventListener("dragover", suppressDragDrop, true);
      document.addEventListener("drop", suppressDragDrop, true);
    } else {
      document.removeEventListener("dragenter", suppressDragDrop, true);
      document.removeEventListener("dragover", suppressDragDrop, true);
      document.removeEventListener("drop", suppressDragDrop, true);
    }
  };

  const toggleMultiJobMutation = useMutation({
    mutationFn: async (newToggleState: boolean) => {
      const response = await fetch(
        `http://127.0.0.1:6789/toggle_multi_job?toggle=${newToggleState}`,
        {
          method: "PUT",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to toggle multi-job");
      }
      return response.json();
    },
    onSuccess: () => {
      store.send({ type: "TOGGLE_MULTI_JOB" });
    },
    onError: (error) => {
      // Handle error, e.g., show a notification
      console.error("Error toggling multi-job:", error);
    },
  });

  return (
    <div>
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="[&_svg]:size-7">
            <Cog strokeWidth={2} />
          </Button>
        </DialogTrigger>
        <DialogContent className="flex h-[80vh] max-w-(--breakpoint-2xl) min-w-[80vw] flex-col bg-slate-100/95 text-black ring-4 ring-white/15 ring-offset-0 dark:bg-black/80 dark:text-white">
          <DialogHeader>
            <DialogTitle className={`text-3xl ${funnel.className}`}>
              Settings
            </DialogTitle>
            <DialogDescription className="text-gray-800 dark:text-slate-400">
              {/* Placeholder text */}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={`flex flex-row items-center space-x-5 ${funnel.className}`}
            >
              <Label htmlFor="defaultSaveLocation" className="min-w-40 text-lg">
                Save Location:
              </Label>
              <p className="rounded-md border border-black p-1 pr-2 pl-2 dark:bg-white dark:text-black">
                {saveLocation.length == 0 ? "Default Location" : saveLocation}
              </p>

              <Button
                id="defaultSaveLocation"
                className="font-semibold hover:bg-zinc-600 dark:hover:bg-amber-200"
                onClick={returnPathDirectories}
              >
                Change Location
              </Button>
            </div>

            <div
              className={`flex flex-row items-center space-x-5 ${funnel.className}`}
            >
              <Label
                htmlFor="viewModeToggle"
                className="min-w-40 border-black text-lg"
              >
                UI Mode:
              </Label>
              <ToggleGroup
                type="single"
                variant="outline"
                id="viewModeToggle"
                defaultValue={theme}
                value={theme}
                onValueChange={(value) => {
                  if (value) {
                    setTheme(value);
                  }
                }}
              >
                <ToggleGroupItem
                  value="dark"
                  onClick={() => setTheme("dark")}
                  className="border-black text-black hover:bg-amber-200 hover:font-extrabold data-[state=on]:bg-orange-300 data-[state=on]:font-bold dark:bg-white dark:hover:bg-amber-200 dark:hover:text-black dark:data-[state=on]:bg-orange-300 dark:data-[state=on]:text-black"
                >
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="light"
                  onClick={() => setTheme("light")}
                  className="border-black text-black hover:bg-amber-200 hover:font-extrabold data-[state=on]:bg-orange-300 data-[state=on]:font-bold dark:bg-white dark:hover:bg-amber-200 dark:hover:text-black dark:data-[state=on]:bg-orange-300 dark:data-[state=on]:text-black"
                >
                  Light
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="system"
                  onClick={() => setTheme("system")}
                  className="border-black text-black hover:bg-amber-200 hover:font-extrabold data-[state=on]:bg-orange-300 data-[state=on]:font-bold dark:bg-white dark:hover:bg-amber-200 dark:hover:text-black dark:data-[state=on]:bg-orange-300 dark:data-[state=on]:text-black"
                >
                  System
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div
              className={`flex flex-row items-center space-x-5 ${funnel.className}`}
            >
              <Label htmlFor="viewModeToggle" className="text-lg">
                Enable Extended Subtitle Formats
              </Label>
              <Switch
                defaultChecked={useExtendedFormats}
                onClick={() =>
                  store.send({ type: "TOGGLE_EXTENDED_SUBTITLES" })
                }
                className="outline-1 outline-gray-700 dark:bg-slate-200 dark:data-[state=checked]:bg-orange-400"
              ></Switch>
            </div>
            <div
              className={`flex flex-row items-center space-x-5 ${funnel.className}`}
            >
              <Label htmlFor="viewModeToggle" className="text-lg">
                Enable Simultaneous Multiple Jobs
              </Label>
              <Switch
                defaultChecked={useMultiJob}
                checked={useMultiJob}
                onCheckedChange={(newCheckedState) => {
                  toggleMultiJobMutation.mutate(newCheckedState);
                }}
                className="outline-1 outline-gray-700 dark:bg-slate-200 dark:data-[state=checked]:bg-orange-400"
              ></Switch>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
