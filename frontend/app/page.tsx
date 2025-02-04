"use client";
import { funnel } from "@/lib/fonts";
import SettingsMenu from "@/components/settingsMenu";
import FilesMenu from "@/components/fileMenu";

// Component Stuff
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
      <main className="flex h-screen flex-row space-x-4 bg-slate-50 p-4 dark:bg-zinc-950">
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
            <div className="grid h-full grid-cols-1 place-content-between gap-4">
              <SettingsMenu />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  form="settings-form"
                  className={`${funnel.className} h-16 bg-[#1f4739] align-middle text-3xl text-white hover:text-black dark:bg-[#297a5f]`}
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
