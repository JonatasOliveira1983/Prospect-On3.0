"use client";
import { api, WS_URL } from '@/lib/api';

import { useEffect, useState } from "react";
import {
  Flame,
  Loader2
} from "lucide-react";
import LeadTable from "../../components/LeadTable";

interface Lead {
  id?: string;
  name: string;
  address: string;
  score: number;
  email?: string;
  social_url?: string;
  booking_url?: string;
  phone?: string;
  responsavel_contato?: string;
  responsavel_nome?: string;
  website?: string;
  vision_image_url?: string;
  is_favorite?: boolean | number;
  interaction_notes?: string;
  return_date?: string;
  contact_status?: string;
}

export default function LeadsQuentes() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeads() {
    try {
      const res = await api.leadsQuentes();
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      }
    } catch (error) {
      console.error("Falha ao carregar leads quentes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.3em]">
          <Flame size={14} className="fill-rose-500" />
          <span>Leads Quentes</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
          Alvos <span className="text-rose-500">Favoritados</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl">
          Sua lista personalizada de condomínios prioritários para abordagem comercial imediata da Otto Pinturas.
        </p>
      </header>

      {/* Main Content Area */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden flex-1">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lista de Contatos</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{leads.length} leads quentes para agir</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-rose-500" size={48} />
            <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Carregando Favoritos...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-950/40 backdrop-blur-xl border border-dashed border-white/10 rounded-[3rem]">
            <Flame className="text-slate-700 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Nenhum Favorito</h3>
            <p className="text-slate-600 text-sm mt-2 text-center max-w-md">Vá até o painel principal do Sniper Prospect e favorite os condomínios clicando no ícone de estrela ⭐.</p>
          </div>
        ) : (
          <LeadTable leads={leads} />
        )}
      </div>
    </div>
  );
}

