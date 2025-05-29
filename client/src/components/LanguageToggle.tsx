import { Button } from "@/components/ui/button";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-xs font-medium px-3 py-1"
      >
        EN
      </Button>
      <Button
        variant={language === "hi" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("hi")}
        className="text-xs font-medium px-3 py-1 font-hindi"
      >
        हिं
      </Button>
    </div>
  );
}
