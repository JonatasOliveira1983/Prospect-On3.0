"use client";
import { api, resolveLeadImageUrl } from '@/lib/api';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ChevronRight,
  Mail,
  Globe,
  Phone,
  Star,
  Building2,
  ScrollText,
  Briefcase,
  Lock
} from "lucide-react";
import LeadDetailModal from "./LeadDetailModal";

interface Lead {
  id?: string;
  name: string;
  address: string;
  score: number;
  category?: string;
  responsavel_nome?: string;
  responsavel_contato?: string;
  phone?: string;
  source?: string;
  email?: string;
  social_url?: string;
  website?: string;
  vision_image_url?: string;
  is_favorite?: boolean | number;
  interaction_notes?: string;
  return_date?: string;
  contact_status?: string;
  intencao_ativa?: boolean | number;
  resumo_sinal?: string;
  link_fonte?: string;
  score_urgencia?: number;
  categoria_demanda?: string;
  pilar?: string;
  reserved_by_user_id?: number;
  reserved_by_name?: string;
  reserved_by_email?: string;
}

const STATUS_DOT: Record<string, string> = {
  'Negócio Fechado':   'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]',
  'Reunião Agendada':  'bg-yellow-300 animate-pulse',
  'Proposta Enviada':  'bg-slate-300',
  'Contato Iniciado':  'bg-blue-400',
  'Sem Interesse':     'bg-rose-500',
};

export default function LeadTable({ leads, onSave, readOnly = false }: { leads: Lead[]; onSave?: () => void; readOnly?: boolean }) {
  const [inspectingLead, setInspectingLead] = useState<Lead | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (leads) {
      setFavorites(
        leads.reduce((acc, curr) => ({
          ...acc,
          [curr.name]: curr.is_favorite === 1 || curr.is_favorite === true
        }), {})
      );
    }
  }, [leads]);

  const handleToggleFavorite = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    if (readOnly) return;

    // Se o lead já estiver reservado por outro usuário, bloquear ação
    if (lead.reserved_by_user_id) {
      alert(`⚠️ Bloqueio de Concorrência:\n\nEste lead já está sendo trabalhado pelo vendedor: ${lead.reserved_by_name} (${lead.reserved_by_email}).\n\nOutro vendedor não pode favoritar este mesmo lead.`);
      return;
    }

    const isCurrentlyFavorite = favorites[lead.name] || false;
    const nextFavorite = !isCurrentlyFavorite;
    setFavorites(prev => ({ ...prev, [lead.name]: nextFavorite }));
    try {
      const leadId = lead.id || lead.name.toLowerCase().replace(/\s+/g, "_").replace(/\//g, "-");
      const res = await api.favorite(leadId, nextFavorite);
      if (!res.ok) {
        setFavorites(prev => ({ ...prev, [lead.name]: isCurrentlyFavorite }));
        try {
          const errData = await res.json();
          if (errData?.detail) {
            alert(`⚠️ Falha ao favoritar:\n\n${errData.detail}`);
          }
        } catch {}
      }
    } catch {
      setFavorites(prev => ({ ...prev, [lead.name]: isCurrentlyFavorite }));
    }
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center">
          <Star size={28} className="text-slate-600" />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum lead no radar ainda</p>
        <p className="text-slate-600 text-xs max-w-xs">Configure os 3 parâmetros acima e clique em <strong className="text-yellow-400">Iniciar Sniper 4 Fases</strong> para começar a capturar leads.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:hidden gap-3">
        {leads.map((lead, i) => {
          const isFav = favorites[lead.name] || false;
          const dotClass = STATUS_DOT[lead.contact_status || ''] || 'bg-slate-600';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-slate-950/40 backdrop-blur-xl border border-white/5 hover:border-yellow-400/20 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer"
              onClick={() => setInspectingLead(lead)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    <img 
                      src={resolveLeadImageUrl(lead.vision_image_url)} 
                      className="w-full h-full object-cover" 
                      alt="" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-yellow-400 font-black text-[9px] uppercase tracking-widest">{lead.source || 'SNIPER TURBO'}</span>
                      
                      {/* Badge do Pilar */}
                      {(lead.pilar || 'A') === 'A' && (
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Building2 size={8} /> Pilar A: Condomínios
                        </span>
                      )}
                      {lead.pilar === 'B' && (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <ScrollText size={8} /> Pilar B: Públicos
                        </span>
                      )}
                      {lead.pilar === 'C' && (
                        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Briefcase size={8} /> Pilar C: Corporativo
                        </span>
                      )}

                      {lead.intencao_ativa ? (
                        <span className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.3)] shrink-0">
                          🔥 OPORTUNIDADE ATIVA
                        </span>
                      ) : null}

                      {lead.reserved_by_user_id ? (
                        <span className="bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Lock size={8} /> Reservado por {lead.reserved_by_name}
                        </span>
                      ) : isFav ? (
                        <span className="bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.2)]">
                          <Lock size={8} /> Reservado por Você
                        </span>
                      ) : null}
                    </div>
                    <h4 className="text-white font-black text-sm leading-tight uppercase tracking-tight truncate">{lead.name}</h4>
                    <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1 truncate">
                      <MapPin size={9} className="text-yellow-400/70 shrink-0" /> {lead.address}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(e, lead)}
                  className={`p-2 rounded-xl transition-all border shrink-0 ${
                    lead.reserved_by_user_id
                      ? 'bg-slate-900 border-purple-500/30 text-purple-400'
                      : isFav
                      ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400 shadow-md shadow-yellow-400/5'
                      : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'
                  }`}
                  title={lead.reserved_by_user_id ? `Reservado por ${lead.reserved_by_name}` : isFav ? "Você reservou este lead (Clique para remover)" : "Favoritar lead"}
                >
                  {lead.reserved_by_user_id ? (
                    <Lock size={16} />
                  ) : isFav ? (
                    <div className="relative">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <div className="absolute -bottom-1.5 -right-1.5 bg-slate-950 rounded-full p-[1px] border border-yellow-400/50">
                        <Lock size={8} className="text-yellow-400" />
                      </div>
                    </div>
                  ) : (
                    <Star size={16} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-white/5">
                <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {lead.contact_status || 'Aguardando Abordagem'}
                </span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setInspectingLead(lead); }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Ver Detalhes & CRM
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="px-5 py-4">⭐</th>
              <th className="px-5 py-4">Condomínio / Endereço</th>
              <th className="px-5 py-4">Status Comercial</th>
              <th className="px-5 py-4">Contatos</th>
              <th className="px-5 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => {
              const isFav = favorites[lead.name] || false;
              const hasNotes = !!lead.interaction_notes;
              const phoneRaw = lead.phone || lead.responsavel_contato || "";
              const dotClass = STATUS_DOT[lead.contact_status || ''] || 'bg-slate-600';

              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-slate-950/20 hover:bg-slate-950/60 border border-white/5 hover:border-yellow-400/30 rounded-2xl transition-all cursor-pointer"
                  onClick={() => setInspectingLead(lead)}
                >
                  {/* Favoritar */}
                  <td className="px-5 py-4 first:rounded-l-2xl w-16">
                    <button
                      onClick={(e) => handleToggleFavorite(e, lead)}
                      className={`p-2 rounded-xl transition-all border hover:scale-105 active:scale-95 ${
                        lead.reserved_by_user_id
                          ? 'bg-slate-900 border-purple-500/30 text-purple-400 shadow-md shadow-purple-500/5'
                          : isFav
                          ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400 shadow-md shadow-yellow-400/10'
                          : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white'
                      }`}
                      title={
                        lead.reserved_by_user_id
                          ? `Reservado por ${lead.reserved_by_name}`
                          : isFav
                          ? "Você reservou este lead (Clique para remover)"
                          : "Marcar como Lead Quente"
                      }
                    >
                      {lead.reserved_by_user_id ? (
                        <Lock size={15} />
                      ) : isFav ? (
                        <div className="relative">
                          <Star size={15} className="fill-yellow-400 text-yellow-400" />
                          <div className="absolute -bottom-1.5 -right-1.5 bg-slate-950 rounded-full p-[1px] border border-yellow-400/50">
                            <Lock size={7} className="text-yellow-400" />
                          </div>
                        </div>
                      ) : (
                        <Star size={15} />
                      )}
                    </button>
                  </td>

                  {/* Nome e Endereço */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-yellow-400/40 transition-colors shrink-0">
                        <img 
                          src={resolveLeadImageUrl(lead.vision_image_url)} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-white font-black group-hover:text-yellow-400 transition-colors uppercase tracking-tight text-sm">{lead.name}</h5>
                          
                          {/* Badge do Pilar */}
                          {(lead.pilar || 'A') === 'A' && (
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Building2 size={8} /> Pilar A: Condomínios
                            </span>
                          )}
                          {lead.pilar === 'B' && (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <ScrollText size={8} /> Pilar B: Públicos
                            </span>
                          )}
                          {lead.pilar === 'C' && (
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Briefcase size={8} /> Pilar C: Corporativo
                            </span>
                          )}

                          {lead.intencao_ativa ? (
                            <span className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.3)] whitespace-nowrap">
                              🔥 OPORTUNIDADE ATIVA
                            </span>
                          ) : null}

                          {lead.reserved_by_user_id ? (
                            <span className="bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Lock size={8} /> Reservado por {lead.reserved_by_name}
                            </span>
                          ) : isFav ? (
                            <span className="bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap animate-pulse shadow-[0_0_6px_rgba(250,204,21,0.15)]">
                              <Lock size={8} /> Reservado por Você
                            </span>
                          ) : null}
                        </div>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5 font-medium max-w-xs truncate">
                          <MapPin size={10} className="text-yellow-400/60 shrink-0" /> {lead.address}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status Comercial */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                          {lead.contact_status || 'Aguardando Abordagem'}
                        </span>
                      </div>
                      {hasNotes && (
                        <p className="text-[10px] text-slate-500 italic font-medium max-w-[200px] truncate">
                          "{lead.interaction_notes}"
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Contatos Rápidos */}
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <div className={`p-1.5 rounded-lg border ${phoneRaw && phoneRaw !== 'N/D' ? 'bg-slate-800 text-yellow-400 border-white/5' : 'bg-slate-900/30 text-slate-600 border-transparent'}`} title={phoneRaw || 'Sem Telefone'}>
                        <Phone size={12} />
                      </div>
                      <div className={`p-1.5 rounded-lg border ${lead.email && lead.email !== 'N/D' ? 'bg-slate-800 text-yellow-400 border-white/5' : 'bg-slate-900/30 text-slate-600 border-transparent'}`} title={lead.email || 'Sem E-mail'}>
                        <Mail size={12} />
                      </div>
                      <div className={`p-1.5 rounded-lg border ${lead.website && lead.website !== 'N/D' ? 'bg-slate-800 text-yellow-400 border-white/5' : 'bg-slate-900/30 text-slate-600 border-transparent'}`} title={lead.website || 'Sem Site'}>
                        <Globe size={12} />
                      </div>
                    </div>
                  </td>

                  {/* Ver Detalhes */}
                  <td className="px-5 py-4 last:rounded-r-2xl text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setInspectingLead(lead); }}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95"
                      >
                        Ver CRM
                      </button>
                      <button className="p-2 bg-slate-900 hover:bg-slate-700 text-slate-500 hover:text-white rounded-xl transition-all border border-white/5">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inspectingLead && (
        <LeadDetailModal
          lead={inspectingLead}
          isOpen={!!inspectingLead}
          onClose={() => setInspectingLead(null)}
          onSave={() => {
            setInspectingLead(null);
            if (onSave) onSave();
          }}
          readOnly={readOnly || !!inspectingLead.reserved_by_user_id}
        />
      )}
    </>
  );
}
