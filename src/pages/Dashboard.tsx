import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BarChart3 className="h-8 w-8 text-primary" /> Tableau de bord
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Modules complétés", value: currentUser.completedModules.length, color: "text-accent" },
          { icon: TrendingUp, label: "Points totaux", value: currentUser.totalPoints, color: "text-primary" },
          { icon: Clock, label: "Heures d'étude", value: "24h", color: "text-orange-400" },
          { icon: BarChart3, label: "Quizzes réussis", value: 12, color: "text-green-400" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <span className="text-3xl font-bold">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
