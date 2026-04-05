import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "@/api/usersApi";
import type { SafeUser } from "@/api/authApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Pencil, Trash2, Trophy, Flame, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["adminUsers"], queryFn: usersApi.getAll });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState<SafeUser | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<SafeUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SafeUser | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" as "student" | "admin" });

  const addMutation = useMutation({
    mutationFn: () => usersApi.create({ ...newUser, role: newUser.role }),
    onSuccess: () => { toast.success("Utilisateur ajouté"); setAddOpen(false); setNewUser({ name: "", email: "", password: "", role: "student" }); queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const editRoleMutation = useMutation({
    mutationFn: (u: SafeUser) => usersApi.update(u.id, { role: u.role === "admin" ? "student" : "admin" } as any),
    onSuccess: () => { toast.success("Rôle changé"); setEditRoleUser(null); queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => { toast.success("Utilisateur supprimé"); setDeleteTarget(null); queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); },
  });

  if (isLoading || !users) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 bg-secondary rounded-lg" />)}</div>;

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="student">Étudiant</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="instructor">Instructeur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gradient-primary-btn text-primary-foreground" onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Avatar</TableHead><TableHead>Nom</TableHead><TableHead className="hidden sm:table-cell">Email</TableHead><TableHead>Rôle</TableHead><TableHead className="hidden md:table-cell">Points</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((u) => (
              <TableRow key={u.id} className="border-border/50">
                <TableCell><div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: u.avatarColor }}>{u.avatar}</div></TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"} className={u.role === "admin" ? "gradient-primary-btn text-primary-foreground border-0" : ""}>{u.role}</Badge></TableCell>
                <TableCell className="hidden md:table-cell">{u.totalPoints}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewUser(u)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditRoleUser(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(u)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)} className={page === i + 1 ? "gradient-primary-btn text-primary-foreground" : ""}>{i + 1}</Button>
          ))}
        </div>
      )}

      {/* View */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>Détails</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-primary-foreground" style={{ backgroundColor: viewUser.avatarColor }}>{viewUser.avatar}</div>
                <div><h3 className="font-bold text-lg">{viewUser.name}</h3><p className="text-sm text-muted-foreground">{viewUser.email}</p><Badge className="mt-1">{viewUser.role}</Badge></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary"><Trophy className="h-5 w-5 mx-auto text-accent mb-1" /><p className="font-bold">{viewUser.totalPoints}</p><p className="text-xs text-muted-foreground">Points</p></div>
                <div className="p-3 rounded-lg bg-secondary"><Flame className="h-5 w-5 mx-auto text-warning mb-1" /><p className="font-bold">{viewUser.streak}</p><p className="text-xs text-muted-foreground">Streak</p></div>
                <div className="p-3 rounded-lg bg-secondary"><Calendar className="h-5 w-5 mx-auto text-primary mb-1" /><p className="font-bold text-sm">{viewUser.joinedAt}</p><p className="text-xs text-muted-foreground">Rejoint</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit role */}
      <AlertDialog open={!!editRoleUser} onOpenChange={() => setEditRoleUser(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Changer le rôle</AlertDialogTitle><AlertDialogDescription>Changer le rôle de {editRoleUser?.name} de {editRoleUser?.role} à {editRoleUser?.role === "admin" ? "student" : "admin"} ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => editRoleUser && editRoleMutation.mutate(editRoleUser)} className="gradient-primary-btn text-primary-foreground" disabled={editRoleMutation.isPending}>{editRoleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Supprimer</AlertDialogTitle><AlertDialogDescription>Supprimer {deleteTarget?.name} ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} className="bg-destructive text-destructive-foreground" disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-card border-border">
          <DialogHeader><DialogTitle>Ajouter un utilisateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nom" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="bg-secondary border-border" />
            <Input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-secondary border-border" />
            <Input placeholder="Mot de passe" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-secondary border-border" />
            <Select value={newUser.role} onValueChange={(v: "student" | "admin") => setNewUser({ ...newUser, role: v })}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="student">Étudiant</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button onClick={() => addMutation.mutate()} className="gradient-primary-btn text-primary-foreground" disabled={addMutation.isPending}>{addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
