import { funnel } from "@/lib/fonts";
import { TrashIcon, PlusIcon } from "lucide-react";

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
    store.send({ type: "addFiles", newFiles: newFiles });
    return newFiles;
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
          className="flex-none border-none bg-white data-[state=checked]:bg-white dark:data-[state=checked]:bg-primary"
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
    store.send({ type: "removeFile", removeFile: file });
  }
  function removeSpecificFiles() {
    for (const removeFile of selectedFiles) {
      setFiles((prevFiles) => prevFiles.filter((file) => file !== removeFile));
    }
    store.send({ type: "removeFiles", removeFiles: [...selectedFiles] });
    setSelectedFiles(new Set());
  }
  function clearFiles() {
    store.send({ type: "clearFiles" });
    setFiles([]);
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
    <div className={`flex h-fileHeight flex-col rounded-t-lg bg-[#D9D9D9]`}>
      <div
        className={`flex items-center justify-between bg-[#F4A259] pr-2 text-black ${funnel.className} min-h-12 rounded-t-lg text-xl font-bold`}
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
            <p className={`${funnel.className} text-xl font-bold`}>Add New</p>
          </Button>
          {selectedFiles.size == 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <TrashIcon
                    strokeWidth={3}
                    size={24}
                    className="hover:text-accent-foreground"
                  />
                  <p className={`${funnel.className} text-xl font-bold`}>
                    Remove All
                  </p>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-100 text-black">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700">
                    Are you sure that you want to remove all files?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-black hover:bg-gray-200">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearFiles}
                    className="font-md bg-red-800 hover:bg-red-950"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
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
              <p className={`${funnel.className} text-xl font-bold`}>
                Remove Selected
              </p>
            </Button>
          )}
        </div>
      </div>
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
