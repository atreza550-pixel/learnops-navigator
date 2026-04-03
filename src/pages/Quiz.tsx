import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const QUESTIONS = [
  { q: "Que signifie CI/CD ?", options: ["Continuous Integration / Continuous Deployment", "Code Integration / Code Delivery", "Central Intelligence / Core Data"], answer: 0 },
  { q: "Quel outil est utilisé pour la conteneurisation ?", options: ["Jenkins", "Docker", "Ansible"], answer: 1 },
  { q: "Kubernetes gère quoi ?", options: ["Les bases de données", "L'orchestration de conteneurs", "Le versioning de code"], answer: 1 },
];

const Quiz = () => {
  const { moduleId } = useParams();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === QUESTIONS[current].answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
        toast.success(`Quiz terminé ! Score: ${score + (idx === QUESTIONS[current].answer ? 1 : 0)}/${QUESTIONS.length}`);
      }
    }, 1000);
  };

  if (finished) {
    return (
      <div className="min-h-screen p-6 max-w-lg mx-auto flex items-center justify-center">
        <Card className="glass-card w-full text-center">
          <CardContent className="p-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-accent mx-auto" />
            <h2 className="text-2xl font-bold">Quiz Terminé !</h2>
            <p className="text-4xl font-bold text-primary">{score}/{QUESTIONS.length}</p>
            <Link to="/home"><Button className="gradient-primary-btn text-primary-foreground">Retour à l'accueil</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto space-y-6">
      <Link to={`/modules/${moduleId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> Quiz</h1>
        <span className="text-sm text-muted-foreground">{current + 1}/{QUESTIONS.length}</span>
      </div>
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">{q.q}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = "w-full justify-start text-left";
            if (selected !== null) {
              if (i === q.answer) cls += " border-accent text-accent";
              else if (i === selected) cls += " border-destructive text-destructive";
            }
            return (
              <Button key={i} variant="outline" className={cls} onClick={() => selected === null && handleAnswer(i)} disabled={selected !== null}>
                {selected !== null && i === q.answer && <CheckCircle className="mr-2 h-4 w-4" />}
                {selected !== null && i === selected && i !== q.answer && <XCircle className="mr-2 h-4 w-4" />}
                {opt}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
