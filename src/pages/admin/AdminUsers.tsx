import { useState } from "react";
import { useDataStore, type UserWithPassword } from "@/stores/dataStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { TableSkeleton } from "@/components/LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Pencil, Trash2, Users, Trophy, Flame, Calendar } from "lucide-react";
import { toast } from "sonner";

const AdminUsers = () => {
  const { users, addUser, updateUser, deleteUser } = useDataStore();
  const loading = useDelayedLoading(300);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState<UserWithPassword | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<UserWithPassword | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserWithPassword | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" as "student" | "admin" });

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (users.find((u) => u.email === newUser.email)) {
      toast.error("Cet email existe déjà");
      return;
    }
    addUser(newUser);
    toast.success("Utilisateur ajouté avec succès");
    setAddOpen(false);
    setNewUser({ name: "", email: "", password: "", role: "student" });
  };

  const handleEditRole = () => {
    if (!editRoleUser) return;
    const newRole = editRoleUser.role === "admin" ? "student" : "admin";
    updateUser(editRoleUser.id, { role: newRole });
    toast.success(`Rôle changé en ${newRole}`);
    setEditRoleUser(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    toast.success("Utilisateur supprimé");
    setDeleteTarget(null);
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-4 page-transition">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="student">Étudiant</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gradient-primary-btn text-primary-foreground" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Avatar</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="hidden md:table-cell">Modules</TableHead>
              <TableHead className="hidden md:table-cell">Points</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((u) => (
              <TableRow key={u.id} className="border-border/50">
                <TableCell>
                  <div className="h-8 w-8 rounded-full gradient-primary-btn flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {u.avatar}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className={u.role === "admin" ? "gradient-primary-btn text-primary-foreground border-0" : ""}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{u.completedModules.length}</TableCell>
                <TableCell className="hidden md:table-cell">{u.totalPoints}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewUser(u)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditRoleUser(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(u)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)} className={page === i + 1 ? "gradient-primary-btn text-primary-foreground" : ""}>
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* View user modal */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full gradient-primary-btn flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {viewUser.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{viewUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                  <Badge variant={viewUser.role === "admin" ? "default" : "secondary"} className="mt-1">
                    {viewUser.role}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <Trophy className="h-5 w-5 mx-auto text-accent mb-1" />
                  <p className="font-bold">{viewUser.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <Flame className="h-5 w-5 mx-auto text-warning mb-1" />
                  <p className="font-bold">{viewUser.streak}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="font-bold text-sm">{viewUser.joinedAt}</p>
                  <p className="text-xs text-muted-foreground">Rejoint</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Modules complétés ({viewUser.completedModules.length})</p>
                <div className="flex flex-wrap gap-2">
                  {viewUser.completedModules.map((m) => (
                    <Badge key={m} variant="outline">{m}</Badge>
                  ))}
                  {viewUser.completedModules.length === 0 && <p className="text-xs text-muted-foreground">Aucun module complété</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit role dialog */}
      <AlertDialog open={!!editRoleUser} onOpenChange={() => setEditRoleUser(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Changer le rôle de <strong>{editRoleUser?.name}</strong> de{" "}
              <strong>{editRoleUser?.role}</strong> à{" "}
              <strong>{editRoleUser?.role === "admin" ? "student" : "admin"}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditRole} className="gradient-primary-btn text-primary-foreground">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add user modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nom complet" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="bg-secondary border-border" />
            <Input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-secondary border-border" />
            <Input placeholder="Mot de passe" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-secondary border-border" />
            <Select value={newUser.role} onValueChange={(v: "student" | "admin") => setNewUser({ ...newUser, role: v })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Étudiant</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button onClick={handleAddUser} className="gradient-primary-btn text-primary-foreground">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
