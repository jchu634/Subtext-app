import { Check, ChevronsUpDown, Undo2Icon } from "lucide-react";
import { toolbarVars, funnelDisplay } from "@/app/page";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

// Store Stuff
import { useSelector } from "@xstate/store/react";
import { store } from "@/components/stores";

// Form Stuff
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";

// Query Stuff
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface modelSize {
  modelName: String;
  suggestedVRAM: number;
}
interface languageType {
  code: string;
  lang: string;
}

const formSchema = z.object({
  model: z.string(),
  modelSize: z.string(),
  embedSubtitles: z.boolean(),
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

export function SettingsMenu() {
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = useState<string>("whisper");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

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
      language: "auto",
      outputFormats: [
        { value: "SRT", active: false, isExtended: false },
        { value: "ASS", active: false, isExtended: false },
        { value: "WebVTT", active: false, isExtended: false },
        { value: "MPL2", active: false, isExtended: true },
        { value: "TMP", active: false, isExtended: true },
        { value: "SAMI", active: false, isExtended: true },
        { value: "TTML", active: false, isExtended: true },
        { value: "MicroDVD", active: false, isExtended: true },
      ],
      filePaths: ["Placeholder", "PlaceholderToo"],
    },
  });

  useEffect(() => {
    if (modelSizes.length > 0) {
      form.setValue("modelSize", modelSizes[0]);
    }
  }, [modelSizes, form]);
  const { fields, update } = useFieldArray({
    name: "outputFormats",
    control: form.control,
  });

  const handleToggle = (index: number) => {
    const current = fields[index];
    update(index, { ...current, active: !current.active });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const result = values.outputFormats
      .filter((item) => item.active && (!item.isExtended || useExtendedFormats))
      .map((item) => item.value);
    console.log(result);
    console.log(values);
  };

  const resetSettings = () => {
    form.reset();
  };

  return (
    <div className={`h-[80vh] bg-[#D9D9D9] ${toolbarVars.rounded}`}>
      {/* Settings Menu */}
      <div
        className={`flex items-center justify-between bg-[#8CB369] pr-2 text-black ${funnelDisplay.className} text-xl font-bold ${toolbarVars.height} ${toolbarVars.rounded}`}
      >
        <p className="pl-4">Settings</p>
        <div>
          <Button variant="ghost" className="p-2" onClick={resetSettings}>
            <Undo2Icon
              strokeWidth={3}
              size={24}
              className="hover:text-accent-foreground"
            />
            <p className={`${funnelDisplay.className} text-xl font-bold`}>
              Reset
            </p>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="settings-form">
          <div
            className={`h-full space-y-4 p-3 text-black ${funnelDisplay.className}`}
          >
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
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
                        className="w-[180px] border-2 border-black"
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
                          className={`${funnelDisplay.className}`}
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
                        className="w-[180px] border-2 border-black"
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
                          className={`${funnelDisplay.className}`}
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
                  <FormLabel className="text-lg font-bold">
                    Embed Subtitles into Video
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      defaultChecked={true}
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
        </form>
      </Form>
    </div>
  );
}
