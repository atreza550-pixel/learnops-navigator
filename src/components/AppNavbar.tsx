import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeStore } from "@/stores/themeStore";
import { Home, BarChart3, User, Shield, Trophy, Sun, Moon, ShoppingBag, BookOpen, Wallet, GraduationCap } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";
import { motion } from "framer-motion";

const AppNavbar = () => {
  const { isAdmin, currentUser } = useAuth();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const isInstructor = currentUser?.role === "instructor" || currentUser?.role === "admin";

  const links = [
    { to: "/home", icon: Home, label: "Accueil" },
    { to: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { to: "/leaderboard", icon: Trophy, label: "Classement" },
    { to: "/profile", icon: User, label: "Profil" },
    ...(isInstructor ? [{ to: "/instructor", icon: GraduationCap, label: "Instructor" }] : []),
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border transition-colors duration-300">
      {/* Top bar with search + notifications + theme + wallet */}
      <div className="absolute -top-12 right-2 flex items-center gap-1">
        <Link to="/my-courses" className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/wallet" className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </Link>
        <GlobalSearch />
        <NotificationBell />
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>

      <div className="max-w-lg mx-auto flex justify-around py-2">
        {links.map((l) => {
          const active = l.to === "/admin" ? pathname.startsWith("/admin") : l.to === "/instructor" ? pathname.startsWith("/instructor") : l.to === "/marketplace" ? pathname.startsWith("/marketplace") : pathname === l.to;
          return (
            <Link key={l.to} to={l.to} className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors">
              <l.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[9px] ${active ? "text-primary" : "text-muted-foreground"}`}>{l.label}</span>
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
