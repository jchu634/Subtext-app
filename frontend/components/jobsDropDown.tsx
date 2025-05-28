"use client";
import { funnel } from "@/lib/fonts";

import { LayoutListIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AppInfoDialog from "@/components/appInfoDialog";
import { store } from "@/lib/stores";
import { useSelector } from "@xstate/store/react";

export default function JobsDropDown() {
  const jobProgress = useSelector(store, (state) => state.context.jobProgress);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center [&_svg]:size-7">
        <LayoutListIcon strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={`${funnel.className}`}>
        <DropdownMenuLabel>Jobs</DropdownMenuLabel>
        {Object.entries(jobProgress).map(([fileName, progress]) => (
          <DropdownMenuItem key={fileName}>
            <span>
              {fileName}: {progress as number}%
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
