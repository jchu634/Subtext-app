"use client";
import { Funnel_Display } from "next/font/google";
import { SettingsMenu } from "@/components/settingsMenu";
import { FilesMenu } from "@/components/fileMenu";

// Component Stuff
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const funnelDisplay = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
});

export const toolbarVars = {
  height: "h-10",
  rounded: "rounded-md",
};

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
  return (
    <div>
      <main className="flex flex-row space-x-4 bg-slate-50 p-4 dark:bg-slate-950">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full space-x-4"
          autoSaveId={"persistence"}
        >
          <ResizablePanel defaultSize={60} minSize={30}>
            <FilesMenu />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={30}>
            <SettingsMenu />
            <Button type="submit" form="settings-form">
              DEBUG Submit
            </Button>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
