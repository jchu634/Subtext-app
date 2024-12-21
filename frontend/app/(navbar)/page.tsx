"use client";
import { Funnel_Display } from "next/font/google";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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

declare global {
  interface Window {
    showOpenFilePicker: () => Promise<[FileSystemFileHandle]>;
    pywebview: {
      api: {
        spawnFileDialog: () => string[];
        killWindow: () => void;
        spawnSettingsWindow: () => void;
        killSettingsWindow: () => void;
        createToastOnMainWindow: (
          title: string,
          description: string,
          duration: number,
        ) => void;
        setWindowAlwaysOnTop: (alwaysOnTop: boolean) => void;
      };
    };
  }
}

export default function Home() {
  const [files, setFiles] = useState<file[]>([]);

  async function returnPathDirectories() {
    const handle = await window.pywebview.api.spawnFileDialog();

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
        className="w-50vw-minus-2rem flex h-10 items-center justify-between rounded-md bg-[#5E5E5E] pl-2"
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
            <Trash
              strokeWidth={3}
              size={24}
              className="hover:text-accent-foreground"
            />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="flex flex-row space-x-2 bg-slate-50 p-4 dark:bg-slate-950">
        {/* File Menu */}
        <div className="flex">
          <div
            className={`h-[80vh] w-[50vw] bg-[#D9D9D9] ${toolbarVars.rounded}`}
          >
            <div
              className={`flex items-center justify-between bg-[#F4A259] pr-2 text-black ${funnelDisplay.className} text-xl font-bold ${toolbarVars.height} ${toolbarVars.rounded}`}
            >
              <p className="pl-4">Files</p>
              <div>
                <Button
                  variant="ghost"
                  className="p-2"
                  onClick={returnPathDirectories}
                >
                  <Plus
                    strokeWidth={3}
                    size={24}
                    className="hover:text-accent-foreground"
                  />
                  <p className={`${funnelDisplay.className} text-lg font-bold`}>
                    Add New
                  </p>
                </Button>
                <Button variant="ghost" className="p-2" onClick={clearFiles}>
                  <Trash
                    strokeWidth={3}
                    size={24}
                    className="hover:text-accent-foreground"
                  />
                  <p className={`${funnelDisplay.className} text-lg font-bold`}>
                    Remove All
                  </p>
                </Button>
              </div>
            </div>
            <div className={`space-y-2 p-3 ${funnelDisplay.className}`}>
              {files.map((file, index) => {
                return mapFiles(file, index);
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
