import { useDataStore } from "@/stores/dataStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { StatCardSkeleton, ChartSkeleton } from "@/components/LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, Award, TrendingUp, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

const activityData = [
  { day: "Lun", inscriptions: 2, leçons: 8 },
  { day: "Mar", inscriptions: 1, leçons: 12 },
  { day: "Mer", inscriptions: 3, leçons: 6 },
  { day: "Jeu", inscriptions: 0, leçons: 15 },
  { day: "Ven", inscriptions: 2, leçons: 10 },
  { day: "Sam", inscriptions: 1, leçons: 4 },
  { day: "Dim", inscriptions: 0, leçons: 3 },
];

const COLORS = ["hsl(239,84%,67%)", "hsl(187,85%,53%)"];

const AdminOverview = () => {
  const { users, modules, activities } = useDataStore();
  const loading = useDelayedLoading(400);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const students = users.filter((u) => u.role === "student").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const roleData = [
    { name: "Étudiants", value: students },
    { name: "Admins", value: admins },
  ];

  const progressData = modules.map((m) => {
    const completedCount = users.filter((u) => u.completedModules.includes(m.id)).length;
    return { name: m.title.length > 15 ? m.title.slice(0, 15) + "..." : m.title, completion: Math.round((completedCount / users.length) * 100) };
  });

  const stats = [
    { label: "Total utilisateurs", value: users.length, sub: "+2 ce mois", icon: Users, color: "text-primary" },
    { label: "Modules actifs", value: modules.length, sub: "", icon: BookOpen, color: "text-accent" },
    { label: "Leçons totales", value: totalLessons, sub: "", icon: FileText, color: "text-success" },
    { label: "Quiz complétés", value: "12 tentatives", sub: "", icon: Award, color: "text-warning" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 page-transition">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-transition">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="glass-card hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                {s.sub && <p className="text-xs text-success">{s.sub}</p>}
              </div>
              <s.icon className={`h-8 w-8 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Activité des 7 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" />
                <XAxis dataKey="day" stroke="hsl(220,10%,55%)" fontSize={12} />
                <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(240,20%,11%)", border: "1px solid hsl(240,15%,20%)", borderRadius: "8px", color: "hsl(220,20%,90%)" }}
                />
                <Line type="monotone" dataKey="inscriptions" stroke="hsl(239,84%,67%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="leçons" stroke="hsl(187,85%,53%)" strokeWidth={2} dot={{ r: 4 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Répartition des rôles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(240,20%,11%)", border: "1px solid hsl(240,15%,20%)", borderRadius: "8px", color: "hsl(220,20%,90%)" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Progression par module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" />
              <XAxis dataKey="name" stroke="hsl(220,10%,55%)" fontSize={11} />
              <YAxis stroke="hsl(220,10%,55%)" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(240,20%,11%)", border: "1px solid hsl(240,15%,20%)", borderRadius: "8px", color: "hsl(220,20%,90%)" }} />
              <Bar dataKey="completion" fill="hsl(239,84%,67%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity feed */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.slice(0, 10).map((a) => (
            <div key={a.id} className="flex items-center gap-3 text-sm">
              <div className={`h-2 w-2 rounded-full ${
                a.type === "register" ? "bg-primary" :
                a.type === "quiz_pass" ? "bg-accent" :
                a.type === "quiz_fail" ? "bg-destructive" :
                "bg-foreground"
              }`} />
              <span className="font-medium">{a.userName}</span>
              <span className="text-muted-foreground">{a.detail}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(a.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
