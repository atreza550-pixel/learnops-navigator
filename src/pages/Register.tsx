import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Rocket, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (isAuthenticated) return <Navigate to="/home" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    const success = register(name, email, password);
    if (success) navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary-btn">
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="text-sm text-muted-foreground">Rejoignez LearnOps Journey</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 bg-secondary border-border" required />
            </div>
            <Button type="submit" className="w-full gradient-primary-btn text-primary-foreground font-semibold">
              S'inscrire
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
