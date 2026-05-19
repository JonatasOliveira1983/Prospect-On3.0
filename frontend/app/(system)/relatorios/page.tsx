"use client";

import { useEffect, useState } from "react";
import { Database, Building2, MapPin, Loader2, Phone, Globe, Mail } from "lucide-react";

interface Lead {
  name: string;
  address: string;
  score: number;
  phone?: string;
  email?: string;
  website?: string;
  source?: string;
  scanned_at?: string;
}

export default function BaseLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLeads(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-violet-400 font-black text-xs uppercase tracking-[0.3em]">
          <Database size={14} className="text-violet-400" />
          <span>Base de Leads</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
          Todos os <span className="text-violet-400">Leads</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl">
          Relação completa de todos os condomínios cadastrados no radar da Otto Pinturas.
        </p>
      </header>

      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-400/5 blur-[120px] rounded-full -mr-48 -mt-48" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Base de Dados</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{leads.length} condomínios cadastrados</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-violet-400" size={48} />
              <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Carregando Base...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead, i) => (
                <div key={i} className="bg-slate-950/40 border border-white/5 hover:border-violet-400/20 rounded-2xl p-5 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-white text-sm uppercase tracking-tight truncate">{lead.name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={9} className="shrink-0" /> {lead.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.phone && lead.phone !== 'N/D' && (
                      <span className="text-[10px] bg-slate-900/60 text-emerald-400 px-2 py-1 rounded-lg border border-white/5 font-bold truncate max-w-[120px]">
                        <Phone size={9} className="inline mr-1" />{lead.phone}
                      </span>
                    )}
                    {lead.email && lead.email !== 'N/D' && (
                      <span className="text-[10px] bg-slate-900/60 text-blue-400 px-2 py-1 rounded-lg border border-white/5 font-bold truncate max-w-[120px]">
                        <Mail size={9} className="inline mr-1" />Email
                      </span>
                    )}
                    {lead.website && lead.website !== 'N/D' && (
                      <span className="text-[10px] bg-slate-900/60 text-cyan-400 px-2 py-1 rounded-lg border border-white/5 font-bold truncate max-w-[100px]">
                        <Globe size={9} className="inline mr-1" />Site
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}