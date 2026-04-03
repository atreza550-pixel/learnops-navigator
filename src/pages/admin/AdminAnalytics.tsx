import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AdminAnalytics = () => (
  <Card className="glass-card">
    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Analytique</CardTitle></CardHeader>
    <CardContent><p className="text-muted-foreground">Statistiques et graphiques — à implémenter.</p></CardContent>
  </Card>
);

export default AdminAnalytics;
