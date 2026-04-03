import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  const saved = localStorage.getItem("learnops_theme") as Theme | null;
  const initial = saved || "dark";
  
  // Apply on load
  if (initial === "light") {
    document.documentElement.classList.add("light");
  }
  
  return {
    theme: initial,
    toggleTheme: () => set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("learnops_theme", next);
      if (next === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
      return { theme: next };
    }),
  };
});
