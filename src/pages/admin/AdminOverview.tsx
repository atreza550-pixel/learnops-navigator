import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "@/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, FileText, Award, TrendingUp, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { CountUp } from "@/components/AnimatedComponents";

const COLORS = ["hsl(239,84%,67%)", "hsl(187,85%,53%)", "hsl(38,92%,50%)"];
const tooltipStyle = { backgroundColor: "hsl(240,20%,11%)", border: "1px solid hsl(240,15%,20%)", borderRadius: "8px", color: "hsl(220,20%,90%)" };

const AdminOverview = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["adminStats"], queryFn: adminApi.getStats });
  const { data: analytics, isLoading: analyticsLoading } = useQuery({ queryKey: ["adminAnalytics"], queryFn: adminApi.getAnalytics });

  const loading = statsLoading || analyticsLoading;

  if (loading || !stats || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-secondary rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 bg-secondary rounded-xl" />
          <Skeleton className="h-72 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total utilisateurs", value: stats.totalUsers, sub: `${stats.activeToday} actifs aujourd'hui`, icon: Users, color: "text-primary" },
    { label: "Modules actifs", value: stats.totalModules, icon: BookOpen, color: "text-accent" },
    { label: "Leçons totales", value: stats.totalLessons, icon: FileText, color: "text-success" },
    { label: "Quiz complétés", value: stats.quizAttempts, sub: `Score moyen: ${stats.avgScore}%`, icon: Award, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={i} className="glass-card hover-scale">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-normal">{s.label}</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div><p className="text-2xl font-bold"><CountUp end={s.value} /></p>{s.sub && <p className="text-xs text-success">{s.sub}</p>}</div>
              <s.icon className={`h-8 w-8 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Activité des 7 derniers jours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" />
                <XAxis dataKey="day" stroke="hsl(220,10%,55%)" fontSize={12} />
                <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="inscriptions" stroke="hsl(239,84%,67%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="leçons" stroke="hsl(187,85%,53%)" strokeWidth={2} dot={{ r: 4 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Répartition des rôles</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={analytics.roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {analytics.roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Progression par module</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.moduleCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" />
              <XAxis dataKey="name" stroke="hsl(220,10%,55%)" fontSize={11} />
              <YAxis stroke="hsl(220,10%,55%)" fontSize={12} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="completion" radius={[4, 4, 0, 0]}>{analytics.moduleCompletion.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Utilisateurs les plus actifs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {analytics.activeUsers.slice(0, 8).map((u, i) => (
            <div key={u.id} className="flex items-center gap-3 text-sm">
              <span className={`font-bold w-5 ${i === 0 ? "text-warning" : "text-muted-foreground"}`}>{i + 1}</span>
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ backgroundColor: u.avatarColor }}>{u.avatar}</div>
              <span className="font-medium flex-1">{u.name}</span>
              <span className="text-muted-foreground">{u.points} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
