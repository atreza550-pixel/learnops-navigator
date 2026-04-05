import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as adminApi from "@/api/adminApi";
import * as usersApi from "@/api/usersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, BarChart3, TrendingUp, Award, Trophy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";

const completionDataMap: Record<string, { day: string; completions: number }[]> = {
  "7days": [{ day: "Lun", completions: 5 }, { day: "Mar", completions: 8 }, { day: "Mer", completions: 3 }, { day: "Jeu", completions: 12 }, { day: "Ven", completions: 7 }, { day: "Sam", completions: 2 }, { day: "Dim", completions: 1 }],
  "30days": [{ day: "S1", completions: 22 }, { day: "S2", completions: 35 }, { day: "S3", completions: 28 }, { day: "S4", completions: 42 }],
  "all": [{ day: "Jan", completions: 45 }, { day: "Fév", completions: 62 }, { day: "Mar", completions: 78 }, { day: "Avr", completions: 38 }],
};

const tooltipStyle = { backgroundColor: "hsl(240,20%,11%)", border: "1px solid hsl(240,15%,20%)", borderRadius: "8px", color: "hsl(220,20%,90%)" };

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState<string>("7days");
  const { data: analytics, isLoading: aLoading } = useQuery({ queryKey: ["adminAnalytics"], queryFn: adminApi.getAnalytics });
  const { data: users } = useQuery({ queryKey: ["adminUsers"], queryFn: usersApi.getAll });

  if (aLoading || !analytics) return <div className="space-y-6"><Skeleton className="h-72 bg-secondary rounded-xl" /><Skeleton className="h-72 bg-secondary rounded-xl" /></div>;

  const exportCSV = () => {
    if (!users) return;
    const headers = "Nom,Email,Rôle,Points,Streak,Modules Complétés\n";
    const rows = users.map((u) => `${u.name},${u.email},${u.role},${u.totalPoints},${u.streak},"${u.completedModules.join(";")}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "learnops_stats.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-44 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="7days">7 derniers jours</SelectItem><SelectItem value="30days">30 derniers jours</SelectItem><SelectItem value="all">Tout le temps</SelectItem></SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Exporter CSV</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Complétion des leçons</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={completionDataMap[dateRange]}>
                <defs><linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" /><XAxis dataKey="day" stroke="hsl(220,10%,55%)" fontSize={12} /><YAxis stroke="hsl(220,10%,55%)" fontSize={12} /><Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="completions" stroke="hsl(239,84%,67%)" fill="url(#colorComp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-accent" /> Scores moyens par quiz</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.quizScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" /><XAxis dataKey="name" stroke="hsl(220,10%,55%)" fontSize={11} /><YAxis stroke="hsl(220,10%,55%)" fontSize={12} domain={[0, 100]} unit="%" /><Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score" fill="hsl(187,85%,53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Leçons les plus populaires</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-border/50 hover:bg-transparent"><TableHead>Leçon</TableHead><TableHead>Module</TableHead><TableHead className="text-right">Complétions</TableHead></TableRow></TableHeader>
              <TableBody>
                {analytics.topLessons.map((l, i) => (
                  <TableRow key={i} className="border-border/50"><TableCell className="font-medium">{l.title}</TableCell><TableCell><Badge variant="outline" className="text-xs">{l.module}</Badge></TableCell><TableCell className="text-right">{l.completions}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" /> Utilisateurs les plus actifs</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow className="border-border/50 hover:bg-transparent"><TableHead>#</TableHead><TableHead>Nom</TableHead><TableHead className="text-right">Points</TableHead></TableRow></TableHeader>
              <TableBody>
                {analytics.activeUsers.map((u, i) => (
                  <TableRow key={u.id} className="border-border/50">
                    <TableCell><span className={`font-bold ${i === 0 ? "text-warning" : "text-muted-foreground"}`}>{i + 1}</span></TableCell>
                    <TableCell className="font-medium flex items-center gap-2"><div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ backgroundColor: u.avatarColor }}>{u.avatar}</div>{u.name}</TableCell>
                    <TableCell className="text-right font-bold">{u.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
