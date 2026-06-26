import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppVersion } from "@/lib/hooks/use-app-version";
import { useUiStore } from "@/lib/ui-store";
import {
  backendLicenses,
  frontendLicenses,
  type LicenseEntry,
} from "@/lib/licenses";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LicenseRow({ license }: { license: LicenseEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="text-sm font-medium">{license.name}</div>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        License: {license.license}
        {open ? (
          <ChevronUp className="size-3.5" />
        ) : (
          <ChevronDown className="size-3.5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs leading-relaxed">
          {license.licenseDetails}
        </pre>
      </CollapsibleContent>
      <Separator className="my-2 bg-border" />
    </Collapsible>
  );
}

export default function AppInfoDialog() {
  const aboutOpen = useUiStore((s) => s.aboutOpen);
  const setAboutOpen = useUiStore((s) => s.setAboutOpen);
  const version = useAppVersion();
  const [openFrontend, setOpenFrontend] = useState(false);
  const [openBackend, setOpenBackend] = useState(false);

  return (
    <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
      <DialogContent className="flex max-h-[85vh] min-w-[80vw] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Subtext Desktop {version}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Author: Joshua Chung
            <Button
              variant="link"
              size="icon-sm"
              onClick={() => openUrl("https://github.com/jchu634/")}
            >
              <GithubIcon className="size-4" />
            </Button>
          </DialogDescription>
          <Separator className="my-2 bg-border" />
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-hidden">
          <Collapsible open={openFrontend} onOpenChange={setOpenFrontend}>
            <CollapsibleTrigger className="flex items-center gap-1 text-base font-medium">
              Frontend Licenses
              {openFrontend ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="max-h-[55vh] p-2">
                <div className="flex flex-col gap-2">
                  {frontendLicenses.map((l) => (
                    <LicenseRow key={l.name} license={l} />
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openBackend} onOpenChange={setOpenBackend}>
            <CollapsibleTrigger className="flex items-center gap-1 text-base font-medium">
              Backend Licenses
              {openBackend ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              {backendLicenses.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">
                  Backend licenses will be listed once the runtime dependency
                  tree is finalised.
                </p>
              ) : (
                <ScrollArea className="max-h-[40vh] p-2">
                  <div className="flex flex-col gap-2">
                    {backendLicenses.map((l) => (
                      <LicenseRow key={l.name} license={l} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}
