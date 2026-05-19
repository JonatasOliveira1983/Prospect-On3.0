import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { LayoutDashboard, Target, Map as MapIcon, Database, Clock, Settings } from "lucide-react";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-otto-blue text-white min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 min-h-screen p-4 lg:p-10 lg:ml-72 pb-24 lg:pb-10 transition-all duration-300">
          {children}
        </main>
      </div>
      
      {/* Mobile Nav - Fully Functional & Aesthetic (Sticky Bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-yellow-400/20 z-50 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <Link href="/dashboard" className="p-2 text-slate-400 hover:text-yellow-400 active:scale-90 transition-all flex flex-col items-center justify-center">
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Cockpit</span>
        </Link>
        <Link href="/leads-quentes" className="p-2 text-slate-400 hover:text-yellow-400 active:scale-90 transition-all flex flex-col items-center justify-center">
          <Target size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Elite</span>
        </Link>
        <Link href="/mapa-radar" className="p-2 text-slate-400 hover:text-yellow-400 active:scale-90 transition-all flex flex-col items-center justify-center">
          <MapIcon size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Radar</span>
        </Link>
        <Link href="/relatorios" className="p-2 text-slate-400 hover:text-yellow-400 active:scale-90 transition-all flex flex-col items-center justify-center">
          <Database size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Leads</span>
        </Link>
        <Link href="/comissoes" className="p-2 text-slate-400 hover:text-yellow-400 active:scale-90 transition-all flex flex-col items-center justify-center">
          <Clock size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Ativo</span>
        </Link>
        <Link href="/configuracoes" className="p-2 text-slate-400 hover:text-yellow-400 active:scale-90 transition-all flex flex-col items-center justify-center">
          <Settings size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Painel</span>
        </Link>
      </div>
    </div>
  );
}
