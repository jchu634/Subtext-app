import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend, type JobConfig } from "@/lib/backend";
import { useStore } from "@/lib/store";

export type SubmitJobValues = Omit<JobConfig, "filePaths" | "saveLocation">;

function deriveJobName(filePaths: string[]): string {
  const first = filePaths[0]?.split(/[\\/]/).pop() ?? "Job";
  const base = first.slice(0, 24);
  return filePaths.length > 1 ? `${base} + ${filePaths.length - 1} more` : base;
}

export function useSubmitJob() {
  const addJob = useStore((s) => s.addJob);
  const updateJobProgress = useStore((s) => s.updateJobProgress);
  const files = useStore((s) => s.files);
  const saveLocation = useStore((s) => s.saveLocation);

  return useMutation({
    mutationFn: async (values: SubmitJobValues) => {
      const filePaths = files.map((f) => f.fullPath);
      const config: JobConfig = { ...values, filePaths, saveLocation };
      const { jobId } = await backend.submitJob(config);
      return { jobId, filePaths };
    },
    onMutate: () => {
      toast.message("Job Submitted", {
        description: "Job submitted.",
        duration: 2000,
      });
    },
    onSuccess: ({ jobId, filePaths }) => {
      const jobName = deriveJobName(filePaths);
      addJob({
        jobId,
        jobName,
        percentage: 0,
        status: "Pending",
        message: "Job submitted, awaiting progress...",
      });

      backend.onJobProgress(jobId, (p) => {
        updateJobProgress(jobId, {
          percentage: p.percentage,
          status: p.status,
          message: p.message,
        });
        if (p.status === "Complete") {
          toast.success("Job Complete", {
            description: `${jobName} complete.`,
            duration: 3000,
          });
        } else if (p.status === "Error") {
          toast.error("Job Error", {
            description:
              p.message ?? `An error occurred for ${jobName}.`,
            duration: 5000,
          });
        }
      });
    },
    onError: (error: Error) => {
      toast.error("Submission Error", {
        description: error.message || "Failed to submit job.",
        duration: 5000,
      });
    },
  });
}
