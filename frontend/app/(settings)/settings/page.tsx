"use client";
import Image from "next/image";
import { Settings, Moon, Sun, Download, X } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { setTheme } = useTheme();
  return (
    <div className="h-screen w-screen bg-white p-4 dark:bg-black">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <div className="relative-center flex items-center">
              <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 stroke-2 text-black transition-all dark:hidden dark:-rotate-90" />
              <Moon className="hidden h-[1.2rem] w-[1.2rem] rotate-90 stroke-2 transition-all dark:block dark:rotate-0" />
            </div>
            <span className="sr-only">Toggle theme</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <p>&nbsp;Light</p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <p>&nbsp;Dark</p>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <p>&nbsp;System</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
