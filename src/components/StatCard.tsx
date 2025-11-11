import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "gold" | "success";
}

const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "border-primary/20 hover:shadow-[0_0_20px_rgba(0,86,255,0.2)]",
    gold: "border-gold/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]",
    success: "border-success/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]",
  };

  const iconStyles = {
    default: "text-primary",
    gold: "text-gold",
    success: "text-success",
  };

  return (
    <Card className={`p-5 border ${variantStyles[variant]} transition-all duration-300 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-secondary/50 ${iconStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
