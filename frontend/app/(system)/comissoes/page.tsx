"use client";

import { useEffect, useState } from "react";
import { Clock, Phone, MessageSquare, Loader2 } from "lucide-react";

interface Lead {
  id?: string;
  name: string;
  address: string;
  score: number;
  phone?: string;
  contact_status?: string;
  interaction_notes?: string;
  return_date?: string;
}

export default function Atividades() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  // Status counts
  const totalAbordados = leads.filter(l => l.contact_status && l.contact_status !== 'Aguardando Abordagem').length;
  const totalComRetorno = leads.filter(l => l.return_date).length;
  const totalComAnotacoes = leads.filter(l => l.interaction_notes).length;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-[0.3em]">
          <Clock size={14} className="text-blue-400" />
          <span>Atividades Comerciais</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
          Histórico de <span className="text-blue-400">Prospecção</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl">
          Acompanhe todas as interações comerciais realizadas com os condomínios.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
          <Phone size={36} className="absolute top-4 right-4 text-emerald-400/10" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contatos Realizados</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">{totalAbordados}</p>
        </div>
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
          <Clock size={36} className="absolute top-4 right-4 text-yellow-400/10" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Retornos Agendados</span>
          <p className="text-3xl font-black text-yellow-400 mt-1">{totalComRetorno}</p>
        </div>
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
          <MessageSquare size={36} className="absolute top-4 right-4 text-blue-400/10" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Com Anotações</span>
          <p className="text-3xl font-black text-blue-400 mt-1">{totalComAnotacoes}</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 blur-[120px] rounded-full -mr-48 -mt-48" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Registro de Atividades</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{leads.length} leads na base</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-400" size={48} />
              <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Carregando Atividades...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-950/40 backdrop-blur-xl border border-dashed border-white/10 rounded-[3rem]">
              <Clock className="text-slate-700 mb-4" size={64} />
              <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Nenhuma Atividade</h3>
              <p className="text-slate-600 text-sm mt-2 text-center max-w-md">
                As interações de CRM registradas no Cockpit aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead, i) => {
                const statusColor = lead.contact_status === 'Negócio Fechado' ? 'text-emerald-400' :
                  lead.contact_status === 'Reunião Agendada' ? 'text-yellow-400' :
                    lead.contact_status === 'Proposta Enviada' ? 'text-cyan-400' :
                      lead.contact_status === 'Contato Iniciado' ? 'text-blue-400' :
                        lead.contact_status === 'Sem Interesse' ? 'text-rose-500' :
                          'text-slate-500';

                return (
                  <div key={i} className="bg-slate-950/40 border border-white/5 hover:border-blue-400/20 rounded-2xl p-5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-black text-white uppercase tracking-tight">{lead.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{lead.address}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor}`}>
                        {lead.contact_status || 'Aguardando Abordagem'}
                      </span>
                    </div>
                    {lead.interaction_notes && (
                      <div className="mt-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-300 italic">"{lead.interaction_notes}"</p>
                      </div>
                    )}
                    {lead.return_date && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-yellow-400/70 font-bold">
                        <Clock size={10} />
                        Retorno agendado: {new Date(lead.return_date).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}