import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ size = "default" }: { size?: "default" | "lg" | "sm" }) {
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

  const iconSize = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-4.5 h-4.5" : "w-5 h-5";
  const btnPad = size === "lg" ? "p-3" : size === "sm" ? "p-2" : "p-2";

  return (
    <button
      onClick={toggle}
      className={`${btnPad} rounded-lg bg-secondary/50 hover:bg-secondary transition-colors`}
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
