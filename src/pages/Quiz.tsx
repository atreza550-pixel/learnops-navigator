import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Home, Trophy } from "lucide-react";
import { useDataStore } from "@/stores/dataStore";
import { useAuth } from "@/contexts/AuthContext";
import { getQuizByModuleId, saveQuizAttempt, type QuizData } from "@/data/quizData";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const Quiz = () => {
  const { moduleId } = useParams();
  const { modules } = useDataStore();
  const { currentUser, updateCurrentUser } = useAuth();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const mod = modules.find((m) => m.id === moduleId);

  useEffect(() => {
    if (moduleId) {
      const q = getQuizByModuleId(moduleId);
      setQuiz(q || null);
    }
  }, [moduleId]);

  if (!quiz || !mod) {
    return (
      <div className="min-h-screen p-6 max-w-lg mx-auto flex items-center justify-center page-transition">
        <Card className="glass-card w-full text-center">
          <CardContent className="p-8 space-y-4">
            <p className="text-muted-foreground">Quiz introuvable pour ce module.</p>
            <Link to="/home"><Button variant="outline">Retour</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const progressPercent = ((current + 1) / totalQuestions) * 100;

  const handleSelect = (idx: number) => {
    if (finished) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current < totalQuestions - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      // Finish quiz
      const score = newAnswers.reduce((acc, ans, i) => acc + (ans === quiz.questions[i].correctAnswer ? 1 : 0), 0);
      const percentage = Math.round((score / totalQuestions) * 100);
      const passed = percentage >= 70;

      saveQuizAttempt({
        moduleId: moduleId!,
        moduleName: mod.title,
        score,
        total: totalQuestions,
        percentage,
        passed,
        date: new Date().toISOString(),
        answers: newAnswers,
      });

      if (passed && currentUser && !currentUser.completedModules.includes(moduleId!)) {
        updateCurrentUser({
          completedModules: [...currentUser.completedModules, moduleId!],
          totalPoints: currentUser.totalPoints + percentage * 2,
        });
      }

      if (passed) {
        toast.success("Quiz réussi ! 🎉");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        toast.error("Quiz échoué. Réessayez !");
      }

      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  };

  // Results screen
  if (finished) {
    const score = answers.reduce((acc, ans, i) => acc + (ans === quiz.questions[i].correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6 page-transition">
        {/* Score circle */}
        <Card className="glass-card text-center">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-secondary" />
                <circle
                  cx="60" cy="60" r="54" fill="none" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className={passed ? "stroke-accent" : "stroke-destructive"}
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${passed ? "text-accent" : "text-destructive"}`}>
                  {percentage}%
                </span>
              </div>
            </div>

            <Badge className={`text-sm px-4 py-1 ${passed ? "bg-accent/20 text-accent border-accent/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
              {passed ? "Réussi ✓" : "Échoué ✗"}
            </Badge>

            {passed && (
              <div className="space-y-1">
                <Trophy className="h-8 w-8 text-accent mx-auto animate-pulse-glow" />
                <p className="text-lg font-bold">Félicitations ! Module complété !</p>
                <p className="text-sm text-muted-foreground">+{percentage * 2} points gagnés</p>
              </div>
            )}

            <p className="text-muted-foreground">{score}/{totalQuestions} bonnes réponses</p>

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
          <CardHeader>
            <CardTitle className="text-base">Révision des réponses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((q, i) => {
              const userAnswer = answers[i];
              const correct = userAnswer === q.correctAnswer;
              return (
                <div key={q.id} className="space-y-2 pb-4 border-b border-border/30 last:border-0">
                  <div className="flex items-start gap-2">
                    {correct
                      ? <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      : <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    }
                    <p className="font-medium text-sm">{i + 1}. {q.question}</p>
                  </div>
                  <div className="ml-7 space-y-1">
                    {q.options.map((opt, oi) => {
                      let cls = "text-xs px-3 py-1.5 rounded-md ";
                      if (oi === q.correctAnswer) {
                        cls += "bg-accent/10 text-accent border border-accent/30";
                      } else if (oi === userAnswer && !correct) {
                        cls += "bg-destructive/10 text-destructive border border-destructive/30";
                      } else {
                        cls += "text-muted-foreground";
                      }
                      return (
                        <div key={oi} className={cls}>
                          {oi === q.correctAnswer && "✓ "}{oi === userAnswer && oi !== q.correctAnswer && "✗ "}{opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  const q = quiz.questions[current];

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6 page-transition">
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left p-4 rounded-lg border transition-all text-sm ${
                selected === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/60"
              }`}
            >
              <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold mr-3 ${
                selected === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={handleNext}
        disabled={selected === null}
        className="w-full gradient-primary-btn text-primary-foreground disabled:opacity-50"
      >
        {current < totalQuestions - 1 ? (
          <>Question suivante <ArrowRight className="ml-2 h-4 w-4" /></>
        ) : (
          <>Terminer le Quiz <CheckCircle className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </div>
  );
};

export default Quiz;
