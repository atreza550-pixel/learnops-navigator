import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as modulesApi from "@/api/modulesApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, PlayCircle, CheckCircle, BookOpen } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { StaggerContainer, StaggerItem } from "@/components/AnimatedComponents";

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const { data: mod, isLoading } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => modulesApi.getById(moduleId!),
    enabled: !!moduleId,
  });

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-6 w-24 bg-secondary" />
          <Skeleton className="h-10 w-64 bg-secondary" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 bg-secondary rounded-xl" />)}
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!mod) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
          <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <p className="text-muted-foreground">Module introuvable.</p>
        </div>
      </AnimatedPage>
    );
  }

  const allComplete = mod.progress === 100;

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
        <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: mod.color + "20" }}>
            {mod.icon === "GitBranch" ? "🔀" : mod.icon === "Workflow" ? "⚙️" : mod.icon === "Container" ? "🐳" : "🧠"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{mod.title}</h1>
            <p className="text-sm text-muted-foreground">{mod.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={mod.progress} className="flex-1 h-2" />
          <span className="text-sm font-medium text-muted-foreground">{mod.progress}%</span>
        </div>

        <StaggerContainer className="space-y-3">
          {mod.lessons.map((lesson) => {
            const isCompleted = mod.completedLessons.includes(lesson.id);
            return (
              <StaggerItem key={lesson.id}>
                <Link to={`/modules/${moduleId}/lessons/${lesson.id}`}>
                  <Card className={`glass-card hover:border-primary/50 transition-colors cursor-pointer hover-scale ${isCompleted ? "border-accent/30" : ""}`}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {isCompleted ? <CheckCircle className="h-5 w-5 text-accent" /> : <PlayCircle className="h-5 w-5 text-muted-foreground" />}
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.duration} · {lesson.type === "video" ? "📹 Vidéo" : "📖 Lecture"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <Link to={`/quiz/${moduleId}`}>
          <Button className={`w-full mt-4 ${allComplete ? "gradient-primary-btn text-primary-foreground" : ""}`} disabled={!allComplete} variant={allComplete ? "default" : "outline"}>
            <BookOpen className="mr-2 h-4 w-4" /> {allComplete ? "Passer le Quiz" : `Terminez toutes les leçons (${mod.completedLessons.length}/${mod.totalLessons})`}
          </Button>
        </Link>
      </div>
    </AnimatedPage>
  );
};

export default ModuleDetail;
