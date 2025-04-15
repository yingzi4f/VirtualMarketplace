import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface SearchBarProps {
  onSearch?: () => void;
  initialQuery?: string;
}

export function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  
  // Update search query if initialQuery prop changes
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) {
        onSearch();
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full pl-10 pr-16 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button 
            type="submit" 
            size="sm" 
            variant="ghost" 
            className="h-7 text-primary hover:text-primary"
          >
            {t("search")}
          </Button>
        </div>
      </div>
    </form>
  );
}
