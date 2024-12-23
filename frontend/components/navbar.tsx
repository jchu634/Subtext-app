"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, Settings, Cog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SettingsDialog } from "@/components/settingsDialog";

export default function SideNav() {
  const { setTheme } = useTheme();

  return (
    <main className={`pywebview-drag-region`}>
      <div className="flex h-screen w-16 items-end justify-center bg-[#5B8E7D] p-4 md:px-2">
        <SettingsDialog />
      </div>
    </main>
  );
}
