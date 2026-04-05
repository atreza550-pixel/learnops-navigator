import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as quizApiModule from "@/api/quizApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Home, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import AnimatedPage from "@/components/AnimatedPage";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/AnimatedComponents";

const Quiz = () => {
  const { moduleId } = useParams();
  const { refreshUser } = useAuth();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<quizApiModule.QuizResult | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", moduleId],
    queryFn: () => quizApiModule.getByModule(moduleId!),
    enabled: !!moduleId,
  });

  const submitMutation = useMutation({
    mutationFn: (args: { quizId: string; answers: number[] }) => quizApiModule.submit(args.quizId, args.answers),
    onSuccess: (res) => {
      setResult(res);
      if (res.passed) {
        toast.success("Quiz réussi ! 🎉");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        toast.error("Quiz échoué. Réessayez !");
      }
      refreshUser();
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32 bg-secondary" />
          <Skeleton className="h-64 bg-secondary rounded-xl" />
        </div>
      </AnimatedPage>
    );
  }

  if (!quiz) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-lg mx-auto flex items-center justify-center">
          <Card className="glass-card w-full text-center">
            <CardContent className="p-8 space-y-4">
              <p className="text-muted-foreground">Quiz introuvable pour ce module.</p>
              <Link to="/home"><Button variant="outline">Retour</Button></Link>
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    );
  }

  const totalQuestions = quiz.questions.length;
  const progressPercent = ((current + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current < totalQuestions - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      submitMutation.mutate({ quizId: quiz.id, answers: newAnswers });
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setResult(null);
  };

  // Results screen
  if (result) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
          <Card className="glass-card text-center">
            <CardContent className="p-8 space-y-4">
              <div className="mx-auto relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-secondary" />
                  <motion.circle
                    cx="60" cy="60" r="54" fill="none" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeLinecap="round"
                    className={result.passed ? "stroke-accent" : "stroke-destructive"}
                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - result.percentage / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${result.passed ? "text-accent" : "text-destructive"}`}>
                    <CountUp end={result.percentage} duration={1000} />%
                  </span>
                </div>
              </div>

              <Badge className={`text-sm px-4 py-1 ${result.passed ? "bg-accent/20 text-accent border-accent/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
                {result.passed ? "Réussi ✓" : "Échoué ✗"}
              </Badge>

              {result.passed && (
                <div className="space-y-1">
                  <Trophy className="h-8 w-8 text-accent mx-auto" />
                  <p className="text-lg font-bold">Félicitations ! Module complété !</p>
                  <p className="text-sm text-muted-foreground">+{result.pointsEarned} points gagnés</p>
                </div>
              )}

              <p className="text-muted-foreground">{result.score}/{result.total} bonnes réponses</p>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Recommencer
                </Button>
                <Link to="/home">
                  <Button className="gradient-primary-btn text-primary-foreground">
                    <Home className="mr-2 h-4 w-4" /> Retour aux modules
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Review */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Révision des réponses</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {quiz.questions.map((q, i) => {
                const userAnswer = answers[i];
                const correct = userAnswer === result.correctAnswers[i];
                return (
                  <div key={q.id} className="space-y-2 pb-4 border-b border-border/30 last:border-0">
                    <div className="flex items-start gap-2">
                      {correct ? <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />}
                      <p className="font-medium text-sm">{i + 1}. {q.question}</p>
                    </div>
                    <div className="ml-7 space-y-1">
                      {q.options.map((opt, oi) => {
                        let cls = "text-xs px-3 py-1.5 rounded-md ";
                        if (oi === result.correctAnswers[i]) cls += "bg-accent/10 text-accent border border-accent/30";
                        else if (oi === userAnswer && !correct) cls += "bg-destructive/10 text-destructive border border-destructive/30";
                        else cls += "text-muted-foreground";
                        return <div key={oi} className={cls}>{oi === result.correctAnswers[i] && "✓ "}{oi === userAnswer && oi !== result.correctAnswers[i] && "✗ "}{opt}</div>;
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    );
  }

  // Quiz in progress
  const q = quiz.questions[current];

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
        <Link to={`/modules/${moduleId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au module
        </Link>

        <div>
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground font-medium">Question {current + 1}/{totalQuestions}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left p-4 rounded-lg border transition-all text-sm ${
                      selected === i
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/60"
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold mr-3 ${
                      selected === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={handleNext}
          disabled={selected === null || submitMutation.isPending}
          className="w-full gradient-primary-btn text-primary-foreground disabled:opacity-50"
        >
          {submitMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Évaluation en cours...</>
          ) : current < totalQuestions - 1 ? (
            <>Question suivante <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Terminer le Quiz <CheckCircle className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </AnimatedPage>
  );
};

export default Quiz;
