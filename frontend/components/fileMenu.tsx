import { toolbarVars, funnelDisplay } from "@/app/page";
import { TrashIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvertedCheckbox, Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useState } from "react";

// Store Stuff
import { useSelector } from "@xstate/store/react";
import { store } from "@/components/stores";

// Animation Stuff
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface file {
  fullPath: String;
  fileName: String;
}

export function FilesMenu() {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [files, setFiles] = useState<file[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<file>>(new Set());
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  const storeFiles = useSelector(store, (state) => state.context.files);

  async function returnPathDirectories() {
    const handle = await window.pywebview.api.spawnMultipleFileDialog();

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
    store.send({ type: "addFiles", newFiles: newFiles });
    return newFiles;
  }

  function mapFiles(file: any, index: number) {
    return (
      <div
        className="grid h-11 w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-[#5E5E5E] px-2"
        key={index}
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

  function clearFiles() {
    store.send({ type: "clearFiles" });
    setFiles([]);
    setSelectedFiles(new Set());
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
      className={`flex h-fileHeight flex-col bg-[#D9D9D9] ${toolbarVars.rounded}`}
    >
      <div
        className={`flex items-center justify-between bg-[#F4A259] pr-2 text-black ${funnelDisplay.className} text-xl font-bold min-h-${toolbarVars.height} ${toolbarVars.rounded}`}
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
            <p className={`${funnelDisplay.className} text-xl font-bold`}>
              Add New
            </p>
          </Button>
          {selectedFiles.size == 0 && (
            <Button variant="ghost" className="p-2" onClick={clearFiles}>
              <TrashIcon
                strokeWidth={3}
                size={24}
                className="hover:text-accent-foreground"
              />
              <p className={`${funnelDisplay.className} text-xl font-bold`}>
                Remove All
              </p>
            </Button>
          )}
          {selectedFiles.size > 0 && (
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
              <p className={`${funnelDisplay.className} text-xl font-bold`}>
                Remove Selected
              </p>
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className={`w-full p-3 ${funnelDisplay.className}`}>
        <div className="space-y-2" ref={parent}>
          {[...storeFiles].map((file, index) => {
            return mapFiles(file, index);
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
