"use client";
import { api, WS_URL } from '@/lib/api';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ChevronRight,
  Mail,
  Globe,
  Phone,
  Star,
  ExternalLink,
  Calendar,
  MessageSquare
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
}

export default function LeadTable({ leads }: { leads: Lead[] }) {
  const [inspectingLead, setInspectingLead] = useState<Lead | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Sincronizar estado local de favoritos quando os leads mudarem
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
    const isCurrentlyFavorite = favorites[lead.name] || false;
    const nextFavorite = !isCurrentlyFavorite;

    // Atualização otimista na interface
    setFavorites(prev => ({ ...prev, [lead.name]: nextFavorite }));

    try {
      const leadId = lead.id || lead.name.toLowerCase().replace(/\s+/g, "_").replace(/\//g, "-");
      const res = await fetch(`/api/leads/${leadId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: nextFavorite })
      });

      if (!res.ok) {
        // Rollback se falhar
        setFavorites(prev => ({ ...prev, [lead.name]: isCurrentlyFavorite }));
      }
    } catch (error) {
      console.error("Erro ao favoritar lead:", error);
      setFavorites(prev => ({ ...prev, [lead.name]: isCurrentlyFavorite }));
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {leads.map((lead, i) => {
          const isFav = favorites[lead.name] || false;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-950/40 backdrop-blur-xl border border-white/5 hover:border-emerald-400/20 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden"
              onClick={() => setInspectingLead(lead)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-emerald-400 font-black text-[9px] uppercase tracking-widest mb-1">{lead.source || 'SNIPER TURBO'}</span>
                  <h4 className="text-white font-black text-lg leading-tight uppercase tracking-tight">{lead.name}</h4>
                  <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                    <MapPin size={11} className="text-emerald-500 shrink-0" /> {lead.address}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={(e) => handleToggleFavorite(e, lead)}
                    className={`p-2.5 rounded-xl transition-all border ${isFav
                        ? 'bg-rose-500/25 border-rose-500/30 text-rose-400'
                        : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'
                      }`}
                  >
                    <Star size={18} className={isFav ? "fill-rose-400" : ""} />
                  </button>
                </div>
              </div>

              {/* Status do Contato Comercial */}
              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <div className={`w-2 h-2 rounded-full ${lead.contact_status === 'Negócio Fechado' ? 'bg-emerald-400' :
                    lead.contact_status === 'Reunião Agendada' ? 'bg-yellow-400 animate-pulse' :
                      lead.contact_status === 'Proposta Enviada' ? 'bg-cyan-400' :
                        lead.contact_status === 'Contato Iniciado' ? 'bg-blue-400' :
                          lead.contact_status === 'Sem Interesse' ? 'bg-rose-500' :
                            'bg-slate-600'
                  }`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {lead.contact_status || 'Aguardando Abordagem'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setInspectingLead(lead); }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  Ver Detalhes & CRM
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="px-6 py-4">Favorito</th>
              <th className="px-6 py-4">Condomínio / Endereço</th>
              <th className="px-6 py-4">Status Comercial</th>
              <th className="px-6 py-4">Contatos</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => {
              const isFav = favorites[lead.name] || false;
              const hasNotes = !!lead.interaction_notes;
              const phoneRaw = lead.phone || lead.responsavel_contato || "";

              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-slate-950/20 hover:bg-slate-950/60 border border-white/5 hover:border-emerald-400/30 rounded-2xl transition-all cursor-pointer relative"
                  onClick={() => setInspectingLead(lead)}
                >
                  {/* Favoritar */}
                  <td className="px-6 py-5 first:rounded-l-[1.5rem] w-20">
                    <button
                      onClick={(e) => handleToggleFavorite(e, lead)}
                      className={`p-2.5 rounded-xl transition-all border hover:scale-105 active:scale-95 ${isFav
                          ? 'bg-rose-500/25 border-rose-500/30 text-rose-400 shadow-md shadow-rose-500/5'
                          : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white'
                        }`}
                      title={isFav ? "Remover dos Favoritos" : "Marcar como Favorito (Lead Quente)"}
                    >
                      <Star size={16} className={isFav ? "fill-rose-400" : ""} />
                    </button>
                  </td>

                  {/* Nome e Endereço */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-emerald-400/50 transition-colors shrink-0">
                        {lead.vision_image_url ? (
                          <img src={lead.vision_image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                            <Star size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="text-white font-black group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{lead.name}</h5>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1 font-medium max-w-lg truncate">
                          <MapPin size={11} className="text-emerald-400/70 shrink-0" /> {lead.address}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Funil Comercial Status */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${lead.contact_status === 'Negócio Fechado' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                            lead.contact_status === 'Reunião Agendada' ? 'bg-yellow-400 animate-pulse' :
                              lead.contact_status === 'Proposta Enviada' ? 'bg-cyan-400' :
                                lead.contact_status === 'Contato Iniciado' ? 'bg-blue-400' :
                                  lead.contact_status === 'Sem Interesse' ? 'bg-rose-500' :
                                    'bg-slate-600'
                          }`} />
                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                          {lead.contact_status || 'Aguardando Abordagem'}
                        </span>
                      </div>
                      {hasNotes && (
                        <p className="text-[10px] text-slate-400 italic font-medium max-w-[200px] truncate">
                          "{lead.interaction_notes}"
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Contatos Rápidos */}
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      {phoneRaw && phoneRaw !== 'N/D' ? (
                        <div className="p-2 bg-slate-800/80 rounded-lg text-emerald-400 border border-white/5" title={`Celular: ${phoneRaw}`}><Phone size={13} /></div>
                      ) : (
                        <div className="p-2 bg-slate-900/30 rounded-lg text-slate-600" title="Sem Telefone"><Phone size={13} /></div>
                      )}
                      {lead.email && lead.email !== 'N/D' ? (
                        <div className="p-2 bg-slate-800/80 rounded-lg text-emerald-400 border border-white/5" title={`E-mail: ${lead.email}`}><Mail size={13} /></div>
                      ) : (
                        <div className="p-2 bg-slate-900/30 rounded-lg text-slate-600" title="Sem E-mail"><Mail size={13} /></div>
                      )}
                      {lead.website && lead.website !== 'N/D' ? (
                        <div className="p-2 bg-slate-800/80 rounded-lg text-emerald-400 border border-white/5" title={`Site: ${lead.website}`}><Globe size={13} /></div>
                      ) : (
                        <div className="p-2 bg-slate-900/30 rounded-lg text-slate-600" title="Sem Site"><Globe size={13} /></div>
                      )}
                    </div>
                  </td>

                  {/* Ver Detalhes */}
                  <td className="px-6 py-5 last:rounded-r-[1.5rem] text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setInspectingLead(lead); }}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95"
                      >
                        Ver CRM
                      </button>
                      <button className="p-2.5 bg-slate-850 hover:bg-slate-700 text-slate-500 hover:text-white rounded-xl transition-all">
                        <ChevronRight size={15} />
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
          onSave={() => window.location.reload()}
        />
      )}
    </>
  );
}

