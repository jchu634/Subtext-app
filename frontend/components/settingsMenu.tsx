import { Check, ChevronsUpDown, CircleSlashIcon } from "lucide-react";
import { toolbarVars, funnelDisplay } from "@/app/page";
import { cn } from "@/lib/utils";

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

// Store Stuff
import { useSelector } from "@xstate/store/react";
import { store } from "@/components/settingsStore";

// Form Stuff
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  model: z.string(),
  modelSize: z.string(),
  embedSubtitles: z.boolean(),
  language: z.string(),
  outputFormats: z.array(z.string()),
  filePaths: z.array(z.string()),
});

interface modelSize {
  modelName: String;
  suggestedVRAM: number;
}
var modelSizes = [
  { modelName: "tiny", suggestedVRAM: 1 },
  { modelName: "base", suggestedVRAM: 1 },
  { modelName: "small", suggestedVRAM: 2 },
  { modelName: "medium", suggestedVRAM: 5 },
  { modelName: "large", suggestedVRAM: 10 },
  { modelName: "turbo", suggestedVRAM: 6 },
];

var languages = [
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

var subtitleFormats = ["SRT", "ASS", "WebVTT"];
var extendedSubtitlesFormats = ["MPL2", "TMP", "SAMI", "TTML", "MicroDVD"];

export function SettingsMenu() {
  function resetSettings() {
    // #TODO
  }
  const useExtendedFormats = useSelector(
    store,
    (state) => state.context.extendedSubtitlesFormats,
  );

  return (
    <div className={`h-[80vh] bg-[#D9D9D9] ${toolbarVars.rounded}`}>
      {/* Settings Menu */}
      <div
        className={`flex items-center justify-between bg-[#8CB369] pr-2 text-black ${funnelDisplay.className} text-xl font-bold ${toolbarVars.height} ${toolbarVars.rounded}`}
      >
        <p className="pl-4">Settings</p>
        <div>
          <Button variant="ghost" className="p-2" onClick={resetSettings}>
            <CircleSlashIcon
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
      <div
        className={`h-full space-y-4 p-3 text-black ${funnelDisplay.className}`}
      >
        <div className="flex items-center space-x-2">
          <Label htmlFor="modelSize" className="text-lg font-bold">
            Model Size:
          </Label>
          <Select>
            <SelectTrigger
              id="modelSize"
              className="w-[180px] border-2 border-black"
            >
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {modelSizes.map((size, index) => (
                <SelectItem
                  value={`${size.modelName}`}
                  className={`${funnelDisplay.className}`}
                  key={index}
                >
                  {size.modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="embedSubtitles" className="text-lg font-bold">
            Embed Subtitles into Video
          </Label>
          <Checkbox id="embedSubtitles" defaultChecked={true} />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="subtitleFormat" className="text-lg font-bold">
            Output Subtitle Format(s):
          </Label>
          <div id="subtitleFormat" className="space-x-1 space-y-1">
            {subtitleFormats.map((format, index) => (
              <Toggle key={index}>{format}</Toggle>
            ))}

            {useExtendedFormats && (
              <>
                {extendedSubtitlesFormats.map((format, index) => (
                  <Toggle key={index}>{format}</Toggle>
                ))}
              </>
            )}
          </div>
        </div>
        {/* <div className="flex items-center space-x-2">
                  <Label htmlFor="languageSelect" className="text-lg font-bold">
                    Language:
                  </Label>
                  <div id="languageSelect">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[200px] justify-between"
                        >
                          {value
                            ? frameworks.find(
                                (framework) => framework.value === value,
                              )?.label
                            : "Auto Detect"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search Language..." />
                          <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup>
                              {languages.map((language) => (
                                <CommandItem
                                  key={language}
                                  value={language}
                                  onSelect={(currentValue) => {
                                    setValue(
                                      currentValue === value
                                        ? ""
                                        : currentValue,
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      value === language
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {language}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div> 
                </div> */}
      </div>
    </div>
  );
}
