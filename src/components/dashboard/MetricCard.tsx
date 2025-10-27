import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  showEye?: boolean;
}

export function MetricCard({ title, value, showEye = true }: MetricCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-card to-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>{title}</span>
          {showEye && (
            <Eye className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" style={{ color: 'var(--subtext)' }} />
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{value}</p>
      </div>
    </div>
  );
}
