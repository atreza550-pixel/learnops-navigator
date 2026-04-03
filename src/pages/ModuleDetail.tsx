import { useParams, Link } from "react-router-dom";
import { useDataStore } from "@/stores/dataStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, CheckCircle, BookOpen } from "lucide-react";

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const { modules } = useDataStore();
  const mod = modules.find((m) => m.id === moduleId);

  if (!mod) {
    return (
      <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6 page-transition">
        <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <p className="text-muted-foreground">Module introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6 page-transition">
      <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{mod.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{mod.title}</h1>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {mod.lessons.map((lesson, i) => (
          <Link key={lesson.id} to={`/modules/${moduleId}/lessons/${lesson.id}`}>
            <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer hover-scale">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {i < 2 ? <CheckCircle className="h-5 w-5 text-accent" /> : <PlayCircle className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration} · {lesson.type === "video" ? "Vidéo" : "Lecture"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Link to={`/quiz/${moduleId}`}>
        <Button className="w-full gradient-primary-btn text-primary-foreground mt-4">
          <BookOpen className="mr-2 h-4 w-4" /> Passer le Quiz
        </Button>
      </Link>
    </div>
  );
};

export default ModuleDetail;
