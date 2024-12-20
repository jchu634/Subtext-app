"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, Settings, Cog } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SideNav() {
  const { setTheme } = useTheme();

  return (
    <main className={`pywebview-drag-region`}>
      <div className="flex h-screen w-16 items-end justify-center bg-[#5B8E7D] p-4 md:px-2">
        <Button
          variant="ghost"
          size="icon"
          className="[&_svg]:size-7"
          onClick={() => window.pywebview.api.spawnSettingsWindow()}
        >
          <Cog strokeWidth={2} />
        </Button>
      </div>
    </main>
  );
}
