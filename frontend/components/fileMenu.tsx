import { funnel } from "@/lib/fonts";
import { TrashIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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

// Animation Stuff
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function FilesMenu() {
  const [parent] = useAutoAnimate(/* optional config */);

  return (
    <div
      className={`flex h-fileHeight flex-col rounded-lg bg-[#D9D9D9] dark:bg-[#1b1c1d]`}
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

      <ScrollArea className={`w-full p-3 ${funnel.className}`}>
        <div className="space-y-2" ref={parent}></div>
      </ScrollArea>
    </div>
  );
}
