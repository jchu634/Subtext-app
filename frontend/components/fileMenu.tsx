import { funnel } from "@/lib/fonts";
import { TrashIcon, PlusIcon, SquareIcon, SquareXIcon } from "lucide-react";

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

import { useState } from "react";

// Store Stuff
import { useSelector } from "@xstate/store/react";
import { store } from "@/lib/stores";

// Animation Stuff
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface file {
  fullPath: string;
  fileName: string;
}

interface pywebviewFiles {
  name: string;
  pywebviewFullPath: string;
}
// Extend the Window interface to include our custom function
declare global {
  interface Window {
    dragDropFiles: (files: pywebviewFiles[]) => void;
  }
}

export default function FilesMenu() {
  const [parent] = useAutoAnimate(/* optional config */);
  const [files, setFiles] = useState<file[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<file>>(new Set());
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  const storeFiles = useSelector(store, (state) => state.context.files);

  async function returnPathDirectories() {
    const handle = await window.pywebview.api.spawnMultipleFileDialog();

    if (handle == null || handle.length == 0) {
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
    store.send({ type: "ADD_FILES", newFiles: newFiles });
    return newFiles;
  }

  async function dragDropFiles(files: pywebviewFiles[]) {
    if (!files || files.length === 0) {
      return;
    }

    const newFiles = files.map((file: pywebviewFiles) => {
      return { fullPath: file.pywebviewFullPath, fileName: file.name };
    });

    setFiles((prevFiles) => {
      const allFiles = prevFiles.concat(newFiles);
      const uniqueFiles = allFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.fullPath === file.fullPath),
      );
      return uniqueFiles;
    });

    store.send({ type: "ADD_FILES", newFiles: newFiles });
    return newFiles;
  }

  // Add the function to the window object
  if (typeof window !== "undefined") {
    window.dragDropFiles = dragDropFiles;
  }

  function mapFiles(file: file, index: number) {
    return (
      <div
        className="grid h-11 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-[#5E5E5E] px-2"
        key={index}
        title={file.fullPath}
      >
        <InvertedCheckbox
          id={`file-${index}`}
          className="dark:data-[state=checked]:bg-primary flex-none border-none bg-white data-[state=checked]:bg-white"
          checked={selectedFiles.has(file)}
          onClick={(e) => handleCheckboxChange(file, index, e)}
        />
        <p className="truncate px-2">{file.fileName}</p>
        <Button
          variant="ghost"
          size="icon"
          className="flex-none"
          onClick={() => removeFile(file)}
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

  function removeFile(file: file) {
    setFiles((prevFiles) => prevFiles.filter((filtFile) => filtFile !== file));
    store.send({ type: "REMOVE_FILE", removeFile: file });
  }
  function removeSpecificFiles() {
    for (const removeFile of selectedFiles) {
      setFiles((prevFiles) => prevFiles.filter((file) => file !== removeFile));
    }
    store.send({ type: "REMOVE_FILES", removeFiles: [...selectedFiles] });
    setSelectedFiles(new Set());
  }
  function clearFiles() {
    store.send({ type: "CLEAR_FILES" });
    setFiles([]);
    setSelectedFiles(new Set());
  }
  function selectAllFiles() {
    setSelectedFiles(new Set(files));
  }
  function unSelectAllFiles() {
    setSelectedFiles(new Set());
  }

  function handleCheckboxChange(
    file: file,
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    const isShiftPressed = event.shiftKey;
    const newSelected = new Set(selectedFiles);

    if (isShiftPressed && lastCheckedIndex !== null) {
      const start = Math.min(lastCheckedIndex, index);
      const end = Math.max(lastCheckedIndex, index);

      files.slice(start, end + 1).forEach((file) => {
        if (selectedFiles.has(files[lastCheckedIndex])) {
          newSelected.add(file);
        } else {
          newSelected.delete(file);
        }
      });
    } else {
      if (newSelected.has(file)) {
        newSelected.delete(file);
      } else {
        newSelected.add(file);
      }
    }

    setSelectedFiles(newSelected);
    setLastCheckedIndex(index);
  }

  return (
    <div
      className={`flex h-[calc(100vh-70px)] flex-col rounded-lg bg-[#D9D9D9] dark:bg-[#1b1c1d]`}
    >
      <div
        className="flex min-h-12 items-center justify-between rounded-t-lg bg-[#F4A259] pr-2 text-xl font-bold text-black"
        ref={parent}
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
            <p className="text-xl font-medium">Add New</p>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="p-2">
                <TrashIcon
                  strokeWidth={3}
                  size={24}
                  className="hover:text-accent-foreground"
                />
                <p className="text-xl font-medium">Remove All</p>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-2 border-red-700 bg-popover text-black dark:text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-700 dark:text-white">
                  Are you sure that you want to remove all files?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-black hover:bg-gray-200 dark:border-white dark:hover:bg-zinc-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearFiles}
                  className="font-md bg-red-800 hover:bg-red-950 dark:text-white"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {storeFiles.size != 0 && (
        <div
          className="flex items-center space-x-2 rounded-b-sm bg-slate-300 py-2 pl-2.5 dark:bg-[#2a2b2c]"
          ref={parent}
        >
          <Button
            variant="outline"
            size="narrow"
            className={`${funnel.className} border-black text-black dark:border-white dark:text-white`}
            onClick={
              selectedFiles.size == files.length
                ? unSelectAllFiles
                : selectAllFiles
            }
          >
            {selectedFiles.size == files.length ? (
              <div className="flex items-center space-x-2">
                <SquareXIcon strokeWidth={2} size={24} />
                <span>Unselect all Files</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SquareIcon strokeWidth={2} size={24} />
                <span>Select All Files</span>
              </div>
            )}
          </Button>
          {selectedFiles.size > 0 && (
            <Button
              variant="outline"
              size="narrow"
              className="border-black p-2 text-black dark:border-white dark:text-white"
              onClick={removeSpecificFiles}
            >
              <TrashIcon
                strokeWidth={2}
                size={24}
                className="hover:text-accent-foreground"
              />
              <p className={`${funnel.className} `}>Remove Selected</p>
            </Button>
          )}
        </div>
      )}
      <ScrollArea className={`w-full p-3 ${funnel.className}`}>
        <div className="space-y-2" ref={parent}>
          {[...storeFiles].map((file, index) => {
            return mapFiles(file, index);
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
