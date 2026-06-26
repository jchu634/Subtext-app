import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Undo2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { ScrollAreaShadow } from "@/components/ui/scroll-area-shadow";
import { useLanguages, useModelSizes, useModels } from "@/lib/hooks/use-backend";
import { useSubmitJob } from "@/lib/hooks/use-submit-job";
import { useStore } from "@/lib/store";

const formSchema = z.object({
  model: z.string(),
  modelSize: z.string(),
  embedSubtitles: z.boolean(),
  overWriteFiles: z.boolean(),
  language: z.string(),
  outputFormats: z.array(
    z.object({
      value: z.string().min(1),
      active: z.boolean(),
      isExtended: z.boolean(),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  model: "Whisper (CPU)",
  modelSize: "tiny",
  embedSubtitles: false,
  overWriteFiles: false,
  language: "auto",
  outputFormats: [
    { value: "SRT", active: false, isExtended: false },
    { value: "ASS", active: false, isExtended: false },
    { value: "WebVTT", active: false, isExtended: false },
    { value: "MPL2", active: false, isExtended: true },
    { value: "TMP", active: false, isExtended: true },
    { value: "TTML", active: false, isExtended: true },
    { value: "MicroDVD", active: false, isExtended: true },
  ],
};

export default function SettingsMenu() {
  const extended = useStore((s) => s.extendedSubtitlesFormats);
  const files = useStore((s) => s.files);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "outputFormats",
  });

  const model = form.watch("model");
  const modelSize = form.watch("modelSize");
  const language = form.watch("language");
  const embedSubtitles = form.watch("embedSubtitles");
  const overWriteFiles = form.watch("overWriteFiles");

  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: modelSizes = [], isLoading: sizesLoading } = useModelSizes(model);
  const { data: languages = [] } = useLanguages(model);

  const submitJob = useSubmitJob();

  useEffect(() => {
    if (modelSizes.length > 0) {
      form.setValue("modelSize", modelSizes[0]);
    }
  }, [modelSizes, form]);

  function onSubmit(values: FormValues) {
    const activeFormats = values.outputFormats
      .filter((f) => f.active && (!f.isExtended || extended))
      .map((f) => f.value);

    if (files.length === 0) {
      toast.error("Error: No Files", {
        description: "No files in job.",
      });
      return;
    }
    if (activeFormats.length === 0 && !values.embedSubtitles) {
      toast.error("Error: No Output", {
        description:
          "Embed subtitles is off and no output formats are selected.",
      });
      return;
    }
    if (!values.modelSize) {
      toast.error("Error: No Model Size", {
        description: "Please select a model size.",
      });
      return;
    }

    submitJob.mutate({
      model: values.model,
      modelSize: values.modelSize,
      language: values.language,
      embedSubtitles: values.embedSubtitles,
      overWriteFiles: values.overWriteFiles,
      outputFormats: activeFormats,
    });
  }

  return (
    <div className="flex h-full flex-col rounded-lg bg-muted/50 dark:bg-[#1b1c1d]">
      <div className="flex h-12 items-center justify-between rounded-t-lg bg-[#8CB369] pr-2 text-xl font-bold text-black">
        <p className="pl-4">Settings</p>
        <Button
          variant="ghost"
          className="p-2 text-black hover:bg-black/10"
          onClick={() => form.reset(DEFAULT_VALUES)}
        >
          <Undo2Icon className="size-5" strokeWidth={3} />
          <span className="text-base font-medium">Reset</span>
        </Button>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <ScrollAreaShadow className="flex-1">
          <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2">
              <Label className="min-w-28 text-base">Model:</Label>
              <Select
                value={model}
                onValueChange={(v) => form.setValue("model", v as string)}
              >
                <SelectTrigger
                  className="w-[180px]"
                  disabled={modelsLoading}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="min-w-28 text-base">Model Size:</Label>
              <Select
                value={modelSize}
                onValueChange={(v) => form.setValue("modelSize", v as string)}
              >
                <SelectTrigger className="w-[180px]" disabled={sizesLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelSizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-base">Input Video Language:</Label>
              <Combobox
                value={language}
                onValueChange={(v) => form.setValue("language", v as string)}
              >
                <ComboboxTrigger className="flex h-7 w-[200px] items-center justify-between rounded-md border border-input bg-input/20 px-2 text-xs dark:bg-input/30">
                  {languages.find((l) => l.code === language)?.lang ??
                    "Auto Detect"}
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput
                    placeholder="Search Language..."
                    showTrigger={false}
                    showClear={false}
                  />
                  <ComboboxList>
                    <ComboboxEmpty>No language found.</ComboboxEmpty>
                    {languages.map((l) => (
                      <ComboboxItem key={l.code} value={l.code}>
                        {l.lang}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <Separator className="my-2 bg-border" />

            <div className="flex items-center gap-2">
              <Label className="min-w-60 text-base">
                Embed Subtitles into Video
              </Label>
              <Checkbox
                checked={embedSubtitles}
                onCheckedChange={(v) =>
                  form.setValue("embedSubtitles", v as boolean)
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Label
                className={`min-w-60 text-base ${
                  !embedSubtitles ? "text-muted-foreground" : ""
                }`}
              >
                Replace Original File
              </Label>
              <Checkbox
                checked={overWriteFiles}
                disabled={!embedSubtitles}
                onCheckedChange={(v) =>
                  form.setValue("overWriteFiles", v as boolean)
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-base">Output Subtitle Format(s):</Label>
              <div className="flex flex-wrap items-center gap-1">
                {fields.map((field, index) =>
                  !field.isExtended || extended ? (
                    <Toggle
                      key={field.id}
                      variant="outline"
                      pressed={field.active}
                      onPressedChange={() =>
                        update(index, { ...field, active: !field.active })
                      }
                    >
                      {field.value}
                    </Toggle>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </ScrollAreaShadow>

        <div className="flex justify-end p-3">
          <Button
            type="submit"
            className="h-14 bg-primary px-10 text-2xl text-primary-foreground hover:bg-primary/90"
            disabled={submitJob.isPending}
          >
            {submitJob.isPending ? "Starting..." : "Start Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
