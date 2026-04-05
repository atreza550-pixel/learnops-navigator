import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as lessonsApi from "@/api/lessonsApi";
import * as modulesApi from "@/api/modulesApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Loader2 } from "lucide-react";
import LessonNotes from "@/components/LessonNotes";
import AnimatedPage from "@/components/AnimatedPage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LessonDetail = () => {
  const { moduleId, lessonId } = useParams();
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: mod } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => modulesApi.getById(moduleId!),
    enabled: !!moduleId,
  });

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonsApi.getById(lessonId!),
    enabled: !!lessonId,
  });

  const completeMutation = useMutation({
    mutationFn: () => lessonsApi.complete(lessonId!),
    onSuccess: (result) => {
      toast.success(`Leçon complétée ! +${result.pointsEarned} pts`);
      if (result.badgesUnlocked.length > 0) {
        toast.success(`Badge débloqué : ${result.badgesUnlocked.join(", ")} !`, { icon: "🏅" });
      }
      queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      refreshUser();
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32 bg-secondary" />
          <Skeleton className="h-64 bg-secondary rounded-xl" />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
        <Link to={`/modules/${moduleId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au module
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  {lesson?.type === "video" ? <Video className="h-6 w-6 text-primary" /> : <FileText className="h-6 w-6 text-accent" />}
                  <h1 className="text-2xl font-bold">{lesson?.title || `Leçon ${lessonId}`}</h1>
                </div>
                {lesson?.duration && <p className="text-sm text-muted-foreground">{lesson.type === "video" ? "📹 Vidéo" : "📖 Lecture"} · {lesson.duration}</p>}
                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">{lesson?.type === "video" ? "📹 Contenu vidéo ici" : "📖 Contenu de lecture"}</p>
                </div>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{lesson?.content || "Contenu de la leçon..."}</p>
                </div>

                {/* Complete button */}
                {lesson && !lesson.completed && (
                  <Button
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                    className="w-full gradient-primary-btn text-primary-foreground"
                  >
                    {completeMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : <><CheckCircle className="mr-2 h-4 w-4" /> Marquer comme terminé</>}
                  </Button>
                )}
                {lesson?.completed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10 text-accent">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Leçon complétée ✓</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <LessonNotes lessonId={`${moduleId}_${lessonId}`} />
            {mod && (
              <Card className="glass-card">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> {mod.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{mod.lessons.length} leçons · {mod.duration}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default LessonDetail;
