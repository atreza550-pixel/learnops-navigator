import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Users, BookOpen, CheckCircle, Lock, ArrowLeft, CreditCard, Wallet, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import { useAuth } from "@/contexts/AuthContext";
import * as marketplaceApi from "@/api/marketplaceApi";
import confetti from "canvas-confetti";

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ discount: number; finalPrice: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [payMethod, setPayMethod] = useState("card");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => marketplaceApi.getCourseById(courseId!),
    enabled: !!courseId,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => marketplaceApi.getWallet(),
  });

  const applyCouponMut = useMutation({
    mutationFn: () => marketplaceApi.applyCoupon(couponCode, courseId!),
    onSuccess: (r) => { setCouponResult(r); setCouponError(""); toast.success(`Coupon appliqué ! -${r.discount} TND`); },
    onError: (e: any) => { setCouponError(e.message); setCouponResult(null); },
  });

  const purchaseMut = useMutation({
    mutationFn: () => marketplaceApi.purchase(courseId!, payMethod, couponResult ? couponCode : undefined),
    onSuccess: () => {
      setPurchaseSuccess(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reviewMut = useMutation({
    mutationFn: () => marketplaceApi.addReview(courseId!, reviewRating, reviewComment),
    onSuccess: () => {
      toast.success("Avis publié !");
      setShowReviewForm(false);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <AnimatedPage><div className="max-w-5xl mx-auto px-4 py-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /><Skeleton className="h-40" /></div></AnimatedPage>;
  if (!course) return <AnimatedPage><div className="text-center py-20 text-muted-foreground">Cours introuvable</div></AnimatedPage>;

  const finalPrice = couponResult ? couponResult.finalPrice : course.price;
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);
  const hasReviewed = course.reviews.some(r => r.userId === currentUser?.id);

  const ratingBreakdown = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: course.reviews.filter(r => r.rating === s).length,
    pct: course.reviews.length > 0 ? Math.round(course.reviews.filter(r => r.rating === s).length / course.reviews.length * 100) : 0,
  }));

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour au Marketplace
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              {course.instructor && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: course.instructor.avatarColor }}>{course.instructor.avatar}</div>
                  <span className="text-sm text-muted-foreground">{course.instructor.name}</span>
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(course.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />)} <span className="ml-1">{course.rating}</span> ({course.reviewsCount} avis)</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.studentsCount} étudiants</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
              </div>
              <div className="flex gap-2 mt-3">{course.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
              <p className="text-muted-foreground mt-4">{course.description}</p>
            </div>

            {/* Highlights */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-3">Ce que vous apprendrez</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span className="text-sm text-muted-foreground">{h}</span></div>
                ))}
              </div>
            </div>

            {/* Content accordion */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-3">Contenu du cours ({course.lessonsCount} leçons)</h2>
              <Accordion type="single" collapsible>
                {Array.from({ length: course.lessonsCount }).map((_, i) => (
                  <AccordionItem key={i} value={`l${i}`}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        {i < 2 ? <BookOpen className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                        <span>Leçon {i + 1}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {i < 2 ? "Contenu de la leçon accessible après achat." : "🔒 Contenu verrouillé — Achetez le cours pour y accéder."}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="font-semibold text-foreground">Avis ({course.reviews.length})</h2>
              <div className="flex items-start gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">{course.rating}</div>
                  <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(course.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />)}</div>
                </div>
                <div className="flex-1 space-y-1">
                  {ratingBreakdown.map(r => (
                    <div key={r.stars} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{r.stars}★</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{ width: `${r.pct}%` }} /></div>
                      <span className="w-8 text-muted-foreground">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {course.reviews.slice(0, 3).map(r => {
                const user = { avatar: r.userId.slice(0, 2).toUpperCase() };
                return (
                  <div key={r.id} className="border-t border-border pt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{user.avatar}</div>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />)}</div>
                      <span className="text-[10px] text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                );
              })}

              {course.isPurchased && !hasReviewed && (
                <>
                  {showReviewForm ? (
                    <div className="border-t border-border pt-3 space-y-3">
                      <div className="flex gap-1">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setReviewRating(s)}><Star className={`h-5 w-5 ${s <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} /></button>)}</div>
                      <Textarea placeholder="Votre avis..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending || !reviewComment.trim()}>
                          {reviewMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Publier
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>Laisser un avis</Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT - Purchase card */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-4 bg-card rounded-xl border border-border overflow-hidden">
              <div className="h-32 flex items-center justify-center text-5xl" style={{ backgroundColor: course.color + "20" }}>
                {course.icon === "Server" ? "🖥️" : course.icon === "Cloud" ? "☁️" : course.icon === "BarChart" ? "📊" : course.icon === "GitMerge" ? "🔀" : "📈"}
              </div>
              <div className="p-4 space-y-4">
                {course.isPurchased ? (
                  <>
                    <Badge className="w-full justify-center bg-emerald-500/20 text-emerald-400 border-emerald-500/30 py-2">✓ Cours acheté</Badge>
                    <Button className="w-full" asChild><Link to="/my-courses">Accéder au cours →</Link></Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{finalPrice} TND</span>
                      {couponResult ? <span className="text-sm text-muted-foreground line-through">{course.price} TND</span> : null}
                      <span className="text-sm text-muted-foreground line-through">{course.originalPrice} TND</span>
                      <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
                    </div>

                    {/* Coupon */}
                    <div className="flex gap-2">
                      <Input placeholder="Code coupon" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        className={couponError ? "border-destructive animate-shake" : ""} />
                      <Button variant="outline" size="sm" onClick={() => applyCouponMut.mutate()} disabled={!couponCode || applyCouponMut.isPending}>
                        {applyCouponMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                    {couponResult && <p className="text-xs text-emerald-400">✓ -{couponResult.discount} TND</p>}

                    <Button className="w-full" size="lg" onClick={() => { setShowPurchaseModal(true); setPurchaseSuccess(false); }}>
                      Acheter maintenant
                    </Button>

                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Accès à vie</div>
                      <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Certificat inclus</div>
                      <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Remboursement 7j</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{purchaseSuccess ? "🎉 Cours acheté !" : "Confirmer l'achat"}</DialogTitle></DialogHeader>
          <AnimatePresence mode="wait">
            {purchaseSuccess ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                <div className="text-5xl">🎉</div>
                <p className="text-foreground font-semibold">{course.title}</p>
                <p className="text-sm text-muted-foreground">Vous pouvez maintenant accéder au contenu complet du cours.</p>
                <Button onClick={() => setShowPurchaseModal(false)}>Accéder au cours →</Button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cours</span><span className="text-foreground">{course.title}</span></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-muted-foreground">Prix</span><span className="font-bold text-primary">{finalPrice} TND</span></div>
                  {couponResult && <div className="flex justify-between text-xs mt-1"><span className="text-muted-foreground">Coupon</span><span className="text-emerald-400">-{couponResult.discount} TND</span></div>}
                </div>
                <Tabs value={payMethod} onValueChange={setPayMethod}>
                  <TabsList className="w-full">
                    <TabsTrigger value="card" className="flex-1"><CreditCard className="h-4 w-4 mr-1" /> Carte</TabsTrigger>
                    <TabsTrigger value="wallet" className="flex-1"><Wallet className="h-4 w-4 mr-1" /> Wallet ({wallet?.balance ?? 0} TND)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="space-y-3 mt-3">
                    <Input placeholder="4242 4242 4242 4242" />
                    <div className="flex gap-2"><Input placeholder="MM/AA" /><Input placeholder="CVV" /></div>
                  </TabsContent>
                  <TabsContent value="wallet" className="mt-3">
                    <div className="bg-secondary/30 rounded-lg p-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Solde actuel</span><span>{wallet?.balance ?? 0} TND</span></div>
                      <div className="flex justify-between mt-1"><span className="text-muted-foreground">Après achat</span><span className={`font-bold ${(wallet?.balance ?? 0) < finalPrice ? "text-destructive" : "text-emerald-400"}`}>{Math.round(((wallet?.balance ?? 0) - finalPrice) * 100) / 100} TND</span></div>
                    </div>
                  </TabsContent>
                </Tabs>
                <Button className="w-full" onClick={() => purchaseMut.mutate()} disabled={purchaseMut.isPending}>
                  {purchaseMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Traitement...</> : `Confirmer (${finalPrice} TND)`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default CourseDetail;
