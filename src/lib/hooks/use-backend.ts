import { useQuery } from "@tanstack/react-query";
import { backend } from "@/lib/backend";

export function useModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => backend.getAvailableModels(),
  });
}

export function useModelSizes(model: string | undefined) {
  return useQuery({
    queryKey: ["modelSizes", model],
    queryFn: () => backend.getModelSizes(model!),
    enabled: !!model,
  });
}

export function useLanguages(model: string | undefined) {
  return useQuery({
    queryKey: ["languages", model],
    queryFn: () => backend.getSupportedLanguages(model!),
    enabled: !!model,
  });
}
