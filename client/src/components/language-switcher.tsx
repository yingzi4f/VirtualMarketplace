import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface LanguageSwitcherProps {
  variant?: "icon" | "text" | "both";
}

export function LanguageSwitcher({ variant = "both" }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button 
      onClick={toggleLanguage} 
      variant="ghost" 
      size={variant === "icon" ? "icon" : "sm"}
      className="text-white hover:text-white hover:bg-white/10"
    >
      {variant !== "text" && <Globe className="h-4 w-4 mr-1" />}
      {variant !== "icon" && (
        <span className="text-sm font-medium">
          {language === 'en' ? '中文' : 'English'}
        </span>
      )}
    </Button>
  );
}
