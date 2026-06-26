import { LayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { JobProgressEntry } from "@/lib/store";

export default function JobsDropDown() {
  const jobProgress = useStore((s) => s.jobProgress);
  const multiJob = useStore((s) => s.multiJob);
  const clearInactiveJobs = useStore((s) => s.clearInactiveJobs);

  const entries = Object.entries(jobProgress);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-9 items-center justify-center rounded-md text-primary-foreground hover:bg-white/10 [&_svg]:size-6">
        <LayoutList />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-72">
        <div className="sticky top-0 z-10 bg-popover">
          <div className="flex items-center justify-between gap-2 pr-1">
            <DropdownMenuLabel>Jobs</DropdownMenuLabel>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => clearInactiveJobs()}
            >
              Clear
            </Button>
          </div>
          <DropdownMenuSeparator className="bg-border" />
        </div>

        {entries.length === 0 && (
          <DropdownMenuItem>No Active Jobs</DropdownMenuItem>
        )}

        {entries.map(([jobId, progress]: [string, JobProgressEntry]) => (
          <DropdownMenuItem key={jobId} className="flex flex-col items-start">
            <span className="w-full truncate">{progress.jobName}</span>
            <div className="flex flex-row items-center gap-3">
              <span>{progress.status}</span>
              <span
                className={cn(
                  progress.status === "Complete" && "text-green-600",
                  progress.status === "Pending" && "text-yellow-500",
                  progress.status === "Running" && "text-blue-600",
                  progress.status === "Error" && "text-red-600",
                )}
              >
                ●
              </span>
              {(progress.status === "Complete" ||
                progress.status === "Error" ||
                !multiJob ||
                (multiJob && entries.length === 1)) && (
                <Progress value={progress.percentage} className="flex-1" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
