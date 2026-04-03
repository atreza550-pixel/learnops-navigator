import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const StatCardSkeleton = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-24 bg-secondary" />
    </CardHeader>
    <CardContent className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded bg-secondary" />
      <Skeleton className="h-8 w-16 bg-secondary" />
    </CardContent>
  </Card>
);

export const ChartSkeleton = () => (
  <Card className="glass-card">
    <CardHeader>
      <Skeleton className="h-5 w-48 bg-secondary" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full bg-secondary rounded" />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card className="glass-card">
    <CardContent className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-secondary rounded" />
      ))}
    </CardContent>
  </Card>
);
