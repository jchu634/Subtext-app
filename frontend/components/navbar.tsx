import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function SideNav() {
  const { setTheme } = useTheme();

  return (
    <main className={`pywebview-drag-region`}>
      <div className="flex h-screen w-16 items-end justify-center bg-[#5B8E7D] p-4 md:px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <div className="relative-center flex items-center">
                <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 stroke-2 text-zinc-200 transition-all dark:hidden dark:-rotate-90" />
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
    </main>
  );
}
