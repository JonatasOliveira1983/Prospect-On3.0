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
  Layers,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';

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
  const [publicoAlvo, setPublicoAlvo] = useState("Condominios");
  const [palavraChave, setPalavraChave] = useState("Residenciais");
  const [regiao, setRegiao] = useState("Jundiaí - SP");
  const [targetLeads, setTargetLeads] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  async function fetchLeads() {
    try {
      const res = await api.leads();
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
      const combinedQuery = `${publicoAlvo} ${palavraChave}`.trim();
      await api.scanStart(combinedQuery, regiao, targetLeads);
      setTimeout(() => setTurboLoading(false), 5000);
    } catch (error) {
      console.error("Erro no Turbo Scan:", error);
      setTurboLoading(false);
    }
  }

  async function handleClearLeads() {
    if (!confirm("Deseja realmente limpar todos os leads do radar?")) return;
    try {
      const res = await api.leadsClear();
      const data = await res.json();
      if (data.success) {
        setLeads([]);
      }
    } catch (error) {
      console.error("Erro ao limpar leads:", error);
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10">
      {/* Header Section */}
      <header className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-xs uppercase tracking-[0.3em]">
              <Zap size={14} className="fill-yellow-400" />
              <span>Metodologia Sniper 3 Fases</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              CRM <span className="text-yellow-400">Prospetor</span>
            </h1>
          </div>

          <button
            onClick={handleClearLeads}
            className="bg-slate-950/40 backdrop-blur-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 font-bold p-3 sm:p-4 rounded-2xl transition-all border border-white/5 hover:border-rose-500/30"
            title="Limpar Base de Leads"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Painel Sniper 3 Fases */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-yellow-400/10 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col gap-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

          {/* Grid das Fases de Busca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">

            {/* FASE 1 */}
            <div className="flex flex-col gap-2.5 p-4 sm:p-5 bg-slate-900/60 border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-yellow-400/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  Fase 1
                </span>
                <Users size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Público Alvo</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Atividade Principal do Seu Cliente Ideal: Segmentação do Seu Cliente Ideal.
              </p>
              <input
                type="text"
                value={publicoAlvo}
                onChange={(e) => setPublicoAlvo(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 sm:py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-colors mt-2"
                placeholder="Ex: Condominios, Industrias, Lojas de"
              />
            </div>

            {/* FASE 2 */}
            <div className="flex flex-col gap-2.5 p-4 sm:p-5 bg-slate-900/60 border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-yellow-400/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  Fase 2
                </span>
                <Search size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Palavra Chave</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Palavras que Limitam o Interesse e o Perfil do Seu Cliente Ideal.
              </p>
              <input
                type="text"
                value={palavraChave}
                onChange={(e) => setPalavraChave(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 sm:py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-colors mt-2"
                placeholder="Ex: Residenciais, Quimicas em, Calcados em"
              />
            </div>

            {/* FASE 3 */}
            <div className="flex flex-col gap-2.5 p-4 sm:p-5 bg-slate-900/60 border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-yellow-400/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  Fase 3
                </span>
                <MapPin size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Região Segmentada</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Começando de Baixo para Cima: segmentando Cidades Grandes na Busca.
              </p>
              <input
                type="text"
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 sm:py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-colors mt-2"
                placeholder="Ex: Jundiai - SP, Curitiba - PR"
              />
            </div>

          </div>

          {/* Rodapé de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 px-4 py-3 rounded-2xl w-full sm:w-44 group">
                <Layers size={14} className="text-slate-500 group-focus-within:text-yellow-400" />
                <input
                  type="number"
                  value={isNaN(targetLeads) ? "" : targetLeads}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTargetLeads(isNaN(val) ? 0 : val);
                  }}
                  className="bg-transparent border-none text-xs font-black text-white outline-none w-full"
                  placeholder="Qtd Leads"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:inline">
                Meta de Leads no Radar
              </span>
            </div>

            <button
              onClick={handleTurboScan}
              disabled={turboLoading}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black px-8 sm:px-12 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_25px_rgba(250,204,21,0.2)]"
            >
              {turboLoading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
              <span className="uppercase tracking-widest text-xs">Iniciar Sniper 3 Fases</span>
            </button>
          </div>

        </div>
      </header>

      {/* Tabela de Leads */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 shadow-2xl relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

        <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Leads Identificados</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{leads.length} alvos no radar</span>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-yellow-400" size={48} />
            <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sincronizando Radar...</span>
          </div>
        ) : (
          <LeadTable leads={leads} onSave={fetchLeads} />
        )}
      </div>
    </div>
  );
}
