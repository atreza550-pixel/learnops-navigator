import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Rocket, Mail, Lock } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/home" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = login(email, password);
    if (success) navigate("/home");
    setLoading(false);
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    const success = login(email, password);
    if (success) navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary-btn">
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">LearnOps Journey</h1>
          <p className="text-sm text-muted-foreground">Maîtrisez DevOps & MLOps, étape par étape</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
            <Button type="submit" className="w-full gradient-primary-btn text-primary-foreground font-semibold" disabled={loading}>
              Se connecter
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground">Connexion rapide</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => quickLogin("student@learnops.tn", "password123")}>
                🎓 Étudiant Demo
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => quickLogin("admin@learnops.tn", "admin123")}>
                🛡️ Admin Demo
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-accent hover:underline font-medium">
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
