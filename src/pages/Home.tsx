import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, Flame, Star, ArrowRight } from "lucide-react";

const MODULES = [
  { id: "mod1", title: "Introduction à DevOps", description: "CI/CD, Culture DevOps, Outils essentiels", lessons: 5, icon: "🚀" },
  { id: "mod2", title: "Conteneurs & Docker", description: "Dockerfile, Docker Compose, Registry", lessons: 6, icon: "🐳" },
  { id: "mod3", title: "Kubernetes", description: "Pods, Services, Deployments, Helm", lessons: 8, icon: "☸️" },
  { id: "mod4", title: "MLOps Fondamentaux", description: "ML Pipeline, MLflow, Model Registry", lessons: 7, icon: "🤖" },
];

const Home = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">{currentUser.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="h-8 w-8 text-orange-400" />
            <div>
              <p className="text-2xl font-bold">{currentUser.streak}</p>
              <p className="text-xs text-muted-foreground">Jours de suite</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <Star className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold">{currentUser.completedModules.length}/{MODULES.length}</p>
              <p className="text-xs text-muted-foreground">Modules complétés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((mod) => {
            const completed = currentUser.completedModules.includes(mod.id);
            return (
              <Card key={mod.id} className="glass-card hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{mod.icon} {mod.title}</span>
                    {completed && <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">Complété</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{mod.lessons} leçons</span>
                    <Link to={`/modules/${mod.id}`}>
                      <Button size="sm" variant={completed ? "outline" : "default"} className={!completed ? "gradient-primary-btn text-primary-foreground" : ""}>
                        {completed ? "Revoir" : "Commencer"} <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
