import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as terminalApi from "@/api/terminalApi";
import Terminal from "@/components/terminal/Terminal";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Lightbulb, ArrowLeft, ChevronRight, Trophy } from "lucide-react";
import { checkLabStep } from "@/terminal/engine";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const TerminalLabPage = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [labComplete, setLabComplete] = useState(false);
  const startTime = useRef(Date.now());

  const { data: lab, isLoading } = useQuery({
    queryKey: ["terminal-lab", labId],
    queryFn: () => terminalApi.getLabById(labId!),
    enabled: !!labId,
  });

  const completeMutation = useMutation({
    mutationFn: () => terminalApi.completeLab(labId!, Math.floor((Date.now() - startTime.current) / 1000)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminal-progress"] });
    },
  });

  const handleCommand = useCallback((cmd: string) => {
    if (!lab || stepCompleted || currentStep >= lab.steps.length) return;

    const step = lab.steps[currentStep];
    if (checkLabStep(cmd, step.expectedCommands)) {
      setStepCompleted(true);
      setCompletedSteps(prev => new Set([...prev, currentStep]));

      // Auto-advance after 1.5s
      setTimeout(() => {
        if (currentStep + 1 >= lab.steps.length) {
          // Lab complete!
          setLabComplete(true);
          completeMutation.mutate();
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
          setCurrentStep(prev => prev + 1);
          setStepCompleted(false);
          setShowHint(false);
        }
      }, 1500);
    }
  }, [lab, currentStep, stepCompleted, completeMutation]);

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48 bg-secondary" />
          <div className="flex gap-4">
            <Skeleton className="h-[70vh] flex-1 bg-secondary rounded-xl" />
            <Skeleton className="h-[70vh] w-80 bg-secondary rounded-xl" />
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!lab) return null;

  const welcomeMsg = `Bienvenue dans le lab: ${lab.title}\nObjectif: ${lab.description}\nTapez 'help' pour voir les commandes disponibles.\nBonne chance ! 🚀\n`;

  return (
    <AnimatedPage>
      <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/terminal")} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux labs
        </Button>

        <div className="flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 180px)" }}>
          {/* Left panel - Instructions */}
          <Card className="glass-card lg:w-[40%] overflow-y-auto">
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold">{lab.title}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{lab.difficulty}</Badge>
                  <Badge variant="outline">{lab.estimatedTime}</Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Progression: {completedSteps.size}/{lab.steps.length}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedSteps.size / lab.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {lab.steps.map((step, i) => {
                  const done = completedSteps.has(i);
                  const active = i === currentStep && !labComplete;
                  return (
                    <div
                      key={step.id}
                      className={`flex gap-3 p-3 rounded-lg transition-all ${
                        active ? "bg-primary/10 border border-primary/30" :
                        done ? "bg-green-500/5 border border-green-500/20" :
                        "border border-transparent opacity-50"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        done ? "bg-green-500 text-white" :
                        active ? "bg-primary text-primary-foreground" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${active ? "text-foreground" : ""}`}>{step.instruction}</p>
                        {active && stepCompleted && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 p-2 rounded bg-green-500/10 text-green-400 text-xs flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> {step.successMessage}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hint */}
              {!labComplete && currentStep < lab.steps.length && (
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)} className="text-yellow-400">
                    <Lightbulb className="h-4 w-4 mr-1" /> {showHint ? "Masquer l'indice" : "Afficher l'indice 💡"}
                  </Button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-mono"
                      >
                        💡 {lab.steps[currentStep].hint}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right panel - Terminal */}
          <div className="lg:w-[60%] flex flex-col">
            <Terminal height="100%" onCommand={handleCommand} welcomeMessage={welcomeMsg} className="flex-1" />
          </div>
        </div>

        {/* Lab complete dialog */}
        <Dialog open={labComplete} onOpenChange={setLabComplete}>
          <DialogContent className="text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold">Lab complété ! 🎉</h2>
            <p className="text-muted-foreground">{lab.title}</p>
            <div className="py-2">
              <Badge className="text-lg px-4 py-1 bg-primary/20 text-primary">+150 XP</Badge>
            </div>
            <Button onClick={() => navigate("/terminal")} className="w-full">
              Retour aux labs <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
};

export default TerminalLabPage;
