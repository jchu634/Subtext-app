import { Funnel_Display } from "next/font/google";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel",
  subsets: ["latin"],
});

const toolbarVars = {
  height: "h-12",
  rounded: "rounded-md",
};

declare global {
  interface Window {
    showOpenFilePicker: () => Promise<[FileSystemFileHandle]>;
    pywebview: {
      api: {
        spawnFileDialog: () => string[];
        test: () => string[];
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

async function returnPathDirectories() {
  const handle = await window.pywebview.api.spawnFileDialog();

  if (handle.length == 0) {
    // User cancelled, or otherwise failed to open a file.
    return;
  }

  console.log(handle);
  return handle;
}
export default function Home() {
  return (
    <div>
      <main className="flex flex-row bg-slate-50 p-4 dark:bg-slate-950">
        {/* File Menu */}
        <div
          className={`h-[80vh] w-[50vw] bg-[#D9D9D9] ${toolbarVars.rounded}`}
        >
          <div
            className={`flex items-center justify-between bg-[#F4A259] pr-2 text-black ${funnelDisplay.className} text-xl font-bold ${toolbarVars.height} ${toolbarVars.rounded}`}
          >
            <p className="pl-4">Files</p>
            <div>
              <Button variant="ghost" className="p-2">
                <Plus
                  strokeWidth={3}
                  size={24}
                  className="hover:text-accent-foreground"
                />
                <p className={`${funnelDisplay.className} text-lg font-bold`}>
                  Add New
                </p>
              </Button>
              <Button variant="ghost" className="p-2">
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
        </div>
        <div className="pl-4">
          <Button onClick={returnPathDirectories}>test</Button>
        </div>
      </main>
    </div>
  );
}
