"use client";
import { Funnel_Display } from "next/font/google";

import { Cog } from "lucide-react";
import { useTheme } from "next-themes";
import { useSelector } from "@xstate/store/react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { store } from "@/components/stores";
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

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
});

async function returnPathDirectories() {
  const folder = await window.pywebview.api.spawnFolderDialog();
  if (typeof folder == null) {
    // User cancelled operation
    return;
  }
  store.send({ type: "changeSaveLocation", newLocation: folder });
  return folder;
}

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );
  const saveLocation = useSelector(
    store,
    (state) => state.context.saveLocation,
  );

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="[&_svg]:size-7">
            <Cog strokeWidth={2} />
          </Button>
        </DialogTrigger>
        <DialogContent className="flex h-[80vh] w-[80vw] max-w-screen-2xl flex-col bg-slate-100 bg-opacity-95 text-black dark:bg-black dark:bg-opacity-80 dark:text-white">
          <DialogHeader>
            <DialogTitle className={`text-3xl ${funnelDisplay.className}`}>
              Settings
            </DialogTitle>
            <DialogDescription className="text-gray-800 dark:text-slate-400">
              {/* Placeholder text */}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={`flex flex-row items-center space-x-2 ${funnelDisplay.className}`}
            >
              <Label htmlFor="defaultSaveLocation" className="text-lg">
                Save Location:
              </Label>
              <p className="rounded-md border border-black p-1">
                {saveLocation.length == 0 ? "Default Location" : saveLocation}
              </p>

              <Button id="defaultSaveLocation" onClick={returnPathDirectories}>
                Browse
              </Button>
            </div>

            <div
              className={`flex flex-row items-center space-x-5 ${funnelDisplay.className}`}
            >
              <Label htmlFor="viewModeToggle" className="text-lg">
                Enable Extended Subtitle Formats
              </Label>
              <Switch
                defaultChecked={useExtendedFormats}
                onClick={() => store.send({ type: "toggleExtentedSubtitles" })}
                className="outline outline-1 outline-gray-700 dark:bg-slate-200 dark:data-[state=checked]:bg-orange-400"
              ></Switch>
            </div>
            <div
              className={`flex flex-row items-center space-x-5 ${funnelDisplay.className}`}
            >
              <Label htmlFor="viewModeToggle" className="border-black text-lg">
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
                  className="border-black hover:bg-gray-400 data-[state=on]:bg-orange-300 dark:data-[state=on]:text-black"
                >
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="light"
                  onClick={() => setTheme("light")}
                  className="border-black hover:bg-gray-400 data-[state=on]:bg-orange-300"
                >
                  Light
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="system"
                  onClick={() => setTheme("system")}
                  className="border-black hover:bg-gray-400 data-[state=on]:bg-orange-300 dark:data-[state=on]:text-black"
                >
                  System
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
