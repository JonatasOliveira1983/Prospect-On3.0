"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import LeadTable from "../../components/LeadTable";
import {
  Loader2,
  Search,
  Phone,
  Star,
  CloudDownload,
  RefreshCw,
  Database,
  Users,
  X,
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
}

const STATUS_FILTERS = [
  { key: 'all', label: 'Todos os Status' },
  { key: 'Aguardando Abordagem', label: 'Aguardando' },
  { key: 'Contato Iniciado', label: 'Em Contato' },
  { key: 'favorites', label: 'Meus Favoritos' },
];

const SP_BAIRRO_ZONA: Record<string, string> = {
  "aclimacao": "Zona Sul", "alto da boa vista": "Zona Sul", "alto da lapa": "Zona Oeste",
  "alto da mooca": "Zona Leste", "alto de pinheiros": "Zona Oeste", "anhangabau": "Centro",
  "aricanduva": "Zona Leste", "artur alvim": "Zona Leste", "barra funda": "Zona Oeste",
  "bela vista": "Centro", "belenzinho": "Zona Leste", "bom retiro": "Centro",
  "bosque da saude": "Zona Sul", "bras": "Centro", "brasilandia": "Zona Norte",
  "brooklin": "Zona Sul", "butanta": "Zona Oeste", "cambuci": "Centro",
  "campo belo": "Zona Sul", "campo grande": "Zona Sul", "campo limpo": "Zona Sul",
  "cangaiba": "Zona Leste", "carandiru": "Zona Norte", "casa verde": "Zona Norte",
  "caxingui": "Zona Oeste", "centro historico de sao paulo": "Centro", "cerqueira cesar": "Centro",
  "chacara belenzinho": "Zona Leste", "chacara flora": "Zona Sul", "chacara inglesa": "Zona Sul",
  "chacara mafalda": "Zona Sul", "chacara santo antonio": "Zona Sul", "cidade dutra": "Zona Sul",
  "cidade lider": "Zona Leste", "cidade mae do ceu": "Zona Leste", "cidade moncoes": "Zona Sul",
  "cidade patriarca": "Zona Leste", "cidade sao francisco": "Zona Leste", "cidade tiradentes": "Zona Leste",
  "city america": "Zona Norte", "consolacao": "Centro", "cursino": "Zona Sul",
  "ermelino matarazzo": "Zona Leste", "freguesia do o": "Zona Norte", "granja julieta": "Zona Sul",
  "guaianases": "Zona Leste", "higienopolis": "Centro", "ibirapuera": "Zona Sul",
  "imirim": "Zona Norte", "indianopolis": "Zona Sul", "interlagos": "Zona Sul",
  "ipiranga": "Zona Sul", "itaberaba": "Zona Norte", "itaim bibi": "Zona Sul",
  "itaim paulista": "Zona Leste", "itaquera": "Zona Leste", "jabaquara": "Zona Sul",
  "jacana": "Zona Norte", "jaguara": "Zona Oeste", "jaguare": "Zona Oeste",
  "jaragua": "Zona Norte", "jardim america": "Zona Sul", "jardim avelino": "Zona Sul",
  "jardim bonfiglioli": "Zona Oeste", "jardim europa": "Zona Sul",
  "jardim paulista": "Zona Sul", "jardim paulistano": "Zona Sul",
  "jardim sao paulo": "Zona Norte", "jardim sapopemba": "Zona Leste", "jardins": "Zona Sul",
  "lapa": "Zona Oeste", "liberdade": "Centro", "limao": "Zona Norte",
  "mandaqui": "Zona Norte", "mirandopolis": "Zona Sul", "moema": "Zona Sul",
  "mooca": "Zona Leste", "morumbi": "Zona Sul", "parada inglesa": "Zona Norte",
  "paraiso": "Zona Sul", "pari": "Centro", "parque artur alvim": "Zona Leste",
  "parque boturussu": "Zona Leste", "parque da mooca": "Zona Leste", "parque imperial": "Zona Sul",
  "parque mandaqui": "Zona Norte", "parque novo mundo": "Zona Norte", "parque sao jorge": "Zona Leste",
  "parque sao lucas": "Zona Leste", "paulista": "Centro", "penha": "Zona Leste",
  "penha de franca": "Zona Leste", "perdizes": "Zona Oeste", "pinheiros": "Zona Oeste",
  "piqueri": "Zona Norte", "pirituba": "Zona Norte", "planalto paulista": "Zona Sul",
  "pompeia": "Zona Oeste", "republica": "Centro", "rio pequeno": "Zona Oeste",
  "sacoma": "Zona Sul", "santa cecilia": "Centro", "santa teresinha": "Zona Norte",
  "santana": "Zona Norte", "santo amaro": "Zona Sul", "saude": "Zona Sul",
  "se": "Centro", "socorro": "Zona Sul", "sumarezinho": "Zona Oeste",
  "sao joao climaco": "Zona Sul", "sao judas": "Zona Sul", "sao miguel paulista": "Zona Leste",
  "tatuape": "Zona Leste", "tucuruvi": "Zona Norte", "vila andrade": "Zona Sul",
  "vila buarque": "Centro", "vila carrao": "Zona Leste", "vila clementino": "Zona Sul",
  "vila cordeiro": "Zona Sul", "vila da saude": "Zona Sul", "vila formosa": "Zona Leste",
  "vila gomes cardim": "Zona Leste", "vila guarani": "Zona Sul", "vila guilherme": "Zona Norte",
  "vila hamburguesa": "Zona Oeste", "vila leopoldina": "Zona Oeste", "vila madalena": "Zona Oeste",
  "vila maria": "Zona Norte", "vila mariana": "Zona Sul", "vila mascote": "Zona Sul",
  "vila matilde": "Zona Leste", "vila medeiros": "Zona Norte", "vila monte alegre": "Zona Sul",
  "vila nova cachoeirinha": "Zona Norte", "vila nova conceicao": "Zona Sul", "vila olimpia": "Zona Sul",
  "vila prudente": "Zona Leste", "vila reg feijo": "Zona Leste", "vila romana": "Zona Oeste",
  "vila santa catarina": "Zona Sul", "vila socorro": "Zona Sul", "vila sonia": "Zona Oeste",
  "vila zelina": "Zona Leste", "vila esperanca": "Zona Leste", "vila marieta": "Zona Sul",
  "vila carmosina": "Zona Leste", "vila das belezas": "Zona Oeste", "agua branca": "Zona Oeste",
  "agua fria": "Zona Norte", "vila suzana": "Zona Sul", "vila dom pedro i": "Zona Leste",
  "vila monumento": "Zona Leste", "vila gumercindo": "Zona Sul", "vila santana": "Zona Norte",
  "vila brasil": "Zona Leste", "vila dalmacia": "Zona Leste", "vila sabrina": "Zona Norte",
  "vila moreira": "Zona Leste", "vila penteado": "Zona Norte", "vila helena": "Zona Leste",
  "vila bertioga": "Zona Leste", "vila lourdes": "Zona Leste", "vila norma": "Zona Leste",
  "vila alpina": "Zona Leste", "vila cruzeiro": "Zona Sul", "vila indiana": "Zona Sul",
  "chacara california": "Zona Oeste", "conj res jose bonifacio": "Zona Leste",
  "colonia": "Zona Leste", "paraiso do morumbi": "Zona Sul", "vila moraes": "Zona Sul",
  "sl 717": "Zona Leste", "praia grande": "Outros",
  "vila diva (zona leste)": "Zona Leste",
  "chacara santo antonio (zona sul)": "Zona Sul", "chacara santo antonio (zona leste)": "Zona Leste",
  "colonia (zona leste)": "Zona Leste", "jardim lider": "Zona Leste",
  "jardim das acacias": "Zona Sul", "jardim peri peri": "Zona Sul",
  "vila sofia": "Zona Sul", "jardim independencia (sao paulo)": "Zona Sul",
  "jardim das laranjeiras": "Zona Sul", "jardim franca": "Zona Norte",
  "jardim santo andre": "Zona Leste", "vila lucia": "Zona Leste",
  "jardim santa lucrecia": "Zona Sul", "parque nacoes unidas": "Zona Sul",
  "jardim japao": "Zona Leste", "vila zilda": "Zona Leste", "vila nova uniao": "Zona Leste",
  "jardim regis": "Zona Sul", "parque jabaquara": "Zona Sul",
  "jardim nova germania": "Zona Sul", "jardim sao jorge": "Zona Sul",
  "vila morumbi": "Zona Sul", "santa etelvina": "Zona Leste",
  "jardim iguatemi": "Zona Sul", "vila prel": "Zona Leste",
  "jardim sao cristovao": "Zona Leste", "super quadra morumbi": "Zona Sul",
  "jardim cidade pirituba": "Zona Norte", "vila alabama": "Zona Leste",
  "parque paineiras": "Zona Sul", "jardim rincao": "Zona Leste",
  "jardim campo grande": "Zona Sul", "jardim maria estela": "Zona Sul",
  "vila mangalot": "Zona Norte", "vila maracana": "Zona Norte",
  "jardim imbe": "Zona Leste", "jardim santo antoninho": "Zona Leste",
  "vila constancia": "Zona Leste", "vila alexandria": "Zona Sul",
  "vila heliopolis": "Zona Sul", "jardim ibitirama": "Zona Leste",
  "jardim america da penha": "Zona Leste",
  "vila aurora (zona norte)": "Zona Norte", "vila ester (zona norte)": "Zona Norte",
  "jardim imperador (zona leste)": "Zona Leste", "jardim boa vista (zona oeste)": "Zona Oeste",
  "centro de guarulhos": "Outros", "sp zip code:": "Outros",
};

function getZone(address: string): string {
  const bairro = getBairro(address);
  if (!bairro) return "";
  const normalized = bairro.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
  return SP_BAIRRO_ZONA[normalized] || "";
}

function getBairro(address: string): string {
  const match = address.match(/-\s*([^,]+),\s*S[aã]o\s*Paulo/i);
  if (!match) return "";
  let bairro = match[1];
  // Pega o texto apos o ultimo ' - ' (ex: \"9 andar - Bela Vista\" -> \"Bela Vista\")
  const parts = bairro.split("-");
  bairro = parts[parts.length - 1].trim();
  // Remove numeros soltos no inicio
  bairro = bairro.replace(/^\d+\s*/, "");
  return bairro || "";
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<string | null>(null);
  const [bairroFilter, setBairroFilter] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const resp = await api.leads();
      setLeads(await resp.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
        setIsAdmin(u.role === "admin");
      } catch (e) {}
    }
  }, [fetchLeads]);

  const handleImport = async () => {
    setImportLoading(true);
    setImportMessage("Iniciando...");
    try {
      const resp = await api.apifyImport();
      const data = await resp.json();
      setImportMessage(data.success ? data.message : "Erro");
      const iv = setInterval(async () => {
        const r = await api.leads();
        setLeads(await r.json());
      }, 30000);
      setTimeout(() => clearInterval(iv), 900000);
    } catch (e) {
      setImportMessage("Erro de conexao");
    }
    setImportLoading(false);
    setTimeout(() => setImportMessage(""), 8000);
  };

  // Filtros
  const filteredLeads = leads.filter((lead) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!`${lead.name} ${lead.address} ${lead.phone} ${lead.source}`.toLowerCase().includes(q)) return false;
    }
    if (statusFilter === "favorites" && !lead.is_favorite) return false;
    if (statusFilter !== "all" && statusFilter !== "favorites" && lead.contact_status !== statusFilter) return false;
    // Filtro por zona
    if (zoneFilter && getZone(lead.address) !== zoneFilter) return false;
    // Filtro por bairro
    if (bairroFilter && getBairro(lead.address) !== bairroFilter) return false;
    return true;
  });

  // Agrupamentos
  const neighborhoodCounts: Record<string, { count: number; zone: string }> = {};
  const zoneCounts: Record<string, number> = {};
  leads.forEach(l => {
    const zone = getZone(l.address) || "Outros";
    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    const bairro = getBairro(l.address);
    if (bairro && bairro.length > 2) {
      if (!neighborhoodCounts[bairro]) neighborhoodCounts[bairro] = { count: 0, zone: zone || "Outros" };
      neighborhoodCounts[bairro].count++;
    }
  });

  const sortedZones = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]);
  const topBairros = Object.entries(neighborhoodCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);
  const bairrosPorZona = topBairros.reduce((acc, b) => {
    const z = b.zone || "Outros";
    if (!acc[z]) acc[z] = [];
    acc[z].push(b);
    return acc;
  }, {} as Record<string, typeof topBairros>);

  const totalLeads = leads.length;
  const availableLeads = leads.filter(l => !l.is_favorite && l.contact_status === "Aguardando Abordagem").length;
  const myFavorites = leads.filter(l => l.is_favorite).length;
  const inContact = leads.filter(l => l.contact_status === "Contato Iniciado").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
            Administradoras e Síndicos
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Grande São Paulo · {totalLeads} contatos no banco
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLeads()}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard icon={<Database size={16} />} value={totalLeads} label="Total" color="text-white" />
        <MetricCard icon={<Users size={16} />} value={availableLeads} label="Disponíveis" color="text-emerald-400" />
        <MetricCard icon={<Star size={16} />} value={myFavorites} label="Favoritos" color="text-yellow-400" />
        <MetricCard icon={<Phone size={16} />} value={inContact} label="Em Contato" color="text-blue-400" />
      </div>

      {/* COBERTURA HIERÁRQUICA */}
      <div className="mb-4 p-3 bg-slate-900/40 border border-white/5 rounded-xl">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">
          Cobertura · {sortedZones.length} zonas · {Object.keys(neighborhoodCounts).length} bairros
        </span>

        {/* Zonas (clicáveis para filtrar) */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => { setZoneFilter(null); setBairroFilter(null); }}
            className={`px-3 py-1.5 min-h-[36px] rounded-full text-[10px] lg:text-[11px] font-bold border transition-all ${!zoneFilter ? 'bg-white/10 border-white/30 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
          >
            SP: {totalLeads}
          </button>
          {sortedZones.map(([zone, count]) => (
            <button
              key={zone}
              onClick={() => { setZoneFilter(zoneFilter === zone ? null : zone); setBairroFilter(null); }}
              className={`px-3 py-1.5 min-h-[36px] rounded-full text-[10px] lg:text-[11px] font-bold border transition-all ${zoneFilter === zone ? 'bg-white/10 border-white/40 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
            >
              {zone}: <span className={zoneFilter === zone ? 'text-white' : 'text-slate-300'}>{count}</span>
            </button>
          ))}
          {(zoneFilter || bairroFilter) && (
            <button
              onClick={() => { setZoneFilter(null); setBairroFilter(null); }}
              className="px-3 py-1.5 min-h-[36px] rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-400 text-[10px] lg:text-[11px] font-bold flex items-center gap-1"
            >
              <X size={10} /> Limpar
            </button>
          )}
        </div>

        {/* Bairros por zona (se zona selecionada) */}
        {zoneFilter && bairrosPorZona[zoneFilter] && (
          <div className="flex flex-wrap gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[8px] text-slate-500 w-full mb-1">Bairros em {zoneFilter}:</span>
            {bairrosPorZona[zoneFilter].slice(0, 12).map((b) => (
              <button
                key={b.name}
                onClick={() => setBairroFilter(bairroFilter === b.name ? null : b.name)}
                className={`px-2.5 py-1 min-h-[32px] rounded-full text-[10px] lg:text-[11px] font-bold border transition-all ${bairroFilter === b.name ? 'bg-blue-500/20 border-blue-400/40 text-blue-400' : 'bg-slate-800 border-blue-500/10 text-blue-400/70 hover:border-blue-400/20'}`}
              >
                {b.name}: {b.count}
              </button>
            ))}
          </div>
        )}

        {bairroFilter && (
          <div className="mt-1 text-[9px] text-amber-400 font-bold">
            Filtrado: {bairroFilter} — {filteredLeads.length} leads
          </div>
        )}
      </div>

      {/* FILTROS + AÇÕES */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
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
        {isAdmin && (
          <button
            onClick={handleImport}
            disabled={importLoading}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              importLoading ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)]"
            }`}
          >
            {importLoading ? <Loader2 className="animate-spin" size={14} /> : <CloudDownload size={14} />}
            Importar Leads
          </button>
        )}
      </div>

      {importMessage && (
        <div className={`mb-4 px-4 py-2 rounded-xl text-xs font-bold ${importMessage.includes("Erro") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          {importMessage}
        </div>
      )}

      {/* FILTROS DE STATUS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-2 min-h-[36px] rounded-full text-[10px] lg:text-[11px] font-bold uppercase tracking-wider border transition-all ${
              statusFilter === f.key ? "bg-amber-500/20 border-amber-400/40 text-amber-400" : "bg-slate-900 border-white/10 text-slate-400 hover:border-white/20"
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
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Database size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-bold">Nenhum lead encontrado</p>
            <p className="text-xs mt-1">Ajuste os filtros ou clique em "Importar Leads"</p>
          </div>
        ) : (
          <LeadTable leads={filteredLeads} onSave={fetchLeads} />
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
      <div className={color}>{icon}</div>
      <span className={`text-xl font-black font-mono ${color}`}>{value.toLocaleString()}</span>
      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}
