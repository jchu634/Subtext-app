"use client";
import { Funnel_Display } from "next/font/google";
import { TrashIcon, CircleSlashIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useState } from "react";

import { useSelector } from "@xstate/store/react";
import { store } from "@/components/settingsStore";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
});

const toolbarVars = {
  height: "h-10",
  rounded: "rounded-md",
};

interface file {
  fullPath: String;
  fileName: String;
}
interface modelSize {
  modelName: String;
  suggestedVRAM: number;
}
var modelSizes = [
  { modelName: "tiny", suggestedVRAM: 1 },
  { modelName: "base", suggestedVRAM: 1 },
  { modelName: "small", suggestedVRAM: 2 },
  { modelName: "medium", suggestedVRAM: 5 },
  { modelName: "large", suggestedVRAM: 10 },
  { modelName: "turbo", suggestedVRAM: 6 },
];

var subtitleFormats = ["SRT", "ASS", "WebVTT"];
var extendedSubtitlesFormats = ["MPL2", "TMP", "SAMI", "TTML", "MicroDVD"];

declare global {
  interface Window {
    showOpenFilePicker: () => Promise<[FileSystemFileHandle]>;
    pywebview: {
      api: {
        spawnMultipleFileDialog: () => string[];
        spawnFolderDialog: () => void;

        /* Unused Functions*/
        minimiseWindow: () => void;
        maximiseWindow: () => void;
        closeWindow: () => void;

        setWindowAlwaysOnTop: (alwaysOnTop: boolean) => void;
      };
    };
  }
}
export default function Home() {
  const [files, setFiles] = useState<file[]>([]);

  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );

  async function returnPathDirectories() {
    const handle = await window.pywebview.api.spawnMultipleFileDialog();

    if (handle.length == 0) {
      // User cancelled, or otherwise failed to open a file.
      return;
    }

    const newFiles = handle.map((filePath: string) => {
      const fileName = filePath.split("\\").pop() || filePath;
      return { fullPath: filePath, fileName: fileName };
    });
    setFiles((prevFiles) => {
      const allFiles = prevFiles.concat(newFiles);
      const uniqueFiles = allFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.fullPath === file.fullPath),
      );
      return uniqueFiles;
    });
    console.log(newFiles);
    return newFiles;
  }
  function clearFiles() {
    setFiles([]);
  }
  function removeFile(fullPath: string) {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.fullPath !== fullPath),
    );
  }

  function mapFiles(file: any, index: number) {
    // Index is here to stop the warning about needing a key

    return (
      <div
        className="w-windowWidth flex h-10 items-center justify-between rounded-md bg-[#5E5E5E] pl-2"
        key={index}
      >
        <p className="w-4/5 truncate">{file.fileName}</p>
        <div className="pl-2 pr-1">
          <Button
            variant="ghost"
            size="icon"
            className=""
            onClick={() => removeFile(file.fullPath)}
          >
            <TrashIcon
              strokeWidth={3}
              size={24}
              className="hover:text-accent-foreground"
            />
          </Button>
        </div>
      </div>
    );
  }
  function resetSettings() {
    // #TODO
  }

  return (
    <div>
      <main className="flex flex-row space-x-4 bg-slate-50 p-4 dark:bg-slate-950">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full space-x-4"
          autoSaveId={"persistence"}
        >
          <ResizablePanel defaultSize={60} minSize={30}>
            {/* File Menu */}

            <div
              className={`h-fileHeight flex flex-col bg-[#D9D9D9] ${toolbarVars.rounded}`}
            >
              <div
                className={`flex items-center justify-between bg-[#F4A259] pr-2 text-black ${funnelDisplay.className} text-xl font-bold min-h-${toolbarVars.height} ${toolbarVars.rounded}`}
              >
                <p className="pl-4">Files</p>
                <div>
                  <Button
                    variant="ghost"
                    className="p-2"
                    onClick={returnPathDirectories}
                  >
                    <PlusIcon
                      strokeWidth={3}
                      size={24}
                      className="hover:text-accent-foreground"
                    />
                    <p
                      className={`${funnelDisplay.className} text-xl font-bold`}
                    >
                      Add New
                    </p>
                  </Button>
                  <Button variant="ghost" className="p-2" onClick={clearFiles}>
                    <TrashIcon
                      strokeWidth={3}
                      size={24}
                      className="hover:text-accent-foreground"
                    />
                    <p
                      className={`${funnelDisplay.className} text-xl font-bold`}
                    >
                      Remove All
                    </p>
                  </Button>
                </div>
              </div>
              <ScrollArea
                className={`w-full flex-grow p-3 ${funnelDisplay.className}`}
              >
                <div className="space-y-2">
                  {files.map((file, index) => {
                    return mapFiles(file, index);
                  })}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className={`h-[80vh] bg-[#D9D9D9] ${toolbarVars.rounded}`}>
              <div
                className={`flex items-center justify-between bg-[#8CB369] pr-2 text-black ${funnelDisplay.className} text-xl font-bold ${toolbarVars.height} ${toolbarVars.rounded}`}
              >
                <p className="pl-4">Settings</p>
                <div>
                  <Button
                    variant="ghost"
                    className="p-2"
                    onClick={resetSettings}
                  >
                    <CircleSlashIcon
                      strokeWidth={3}
                      size={24}
                      className="hover:text-accent-foreground"
                    />
                    <p
                      className={`${funnelDisplay.className} text-xl font-bold`}
                    >
                      Reset
                    </p>
                  </Button>
                </div>
              </div>
              <div
                className={`h-full space-y-4 p-3 text-black ${funnelDisplay.className}`}
              >
                <div className="flex items-center space-x-2">
                  <Label htmlFor="modelSize" className="text-lg font-bold">
                    Model Size:
                  </Label>
                  <Select>
                    <SelectTrigger
                      id="modelSize"
                      className="w-[180px] border-2 border-black"
                    >
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelSizes.map((size, index) => (
                        <SelectItem
                          value={`${size.modelName}`}
                          className={`${funnelDisplay.className}`}
                          key={index}
                        >
                          {size.modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="embedSubtitles" className="text-lg font-bold">
                    Embed Subtitles into Video
                  </Label>
                  <Checkbox id="embedSubtitles" defaultChecked={true} />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="subtitleFormat" className="text-lg font-bold">
                    Output Subtitle Format(s):
                  </Label>
                  <div id="subtitleFormat" className="space-x-1 space-y-1">
                    {subtitleFormats.map((format, index) => (
                      <Toggle key={index}>{format}</Toggle>
                    ))}
                    {useExtendedFormats}
                    {useExtendedFormats && (
                      <>
                        {extendedSubtitlesFormats.map((format, index) => (
                          <Toggle key={index}>{format}</Toggle>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
