import { Link, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, BookOpen, BarChart3 } from "lucide-react";

const tabs = [
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/modules", label: "Modules", icon: BookOpen },
  { to: "/admin/analytics", label: "Analytique", icon: BarChart3 },
];

const Admin = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" /> Administration
      </h1>
      <div className="flex gap-2">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className={`glass-card cursor-pointer hover:border-primary/50 transition-colors ${pathname === t.to ? "border-primary" : ""}`}>
              <CardContent className="flex items-center gap-2 p-3 px-5">
                <t.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{t.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default Admin;
