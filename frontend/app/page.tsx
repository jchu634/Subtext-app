"use client";
import { Funnel_Display } from "next/font/google";
import { TrashIcon, PlusIcon } from "lucide-react";
import { SettingsMenu } from "@/components/settingsMenu";

// Component Stuff
import { Button } from "@/components/ui/button";
import { InvertedCheckbox, Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useState } from "react";

// Store Stuff
import { useSelector } from "@xstate/store/react";
import { store } from "@/components/settingsStore";

// Animation Stuff
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const funnelDisplay = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
});

export const toolbarVars = {
  height: "h-10",
  rounded: "rounded-md",
};

interface file {
  fullPath: String;
  fileName: String;
}

declare global {
  interface Window {
    showOpenFilePicker: () => Promise<[FileSystemFileHandle]>;
    pywebview: {
      api: {
        spawnMultipleFileDialog: () => string[];
        spawnFolderDialog: () => string;

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
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);

  // Unused: Left for combobox
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

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
  function removeSpecificFiles() {
    for (const removeFile of selectedFiles) {
      setFiles((prevFiles) =>
        prevFiles.filter((file) => file.fullPath !== removeFile),
      );
    }
    setSelectedFiles(new Set());
  }

  function handleCheckboxChange(
    fullPath: string,
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    const isShiftPressed = event.shiftKey;
    const newSelected = new Set(selectedFiles);

    if (isShiftPressed && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, index);
      const end = Math.max(lastCheckedIndex, index);

      files.slice(start, end + 1).forEach((file) => {
        if (selectedFiles.has(files[lastCheckedIndex].fullPath.toString())) {
          newSelected.add(file.fullPath.toString());
        } else {
          newSelected.delete(file.fullPath.toString());
        }
      });
    } else {
      if (newSelected.has(fullPath.toString())) {
        newSelected.delete(fullPath.toString());
      } else {
        newSelected.add(fullPath.toString());
      }
    }

    setSelectedFiles(newSelected);
    setLastCheckedIndex(index);
  }

  function mapFiles(file: any, index: number) {
    return (
      <div
        className="grid h-11 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-[#5E5E5E] px-2"
        key={index}
      >
        <InvertedCheckbox
          id={`file-${index}`}
          className="flex-none border-none bg-white data-[state=checked]:bg-white dark:data-[state=checked]:bg-primary"
          checked={selectedFiles.has(file.fullPath.toString())}
          onClick={(e) =>
            handleCheckboxChange(file.fullPath.toString(), index, e)
          }
        />
        <p className="truncate px-2">{file.fileName}</p>
        <Button
          variant="ghost"
          size="icon"
          className="flex-none"
          onClick={() => removeFile(file.fullPath)}
        >
          <TrashIcon
            strokeWidth={3}
            size={24}
            className="hover:text-accent-foreground"
          />
        </Button>
      </div>
    );
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
              className={`flex h-fileHeight flex-col bg-[#D9D9D9] ${toolbarVars.rounded}`}
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
                  {selectedFiles.size == 0 && (
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={clearFiles}
                    >
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
                  )}
                  {selectedFiles.size > 0 && (
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={removeSpecificFiles}
                    >
                      <TrashIcon
                        strokeWidth={3}
                        size={24}
                        className="hover:text-accent-foreground"
                      />
                      <p
                        className={`${funnelDisplay.className} text-xl font-bold`}
                      >
                        Remove Selected
                      </p>
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className={`w-full p-3 ${funnelDisplay.className}`}>
                <div className="space-y-2" ref={parent}>
                  {files.map((file, index) => {
                    return mapFiles(file, index);
                  })}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={30}>
            <SettingsMenu />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
