import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6 page-transition">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mt-2">Page introuvable</p>
          <p className="text-sm text-muted-foreground mt-1">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        </div>
        <Link to="/home">
          <Button className="gradient-primary-btn text-primary-foreground">
            <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
