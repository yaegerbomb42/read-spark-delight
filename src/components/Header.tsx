
import { useState, useEffect } from "react";
import { Moon, Sun, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}
export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">
            Dopamine<span className="text-secondary">Read</span>
          </h1>
        </div>

        <div className="relative hidden md:flex items-center w-1/3">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search books..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={toggleTheme} variant="ghost" size="icon" className="mr-2">
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-secondary">
              3
            </Badge>
          </Button>

          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarImage src="" />
            <AvatarFallback className="bg-dopamine-500 text-white">RD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
