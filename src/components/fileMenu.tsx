import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { PlusIcon, TrashIcon, SquareIcon, SquareXIcon } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { Button } from "@/components/ui/button";
import { InvertedCheckbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore, type FileEntry } from "@/lib/store";

export default function FileMenu() {
  const files = useStore((s) => s.files);
  const addFiles = useStore((s) => s.addFiles);
  const removeFile = useStore((s) => s.removeFile);
  const removeFiles = useStore((s) => s.removeFiles);
  const clearFiles = useStore((s) => s.clearFiles);

  const [parent] = useAutoAnimate();
  const [selected, setSelected] = useState<Set<FileEntry>>(new Set());
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  async function addFromDialog() {
    const result = await open({ multiple: true });
    if (!result) return;
    const paths = Array.isArray(result) ? result : [result];
    const entries: FileEntry[] = paths.map((p) => ({
      fullPath: p,
      fileName: p.split(/[\\/]/).pop() ?? p,
    }));
    if (entries.length) addFiles(entries);
  }

  function handleToggle(file: FileEntry, index: number, shiftKey: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastCheckedIndex !== null) {
        const start = Math.min(lastCheckedIndex, index);
        const end = Math.max(lastCheckedIndex, index);
        const anchorSelected = prev.has(files[lastCheckedIndex]);
        files.slice(start, end + 1).forEach((f) => {
          if (anchorSelected) next.add(f);
          else next.delete(f);
        });
      } else {
        if (prev.has(file)) next.delete(file);
        else next.add(file);
      }
      return next;
    });
    setLastCheckedIndex(index);
  }

  function removeSelected() {
    removeFiles([...selected]);
    setSelected(new Set());
  }

  const allSelected = selected.size === files.length && files.length > 0;

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col rounded-lg bg-muted/50 dark:bg-[#1b1c1d]">
      <div
        className="flex h-12 items-center justify-between rounded-t-lg bg-[#F4A259] pr-2 text-xl font-bold text-black"
        ref={parent}
      >
        <p className="pl-4">Files</p>
        <div className="flex items-center">
          <Button variant="ghost" className="p-2 text-black hover:bg-black/10" onClick={addFromDialog}>
            <PlusIcon className="size-5" strokeWidth={3} />
            <span className="text-base font-medium">Add New</span>
          </Button>

          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger
              render={
                <Button variant="ghost" className="p-2 text-black hover:bg-black/10" />
              }
            >
              <TrashIcon className="size-5" strokeWidth={3} />
              <span className="text-base font-medium">Remove All</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure that you want to remove all files?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    clearFiles();
                    setSelected(new Set());
                    setAlertOpen(false);
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {files.length > 0 && (
        <div
          className="flex items-center gap-2 rounded-b-sm bg-muted px-2.5 py-2 dark:bg-[#2a2b2c]"
          ref={parent}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(allSelected ? new Set() : new Set(files))}
          >
            {allSelected ? (
              <>
                <SquareXIcon className="size-4" />
                <span>Unselect All Files</span>
              </>
            ) : (
              <>
                <SquareIcon className="size-4" />
                <span>Select All Files</span>
              </>
            )}
          </Button>
          {selected.size > 0 && (
            <Button variant="outline" size="sm" onClick={removeSelected}>
              <TrashIcon className="size-4" />
              <span>Remove Selected</span>
            </Button>
          )}
        </div>
      )}

      <ScrollArea className="w-full flex-1 p-3">
        <div className="flex flex-col gap-2" ref={parent}>
          {files.map((file, index) => (
            <div
              key={file.fullPath}
              title={file.fullPath}
              className="grid h-11 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-card px-2 shadow-sm"
            >
              <InvertedCheckbox
                checked={selected.has(file)}
                onClick={(e) => handleToggle(file, index, e.shiftKey)}
              />
              <p className="truncate px-2 text-sm">{file.fileName}</p>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeFile(file)}
              >
                <TrashIcon className="size-4 hover:text-accent-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
