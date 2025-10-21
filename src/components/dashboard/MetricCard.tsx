import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  showEye?: boolean;
}

export function MetricCard({ title, value, showEye = true }: MetricCardProps) {
  return (
    <Card className="p-4 bg-gradient-card border-primary/20 shadow-card hover:shadow-glow transition-all">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        {showEye && <Eye className="w-3 h-3 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </Card>
  );
}
