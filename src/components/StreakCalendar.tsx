import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface StreakCalendarProps {
  userId: string;
}

const StreakCalendar = ({ userId }: StreakCalendarProps) => {
  const days = useMemo(() => {
    // Seeded random based on userId for consistency
    const seed = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (i: number) => {
      const x = Math.sin(seed * 9301 + i * 49297) * 49297;
      return x - Math.floor(x);
    };

    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const r = rng(i);
      const lessons = r > 0.6 ? Math.floor(r * 5) + 1 : 0;
      result.push({
        date: d,
        lessons,
        label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      });
    }
    return result;
  }, [userId]);

  const getColor = (lessons: number) => {
    if (lessons === 0) return "bg-secondary";
    if (lessons <= 1) return "bg-accent/30";
    if (lessons <= 3) return "bg-accent/60";
    return "bg-accent";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {days.map((d, i) => (
          <Tooltip key={i}>
            <TooltipTrigger>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02, type: "spring", stiffness: 300 }}
                className={`h-4 w-4 rounded-sm ${getColor(d.lessons)} transition-colors`}
              />
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <p className="font-medium">{d.label}</p>
              <p className="text-muted-foreground">
                {d.lessons > 0 ? `${d.lessons} leçon${d.lessons > 1 ? "s" : ""} complétée${d.lessons > 1 ? "s" : ""}` : "Aucune activité"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
        <span>Moins</span>
        <div className="h-3 w-3 rounded-sm bg-secondary" />
        <div className="h-3 w-3 rounded-sm bg-accent/30" />
        <div className="h-3 w-3 rounded-sm bg-accent/60" />
        <div className="h-3 w-3 rounded-sm bg-accent" />
        <span>Plus</span>
      </div>
    </div>
  );
};

export default StreakCalendar;
