import { UploadIcon } from "lucide-react";

import { Navbar } from "@/components/navbar";
import FileMenu from "@/components/fileMenu";
import SettingsMenu from "@/components/settingsMenu";
import AppInfoDialog from "@/components/appInfoDialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDragDrop } from "@/lib/hooks/use-drag-drop";
import { useMenuEvents } from "@/lib/hooks/use-menu-events";

function App() {
  useMenuEvents();
  const isDragging = useDragDrop();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Navbar />
      <div className="relative flex-1">
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-background/60">
            <UploadIcon className="size-10" />
            <p className="font-heading text-2xl font-medium">
              Add files by dropping here
            </p>
          </div>
        )}
        <main className="flex h-screen flex-row p-4">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize={60} minSize={30}>
              <FileMenu />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <SettingsMenu />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
      <AppInfoDialog />
    </div>
  );
}

export default App;
