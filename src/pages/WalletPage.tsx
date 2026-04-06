import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";
import * as marketplaceApi from "@/api/marketplaceApi";

const amounts = [50, 100, 200, 500];

const WalletPage = () => {
  const queryClient = useQueryClient();
  const [showRecharge, setShowRecharge] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => marketplaceApi.getWallet(),
  });

  const rechargeMut = useMutation({
    mutationFn: () => marketplaceApi.rechargeWallet(selectedAmount),
    onSuccess: () => {
      toast.success(`Rechargement de ${selectedAmount} TND réussi !`);
      setShowRecharge(false);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AnimatedPage>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" /> Mon Portefeuille
        </h1>

        {isLoading ? <Skeleton className="h-40 rounded-xl" /> : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 p-6">
            <p className="text-sm text-muted-foreground">Solde actuel</p>
            <p className="text-4xl font-bold text-foreground mt-1">{wallet?.balance.toFixed(2)} <span className="text-lg text-muted-foreground">TND</span></p>
            <Button className="mt-4" onClick={() => setShowRecharge(true)}><Plus className="h-4 w-4 mr-1" /> Recharger</Button>
          </motion.div>
        )}

        {/* Transactions */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border"><h2 className="font-semibold text-foreground">Historique des transactions</h2></div>
          {isLoading ? <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> :
            !wallet?.transactions.length ? (
              <div className="p-8 text-center text-muted-foreground">Aucune transaction</div>
            ) : (
              <div className="divide-y divide-border">
                {[...wallet.transactions].reverse().map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {t.type === "credit" ? <ArrowUpCircle className="h-5 w-5 text-emerald-500" /> : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
                      <div>
                        <p className="text-sm text-foreground">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.type === "credit" ? "default" : "destructive"} className={t.type === "credit" ? "bg-emerald-500/20 text-emerald-400" : ""}>
                        {t.type === "credit" ? "Crédit" : "Débit"}
                      </Badge>
                      <span className={`font-semibold ${t.type === "credit" ? "text-emerald-400" : "text-destructive"}`}>
                        {t.type === "credit" ? "+" : "-"}{t.amount.toFixed(2)} TND
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
        </div>

        {/* Recharge Modal */}
        <Dialog open={showRecharge} onOpenChange={setShowRecharge}>
          <DialogContent>
            <DialogHeader><DialogTitle>Recharger le portefeuille</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {amounts.map(a => (
                  <button key={a} onClick={() => setSelectedAmount(a)}
                    className={`p-4 rounded-lg border text-center font-semibold transition-all ${selectedAmount === a ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    {a} TND
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={() => rechargeMut.mutate()} disabled={rechargeMut.isPending}>
                {rechargeMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Traitement en cours...</> : `Recharger ${selectedAmount} TND`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
};

export default WalletPage;
