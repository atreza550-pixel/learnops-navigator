import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, Star, Clock, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import { useAuth } from "@/contexts/AuthContext";
import * as marketplaceApi from "@/api/marketplaceApi";
import type { DBMarketplaceCourse } from "@/db/database";

const icons = ["Server", "Cloud", "BarChart", "GitMerge", "Activity", "Brain", "Shield", "Zap"];
const iconEmojis: Record<string, string> = { Server: "🖥️", Cloud: "☁️", BarChart: "📊", GitMerge: "🔀", Activity: "📈", Brain: "🧠", Shield: "🛡️", Zap: "⚡" };
const colors = ["#6366f1", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ef4444"];

const CreateCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);

  const { data: existing } = useQuery({
    queryKey: ["course-edit", id],
    queryFn: () => marketplaceApi.getCourseById(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    category: existing?.category || "DevOps",
    level: existing?.level || "Débutant",
    price: existing?.price || 0,
    originalPrice: existing?.originalPrice || 0,
    duration: existing?.duration || "4h",
    icon: existing?.icon || "Server",
    color: existing?.color || "#6366f1",
    highlights: existing?.highlights || ["", "", "", ""],
    lessons: Array.from({ length: existing?.lessonsCount || 0 }, (_, i) => ({
      title: `Leçon ${i + 1}`, type: "video" as const, duration: "20 min"
    })),
  });

  // Sync form with existing data when it loads
  useState(() => {
    if (existing) {
      setForm(f => ({ ...f, title: existing.title, description: existing.description, category: existing.category, level: existing.level, price: existing.price, originalPrice: existing.originalPrice, duration: existing.duration, icon: existing.icon, color: existing.color, highlights: existing.highlights }));
    }
  });

  const update = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const createMut = useMutation({
    mutationFn: (status: "published" | "draft") => {
      const data = {
        instructorId: currentUser!.id,
        title: form.title, description: form.description,
        thumbnail: null, color: form.color, icon: form.icon,
        price: form.price, originalPrice: form.originalPrice,
        currency: "TND", category: form.category, level: form.level,
        duration: form.duration, lessonsCount: form.lessons.length,
        tags: form.title.toLowerCase().split(" ").slice(0, 4),
        status, highlights: form.highlights.filter(Boolean),
      };
      return id ? marketplaceApi.updateCourse(id, data) : marketplaceApi.createCourse(data as any);
    },
    onSuccess: (_, status) => {
      toast.success(status === "published" ? "Cours publié !" : "Brouillon enregistré !");
      navigate("/instructor/courses");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AnimatedPage>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
        <h1 className="text-2xl font-bold text-foreground">{id ? "Modifier le cours" : "Créer un nouveau cours"}</h1>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
            </div>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {step === 1 ? "Informations" : step === 2 ? "Contenu" : "Révision"}
          </span>
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Titre</label>
                <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Ex: Kubernetes Avancé" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea value={form.description} onChange={e => update("description", e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Catégorie</label>
                  <Select value={form.category} onValueChange={v => update("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="DevOps">DevOps</SelectItem><SelectItem value="MLOps">MLOps</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Niveau</label>
                  <Select value={form.level} onValueChange={v => update("level", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Prix (TND)</label><Input type="number" value={form.price} onChange={e => update("price", +e.target.value)} /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Prix original</label><Input type="number" value={form.originalPrice} onChange={e => update("originalPrice", +e.target.value)} /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Durée</label><Input value={form.duration} onChange={e => update("duration", e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Icône</label>
                <div className="flex gap-2 flex-wrap">{icons.map(ic => (
                  <button key={ic} onClick={() => update("icon", ic)} className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg transition-all ${form.icon === ic ? "border-primary bg-primary/10" : "border-border"}`}>
                    {iconEmojis[ic]}
                  </button>
                ))}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Couleur</label>
                <div className="flex gap-2">{colors.map(c => (
                  <button key={c} onClick={() => update("color", c)} className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}</div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Leçons</label>
                {form.lessons.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={l.title} onChange={e => { const lessons = [...form.lessons]; lessons[i] = { ...l, title: e.target.value }; update("lessons", lessons); }} className="flex-1" />
                    <Select value={l.type} onValueChange={v => { const lessons = [...form.lessons]; lessons[i] = { ...l, type: v as any }; update("lessons", lessons); }}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="video">Vidéo</SelectItem><SelectItem value="reading">Lecture</SelectItem></SelectContent>
                    </Select>
                    <Input value={l.duration} onChange={e => { const lessons = [...form.lessons]; lessons[i] = { ...l, duration: e.target.value }; update("lessons", lessons); }} className="w-24" />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => update("lessons", form.lessons.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => update("lessons", [...form.lessons, { title: `Leçon ${form.lessons.length + 1}`, type: "video", duration: "20 min" }])}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une leçon
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ce que vous apprendrez (4 points)</label>
                {form.highlights.map((h, i) => (
                  <Input key={i} value={h} onChange={e => { const hl = [...form.highlights]; hl[i] = e.target.value; update("highlights", hl); }} placeholder={`Point ${i + 1}`} />
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Aperçu du cours</h3>
              <div className="bg-secondary/30 rounded-xl overflow-hidden border border-border">
                <div className="h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: form.color + "20" }}>{iconEmojis[form.icon]}</div>
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-foreground">{form.title || "Sans titre"}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{form.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{form.level}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{form.duration}</span>
                    <span className="text-xs text-muted-foreground">{form.lessons.length} leçons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{form.price} TND</span>
                    <span className="text-xs text-muted-foreground line-through">{form.originalPrice} TND</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}><ArrowLeft className="h-4 w-4 mr-1" /> Précédent</Button>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)}><ArrowRight className="h-4 w-4 mr-1" /> Suivant</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => createMut.mutate("draft")} disabled={createMut.isPending}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Brouillon
              </Button>
              <Button onClick={() => createMut.mutate("published")} disabled={createMut.isPending || !form.title}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Publier
              </Button>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CreateCourse;
