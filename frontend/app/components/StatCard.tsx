import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "green" | "yellow" | "red";
}

export default function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
  const colors = {
    blue: "text-blue-400 bg-blue-400/10 neon-blue border-blue-400/20",
    green: "text-green-400 bg-green-400/10 neon-green border-green-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className={`p-6 rounded-2xl glass border flex flex-col gap-3 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <Icon size={24} />
        {trend && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/5">{trend}</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-muted">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
