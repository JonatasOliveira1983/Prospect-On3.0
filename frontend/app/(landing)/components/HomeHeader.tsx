"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, LogIn, X } from "lucide-react";

export default function HomeHeader() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === "adm" && cleanPass === "123") {
      window.location.href = "/dashboard";
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <header className="w-full py-4 px-6 md:px-8 flex justify-between items-center bg-slate-950/85 border-b border-white/5 sticky top-0 z-50 shadow-2xl backdrop-blur-md">
      {/* Brand logo only - standalone and enlarged, no border square or text */}
      <div 
        className="cursor-pointer select-none active:scale-95 transition-transform shrink-0" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Image 
          src="/AquivosOtto/Logo/Img001 logo Otto.png"
          alt="Logo Otto Pinturas"
          width={64}
          height={64}
          className="object-contain hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>

      {/* Desktop Login Form (hidden on mobile) */}
      <form onSubmit={handleLogin} className="hidden md:flex items-center gap-3">
        {error && <span className="text-red-400 text-[10px] font-bold mr-2 uppercase tracking-wider">{error}</span>}
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full border border-white/5 bg-slate-900/60 text-xs outline-none focus:border-otto-yellow focus:ring-1 focus:ring-otto-yellow/20 transition-all text-white w-28 focus:w-36 placeholder-slate-500"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="password" 
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full border border-white/5 bg-slate-900/60 text-xs outline-none focus:border-otto-yellow focus:ring-1 focus:ring-otto-yellow/20 transition-all text-white w-28 focus:w-36 placeholder-slate-500"
          />
        </div>
        <button 
          type="submit" 
          className="bg-otto-yellow hover:bg-yellow-400 text-slate-950 font-black px-6 py-2 rounded-full transition-all text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:shadow-[0_0_25px_rgba(250,204,21,0.45)] active:scale-95"
        >
          Entrar
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Mobile Login Toggle Button (hidden on desktop) */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setIsMobileFormOpen(!isMobileFormOpen)}
          className="p-2.5 rounded-full bg-otto-yellow text-slate-950 hover:bg-yellow-400 transition-all active:scale-90 shadow-[0_0_15px_rgba(250,204,21,0.25)] flex items-center justify-center"
          title="Login de Administrador"
        >
          {isMobileFormOpen ? <X size={18} /> : <LogIn size={18} />}
        </button>
      </div>

      {/* Mobile Floating Dropdown Form */}
      {isMobileFormOpen && (
        <div className="absolute top-[72px] right-6 left-6 z-50 md:hidden p-6 rounded-3xl bg-slate-900/95 border border-white/10 backdrop-blur-lg shadow-2xl animate-fade-in flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Painel Administrativo</h4>
            {error && <span className="text-red-400 text-[9px] font-bold uppercase tracking-wider">{error}</span>}
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-slate-950 text-xs text-white outline-none focus:border-otto-yellow transition-colors placeholder-slate-500"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-slate-950 text-xs text-white outline-none focus:border-otto-yellow transition-colors placeholder-slate-500"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-otto-yellow hover:bg-yellow-400 text-slate-950 font-black py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
            >
              Entrar
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
