import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ size = "default", className = "" }: { size?: "default" | "lg" | "sm"; className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const shouldBeDark = stored === "dark";
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
  };

  const iconSize = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-4 h-4" : "w-[18.5px] h-[18.5px] sm:w-5 sm:h-5";
  const btnPad = size === "lg" ? "p-3" : size === "sm" ? "p-1.5" : "p-[7.25px] sm:p-2";

  return (
    <button
      onClick={toggle}
      className={`${btnPad} rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className={`${iconSize} text-foreground`} />
      ) : (
        <Moon className={`${iconSize} text-foreground`} />
      )}
    </button>
  );
}
