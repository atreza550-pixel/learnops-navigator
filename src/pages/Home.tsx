import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/stores/dataStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { StatCardSkeleton } from "@/components/LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, Flame, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, CountUp } from "@/components/AnimatedComponents";
import AnimatedPage from "@/components/AnimatedPage";

const Home = () => {
  const { currentUser } = useAuth();
  const { modules } = useDataStore();
  const loading = useDelayedLoading(300);

  if (!currentUser) return null;

  if (loading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64 bg-secondary" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bonjour, {currentUser.name.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground">Continuez votre apprentissage</p>
          </div>
          <Link to="/profile">
            <div className="h-10 w-10 rounded-full gradient-primary-btn flex items-center justify-center text-sm font-bold text-primary-foreground">
              {currentUser.avatar}
            </div>
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Trophy, value: currentUser.totalPoints, label: "Points", color: "text-accent" },
            { icon: Flame, value: currentUser.streak, label: "Jours de suite", color: "text-warning" },
            { icon: Star, value: currentUser.completedModules.length, label: "Modules complétés", color: "text-primary", suffix: `/${modules.length}` },
          ].map((s, i) => (
            <StaggerItem key={i}>
              <Card className="glass-card hover-scale">
                <CardContent className="flex items-center gap-3 p-4">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold"><CountUp end={s.value} />{s.suffix || ""}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Modules
          </h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4" staggerDelay={0.1}>
            {modules.map((mod) => {
              const completed = currentUser.completedModules.includes(mod.id);
              return (
                <StaggerItem key={mod.id}>
                  <motion.div whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${mod.color}30` }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="glass-card hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>{mod.icon} {mod.title}</span>
                          {completed && <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">Complété</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{mod.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{mod.lessons.length} leçons</span>
                          <Link to={`/modules/${mod.id}`}>
                            <Button size="sm" variant={completed ? "outline" : "default"} className={!completed ? "gradient-primary-btn text-primary-foreground" : ""}>
                              {completed ? "Revoir" : "Commencer"} <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Home;
