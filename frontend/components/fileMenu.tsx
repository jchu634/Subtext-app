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
          className="dark:data-[state=checked]:bg-primary flex-none border-none bg-white data-[state=checked]:bg-white"
          checked={selectedFiles.has(file)}
        />
        <p className="truncate px-2">{file.fileName}</p>
        <Button variant="ghost" size="icon" className="flex-none">
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
    <div
      className={`h-fileHeight flex flex-col rounded-lg bg-[#D9D9D9] dark:bg-[#1b1c1d]`}
    >
      <div
        className={`flex items-center justify-between bg-[#F4A259] pr-2 text-black ${funnel.className} min-h-12 rounded-t-lg text-xl font-bold`}
        ref={parent}
      >
        <p className="pl-4">Files</p>
        <div>
          <Button variant="ghost" className="p-2">
            <PlusIcon
              strokeWidth={3}
              size={24}
              className="hover:text-accent-foreground"
            />
            <p className={`${funnel.className} text-xl font-bold`}>Add New</p>
          </Button>

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
                <AlertDialogAction className="font-md bg-red-800 hover:bg-red-950">
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
