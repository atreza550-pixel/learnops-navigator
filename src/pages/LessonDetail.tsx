import { useParams, Link } from "react-router-dom";
import { useDataStore } from "@/stores/dataStore";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Video, FileText } from "lucide-react";
import LessonNotes from "@/components/LessonNotes";
import AnimatedPage from "@/components/AnimatedPage";

const LessonDetail = () => {
  const { moduleId, lessonId } = useParams();
  const { modules } = useDataStore();

  const mod = modules.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
        <Link to={`/modules/${moduleId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au module
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
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
                  <p className="text-muted-foreground leading-relaxed">
                    {lesson?.content || "Contenu de la leçon..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Notes */}
          <div className="space-y-4">
            <LessonNotes lessonId={`${moduleId}_${lessonId}`} />

            {/* Module info */}
            {mod && (
              <Card className="glass-card">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {mod.icon} {mod.title}
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
