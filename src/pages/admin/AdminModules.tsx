import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as modulesApi from "@/api/modulesApi";
import * as lessonsApiMod from "@/api/lessonsApi";
import type { DBLesson } from "@/db/database";
import type { ModuleWithProgress } from "@/api/modulesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, ChevronDown, GripVertical, BookOpen, Video, FileText, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PRESET_COLORS = ["#6366f1", "#22d3ee", "#a855f7", "#f59e0b", "#ef4444", "#10b981"];
const ICON_OPTIONS = ["GitBranch", "Workflow", "Container", "Brain", "Zap", "Target"];

const AdminModules = () => {
  const queryClient = useQueryClient();
  const { data: modules, isLoading } = useQuery({ queryKey: ["modules"], queryFn: modulesApi.getAll });

  const [moduleModal, setModuleModal] = useState<{ open: boolean; editing: ModuleWithProgress | null }>({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState<ModuleWithProgress | null>(null);
  const [expandedMod, setExpandedMod] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<{ moduleId: string; editing: DBLesson | null; open: boolean }>({ moduleId: "", editing: null, open: false });
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<{ moduleId: string; lesson: DBLesson } | null>(null);

  const [formData, setFormData] = useState({ title: "", description: "", difficulty: "Débutant", duration: "", color: "#6366f1", icon: "GitBranch", lessonCount: 0, order: 0 });
  const [lessonData, setLessonData] = useState({ title: "", type: "video" as "video" | "reading", duration: "", content: "" });

  const inv = () => queryClient.invalidateQueries({ queryKey: ["modules"] });

  const addModMutation = useMutation({
    mutationFn: () => modulesApi.create({ ...formData, id: "" }),
    onSuccess: () => { toast.success("Module ajouté"); setModuleModal({ open: false, editing: null }); inv(); },
  });

  const updateModMutation = useMutation({
    mutationFn: (id: string) => modulesApi.update(id, formData),
    onSuccess: () => { toast.success("Module mis à jour"); setModuleModal({ open: false, editing: null }); inv(); },
  });

  const deleteModMutation = useMutation({
    mutationFn: (id: string) => modulesApi.remove(id),
    onSuccess: () => { toast.success("Module supprimé"); setDeleteTarget(null); inv(); },
  });

  const addLessonMutation = useMutation({
    mutationFn: (moduleId: string) => lessonsApiMod.createLesson({ ...lessonData, id: "", moduleId, order: 999 }),
    onSuccess: () => { toast.success("Leçon ajoutée"); setLessonForm({ moduleId: "", editing: null, open: false }); inv(); },
  });

  const updateLessonMutation = useMutation({
    mutationFn: (args: { id: string }) => lessonsApiMod.updateLesson(args.id, lessonData),
    onSuccess: () => { toast.success("Leçon mise à jour"); setLessonForm({ moduleId: "", editing: null, open: false }); inv(); },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => lessonsApiMod.deleteLesson(id),
    onSuccess: () => { toast.success("Leçon supprimée"); setDeleteLessonTarget(null); inv(); },
  });

  const reorderMutation = useMutation({
    mutationFn: (args: { moduleId: string; from: number; to: number }) => lessonsApiMod.reorderLessons(args.moduleId, args.from, args.to),
    onSuccess: inv,
  });

  if (isLoading || !modules) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 bg-secondary rounded-xl" />)}</div>;

  const openAddModule = () => { setFormData({ title: "", description: "", difficulty: "Débutant", duration: "", color: "#6366f1", icon: "GitBranch", lessonCount: 0, order: modules.length + 1 }); setModuleModal({ open: true, editing: null }); };
  const openEditModule = (mod: ModuleWithProgress) => { setFormData({ title: mod.title, description: mod.description, difficulty: mod.difficulty, duration: mod.duration, color: mod.color, icon: mod.icon, lessonCount: mod.lessonCount, order: mod.order }); setModuleModal({ open: true, editing: mod }); };

  const handleSaveModule = () => {
    if (!formData.title || !formData.description) { toast.error("Titre et description requis"); return; }
    if (moduleModal.editing) updateModMutation.mutate(moduleModal.editing.id);
    else addModMutation.mutate();
  };

  const openAddLesson = (moduleId: string) => { setLessonData({ title: "", type: "video", duration: "", content: "" }); setLessonForm({ moduleId, editing: null, open: true }); };
  const openEditLesson = (moduleId: string, lesson: DBLesson) => { setLessonData({ title: lesson.title, type: lesson.type, duration: lesson.duration, content: lesson.content }); setLessonForm({ moduleId, editing: lesson, open: true }); };

  const handleSaveLesson = () => {
    if (!lessonData.title) { toast.error("Titre requis"); return; }
    if (lessonForm.editing) updateLessonMutation.mutate({ id: lessonForm.editing.id });
    else addLessonMutation.mutate(lessonForm.moduleId);
  };

  const iconEmoji = (icon: string) => icon === "GitBranch" ? "🔀" : icon === "Workflow" ? "⚙️" : icon === "Container" ? "🐳" : icon === "Brain" ? "🧠" : icon === "Zap" ? "⚡" : "🎯";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Modules ({modules.length})</h2>
        <Button onClick={openAddModule} className="gradient-primary-btn text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <Collapsible key={mod.id} open={expandedMod === mod.id} onOpenChange={(open) => setExpandedMod(open ? mod.id : null)}>
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2"><span className="text-2xl">{iconEmoji(mod.icon)}</span><div><CardTitle className="text-base">{mod.title}</CardTitle><p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p></div></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModule(mod)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(mod)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{mod.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs">{mod.duration}</Badge>
                  <Badge variant="outline" className="text-xs">{mod.lessons.length} leçons</Badge>
                  <div className="h-3 w-3 rounded-full ml-auto" style={{ backgroundColor: mod.color }} />
                </div>
              </CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full border-t border-border/50 rounded-none"><ChevronDown className={`h-4 w-4 mr-2 transition-transform ${expandedMod === mod.id ? "rotate-180" : ""}`} /> Gérer les leçons</Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-3 space-y-2">
                  {mod.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {lesson.type === "video" ? <Video className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-accent" />}
                      <span className="flex-1 truncate">{lesson.title}</span><span className="text-xs text-muted-foreground">{lesson.duration}</span>
                      <div className="flex gap-0.5">
                        {idx > 0 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => reorderMutation.mutate({ moduleId: mod.id, from: idx, to: idx - 1 })}><ArrowUp className="h-3 w-3" /></Button>}
                        {idx < mod.lessons.length - 1 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => reorderMutation.mutate({ moduleId: mod.id, from: idx, to: idx + 1 })}><ArrowDown className="h-3 w-3" /></Button>}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditLesson(mod.id, lesson as any)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteLessonTarget({ moduleId: mod.id, lesson: lesson as any })}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => openAddLesson(mod.id)}><Plus className="h-3 w-3 mr-1" /> Ajouter une leçon</Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Module modal */}
      <Dialog open={moduleModal.open} onOpenChange={(o) => setModuleModal({ ...moduleModal, open: o })}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>{moduleModal.editing ? "Modifier" : "Ajouter"} un module</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Titre" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-secondary border-border" />
            <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-secondary border-border" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent>
              </Select>
              <Input placeholder="Durée" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div><p className="text-sm text-muted-foreground mb-2">Couleur</p><div className="flex gap-2">{PRESET_COLORS.map((c) => <button key={c} onClick={() => setFormData({ ...formData, color: c })} className={`h-8 w-8 rounded-full border-2 transition-all ${formData.color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div></div>
            <div><p className="text-sm text-muted-foreground mb-2">Icône</p><div className="flex gap-2 flex-wrap">{ICON_OPTIONS.map((ic) => <button key={ic} onClick={() => setFormData({ ...formData, icon: ic })} className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg border transition-all ${formData.icon === ic ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}>{iconEmoji(ic)}</button>)}</div></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleModal({ open: false, editing: null })}>Annuler</Button>
            <Button onClick={handleSaveModule} className="gradient-primary-btn text-primary-foreground" disabled={addModMutation.isPending || updateModMutation.isPending}>
              {(addModMutation.isPending || updateModMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : moduleModal.editing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Supprimer le module</AlertDialogTitle><AlertDialogDescription>Supprimer «{deleteTarget?.title}» ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteTarget && deleteModMutation.mutate(deleteTarget.id)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={lessonForm.open} onOpenChange={(o) => setLessonForm({ ...lessonForm, open: o })}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>{lessonForm.editing ? "Modifier" : "Ajouter"} une leçon</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Titre" value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={lessonData.type} onValueChange={(v: "video" | "reading") => setLessonData({ ...lessonData, type: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="video">Vidéo</SelectItem><SelectItem value="reading">Lecture</SelectItem></SelectContent>
              </Select>
              <Input placeholder="Durée" value={lessonData.duration} onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })} className="bg-secondary border-border" />
            </div>
            <Textarea placeholder="Contenu" value={lessonData.content} onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })} className="bg-secondary border-border" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonForm({ moduleId: "", editing: null, open: false })}>Annuler</Button>
            <Button onClick={handleSaveLesson} className="gradient-primary-btn text-primary-foreground" disabled={addLessonMutation.isPending || updateLessonMutation.isPending}>
              {(addLessonMutation.isPending || updateLessonMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : lessonForm.editing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteLessonTarget} onOpenChange={() => setDeleteLessonTarget(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Supprimer la leçon</AlertDialogTitle><AlertDialogDescription>Supprimer «{deleteLessonTarget?.lesson.title}» ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteLessonTarget && deleteLessonMutation.mutate(deleteLessonTarget.lesson.id)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminModules;
