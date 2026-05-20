"use client";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Target, Users, User, Settings } from "lucide-react";

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      setCurrentUser(user);

      // Proteção contra vendedor comum acessando áreas admin
      if ((pathname === "/usuarios" || pathname === "/configuracoes") && user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setAuthorized(true);
    } catch (e) {
      console.error(e);
      router.push("/");
    }
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="bg-otto-blue min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-sm tracking-widest text-yellow-400 uppercase">Autenticando...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="bg-otto-blue text-white min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 min-h-screen p-4 lg:p-10 lg:ml-72 pb-24 lg:pb-10 transition-all duration-300">
          {children}
        </main>
      </div>
      
      {/* Mobile Nav - Limpa e Responsiva com base no Perfil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-yellow-400/20 z-50 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <Link href="/dashboard" className={`p-2 transition-all flex flex-col items-center justify-center ${pathname === "/dashboard" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Cockpit</span>
        </Link>
        <Link href="/leads-quentes" className={`p-2 transition-all flex flex-col items-center justify-center ${pathname === "/leads-quentes" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
          <Target size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Elite</span>
        </Link>
        {isAdmin && (
          <>
            <Link href="/usuarios" className={`p-2 transition-all flex flex-col items-center justify-center ${pathname === "/usuarios" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
              <Users size={20} />
              <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Vendedores</span>
            </Link>
            <Link href="/configuracoes" className={`p-2 transition-all flex flex-col items-center justify-center ${pathname === "/configuracoes" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
              <Settings size={20} />
              <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Painel</span>
            </Link>
          </>
        )}
        <Link href="/minha-conta" className={`p-2 transition-all flex flex-col items-center justify-center ${pathname === "/minha-conta" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
          <User size={20} />
          <span className="text-[8px] font-black mt-0.5 tracking-tighter uppercase">Perfil</span>
        </Link>
      </div>
    </div>
  );
}
