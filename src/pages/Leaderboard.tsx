import { useQuery } from "@tanstack/react-query";
import * as usersApi from "@/api/usersApi";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Crown, Medal, Flame, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, CountUp } from "@/components/AnimatedComponents";
import AnimatedPage from "@/components/AnimatedPage";

const Leaderboard = () => {
  const { currentUser } = useAuth();
  const { data: ranked, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: usersApi.getLeaderboard,
  });

  if (isLoading || !ranked) {
    return (
      <AnimatedPage>
        <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 bg-secondary rounded-xl" />)}
        </div>
      </AnimatedPage>
    );
  }

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const podiumColors = ["text-warning", "text-muted-foreground", "text-orange-600"];
  const podiumBg = ["from-yellow-500/10 to-yellow-600/5", "from-gray-400/10 to-gray-500/5", "from-orange-500/10 to-orange-600/5"];
  const podiumIcons = [Crown, Medal, Medal];
  const podiumHeights = ["h-32", "h-24", "h-20"];

  return (
    <AnimatedPage>
      <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Trophy className="h-8 w-8 text-warning" /> Classement</h1>

        <div className="flex items-end justify-center gap-4">
          {[1, 0, 2].map((idx) => {
            const user = podium[idx];
            if (!user) return null;
            const Icon = podiumIcons[idx];
            return (
              <motion.div key={user.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.15, type: "spring", stiffness: 200 }}
                className={`flex flex-col items-center gap-2 ${idx === 0 ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                <Icon className={`h-6 w-6 ${podiumColors[idx]}`} />
                <div className="h-14 w-14 rounded-full flex items-center justify-center font-bold text-primary-foreground" style={{ backgroundColor: user.avatarColor }}>
                  {user.avatar}
                </div>
                <p className="font-semibold text-sm text-center">{user.name.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground"><CountUp end={user.totalPoints} /> pts</p>
                <div className={`w-24 ${podiumHeights[idx]} rounded-t-lg bg-gradient-to-b ${podiumBg[idx]} border border-border/30 flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${podiumColors[idx]}`}>{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Streak</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Modules</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <StaggerContainer staggerDelay={0.05}>
                  {rest.map((user, i) => (
                    <StaggerItem key={user.id}>
                      <TableRow className={`border-border/50 ${currentUser?.id === user.id ? "bg-primary/5" : ""}`}>
                        <TableCell className="font-bold text-muted-foreground">{i + 4}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ backgroundColor: user.avatarColor }}>
                              {user.avatar}
                            </div>
                            <span className="font-medium text-sm">{user.name}</span>
                            {currentUser?.id === user.id && <Badge variant="outline" className="text-[10px] py-0">Vous</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold"><CountUp end={user.totalPoints} /></TableCell>
                        <TableCell className="text-right hidden sm:table-cell"><span className="flex items-center justify-end gap-1 text-sm"><Flame className="h-3 w-3 text-warning" /> {user.streak}</span></TableCell>
                        <TableCell className="text-right hidden sm:table-cell"><span className="flex items-center justify-end gap-1 text-sm"><BookOpen className="h-3 w-3 text-primary" /> {user.completedModules.length}</span></TableCell>
                      </TableRow>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default Leaderboard;
