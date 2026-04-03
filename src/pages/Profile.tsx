import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/stores/dataStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { StatCardSkeleton } from "@/components/LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Trophy, Flame, Calendar, BookOpen, Star, Shield, Lock, AlertTriangle, Save, CheckCircle } from "lucide-react";
import { getModuleQuizBestScore } from "@/data/quizData";
import { toast } from "sonner";

const Profile = () => {
  const { currentUser, updateCurrentUser, resetProgress, logout } = useAuth();
  const { modules } = useDataStore();
  const loading = useDelayedLoading(300);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  if (!currentUser) return null;

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsEstimate = currentUser.completedModules.reduce((acc, modId) => {
    const mod = modules.find((m) => m.id === modId);
    return acc + (mod ? mod.lessons.length : 0);
  }, 0);

  const bestQuizScore = modules.reduce((best, m) => {
    const b = getModuleQuizBestScore(m.id);
    return b && b.percentage > best ? b.percentage : best;
  }, 0);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    updateCurrentUser({ name: name.trim(), email: email.trim() });
    toast.success("Profil mis à jour !");
  };

  const handleChangePassword = () => {
    if (!oldPw || !newPw || !confirmPw) {
      toast.error("Remplissez tous les champs");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPw.length < 6) {
      toast.error("Minimum 6 caractères");
      return;
    }
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Mot de passe modifié avec succès !");
  };

  const handleReset = () => {
    resetProgress();
    setResetOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6 page-transition">
        {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6 page-transition">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="h-8 w-8 text-primary" /> Mon Profil
      </h1>

      {/* Avatar + Info Card */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="h-24 w-24 rounded-full gradient-primary-btn flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {currentUser.avatar}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nom complet</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Rôle</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-secondary/50 border border-border text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="capitalize">{currentUser.role}</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Membre depuis</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-secondary/50 border border-border text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  {currentUser.joinedAt}
                </div>
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full gradient-primary-btn text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-secondary/30">
              <Trophy className="h-5 w-5 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{currentUser.totalPoints}</p>
              <p className="text-[10px] text-muted-foreground">Points totaux</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{currentUser.completedModules.length}/{modules.length}</p>
              <p className="text-[10px] text-muted-foreground">Modules</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <CheckCircle className="h-5 w-5 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{completedLessonsEstimate}/{totalLessons}</p>
              <p className="text-[10px] text-muted-foreground">Leçons</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <Star className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-lg font-bold">{bestQuizScore}%</p>
              <p className="text-[10px] text-muted-foreground">Meilleur quiz</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Changer le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Ancien mot de passe" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="bg-secondary border-border" />
          <Input placeholder="Nouveau mot de passe" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="bg-secondary border-border" />
          <Input placeholder="Confirmer le mot de passe" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="bg-secondary border-border" />
          <Button onClick={handleChangePassword} variant="outline" className="w-full">
            Changer le mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="glass-card border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Réinitialiser votre progression supprimera tous vos modules complétés, points et tentatives de quiz.
          </p>
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setResetOpen(true)}
          >
            Réinitialiser ma progression
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser la progression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous vos points, modules complétés et tentatives de quiz seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
