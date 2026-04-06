import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ShoppingBag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedPage from "@/components/AnimatedPage";
import * as marketplaceApi from "@/api/marketplaceApi";

const MyCourses = () => {
  const { data: purchases, isLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: () => marketplaceApi.getMyPurchases(),
  });

  return (
    <AnimatedPage>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" /> Mes Cours
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : !purchases?.length ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Vous n'avez pas encore acheté de cours</p>
            <Button asChild><Link to="/marketplace">Explorer la Marketplace</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchases.map((p, i) => p.course && (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="h-20 flex items-center justify-center text-3xl" style={{ backgroundColor: p.course.color + "20" }}>
                    {p.course.icon === "Server" ? "🖥️" : p.course.icon === "Cloud" ? "☁️" : p.course.icon === "BarChart" ? "📊" : p.course.icon === "GitMerge" ? "🔀" : "📈"}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground">{p.course.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {p.course.duration}
                      <span>•</span>
                      <span>{p.course.lessonsCount} leçons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Acheté le {p.date}</Badge>
                      <Button size="sm" asChild><Link to={`/marketplace/${p.courseId}`}>Continuer →</Link></Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default MyCourses;
