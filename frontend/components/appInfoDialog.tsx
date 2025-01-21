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

import { useSelector } from "@xstate/store/react";
import { store } from "@/lib/stores";

import { ChevronDown } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { funnel } from "@/lib/fonts";
import { backendLicenses, frontendLicenses } from "@/lib/licenses";

interface licenseFormat {
  name: string;
  license: string;
  licenseDetails: string;
}

function mapLicenses(license: licenseFormat, index: number) {
  return (
    <div key={`license-${index}`}>
      <div className="font-bold">{license.name}</div>
      <Collapsible>
        <CollapsibleTrigger className="flex items-center">
          License: {license.license}
          <Button variant="ghost" size="icon" className="hover:bg-amber-200">
            <ChevronDown />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm">
            {license.licenseDetails}
          </pre>
        </CollapsibleContent>
      </Collapsible>
      <Separator className="my-1 bg-black" />
    </div>
  );
}

export default function AppInfoDialog() {
  const [parent] = useAutoAnimate(/* optional config */);
  const appVersion = useSelector(store, (state) => state.context.appVersion);
  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      {/* Disables Dropdown box immediately closing the dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <span>App Info</span>
        </DialogTrigger>
        <DialogContent
          className="flex h-[80vh] w-[80vw] max-w-screen-2xl flex-col bg-slate-100 bg-opacity-95 text-black dark:bg-black dark:bg-opacity-80 dark:text-white"
          ref={parent}
        >
          <DialogHeader className={`${funnel.className}`}>
            <DialogTitle className={`text-3xl ${funnel.className}`}>
              Subtext Desktop {appVersion}
            </DialogTitle>
            <DialogDescription className="text-md text-gray-800 dark:text-slate-400">
              Author: Joshua Chung
            </DialogDescription>
            <Separator className="my-4 bg-black" />
          </DialogHeader>

          <Collapsible className={`${funnel.className}`}>
            <CollapsibleTrigger className="flex items-center gap-x-1 text-lg">
              Open Source Licenses
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-amber-200"
              >
                <ChevronDown />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4">
              <ScrollArea className={`h-[50vh] p-3 ${funnel.className}`}>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-x-1">
                    Backend
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-amber-200"
                    >
                      <ChevronDown />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    <ScrollArea className={`h-[30vh] p-3 ${funnel.className}`}>
                      {backendLicenses.map((license, index) => {
                        return mapLicenses(license, index);
                      })}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-x-1">
                    Frontend
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-amber-200"
                    >
                      <ChevronDown />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    <ScrollArea className={`h-[30vh] p-3 ${funnel.className}`}>
                      {frontendLicenses.map((license, index) => {
                        return mapLicenses(license, index);
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
