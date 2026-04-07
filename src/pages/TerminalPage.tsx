import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as terminalApi from "@/api/terminalApi";
import Terminal from "@/components/terminal/Terminal";
import AnimatedPage from "@/components/AnimatedPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TerminalSquare, BookOpen, Clock, CheckCircle, ChevronRight, RotateCcw, Copy, Command } from "lucide-react";
import { toast } from "sonner";

const CHEAT_SHEET = [
  { category: "Système", commands: ["ls", "cd", "pwd", "mkdir", "touch", "cat", "echo", "clear", "whoami", "date"] },
  { category: "Git", commands: ["git init", "git add", "git commit", "git status", "git log", "git branch", "git checkout", "git merge", "git push"] },
  { category: "Docker", commands: ["docker images", "docker pull", "docker run", "docker ps", "docker stop", "docker build", "docker-compose up", "docker-compose down"] },
  { category: "MLflow", commands: ["mlflow ui", "mlflow experiments create", "mlflow experiments list", "mlflow run"] },
];

const difficultyColor: Record<string, string> = {
  "Débutant": "bg-green-500/20 text-green-400",
  "Intermédiaire": "bg-yellow-500/20 text-yellow-400",
  "Avancé": "bg-red-500/20 text-red-400",
};

const TerminalPage = () => {
  const [showCheatSheet, setShowCheatSheet] = useState(true);
  const [terminalKey, setTerminalKey] = useState(0);

  const { data: labs, isLoading: labsLoading } = useQuery({
    queryKey: ["terminal-labs"],
    queryFn: terminalApi.getLabs,
  });

  const { data: progress } = useQuery({
    queryKey: ["terminal-progress"],
    queryFn: terminalApi.getMyProgress,
  });

  const completedLabIds = new Set(progress?.map(p => p.labId) || []);

  const handleCopySession = () => {
    toast.success("Session copiée dans le presse-papier !");
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <TerminalSquare className="h-8 w-8 text-primary" />
              Terminal DevOps
            </h1>
            <p className="text-muted-foreground mt-1">Sandbox interactif — pratiquez en toute sécurité</p>
          </div>
        </div>

        <Tabs defaultValue="sandbox" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sandbox">Sandbox libre</TabsTrigger>
            <TabsTrigger value="labs">Labs guidés</TabsTrigger>
          </TabsList>

          <TabsContent value="sandbox" className="space-y-4">
            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="flex-1">
                <div className="flex gap-2 mb-3 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setTerminalKey(k => k + 1)}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Réinitialiser
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopySession}>
                    <Copy className="h-3 w-3 mr-1" /> Copier
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowCheatSheet(s => !s)} className="lg:hidden">
                    <Command className="h-3 w-3 mr-1" /> Commandes
                  </Button>
                </div>
                <Terminal key={terminalKey} height="65vh" />
              </div>

              {showCheatSheet && (
                <Card className="glass-card w-full lg:w-72 shrink-0">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Command className="h-4 w-4 text-primary" /> Commandes disponibles
                    </h3>
                    {CHEAT_SHEET.map(cat => (
                      <div key={cat.category}>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{cat.category}</p>
                        <div className="flex flex-wrap gap-1">
                          {cat.commands.map(cmd => (
                            <Badge
                              key={cmd}
                              variant="secondary"
                              className="text-[10px] cursor-pointer hover:bg-primary/20 transition-colors font-mono"
                            >
                              {cmd}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="labs" className="space-y-4">
            {labsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl bg-secondary" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labs?.map(lab => {
                  const completed = completedLabIds.has(lab.id);
                  return (
                    <Card key={lab.id} className="glass-card hover:border-primary/50 transition-colors group">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <TerminalSquare className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{lab.title}</h3>
                          </div>
                          {completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{lab.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={difficultyColor[lab.difficulty] || ""}>{lab.difficulty}</Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" /> {lab.estimatedTime}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" /> {lab.steps.length} étapes
                          </Badge>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {lab.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 mt-0.5 text-primary shrink-0" /> {obj}
                            </li>
                          ))}
                        </ul>
                        <Link to={`/terminal/lab/${lab.id}`}>
                          <Button className="w-full mt-2" variant={completed ? "outline" : "default"}>
                            {completed ? "Refaire le lab" : "Commencer le Lab"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
};

export default TerminalPage;
