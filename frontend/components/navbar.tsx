"use client";

import { Button } from "@/components/ui/button";
import { SettingsDialog } from "@/components/settingsDialog";

export default function SideNav() {
  return (
    <main>
      <div className="flex h-screen w-16 items-end justify-center bg-[#5B8E7D] p-4 md:px-2">
        <SettingsDialog />
      </div>
    </main>
  );
}
