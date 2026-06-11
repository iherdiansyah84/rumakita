import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "primary" | "accent" | "secondary" | "purple";
}

export function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-teal-100 text-teal-600",
    accent: "bg-orange-100 text-orange-600",
    secondary: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-foreground mb-2">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium ${trend.isPositive ? "text-teal-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
