import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import * as marketplaceApi from "@/api/marketplaceApi";

const InstructorCourses = () => {
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => marketplaceApi.getMyCoursesAsInstructor(),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      marketplaceApi.updateCourse(id, { status: status === "published" ? "draft" : "published" } as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }); toast.success("Statut mis à jour"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => marketplaceApi.deleteCourse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }); toast.success("Cours supprimé"); },
  });

  return (
    <AnimatedPage>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Mes Cours</h1>
          <Button asChild><Link to="/instructor/courses/new"><Plus className="h-4 w-4 mr-1" /> Créer un cours</Link></Button>
        </div>

        {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> :
          !courses?.length ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé de cours</p>
              <Button asChild><Link to="/instructor/courses/new">Créer mon premier cours</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: c.color + "20" }}>
                      {c.icon === "Server" ? "🖥️" : c.icon === "Cloud" ? "☁️" : c.icon === "BarChart" ? "📊" : c.icon === "GitMerge" ? "🔀" : "📈"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{c.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{c.studentsCount} étudiants</span>
                        <span>•</span>
                        <span>{c.price} TND</span>
                        <span>•</span>
                        <span>{c.rating}★</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === "published" ? "default" : "secondary"}>{c.status === "published" ? "Publié" : "Brouillon"}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => toggleMut.mutate({ id: c.id, status: c.status })}>
                      {c.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" asChild><Link to={`/instructor/courses/${c.id}`}><Edit className="h-4 w-4" /></Link></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Supprimer ce cours ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMut.mutate(c.id)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>
    </AnimatedPage>
  );
};

export default InstructorCourses;
