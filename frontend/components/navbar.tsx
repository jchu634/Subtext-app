"use client";

import { MenuDropDown } from "@/components/menuDropDown";
import SettingsDialog from "@/components/settingsDialog";

export default function SideNav() {
  return (
    <main>
      <div className="flex h-screen w-16 flex-col items-center justify-between bg-[#1f4739] p-4 md:px-2">
        <MenuDropDown />
        <SettingsDialog />
      </div>
    </main>
  );
}
