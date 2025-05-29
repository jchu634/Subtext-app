import { Check, ChevronsUpDown, Undo2Icon } from "lucide-react";
import { funnel } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Component Stuff
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollAreaShadow } from "@/components/ui/scroll-area-shadow";
import { useToast } from "@/hooks/use-toast";

// Store Stuff
import { useSelector } from "@xstate/store/react";
import { store, JobProgressState } from "@/lib/stores";

// Form Stuff
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";

// Query Stuff
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface languageType {
  code: string;
  lang: string;
}

const formSchema = z.object({
  model: z.string(),
  modelSize: z.string(),
  embedSubtitles: z.boolean(),
  overWriteFiles: z.boolean(),
  language: z.string(),
  outputFormats: z.array(
    z.object({
      value: z.string().min(1, "Value cannot be empty"),
      active: z.boolean(),
      isExtended: z.boolean(), // Indicates whether the item is an extended item
    }),
  ),
  filePaths: z.array(z.string()),
});

const suppressDragDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleOpenChange = (open: boolean) => {
  if (open) {
    document.addEventListener("dragenter", suppressDragDrop, true);
    document.addEventListener("dragover", suppressDragDrop, true);
    document.addEventListener("drop", suppressDragDrop, true);
  } else {
    document.removeEventListener("dragenter", suppressDragDrop, true);
    document.removeEventListener("dragover", suppressDragDrop, true);
    document.removeEventListener("drop", suppressDragDrop, true);
  }
};

export default function SettingsMenu() {
  // eslint-disable-next-line
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = useState<string>("whisper (CPU)");

  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "whisper (CPU)",
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
        // SAMI is not fully suppported in PySub2
        // { value: "SAMI", active: false, isExtended: true },
        { value: "TTML", active: false, isExtended: true },
        { value: "MicroDVD", active: false, isExtended: true },
      ],
      filePaths: ["Placeholder", "PlaceholderToo"],
    },
  });

  const { fields, update } = useFieldArray({
    name: "outputFormats",
    control: form.control,
  });

  const handleToggle = (index: number) => {
    const current = fields[index];
    update(index, { ...current, active: !current.active });
  };

  const resetSettings = () => {
    form.reset();
  };

  type FormData = {
    filePaths: string[];
    model: string;
    modelSize: string;
    language: string;
    embedSubtitles: boolean;
    overWriteFiles: boolean;
    outputFormats: string[];
    saveLocation: string;
  };

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fetch("http://127.0.0.1:6789/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => {
          if (!res.ok) {
            return res
              .json()
              .then((errData) => {
                throw new Error(
                  errData.detail || `Server error: ${res.status}`,
                );
              })
              .catch(() => {
                throw new Error(`Server error: ${res.status}`);
              });
          }
          return res.json();
        })
        .then((data) => {
          if (data && data[0] && data[0].task_id) {
            const taskId = data[0].task_id;

            const firstFilePath =
              formData.filePaths.length > 0 ? formData.filePaths[0] : "";
            let jobName = firstFilePath
              ? firstFilePath.split(/[\\/]/).pop() || `Task ${taskId}`
              : `Task ${taskId}`;

            jobName =
              jobName.substring(0, 24) +
              (formData.filePaths.length > 1
                ? " + " +
                  (formData.filePaths.length - 1) +
                  " more file" +
                  (formData.filePaths.length == 2 ? "" : "s")
                : "");

            store.send({
              type: "ADD_JOB",
              job: {
                [taskId]: {
                  jobName: jobName,
                  percentage: 0,
                  status: "Pending",
                  message: "Job submitted, awaiting progress...",
                },
              },
            });

            console.log("Job submitted with task ID:", taskId);
            const eventSource = new EventSource(
              `http://127.0.0.1:6789/progress/${taskId}`,
            );

            eventSource.onmessage = (event) => {
              console.log("SSE Message:", event.data);
              try {
                const parsedData = JSON.parse(event.data);
                if (
                  parsedData.type === "status" &&
                  (parsedData.status === "DONE" ||
                    parsedData.status === "ERROR")
                ) {
                  store.send({
                    type: "UPDATE_JOB_PROGRESS",
                    job: {
                      [taskId]: {
                        jobName: jobName,
                        percentage: 100,
                        status: "Complete",
                        message: "Transcription job finished successfully.",
                      },
                    },
                  });
                  console.log(
                    "SSE stream finished with status:",
                    parsedData.status,
                  );
                  eventSource.close();
                  if (parsedData.status === "DONE") {
                    toast({
                      className: "bg-purple-800",
                      title: "Job Complete",
                      description: "Transcription job finished successfully.",
                      duration: 3000,
                    });
                  } else if (parsedData.status === "ERROR") {
                    toast({
                      variant: "destructive",
                      title: "Job Error",
                      description:
                        parsedData.error ||
                        "An error occurred during transcription.",
                      duration: 5000,
                    });
                  }
                } else if (parsedData.type === "progress") {
                  store.send({
                    type: "UPDATE_JOB_PROGRESS",
                    job: {
                      [taskId]: {
                        jobName: jobName,
                        percentage: parsedData.percentage,
                        status: "Running",
                      },
                    },
                  });
                }
              } catch (e) {
                console.error("Failed to parse SSE message JSON:", e);
              }
            };

            eventSource.onerror = (error) => {
              console.error("SSE Error:", error);
              toast({
                variant: "destructive",
                title: "SSE Connection Error",
                description:
                  "Failed to connect to progress stream. Check server status.",
                duration: 5000,
              });
              const currentJobStateOnError = (
                store.getSnapshot().context.jobProgress as JobProgressState
              )[taskId];
              store.send({
                type: "UPDATE_JOB_PROGRESS",
                job: {
                  [taskId]: {
                    jobName: jobName,
                    percentage: currentJobStateOnError?.percentage || 0,
                    status: "Error",
                    message: "SSE connection error. Check server status.",
                  },
                },
              });
              eventSource.close();
            };
            return data;
          } else {
            console.error(
              "Invalid response from server, missing task_id:",
              data,
            );
            throw new Error("Invalid response from server, missing task_id");
          }
        });
    },
    onMutate: () => {
      toast({
        className: "bg-blue-800",
        title: "Job Submitted",
        description: "Transcription job has been submitted to the server.",
        duration: 2000,
      });
    },
    onSuccess: (data) => {
      if (data && data[0] && data[0].task_id) {
        console.log(
          "Mutation for job submission successful, SSE connection initiated for task:",
          data[0].task_id,
        );
      } else {
        console.log(
          "Mutation for job submission successful, but task_id might be missing in returned data:",
          data,
        );
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "Failed to submit transcription job.",
        duration: 5000,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const temp = store.getSnapshot().context;
    const outputFormats = values.outputFormats
      .filter((item) => item.active && (!item.isExtended || useExtendedFormats))
      .map((item) => item.value);

    if (temp.files.size == 0) {
      toast({
        variant: "destructive",
        duration: 2000,
        title: "Error: No Files",
        description: "No Files in job",
      });
      return;
    } else if (outputFormats.length == 0 && values.embedSubtitles == false) {
      toast({
        variant: "destructive",
        duration: 2000,
        title: "Error: No Output",
        description:
          "Embed subtitles is off and no Output formats are selected",
      });
      return;
    } else if (values.modelSize == "") {
      toast({
        variant: "destructive",
        duration: 2000,
        title: "Error: No Model Size",
        description: "Please select a model size",
      });
      return;
    }

    const formData: FormData = {
      filePaths: Array.from(temp.files).map((file) => file.fullPath),
      model: values.model,
      modelSize: values.modelSize,
      language: values.language,
      embedSubtitles: values.embedSubtitles,
      overWriteFiles: values.overWriteFiles,
      outputFormats: outputFormats,
      saveLocation: temp.saveLocation,
    };
    mutation.mutate(formData);
  };

  const { data: models = [], isLoading: isModelsLoading } = useQuery({
    queryKey: ["models"],
    queryFn: () =>
      fetch("http://127.0.0.1:6789/available_models").then((res) => res.json()),
  });

  const { data: modelSizes = [], isLoading: isModelSizesLoading } = useQuery({
    queryKey: ["modelSizes", selectedModel],
    queryFn: () =>
      fetch(
        `http://127.0.0.1:6789/supported_model_sizes?model=${selectedModel}`,
      ).then((res) => res.json()),
    enabled: !!selectedModel,
  });

  useEffect(() => {
    if (modelSizes.length > 0) {
      form.setValue("modelSize", modelSizes[0]);
    }
  }, [modelSizes, form]);

  const { data: modelLanguages = [], isLoading: isLanguagesLoading } = useQuery(
    {
      queryKey: ["modelLanguages", selectedModel],
      queryFn: () =>
        fetch(
          `http://127.0.0.1:6789/supported_languages?model=${selectedModel}`,
        ).then((res) => res.json()),
      enabled: !!selectedModel,
    },
  );

  return (
    <div
      className={`flex h-[76vh] flex-col rounded-lg bg-[#D9D9D9] dark:bg-[#1b1c1d]`}
    >
      <div
        className={`flex items-center justify-between bg-[#8CB369] pr-2 text-black ${funnel.className} h-12 rounded-t-lg text-xl font-bold`}
      >
        <p className="pl-4">Settings</p>
        <div>
          <Button variant="ghost" className="p-2" onClick={resetSettings}>
            <Undo2Icon
              strokeWidth={3}
              size={24}
              className="hover:text-accent-foreground"
            />
            <p className={`${funnel.className} text-xl font-bold`}>Reset</p>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="settings-form"
          className="flex-1 overflow-hidden"
        >
          <ScrollAreaShadow className="h-full rounded-b-lg">
            <div
              className={`space-y-3 p-3 text-black dark:text-white ${funnel.className}`}
            >
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className={`flex items-center space-x-2 space-y-0`}>
                    <FormLabel className="min-w-28 text-lg font-bold dark:font-medium">
                      Model:
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedModel(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isModelsLoading}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="model"
                          className="dark:border-1 w-[180px] border-2 border-black hover:bg-slate-50 dark:border-white dark:hover:bg-slate-500"
                        >
                          <SelectValue
                            placeholder={
                              isModelsLoading ? "Loading..." : "Select Model"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models.map((model: string, index: number) => (
                          <SelectItem
                            value={`${model}`}
                            className={`${funnel.className}`}
                            key={index}
                          >
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelSize"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormLabel className="min-w-28 text-lg font-bold dark:font-medium">
                      Model Size:
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isModelSizesLoading}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="modelSize"
                          className="dark:border-1 w-[180px] border-2 border-black hover:bg-slate-50 dark:border-white dark:hover:bg-slate-500"
                        >
                          <SelectValue
                            placeholder={
                              isModelSizesLoading ? "Loading..." : "Select Size"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modelSizes.map((size: string, index: number) => (
                          <SelectItem
                            value={`${size}`}
                            className={`${funnel.className}`}
                            key={index}
                          >
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormLabel className="text-lg font-bold dark:font-medium">
                      Input Video Language:
                    </FormLabel>

                    <Popover
                      open={open}
                      onOpenChange={(value) => {
                        setOpen(value);
                        handleOpenChange(value);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          disabled={isLanguagesLoading}
                          className={cn(
                            "dark:border-1 w-[200px] justify-between border-2 border-black dark:border-white dark:hover:bg-slate-500",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? modelLanguages.find(
                                (language: languageType) =>
                                  language.code === field.value,
                              )?.lang
                            : "Auto Detect"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="h-[30vh] w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search Language..." />
                          <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup>
                              {modelLanguages.map((language: languageType) => (
                                <CommandItem
                                  key={language.code}
                                  value={language.lang}
                                  onSelect={() => {
                                    form.setValue("language", language.code);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      language.code === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {language.lang}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <Separator className="my-4 bg-black" />
              <FormField
                control={form.control}
                name="embedSubtitles"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormLabel className="min-w-60 text-lg font-bold dark:font-medium">
                      Embed Subtitles into Video
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        defaultChecked={true}
                        className="hover:bg-slate-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overWriteFiles"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormLabel
                      className={`min-w-60 text-lg font-bold dark:font-medium ${
                        !form.getValues("embedSubtitles") ? "text-gray-600" : ""
                      }`}
                    >
                      Replace Original File
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        title={`${!form.getValues("embedSubtitles") ? "This option is only available if embed subtitles is enabled" : "Embeds subtitles into original file"}`}
                        disabled={!form.getValues("embedSubtitles")}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        defaultChecked={true}
                        className="enabled:hover:bg-slate-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="subtitleFormat"
                  className="text-lg font-bold dark:font-medium"
                >
                  Output Subtitle Format(s):
                </Label>
                <div id="subtitleFormat" className="space-x-1 space-y-1">
                  {fields.map(
                    (field, index) =>
                      (!field.isExtended || useExtendedFormats) && (
                        <Toggle
                          pressed={field.active}
                          onPressedChange={() => handleToggle(index)}
                          key={field.id}
                        >
                          {field.value}
                        </Toggle>
                      ),
                  )}
                </div>
              </div>
            </div>
          </ScrollAreaShadow>
        </form>
      </Form>
    </div>
  );
}
