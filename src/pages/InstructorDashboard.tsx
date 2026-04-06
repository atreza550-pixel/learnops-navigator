import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, BookOpen, Users, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AnimatedPage from "@/components/AnimatedPage";
import * as marketplaceApi from "@/api/marketplaceApi";

const InstructorDashboard = () => {
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => marketplaceApi.getMyCoursesAsInstructor(),
  });

  // Get stats for first course as demo
  const { data: stats } = useQuery({
    queryKey: ["course-stats", courses?.[0]?.id],
    queryFn: () => marketplaceApi.getCourseStats(courses![0].id),
    enabled: !!courses?.length,
  });

  const totalStudents = courses?.reduce((s, c) => s + c.studentsCount, 0) || 0;
  const avgRating = courses?.length ? (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(1) : "0";
  const publishedCount = courses?.filter(c => c.status === "published").length || 0;

  const statCards = [
    { label: "Total revenus", value: `${stats?.revenue || 0} TND`, icon: DollarSign, color: "text-emerald-500" },
    { label: "Cours publiés", value: publishedCount, icon: BookOpen, color: "text-primary" },
    { label: "Étudiants totaux", value: totalStudents, icon: Users, color: "text-sky-500" },
    { label: "Note moyenne", value: `${avgRating}★`, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> Espace Instructeur</h1>
          <Button asChild><Link to="/instructor/courses">Gérer mes cours</Link></Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{loadingCourses ? <Skeleton className="h-7 w-16" /> : s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart */}
        {stats && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Revenus mensuels (TND)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Courses performance */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border"><h2 className="font-semibold text-foreground">Performance des cours</h2></div>
          {loadingCourses ? <div className="p-4"><Skeleton className="h-32" /></div> : (
            <div className="divide-y divide-border">
              {courses?.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: c.color + "20" }}>
                      {c.icon === "Server" ? "🖥️" : c.icon === "Cloud" ? "☁️" : c.icon === "BarChart" ? "📊" : c.icon === "GitMerge" ? "🔀" : "📈"}
                    </div>
                    <div><p className="text-sm font-medium text-foreground">{c.title}</p><p className="text-xs text-muted-foreground">{c.studentsCount} étudiants</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{c.rating}★</span>
                    <Badge variant={c.status === "published" ? "default" : "secondary"}>{c.status === "published" ? "Publié" : "Brouillon"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default InstructorDashboard;
