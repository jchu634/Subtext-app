import JobsDropDown from "@/components/jobsDropDown";
import SettingsDialog from "@/components/settingsDialog";

export function Navbar() {
  return (
    <div className="flex h-screen w-16 shrink-0 flex-col items-center justify-between bg-[#1f4739] p-4">
      <div className="space-y-4">
        <JobsDropDown />
      </div>
      <SettingsDialog />
    </div>
  );
}
