import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { funnel } from "@/lib/fonts";
import { useSelector } from "@xstate/store/react";
import { store } from "@/lib/stores";

export default function AppInfoDialog() {
  const appVersion = useSelector(store, (state) => state.context.appVersion);
  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      {/* Disables Dropdown box immediately closing the dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <span>App Info</span>
        </DialogTrigger>
        <DialogContent className="flex h-[80vh] w-[80vw] max-w-screen-2xl flex-col bg-slate-100 bg-opacity-95 text-black dark:bg-black dark:bg-opacity-80 dark:text-white">
          <DialogHeader>
            <DialogTitle className={`text-3xl ${funnel.className}`}>
              Subtext Desktop {appVersion}
            </DialogTitle>
            <DialogDescription className="text-md text-gray-800 dark:text-slate-400">
              Author: Joshua Chung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4"></div>
        </DialogContent>
      </Dialog>
    </DropdownMenuItem>
  );
}
