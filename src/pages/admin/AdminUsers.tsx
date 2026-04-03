import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const AdminUsers = () => (
  <Card className="glass-card">
    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Gestion des utilisateurs</CardTitle></CardHeader>
    <CardContent><p className="text-muted-foreground">Liste des utilisateurs et gestion des rôles — à implémenter.</p></CardContent>
  </Card>
);

export default AdminUsers;
