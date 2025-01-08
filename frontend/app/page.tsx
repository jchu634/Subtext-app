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

export const colourScheme = {
  body: "bg-[#D9D9D9]",
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
      <main className="flex h-screen flex-row space-x-4 bg-slate-50 p-4 dark:bg-slate-950">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-screen w-full space-x-4"
          autoSaveId={"persistence"}
        >
          <ResizablePanel defaultSize={60} minSize={30}>
            <FilesMenu />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={30} className="">
            <div className="grid h-full grid-cols-1 place-content-evenly gap-4">
              <SettingsMenu />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  form="settings-form"
                  className={`${funnelDisplay.className} h-16 bg-[#5B8E7D] align-middle text-3xl`}
                >
                  Start Job
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
