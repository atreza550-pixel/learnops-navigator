import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const AdminModules = () => (
  <Card className="glass-card">
    <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Gestion des modules</CardTitle></CardHeader>
    <CardContent><p className="text-muted-foreground">Créer, modifier et supprimer des modules — à implémenter.</p></CardContent>
  </Card>
);

export default AdminModules;
