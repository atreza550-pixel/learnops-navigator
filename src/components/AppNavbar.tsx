import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeStore } from "@/stores/themeStore";
import { Home, BarChart3, User, Shield, Trophy, Sun, Moon } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";
import { motion } from "framer-motion";

const AppNavbar = () => {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const links = [
    { to: "/home", icon: Home, label: "Accueil" },
    { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { to: "/leaderboard", icon: Trophy, label: "Classement" },
    { to: "/profile", icon: User, label: "Profil" },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border transition-colors duration-300">
      {/* Top bar with search + notifications + theme */}
      <div className="absolute -top-12 right-2 flex items-center gap-1">
        <GlobalSearch />
        <NotificationBell />
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>

      <div className="max-w-lg mx-auto flex justify-around py-2">
        {links.map((l) => {
          const active = l.to === "/admin" ? pathname.startsWith("/admin") : pathname === l.to;
          return (
            <Link key={l.to} to={l.to} className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors">
              <l.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>{l.label}</span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 h-0.5 w-8 rounded-full gradient-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppNavbar;
