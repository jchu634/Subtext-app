import { Check, ChevronsUpDown, Undo2Icon } from "lucide-react";
import { funnel } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  const models = ["Whisper"];
  const modelSizes = [
    "tiny.en",
    "tiny",
    "base.en",
    "base",
    "small.en",
    "small",
    "medium.en",
    "medium",
    "large-v1",
    "large-v2",
    "large-v3",
    "large",
    "large-v3-turbo",
    "turbo",
  ];
  const modelLanguages = [
    { code: "auto", lang: "Auto Detect" },
    { code: "af", lang: "Afrikaans" },
    { code: "ar", lang: "Arabic" },
    { code: "hy", lang: "Armenian" },
    { code: "az", lang: "Azerbaijani" },
    { code: "be", lang: "Belarusian" },
    { code: "bs", lang: "Bosnian" },
    { code: "bg", lang: "Bulgarian" },
    { code: "ca", lang: "Catalan" },
    { code: "zh", lang: "Chinese" },
    { code: "hr", lang: "Croatian" },
    { code: "cs", lang: "Czech" },
    { code: "da", lang: "Danish" },
    { code: "nl", lang: "Dutch" },
    { code: "en", lang: "English" },
    { code: "et", lang: "Estonian" },
    { code: "fi", lang: "Finnish" },
    { code: "fr", lang: "French" },
    { code: "gl", lang: "Galician" },
    { code: "de", lang: "German" },
    { code: "el", lang: "Greek" },
    { code: "he", lang: "Hebrew" },
    { code: "hi", lang: "Hindi" },
    { code: "hu", lang: "Hungarian" },
    { code: "is", lang: "Icelandic" },
    { code: "id", lang: "Indonesian" },
    { code: "it", lang: "Italian" },
    { code: "ja", lang: "Japanese" },
    { code: "kn", lang: "Kannada" },
    { code: "kk", lang: "Kazakh" },
    { code: "ko", lang: "Korean" },
    { code: "lv", lang: "Latvian" },
    { code: "lt", lang: "Lithuanian" },
    { code: "mk", lang: "Macedonian" },
    { code: "ms", lang: "Malay" },
    { code: "mr", lang: "Marathi" },
    { code: "mi", lang: "Maori" },
    { code: "ne", lang: "Nepali" },
    { code: "no", lang: "Norwegian" },
    { code: "fa", lang: "Persian" },
    { code: "pl", lang: "Polish" },
    { code: "pt", lang: "Portuguese" },
    { code: "ro", lang: "Romanian" },
    { code: "ru", lang: "Russian" },
    { code: "sr", lang: "Serbian" },
    { code: "sk", lang: "Slovak" },
    { code: "sl", lang: "Slovenian" },
    { code: "es", lang: "Spanish" },
    { code: "sw", lang: "Swahili" },
    { code: "sv", lang: "Swedish" },
    { code: "tl", lang: "Tagalog" },
    { code: "ta", lang: "Tamil" },
    { code: "th", lang: "Thai" },
    { code: "tr", lang: "Turkish" },
    { code: "uk", lang: "Ukrainian" },
    { code: "ur", lang: "Urdu" },
    { code: "vi", lang: "Vietnamese" },
    { code: "cy", lang: "Welsh" },
  ];

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

  const onSubmit = () => {
    toast({
      className: "bg-blue-800",
      title: "Success",
      description: "Job submitted successfully",
      duration: 2000,
    });
  };

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
                      defaultValue={selectedModel}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="model"
                          className="dark:border-1 w-[180px] border-2 border-black hover:bg-slate-50 dark:border-white dark:hover:bg-slate-500"
                        >
                          <SelectValue placeholder={"Select Model"} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          id="modelSize"
                          className="dark:border-1 w-[180px] border-2 border-black hover:bg-slate-50 dark:border-white dark:hover:bg-slate-500"
                        >
                          <SelectValue placeholder={"Select Size"} />
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

                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
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
