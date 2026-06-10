"use client";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Target, Users, User, FileText, LogOut } from "lucide-react";

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

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <div className="bg-otto-blue text-white min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen lg:ml-72 transition-all duration-300">
          {/* Mobile Top Header */}
          <header className="lg:hidden sticky top-0 z-40 w-full flex items-center px-4 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-yellow-400/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <Link href="/" className="flex items-center">
              <img 
                src="/AquivosOtto/Logo/Img001 logo Otto.png" 
                alt="Logo Otto Pinturas" 
                className="h-10 w-auto object-contain"
              />
            </Link>
          </header>

          <div className="flex-1 p-4 lg:p-10 pb-24 lg:pb-10">
            {children}
          </div>
          <footer className="w-full bg-slate-950/30 border-t border-white/5 py-6 px-4 text-center text-slate-500 text-xs mt-auto pb-24 lg:pb-6">
            <p className="mb-2">&copy; {new Date().getFullYear()} Otto Pinturas. Todos os direitos reservados. Motor de Inteligência <span className="text-otto-yellow font-black tracking-widest text-[9px] border border-otto-yellow/30 px-1 rounded">PROSPECT-ON</span></p>
            <div className="flex justify-center gap-6 mt-3">
              <Link href="/politica-privacidade" className="hover:text-otto-yellow transition-colors">Política de Privacidade</Link>
              <Link href="/termos-uso" className="hover:text-otto-yellow transition-colors">Termos de Uso</Link>
            </div>
          </footer>
        </main>
      </div>
      
      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-yellow-400/20 z-50 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <Link href="/dashboard" className={`p-2.5 min-h-[44px] transition-all flex flex-col items-center justify-center ${pathname === "/dashboard" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-black mt-0.5 tracking-tighter uppercase">Cockpit</span>
        </Link>
        <Link href="/leads-quentes" className={`p-2.5 min-h-[44px] transition-all flex flex-col items-center justify-center ${pathname === "/leads-quentes" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
          <Target size={20} />
          <span className="text-[9px] font-black mt-0.5 tracking-tighter uppercase">Elite</span>
        </Link>
        <Link href="/documentos" className={`p-2.5 min-h-[44px] transition-all flex flex-col items-center justify-center ${pathname === "/documentos" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
          <FileText size={20} />
          <span className="text-[9px] font-black mt-0.5 tracking-tighter uppercase">Docs</span>
        </Link>
        {isAdmin && (
          <Link href="/usuarios" className={`p-2.5 min-h-[44px] transition-all flex flex-col items-center justify-center ${pathname === "/usuarios" ? "text-yellow-400 scale-105" : "text-slate-400 hover:text-yellow-400 active:scale-90"}`}>
            <Users size={20} />
            <span className="text-[9px] font-black mt-0.5 tracking-tighter uppercase">Vendedores</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="p-2.5 min-h-[44px] transition-all flex flex-col items-center justify-center text-red-400 hover:text-red-300 active:scale-90"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-black mt-0.5 tracking-tighter uppercase">Sair</span>
        </button>
      </div>
    </div>
  );
}
