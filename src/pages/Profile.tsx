import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import * as usersApi from "@/api/usersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Trophy, Flame, Calendar, BookOpen, Star, Shield, Lock, AlertTriangle, Save, CheckCircle, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";

const Profile = () => {
  const { currentUser, updateCurrentUser, resetProgress, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () => usersApi.updateProfile({ name: name.trim(), email: email.trim() }),
    onSuccess: (user) => {
      if (user) updateCurrentUser(user);
      toast.success("Profil mis à jour !");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const passwordMutation = useMutation({
    mutationFn: () => usersApi.changePassword(),
    onSuccess: () => {
      setOldPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Mot de passe modifié avec succès !");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetProgress(),
    onSuccess: () => setResetOpen(false),
  });

  if (!currentUser) return null;

  const handleSaveProfile = () => {
    if (!name.trim()) { toast.error("Le nom ne peut pas être vide"); return; }
    saveMutation.mutate();
  };

  const handleChangePassword = () => {
    if (!oldPw || !newPw || !confirmPw) { toast.error("Remplissez tous les champs"); return; }
    if (newPw !== confirmPw) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (newPw.length < 6) { toast.error("Minimum 6 caractères"); return; }
    passwordMutation.mutate();
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><User className="h-8 w-8 text-primary" /> Mon Profil</h1>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold text-primary-foreground" style={{ backgroundColor: currentUser.avatarColor }}>
                {currentUser.avatar}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-muted-foreground mb-1 block">Nom complet</label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">Email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="bg-secondary border-border" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Rôle</label><div className="flex items-center gap-2 h-10 px-3 rounded-md bg-secondary/50 border border-border text-sm"><Shield className="h-4 w-4 text-primary" /><span className="capitalize">{currentUser.role}</span></div></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Membre depuis</label><div className="flex items-center gap-2 h-10 px-3 rounded-md bg-secondary/50 border border-border text-sm"><Calendar className="h-4 w-4 text-primary" />{currentUser.joinedAt}</div></div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saveMutation.isPending} className="w-full gradient-primary-btn text-primary-foreground">
                {saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : <><Save className="mr-2 h-4 w-4" /> Sauvegarder</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Statistiques</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary/30"><Trophy className="h-5 w-5 mx-auto text-accent mb-1" /><p className="text-lg font-bold">{currentUser.totalPoints}</p><p className="text-[10px] text-muted-foreground">Points</p></div>
              <div className="p-3 rounded-lg bg-secondary/30"><BookOpen className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{currentUser.completedModules.length}</p><p className="text-[10px] text-muted-foreground">Modules</p></div>
              <div className="p-3 rounded-lg bg-secondary/30"><Flame className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-lg font-bold">{currentUser.streak}</p><p className="text-[10px] text-muted-foreground">Streak</p></div>
              <div className="p-3 rounded-lg bg-secondary/30"><Star className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-lg font-bold">{currentUser.joinedAt}</p><p className="text-[10px] text-muted-foreground">Rejoint</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Changer le mot de passe</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Ancien mot de passe" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="bg-secondary border-border" />
            <Input placeholder="Nouveau mot de passe" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="bg-secondary border-border" />
            <Input placeholder="Confirmer le mot de passe" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="bg-secondary border-border" />
            <Button onClick={handleChangePassword} variant="outline" className="w-full" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Changer le mot de passe
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/30">
          <CardHeader><CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Zone de danger</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Réinitialiser votre progression supprimera tous vos modules complétés, points et tentatives de quiz.</p>
            <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setResetOpen(true)}>
              Réinitialiser ma progression
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogContent className="glass-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Réinitialiser la progression</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Réinitialiser
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AnimatedPage>
  );
};

export default Profile;
