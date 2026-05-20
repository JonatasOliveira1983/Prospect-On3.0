"use client";
import { api } from '@/lib/api';

import { useEffect, useState } from "react";
import {
  Flame,
  Loader2,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Parâmetros de Vendedor
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState<string>("");

  useEffect(() => {
    // Ler dados de sessão
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }

    // Ler parâmetros da URL de forma segura no client-side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const uId = params.get("userId");
      const uName = params.get("userName");
      if (uId) {
        setSellerId(uId);
        setSellerName(uName || "Vendedor");
      }
    }
  }, []);

  async function fetchLeads() {
    try {
      // Se tiver sellerId, busca os favoritos daquele vendedor, caso contrário busca os próprios
      const res = await api.leadsQuentes(sellerId || undefined);
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
    // Dispara a busca sempre que sellerId for definido ou no primeiro carregamento
    fetchLeads();
    
    // Configura o pooling apenas se NÃO for visualização de outro vendedor (para evitar requisições administrativas repetidas sem necessidade)
    if (!sellerId) {
      const interval = setInterval(fetchLeads, 4000);
      return () => clearInterval(interval);
    }
  }, [sellerId]);

  const isReadOnly = !!sellerId && currentUser?.role === "admin";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Barra de Status Administrativo se estiver visualizando outro vendedor */}
      {isReadOnly && (
        <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-2xl flex items-center justify-between text-yellow-400 text-xs font-bold animate-fade-in shadow-[0_0_15px_rgba(250,204,21,0.05)]">
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} className="animate-pulse shrink-0" />
            <div>
              <p className="uppercase tracking-wider">Modo Gestão Ativado</p>
              <p className="text-slate-400 font-medium text-[10px] normal-case mt-0.5">
                Você está visualizando a carteira exclusiva de Leads Elite e CRM do vendedor <strong className="text-yellow-400 font-black">{sellerName}</strong> em modo somente leitura.
              </p>
            </div>
          </div>
          <Link
            href="/usuarios"
            className="bg-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider hover:bg-yellow-300 transition-all flex items-center gap-1.5 shadow-md shadow-yellow-400/10"
          >
            <ArrowLeft size={12} />
            Voltar
          </Link>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.3em]">
          <Flame size={14} className="fill-rose-500" />
          <span>Leads Quentes</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
          {isReadOnly ? (
            <>Leads Elite <span className="text-yellow-400">de {sellerName}</span></>
          ) : (
            <>Alvos <span className="text-rose-500">Favoritados</span></>
          )}
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl">
          {isReadOnly ? (
            `Auditoria completa da carteira comercial de condomínios prioritários em atendimento por ${sellerName}.`
          ) : (
            "Sua lista personalizada de condomínios prioritários para abordagem comercial imediata da Otto Pinturas."
          )}
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
            <p className="text-slate-600 text-sm mt-2 text-center max-w-md">
              {isReadOnly ? "Este vendedor ainda não favoritou nenhum condomínio prioritário." : "Vá até o painel principal do Sniper Prospect e favorite os condomínios clicando no ícone de estrela ⭐."}
            </p>
          </div>
        ) : (
          <LeadTable leads={leads} readOnly={isReadOnly} />
        )}
      </div>
    </div>
  );
}
