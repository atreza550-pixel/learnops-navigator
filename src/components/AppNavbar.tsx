import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, BarChart3, User, Shield, Rocket } from "lucide-react";

const AppNavbar = () => {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: "/home", icon: Home, label: "Accueil" },
    { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { to: "/profile", icon: User, label: "Profil" },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {links.map((l) => {
          const active = pathname.startsWith(l.to);
          return (
            <Link key={l.to} to={l.to} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <l.icon className="h-5 w-5" />
              <span className="text-[10px]">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AppNavbar;
