import { useState, useRef, useEffect } from "react";
import { useDataStore } from "@/stores/dataStore";
import { Bell, CheckCheck, Trophy, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap = {
  success: CheckCircle,
  trophy: Trophy,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: "text-accent",
  trophy: "text-warning",
  info: "text-primary",
  warning: "text-destructive",
};

const NotificationBell = () => {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useDataStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl glass-card shadow-xl z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> Tout marquer comme lu
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorMap[n.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
