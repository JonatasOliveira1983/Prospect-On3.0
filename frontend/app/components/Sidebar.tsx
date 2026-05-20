"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map as MapIcon, Database, Clock, Settings, Target, Upload, ScanSearch } from "lucide-react";
import UsageIndicator from "./UsageIndicator";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Cockpit", href: "/dashboard" },
    { icon: ScanSearch, label: "Prospecção", href: "/prospeccao" },
    { icon: Target, label: "Leads Elite", href: "/leads-quentes" },
    { icon: MapIcon, label: "Mapa Radar", href: "/mapa-radar" },
    { icon: Database, label: "Base Leads", href: "/relatorios" },
    { icon: Upload, label: "Importar Leads", href: "/importar" },
    { icon: Clock, label: "Atividades", href: "/comissoes" },
    { icon: Settings, label: "Ajustes", href: "/configuracoes" },
  ];


  return (
    <aside className="hidden lg:flex w-72 h-screen bg-slate-950/40 backdrop-blur-xl border-r border-white/5 flex-col p-6 fixed left-0 top-0 z-50">
      <Link href="/" className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)]">
          <Target className="text-slate-900" size={24} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tighter text-white leading-none">PROSPECT-ON</h1>
          <span className="text-[10px] font-bold text-yellow-400 tracking-[0.2em]">SNIPER v3.0</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={i}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20" 
                  : "text-slate-400 hover:bg-yellow-400/5 hover:text-yellow-400"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-slate-900" : "group-hover:text-yellow-400"} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-yellow-400/10">
        <UsageIndicator />
      </div>
    </aside>
  );
}
