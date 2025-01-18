"use client";
import { funnel } from "@/lib/fonts";

import { LibrarySquareIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MenuDropDown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center [&_svg]:size-7">
        <LibrarySquareIcon strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={`${funnel.className}`}>
        {/* <DropdownMenuLabel>App</DropdownMenuLabel>
          <DropdownMenuSeparator /> */}
        <DropdownMenuItem>App Info</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
