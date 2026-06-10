"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Target, Users, User, LogOut, Bell } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role !== "admin") return;
    const poll = async () => {
      try {
        const r = await fetch(`http://localhost:8002/api/admin/pending-responses`, {
          headers: { "X-User-Id": String(currentUser.id) }
        });
        const d = await r.json();
        setPendingCount(d.pending || 0);
      } catch (e) {}
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const isAdmin = currentUser?.role === "admin";

  const menuItems = [
    { icon: LayoutDashboard, label: "Cockpit", href: "/dashboard" },
    { icon: Target, label: "Leads Elite", href: "/leads-quentes" },
    ...(isAdmin ? [
      { icon: Users, label: "Usuários", href: "/usuarios" },
    ] : []),
    { icon: User, label: "Minha Conta", href: "/minha-conta" }
  ];

  return (
    <aside className="hidden lg:flex w-72 h-screen bg-slate-950/40 backdrop-blur-xl border-r border-white/5 flex-col p-6 fixed left-0 top-0 z-50">
      <Link href="/" className="flex items-center justify-center mb-12">
        <img 
          src="/AquivosOtto/Logo/Img001 logo Otto.png" 
          alt="Logo Otto Pinturas" 
          className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
        />
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

      {isAdmin && pendingCount > 0 && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-400/20 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
            <Bell size={14} />
            {pendingCount} lead{pendingCount > 1 ? 's' : ''} com nota pendente
          </div>
          <p className="text-[9px] text-rose-400/60 mt-1">Os vendedores aguardam sua resposta</p>
        </div>
      )}

      <div className="mt-auto space-y-4 pt-6 border-t border-yellow-400/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span className="font-bold text-sm tracking-tight">Sair</span>
        </button>
        
      </div>
    </aside>
  );
}
