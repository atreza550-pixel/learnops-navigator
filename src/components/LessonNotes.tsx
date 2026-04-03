import { useState, useEffect, useCallback } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StickyNote, Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LessonNotes = ({ lessonId }: { lessonId: string }) => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const maxChars = 500;

  const storageKey = `notes_${lessonId}_${currentUser?.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setNotes(saved);
  }, [storageKey]);

  useEffect(() => {
    if (!notes && !localStorage.getItem(storageKey)) return;
    setSaved(false);
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, notes);
      setSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, storageKey]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-accent" />
            Mes Notes
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        <Textarea
          placeholder="Prenez vos notes ici..."
          value={notes}
          onChange={(e) => {
            if (e.target.value.length <= maxChars) setNotes(e.target.value);
          }}
          className="bg-secondary border-border min-h-[120px] text-sm"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{notes.length}/{maxChars} caractères</span>
          {saved && (
            <span className="flex items-center gap-1 text-accent">
              <Check className="h-3 w-3" /> Sauvegardé
            </span>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LessonNotes;
