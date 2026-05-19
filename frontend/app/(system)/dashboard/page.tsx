"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeadTable from "../../components/LeadTable";
import {
  Target,
  Users,
  Loader2,
  Search,
  Zap,
  LayoutDashboard,
  FileText,
  MapPin,
  Layers
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  address: string;
  score: number;
  category: string;
  source: string;
  urgency_score: number;
  demand: any;
  valuation: any;
  vision_analysis: any;
  market: any;
  vision_image_url?: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [turboLoading, setTurboLoading] = useState(false);
  const [niche, setNiche] = useState("Condominios");
  const [city, setCity] = useState("Jundiaí");
  const [targetLeads, setTargetLeads] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  async function fetchLeads() {
    try {
      const res = await fetch(`/api/leads`);
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch (error) {
      console.error("Falha ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  }

  // Polling de fundo: atualiza a cada 5s automaticamente
  useEffect(() => {
    fetchLeads();
    const bgInterval = setInterval(fetchLeads, 5000);
    return () => clearInterval(bgInterval);
  }, []);

  async function handleTurboScan() {
    setTurboLoading(true);
    try {
      // Chamando a rota de varredura 100% automatizada e resiliente no backend
      await fetch(`/api/scan/start?query=${encodeURIComponent(niche)}&city=${encodeURIComponent(city)}&target=${encodeURIComponent(targetLeads)}`, { method: 'POST' });
      // Notificação de sucesso ou feedback visual
      setTimeout(() => setTurboLoading(false), 5000);
    } catch (error) {
      console.error("Erro no Turbo Scan:", error);
      setTurboLoading(false);
    }
  }

  async function handleClearLeads() {
    if (!confirm("Deseja realmente limpar todos os leads do radar?")) return;
    try {
      const res = await fetch(`/api/leads/clear`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLeads([]);
      }
    } catch (error) {
      console.error("Erro ao limpar leads:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section Simplificada */}
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-[0.3em]">
              <Zap size={14} className="fill-emerald-400" />
              <span>Turbo Extension Mode</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              Sniper <span className="text-emerald-400">Prospect</span>
            </h1>
          </div>

          <button
            onClick={handleClearLeads}
            className="bg-slate-950/40 backdrop-blur-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 font-bold p-4 rounded-2xl transition-all border border-white/5 hover:border-rose-500/30"
            title="Limpar Base"
          >
            <Zap size={18} />
          </button>
        </div>

        {/* Painel de Controle Sniper */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 p-2 rounded-[2rem] flex flex-col lg:flex-row gap-2">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-sm font-bold text-white outline-none"
              placeholder="Qual o nicho? (Ex: Condominios)"
            />
          </div>

          <div className="w-px bg-white/5 hidden lg:block my-3" />

          <div className="flex-1 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-sm font-bold text-white outline-none"
              placeholder="Qual cidade?"
            />
          </div>

          <div className="w-px bg-white/5 hidden lg:block my-3" />

          <div className="w-full lg:w-40 relative group">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              type="number"
              value={isNaN(targetLeads) ? "" : targetLeads}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTargetLeads(isNaN(val) ? 0 : val);
              }}
              className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-sm font-bold text-white outline-none"
              placeholder="Qtd Leads"
            />
          </div>

          <button
            onClick={handleTurboScan}
            disabled={turboLoading}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black px-10 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_25px_rgba(16,185,129,0.2)]"
          >
            {turboLoading ? <Loader2 className="animate-spin" size={20} /> : <Target size={22} />}
            <span className="uppercase tracking-widest text-xs">Iniciar Sniper Turbo</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden flex-1">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/5 blur-[120px] rounded-full -mr-48 -mt-48" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Leads Identificados</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{leads.length} alvos no radar</span>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-emerald-400" size={48} />
            <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sincronizando Radar...</span>
          </div>
        ) : (
          <LeadTable leads={leads} />
        )}
      </div>
    </div>
  );
}
