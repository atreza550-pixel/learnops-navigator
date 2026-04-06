import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, DollarSign, CheckCircle, XCircle, Trash2, Plus, ToggleLeft, ToggleRight, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import * as marketplaceApi from "@/api/marketplaceApi";
import { db, DBUser } from "@/db/database";

const AdminMarketplace = () => {
  const queryClient = useQueryClient();
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: 0, type: "percent" as const, maxUses: 100, expiresAt: "2025-12-31" });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ["admin-marketplace"],
    queryFn: () => marketplaceApi.getAllCoursesAdmin(),
  });

  const { data: stats } = useQuery({
    queryKey: ["marketplace-stats"],
    queryFn: () => marketplaceApi.getMarketplaceStats(),
  });

  const { data: coupons, isLoading: loadingCoupons } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => marketplaceApi.getCoupons(),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => marketplaceApi.approveCourse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-marketplace"] }); toast.success("Cours approuvé"); },
  });

  const suspendMut = useMutation({
    mutationFn: (id: string) => marketplaceApi.suspendCourse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-marketplace"] }); toast.success("Cours suspendu"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => marketplaceApi.deleteCourse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-marketplace"] }); toast.success("Cours supprimé"); },
  });

  const toggleCouponMut = useMutation({
    mutationFn: (code: string) => marketplaceApi.toggleCoupon(code),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon mis à jour"); },
  });

  const createCouponMut = useMutation({
    mutationFn: () => marketplaceApi.createCoupon({ ...newCoupon, usedCount: 0, active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon créé");
      setShowCouponForm(false);
      setNewCoupon({ code: "", discount: 0, type: "percent", maxUses: 100, expiresAt: "2025-12-31" });
    },
  });

  const getInstructorName = (id: string) => db.findById<DBUser>("users", id)?.name || "Inconnu";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> Marketplace Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cours total", value: stats?.totalCourses || 0, icon: ShoppingBag },
          { label: "Publiés", value: stats?.publishedCourses || 0, icon: CheckCircle },
          { label: "Achats", value: stats?.totalPurchases || 0, icon: Tag },
          { label: "Revenus", value: `${stats?.totalRevenue || 0} TND`, icon: DollarSign },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="courses">
        <TabsList><TabsTrigger value="courses">Cours</TabsTrigger><TabsTrigger value="coupons">Coupons</TabsTrigger></TabsList>

        <TabsContent value="courses">
          {loadingCourses ? <Skeleton className="h-64" /> : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Cours</TableHead><TableHead>Instructeur</TableHead><TableHead>Prix</TableHead><TableHead>Étudiants</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {courses?.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{getInstructorName(c.instructorId)}</TableCell>
                      <TableCell>{c.price} TND</TableCell>
                      <TableCell>{c.studentsCount}</TableCell>
                      <TableCell><Badge variant={c.status === "published" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {c.status === "draft" ? (
                            <Button size="sm" variant="ghost" onClick={() => approveMut.mutate(c.id)}><CheckCircle className="h-4 w-4 text-emerald-500" /></Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => suspendMut.mutate(c.id)}><XCircle className="h-4 w-4 text-yellow-500" /></Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setShowCouponForm(true)}><Plus className="h-4 w-4 mr-1" /> Nouveau coupon</Button></div>
          {loadingCoupons ? <Skeleton className="h-40" /> : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Code</TableHead><TableHead>Réduction</TableHead><TableHead>Utilisations</TableHead><TableHead>Expire</TableHead><TableHead>Actif</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {coupons?.map(c => (
                    <TableRow key={c.code}>
                      <TableCell className="font-mono font-bold">{c.code}</TableCell>
                      <TableCell>{c.discount}{c.type === "percent" ? "%" : " TND"}</TableCell>
                      <TableCell>{c.usedCount}/{c.maxUses}</TableCell>
                      <TableCell>{c.expiresAt}</TableCell>
                      <TableCell><Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Actif" : "Inactif"}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => toggleCouponMut.mutate(c.code)}>
                          {c.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={showCouponForm} onOpenChange={setShowCouponForm}>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau coupon</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="CODE" value={newCoupon.code} onChange={e => setNewCoupon(c => ({ ...c, code: e.target.value.toUpperCase() }))} />
                <div className="flex gap-2">
                  <Input type="number" placeholder="Réduction" value={newCoupon.discount} onChange={e => setNewCoupon(c => ({ ...c, discount: +e.target.value }))} />
                  <Select value={newCoupon.type} onValueChange={v => setNewCoupon(c => ({ ...c, type: v as any }))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percent">%</SelectItem><SelectItem value="fixed">TND</SelectItem></SelectContent>
                  </Select>
                </div>
                <Input type="number" placeholder="Max utilisations" value={newCoupon.maxUses} onChange={e => setNewCoupon(c => ({ ...c, maxUses: +e.target.value }))} />
                <Input type="date" value={newCoupon.expiresAt} onChange={e => setNewCoupon(c => ({ ...c, expiresAt: e.target.value }))} />
                <Button className="w-full" onClick={() => createCouponMut.mutate()} disabled={!newCoupon.code || createCouponMut.isPending}>
                  {createCouponMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMarketplace;
