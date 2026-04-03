import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";

const LessonDetail = () => {
  const { moduleId, lessonId } = useParams();

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
      <Link to={`/modules/${moduleId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour au module
      </Link>
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Leçon {lessonId}</h1>
          </div>
          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">📹 Contenu vidéo ici</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Contenu de la leçon pour le module <strong>{moduleId}</strong>, leçon <strong>{lessonId}</strong>. 
            Cette section contiendra le matériel pédagogique, les exemples de code et les exercices pratiques.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonDetail;
