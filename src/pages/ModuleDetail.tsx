import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle, CheckCircle } from "lucide-react";

const LESSONS: Record<string, { id: string; title: string; duration: string }[]> = {
  mod1: [
    { id: "l1", title: "Qu'est-ce que DevOps ?", duration: "15 min" },
    { id: "l2", title: "Culture et principes", duration: "20 min" },
    { id: "l3", title: "CI/CD Pipeline", duration: "25 min" },
    { id: "l4", title: "Outils essentiels", duration: "20 min" },
    { id: "l5", title: "Mise en pratique", duration: "30 min" },
  ],
  mod2: [
    { id: "l1", title: "Introduction à Docker", duration: "15 min" },
    { id: "l2", title: "Dockerfile", duration: "20 min" },
    { id: "l3", title: "Docker Compose", duration: "25 min" },
  ],
};

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const lessons = LESSONS[moduleId || ""] || LESSONS.mod1;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
      <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="text-2xl font-bold">Module: {moduleId}</h1>
      <div className="space-y-3">
        {lessons.map((lesson, i) => (
          <Link key={lesson.id} to={`/modules/${moduleId}/lessons/${lesson.id}`}>
            <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {i < 2 ? <CheckCircle className="h-5 w-5 text-accent" /> : <PlayCircle className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Link to={`/quiz/${moduleId}`}>
        <Button className="w-full gradient-primary-btn text-primary-foreground mt-4">Passer le Quiz</Button>
      </Link>
    </div>
  );
};

export default ModuleDetail;
