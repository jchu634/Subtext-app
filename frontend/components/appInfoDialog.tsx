import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

import { useState, RefCallback } from "react";
import { useSelector } from "@xstate/store/react";
import { store } from "@/lib/stores";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { funnel } from "@/lib/fonts";
import { backendLicenses, frontendLicenses } from "@/lib/licenses";

interface licenseFormat {
  name: string;
  license: string;
  licenseDetails: string;
}

function mapLicenses(
  license: licenseFormat,
  index: number,
  parent: RefCallback<Element>,
) {
  return (
    <div key={`license-${index}`}>
      <div className="font-bold">{license.name}</div>
      <Collapsible>
        <CollapsibleTrigger className="flex items-center" asChild>
          <div>
            License: {license.license}
            <Button variant="ghost" size="icon" className="hover:bg-amber-200">
              <ChevronsUpDown />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent ref={parent}>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm">
            {license.licenseDetails}
          </pre>
        </CollapsibleContent>
      </Collapsible>
      <Separator className="my-1 bg-black" />
    </div>
  );
}

export default function AppInfoDialog({}) {
  const [parent] = useAutoAnimate({ duration: 100 });
  const appVersion = useSelector(store, (state) => state.context.appVersion);
  const [isOpenGeneral, setIsOpenGeneral] = useState(false);
  const [isOpenBackend, setIsOpenBackend] = useState(false);
  const [isOpenFrontend, setIsOpenFrontend] = useState(false);

  const suppressDragDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      document.addEventListener("dragenter", suppressDragDrop, true);
      document.addEventListener("dragover", suppressDragDrop, true);
      document.addEventListener("drop", suppressDragDrop, true);
    } else {
      document.removeEventListener("dragenter", suppressDragDrop, true);
      document.removeEventListener("dragover", suppressDragDrop, true);
      document.removeEventListener("drop", suppressDragDrop, true);
    }
  };

  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      {/* Disables Dropdown box immediately closing the dialog */}
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <span>About the app</span>
        </DialogTrigger>
        <DialogContent className="flex h-[80vh] w-[80vw] max-w-screen-2xl flex-col bg-slate-100/95 text-black ring-4 ring-white/15 ring-offset-0 dark:bg-black/80 dark:text-white">
          <DialogHeader className={`${funnel.className}`}>
            <DialogTitle className={`text-3xl ${funnel.className}`}>
              Subtext Desktop {appVersion}
            </DialogTitle>
            <DialogDescription className="text-md flex items-center gap-x-2 text-gray-800 dark:text-slate-400">
              Author: Joshua Chung
              <Button
                variant="link"
                size="icon"
                className="[&_svg]:size-6"
                asChild
              >
                <Link href="https://github.com/jchu634/" target="_blank">
                  <FaGithub />
                </Link>
              </Button>
            </DialogDescription>
            <Separator className="my-4 bg-black" />
          </DialogHeader>

          <Collapsible
            className={`${funnel.className}`}
            open={isOpenGeneral}
            onOpenChange={setIsOpenGeneral}
          >
            <CollapsibleTrigger
              className="flex items-center gap-x-1 text-lg"
              asChild
            >
              <div>
                Open Source Licenses
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-amber-200"
                >
                  {isOpenGeneral ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4" ref={parent}>
              <ScrollArea className={`h-[50vh] p-3 ${funnel.className}`}>
                <Collapsible
                  open={isOpenBackend}
                  onOpenChange={setIsOpenBackend}
                >
                  <CollapsibleTrigger
                    className="flex items-center gap-x-1"
                    asChild
                  >
                    <div>
                      Backend
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-amber-200"
                      >
                        {isOpenBackend ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4" ref={parent}>
                    <ScrollArea className={`h-[30vh] p-3 ${funnel.className}`}>
                      {backendLicenses.map((license, index) => {
                        return mapLicenses(license, index, parent);
                      })}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible
                  open={isOpenFrontend}
                  onOpenChange={setIsOpenFrontend}
                >
                  <CollapsibleTrigger
                    className="flex items-center gap-x-1"
                    asChild
                  >
                    <div>
                      Frontend
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-amber-200"
                      >
                        {isOpenFrontend ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4" ref={parent}>
                    <ScrollArea className={`h-[30vh] p-3 ${funnel.className}`}>
                      {frontendLicenses.map((license, index) => {
                        return mapLicenses(license, index, parent);
                      })}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-4"></div>
        </DialogContent>
      </Dialog>
    </DropdownMenuItem>
  );
}
