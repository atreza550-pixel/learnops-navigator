import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Calendar, Trophy, Flame } from "lucide-react";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="h-8 w-8 text-primary" /> Profil
      </h1>
      <Card className="glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full gradient-primary-btn flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {currentUser.avatar}
          </div>
          <CardTitle className="text-xl mt-3">{currentUser.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          <span className="inline-block text-xs bg-primary/20 text-primary px-3 py-1 rounded-full mt-1 capitalize">{currentUser.role}</span>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div><Trophy className="h-5 w-5 mx-auto text-accent mb-1" /><p className="text-lg font-bold">{currentUser.totalPoints}</p><p className="text-xs text-muted-foreground">Points</p></div>
          <div><Flame className="h-5 w-5 mx-auto text-orange-400 mb-1" /><p className="text-lg font-bold">{currentUser.streak}</p><p className="text-xs text-muted-foreground">Streak</p></div>
          <div><Calendar className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-lg font-bold">{currentUser.joinedAt}</p><p className="text-xs text-muted-foreground">Rejoint</p></div>
        </CardContent>
      </Card>
      <Button onClick={handleLogout} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
        <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
      </Button>
    </div>
  );
};

export default Profile;
