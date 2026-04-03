import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "@/stores/dataStore";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, FileText, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  type: "module" | "lesson" | "user";
  title: string;
  subtitle: string;
  url: string;
  icon: React.ReactNode;
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { modules, users } = useDataStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results: SearchResult[] = [];
  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    modules.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
        results.push({ type: "module", title: m.title, subtitle: m.description, url: `/modules/${m.id}`, icon: <BookOpen className="h-4 w-4 text-primary" /> });
      }
      m.lessons.forEach((l) => {
        if (l.title.toLowerCase().includes(q)) {
          results.push({ type: "lesson", title: l.title, subtitle: `${m.title} · ${l.duration}`, url: `/modules/${m.id}/lessons/${l.id}`, icon: <FileText className="h-4 w-4 text-accent" /> });
        }
      });
    });

    if (isAdmin) {
      users.forEach((u) => {
        if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
          results.push({ type: "user", title: u.name, subtitle: u.email, url: "/admin/users", icon: <Users className="h-4 w-4 text-warning" /> });
        }
      });
    }
  }

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.url);
    setOpen(false);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const grouped = {
    module: results.filter((r) => r.type === "module"),
    lesson: results.filter((r) => r.type === "lesson"),
    user: results.filter((r) => r.type === "user"),
  };

  let flatIndex = 0;

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors">
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded bg-secondary px-1.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-border p-0 max-w-lg overflow-hidden [&>button]:hidden">
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Rechercher modules, leçons, utilisateurs..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="pl-9 bg-secondary border-border"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {query.trim().length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Tapez pour rechercher...
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Aucun résultat pour "{query}"
              </div>
            ) : (
              <>
                {(["module", "lesson", "user"] as const).map((type) => {
                  const items = grouped[type];
                  if (items.length === 0) return null;
                  const label = type === "module" ? "Modules" : type === "lesson" ? "Leçons" : "Utilisateurs";
                  return (
                    <div key={type} className="mb-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">{label}</p>
                      {items.map((r) => {
                        const idx = flatIndex++;
                        return (
                          <motion.button
                            key={`${r.type}-${r.title}-${r.url}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => handleSelect(r)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              idx === selectedIndex ? "bg-primary/10 text-foreground" : "hover:bg-secondary/50 text-muted-foreground"
                            }`}
                          >
                            {r.icon}
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{r.title}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{r.subtitle}</p>
                            </div>
                            <ArrowRight className="h-3 w-3 opacity-40" />
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="p-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground px-4">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>ESC Fermer</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
