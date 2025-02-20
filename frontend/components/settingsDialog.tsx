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

export default function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="[&_svg]:size-7">
            <Cog strokeWidth={2} />
          </Button>
        </DialogTrigger>
        <DialogContent className="flex h-[80vh] w-[80vw] max-w-screen-2xl flex-col bg-slate-100/95 text-black ring-4 ring-white/15 ring-offset-0 dark:bg-black/80 dark:text-white">
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
              <p className="rounded-md border border-black p-1 pl-2 pr-2 dark:bg-white dark:text-black">
                Default Location
              </p>

              <Button
                id="defaultSaveLocation"
                className="font-semibold hover:bg-zinc-600 dark:hover:bg-amber-200"
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
                onClick={() => store.send({ type: "toggleExtentedSubtitles" })}
                className="outline outline-1 outline-gray-700 dark:bg-slate-200 dark:data-[state=checked]:bg-orange-400"
              ></Switch>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
