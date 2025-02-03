import { Check, ChevronsUpDown, Undo2Icon } from "lucide-react";
import { colourScheme } from "@/lib/colourscheme";
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
import { store } from "@/lib/stores";

// Form Stuff
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";

// Query Stuff
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// interface modelSize {
//   modelName: string;
//   suggestedVRAM: number;
// }
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

export default function SettingsMenu() {
  // eslint-disable-next-line
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = useState<string>("whisper");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "whisper",
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
        //SAMI is not fully suppported in PySub2 { value: "SAMI", active: false, isExtended: true },
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
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      });
    },
    onMutate: () => {
      toast({
        className: "bg-blue-800",
        title: "Job Sent",
        description: "Submitted job successfully",
        duration: 2000,
      });
    },
    onSuccess: () => {
      toast({
        className: "bg-purple-800",
        title: "Job Success",
        description: "Job is complete",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
        duration: 2000,
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

    const formData = {
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
    console.log("test");
    toast({
      className: "bg-blue-800",
      title: "Success",
      description: "Form submitted successfully",
      duration: 2000,
    });
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
    <div className={`flex h-[76vh] flex-col rounded-lg ${colourScheme.body}`}>
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
          <ScrollAreaShadow className="h-full">
            <div className={`space-y-3 p-3 text-black ${funnel.className}`}>
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className={`flex items-center space-x-2 space-y-0`}>
                    <FormLabel className="min-w-28 text-lg font-bold">
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
                          className="w-[180px] border-2 border-black hover:bg-slate-50"
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
                    <FormLabel className="min-w-28 text-lg font-bold">
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
                          className="w-[180px] border-2 border-black hover:bg-slate-50"
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
                    <FormLabel className="text-lg font-bold">
                      Input Video Language:
                    </FormLabel>

                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          disabled={isLanguagesLoading}
                          className={cn(
                            "w-[200px] justify-between border-2 border-black",
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
                    <FormLabel className="min-w-60 text-lg font-bold">
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
                      className={`min-w-60 text-lg font-bold ${
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
                <Label htmlFor="subtitleFormat" className="text-lg font-bold">
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
