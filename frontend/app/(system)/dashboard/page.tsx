"use client";

import { useEffect, useState, useCallback } from "react";
import LeadTable from "../../components/LeadTable";
import {
  Loader2,
  Search,
  Building2,
  Phone,
  Mail,
  Star,
  TrendingUp,
  CloudDownload,
  Filter,
  RefreshCw,
  Database,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  score: number;
  category: string;
  source: string;
  pilar: string;
  contact_status: string;
  is_favorite: number;
  created_at?: string;
  updated_at?: string;
}

interface ImportStats {
  regions: number;
  categories: number;
  estimated_leads: number;
  regions_list: string[];
  categories_list: string[];
}

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Todas as Categorias' },
  { key: 'sindico_administradora', label: 'Admin. / Síndicos' },
  { key: 'pintura_predial', label: 'Pintura Predial' },
  { key: 'grande_porte', label: 'Facilities / Grande Porte' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'Todos os Status' },
  { key: 'Aguardando Abordagem', label: 'Aguardando' },
  { key: 'Contato Iniciado', label: 'Em Contato' },
  { key: 'favorites', label: 'Meus Favoritos' },
];

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "score">("recent");

  const fetchLeads = useCallback(async () => {
    try {
      const resp = await api.leads();
      const data: Lead[] = await resp.json();
      setLeads(data);
    } catch (e) {
      console.error("Erro ao buscar leads:", e);
    }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const resp = await fetch(`http://localhost:8002/api/apify/stats`);
      const data = await resp.json();
      if (data.success) {
        setImportStats(data.import_stats);
      }
    } catch (e) {
      // Silencioso
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  const handleImport = async () => {
    setImportLoading(true);
    setImportMessage("Iniciando importação...");
    try {
      const resp = await api.apifyImport();
      const data = await resp.json();
      if (data.success) {
        setImportMessage(data.message);
        await fetchStats();
        // Poll por novos leads a cada 30s
        const pollInterval = setInterval(async () => {
          const r = await api.leads();
          const newLeads: Lead[] = await r.json();
          setLeads(newLeads);
          await fetchStats();
        }, 30000);

        // Para de poll após 15 min
        setTimeout(() => clearInterval(pollInterval), 900000);
      } else {
        setImportMessage("Erro na importação");
      }
    } catch (e) {
      setImportMessage("Erro de conexão");
    }
    setImportLoading(false);
    setTimeout(() => setImportMessage(""), 8000);
  };

  // Filtros
  const filteredLeads = leads.filter((lead) => {
    // Busca textual
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const text = `${lead.name} ${lead.address} ${lead.phone} ${lead.email} ${lead.category}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    // Categoria
    if (categoryFilter !== "all" && lead.category !== categoryFilter) return false;
    // Status / Favoritos
    if (statusFilter === "favorites" && !lead.is_favorite) return false;
    if (statusFilter !== "all" && statusFilter !== "favorites" && lead.contact_status !== statusFilter) return false;
    return true;
  });

  // Ordenação
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === "recent") {
      const da = a.created_at || "";
      const db = b.created_at || "";
      return db.localeCompare(da);
    }
    return (b.score || 0) - (a.score || 0);
  });

  // Métricas
  const totalLeads = leads.length;
  const availableLeads = leads.filter(l => !l.is_favorite && l.contact_status === "Aguardando Abordagem").length;
  const myFavorites = leads.filter(l => l.is_favorite).length;
  const inContact = leads.filter(l => l.contact_status === "Contato Iniciado").length;
  const withPhone = leads.filter(l => l.phone && l.phone !== "N/D").length;
  const withEmail = leads.filter(l => l.email && l.email !== "N/D").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
            Leads de Pintura Predial
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Grande São Paulo · {totalLeads} leads no banco
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchLeads(); fetchStats(); }}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <MetricCard icon={<Database size={16} />} value={totalLeads} label="Total" color="text-white" />
        <MetricCard icon={<Users size={16} />} value={availableLeads} label="Disponíveis" color="text-emerald-400" />
        <MetricCard icon={<Star size={16} />} value={myFavorites} label="Favoritos" color="text-yellow-400" />
        <MetricCard icon={<CheckCircle2 size={16} />} value={inContact} label="Em Contato" color="text-blue-400" />
        <MetricCard icon={<Phone size={16} />} value={withPhone} label="c/ Telefone" color="text-green-400" />
        <MetricCard icon={<Mail size={16} />} value={withEmail} label="c/ Email" color="text-purple-400" />
        <MetricCard
          icon={<TrendingUp size={16} />}
          value={importStats?.estimated_leads || 0}
          label="Podemos Baixar"
          color="text-amber-400"
        />
      </div>

      {/* FILTROS + AÇÕES */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, telefone, bairro..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors"
          />
        </div>

        {/* Ordenação */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "score")}
          className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400/50"
        >
          <option value="recent">Mais Recentes</option>
          <option value="score">Maior Score</option>
        </select>

        {/* Importar */}
        <button
          onClick={handleImport}
          disabled={importLoading}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
            importLoading
              ? "bg-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)]"
          }`}
        >
          {importLoading ? <Loader2 className="animate-spin" size={14} /> : <CloudDownload size={14} />}
          Importar Leads
        </button>
      </div>

      {importMessage && (
        <div className={`mb-4 px-4 py-2 rounded-xl text-xs font-bold ${
          importMessage.includes("Erro") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
        }`}>
          {importMessage}
        </div>
      )}

      {/* FILTROS DE CATEGORIA */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setCategoryFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
              categoryFilter === f.key
                ? "bg-blue-500/20 border-blue-400/40 text-blue-400"
                : "bg-slate-900 border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
              statusFilter === f.key
                ? "bg-amber-500/20 border-amber-400/40 text-amber-400"
                : "bg-slate-900 border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* TABELA */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-400" size={32} />
          </div>
        ) : sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Database size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-bold">Nenhum lead encontrado</p>
            <p className="text-xs mt-1">Clique em "Importar Leads" para começar</p>
          </div>
        ) : (
          <LeadTable
            leads={sortedLeads}
            onLeadUpdate={fetchLeads}
          />
        )}
      </div>

      {/* INFO DE IMPORTAÇÃO */}
      {importStats && (
        <div className="mt-6 p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cobertura da Importação</h3>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span>{importStats.regions} regiões</span>
            <span>{importStats.categories} categorias</span>
            <span>~{importStats.estimated_leads} leads estimados</span>
            <span>Regiões: {importStats.regions_list.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
      <div className={`${color}`}>{icon}</div>
      <span className={`text-xl font-black font-mono ${color}`}>{value.toLocaleString()}</span>
      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}
