import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import * as progressApi from "@/api/progressApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle, Star, Flame, Lock, Award, Download, Trophy, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StaggerContainer, StaggerItem, CountUp } from "@/components/AnimatedComponents";
import AnimatedPage from "@/components/AnimatedPage";
import StreakCalendar from "@/components/StreakCalendar";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { currentUser } = useAuth();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["myProgress"],
    queryFn: progressApi.getMyProgress,
    enabled: !!currentUser,
  });

  const { data: calendar } = useQuery({
    queryKey: ["activityCalendar"],
    queryFn: progressApi.getActivityCalendar,
    enabled: !!currentUser,
  });

  if (!currentUser) return null;

  if (isLoading || !progress) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-secondary rounded-xl" />)}
          </div>
          <Skeleton className="h-64 bg-secondary rounded-xl" />
        </div>
      </AnimatedPage>
    );
  }

  const progressData = progress.modules.map((m) => ({
    name: m.title.length > 12 ? m.title.slice(0, 12) + "…" : m.title,
    fullName: m.title,
    completion: m.progress,
    color: m.color,
  }));

  const handleDownloadCertificate = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,serif;text-align:center;padding:60px;background:linear-gradient(135deg,#1a1a2e,#0f0f1a);color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center}.cert{border:3px solid #6366f1;border-radius:20px;padding:60px;max-width:700px;background:rgba(26,26,46,0.9)}h1{color:#6366f1;font-size:2.5em}h2{color:#22d3ee;font-size:1.5em}.name{font-size:2em;color:#fff;margin:30px 0;font-style:italic}.date{color:#888;margin-top:30px}.badge{font-size:3em;margin:20px 0}</style></head><body><div class="cert"><div class="badge">🎓</div><h1>LearnOps Journey</h1><p>Certificat de complétion</p><h2>Décerné à</h2><div class="name">${currentUser.name}</div><p>Pour avoir complété avec succès tous les modules DevOps & MLOps</p><p class="date">${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `certificat_${currentUser.name.replace(/\s/g, "_")}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: "Modules complétés", val: currentUser.completedModules.length, suffix: `/${progress.modules.length}`, color: "text-primary" },
            { icon: CheckCircle, label: "Leçons terminées", val: progress.completedLessons, suffix: `/${progress.totalLessons}`, color: "text-accent" },
            { icon: Star, label: "Points totaux", val: progress.totalPoints, suffix: " pts", color: "text-warning" },
            { icon: Flame, label: "Streak actuel", val: progress.streak, suffix: " jours", color: "text-destructive" },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <Card className="glass-card hover-scale">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-normal">{s.label}</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-2xl font-bold"><CountUp end={s.val} />{s.suffix}</span>
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Streak Calendar */}
        {calendar && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Calendrier d'activité (30 jours)</CardTitle></CardHeader>
            <CardContent><StreakCalendar userId={currentUser.id} /></CardContent>
          </Card>
        )}

        {/* Progress per module */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Progression par Module</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,15%,20%)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="hsl(220,10%,55%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(220,10%,55%)" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(240,20%,11%)", border: "1px solid hsl(240,15%,20%)", borderRadius: "8px", color: "hsl(220,20%,90%)" }} formatter={(value: number, _: any, props: any) => [`${value}%`, props.payload.fullName]} />
                <Bar dataKey="completion" radius={[0, 4, 4, 0]} animationDuration={800}>{progressData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent quiz attempts */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Tentatives de quiz récentes</CardTitle></CardHeader>
          <CardContent>
            {progress.quizAttempts.length === 0 ? (
              <div className="p-6 text-center"><Award className="h-8 w-8 mx-auto mb-2 opacity-30 text-muted-foreground" /><p className="text-sm text-muted-foreground">Aucune tentative de quiz. Commencez un quiz !</p></div>
            ) : (
              <div className="space-y-3">
                {progress.quizAttempts.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 text-sm">
                    <div className={`h-2 w-2 rounded-full ${a.passed ? "bg-accent" : "bg-destructive"}`} />
                    <div className="flex-1"><span className="font-medium">{a.moduleId}</span><span className="text-muted-foreground ml-2">{a.score}/{a.total} ({a.percentage}%)</span></div>
                    <Badge variant="outline" className={a.passed ? "text-accent border-accent/30" : "text-destructive border-destructive/30"}>{a.passed ? "Réussi" : "Échoué"}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate */}
        <Card className={`glass-card ${progress.hasCertificate ? "border-accent/30" : ""}`}>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" /> Certificat</CardTitle></CardHeader>
          <CardContent>
            {progress.hasCertificate ? (
              <div className="text-center space-y-4">
                <div className="text-5xl">🎓</div><p className="font-bold text-lg">Certificat disponible !</p>
                <Button onClick={handleDownloadCertificate} className="gradient-primary-btn text-primary-foreground"><Download className="mr-2 h-4 w-4" /> Télécharger</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3"><Lock className="h-8 w-8 text-muted-foreground" /><div><p className="font-medium">Complétez tous les modules pour obtenir votre certificat</p><p className="text-xs text-muted-foreground">Terminez les modules et réussissez les quizzes</p></div></div>
                <div className="space-y-2 mt-4">
                  {progress.modules.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 text-sm">
                      {m.quizPassed ? <CheckCircle className="h-4 w-4 text-accent" /> : <div className="h-4 w-4 rounded-full border border-muted-foreground" />}
                      <span className={m.quizPassed ? "text-foreground" : "text-muted-foreground"}>{m.icon} {m.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{m.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-accent" /> Badges</CardTitle></CardHeader>
          <CardContent>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {progress.badges.map((badge) => (
                <StaggerItem key={badge.id}>
                  <div className={`p-4 rounded-xl text-center border transition-all ${badge.earned ? "border-accent/30 bg-accent/5" : "border-border/30 bg-secondary/20 opacity-50"}`}>
                    <div className="text-3xl mb-2">{badge.earned ? badge.icon : "🔒"}</div>
                    <p className="font-medium text-xs">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{badge.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;
