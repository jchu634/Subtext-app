"use client";
import { funnel } from "@/lib/fonts";

import { LayoutListIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { store, ProgressType, JobProgressState } from "@/lib/stores";
import { useSelector } from "@xstate/store/react";
import { cn } from "@/lib/utils";

export default function JobsDropDown() {
  const jobProgress = useSelector(
    store,
    (state) => state.context.jobProgress as JobProgressState,
  );
  const useMultiJob = useSelector(
    store,
    (state) => state.context.multiJob as boolean,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center [&_svg]:size-7">
        <LayoutListIcon strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={`${funnel.className} min-w-40 md:min-w-60`}
      >
        <div className="sticky top-0 z-10 bg-popover">
          <div className="flex items-center justify-between space-x-2 pr-1">
            <DropdownMenuLabel>Jobs</DropdownMenuLabel>
            <Button
              variant="outline"
              className="border-gray h-7 border-gray-800 p-2 dark:border-gray-400"
              onClick={() => store.send({ type: "CLEAR_INACTIVE_JOBS" })}
            >
              <p className={`${funnel.className} text-sm font-medium`}>Clear</p>
            </Button>
          </div>
          <DropdownMenuSeparator className="sticky top-0 bg-gray-400" />
        </div>

        {Object.entries(jobProgress).map(
          ([taskID, progress]: [string, ProgressType]) => (
            <DropdownMenuItem
              key={taskID}
              className="flex flex-col items-start"
            >
              <span className="w-40 md:w-72">{progress.jobName}</span>
              <div className="flex flex-row items-center space-x-4">
                <div>{progress.status} </div>

                <div
                  className={cn(
                    progress.status == "Complete" && "text-green-700",
                    progress.status == "Pending" && "text-yellow-500",
                    progress.status == "Running" && "text-blue-600",
                    progress.status == "Error" && "text-red-800",
                  )}
                >
                  ⬤
                </div>
                {(progress.status === "Complete" ||
                  progress.status === "Error" ||
                  !useMultiJob ||
                  (useMultiJob && Object.keys(jobProgress).length === 1)) && (
                  <Progress
                    value={progress.percentage}
                    className="w-20 md:w-40"
                  />
                )}
              </div>
            </DropdownMenuItem>
          ),
        )}
        {Object.keys(jobProgress).length == 0 && (
          <DropdownMenuItem>
            <p>No Active Jobs</p>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
