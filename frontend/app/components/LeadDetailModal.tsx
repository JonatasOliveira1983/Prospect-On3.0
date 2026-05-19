"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Calendar,
  MessageSquare,
  Clock,
  Check,
  Loader2,
  User,
  Send,
  Sparkles,
  Flame
} from "lucide-react";

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
  interaction_notes?: string;
  return_date?: string;
  contact_status?: string;
  is_favorite?: boolean | number;
}

interface Props {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function LeadDetailModal({ lead, isOpen, onClose, onSave }: Props) {
  const leadId = lead.id || lead.name.toLowerCase().replace(/\s+/g, "_").replace(/\//g, "-");

  const [notes, setNotes] = useState(lead.interaction_notes || "");
  const [returnDate, setReturnDate] = useState(lead.return_date || "");
  const [status, setStatus] = useState(lead.contact_status || "Aguardando Abordagem");
  const [saving, setSaving] = useState(false);

  // Normalização do telefone para WhatsApp
  const phoneRaw = lead.phone || lead.responsavel_contato || "";
  const phoneNumbersOnly = phoneRaw.replace(/\D/g, "");

  // Formatando WhatsApp URL
  let whatsappUrl = "";
  if (phoneNumbersOnly) {
    let formattedNum = phoneNumbersOnly;
    if (formattedNum.length === 10 || formattedNum.length === 11) {
      formattedNum = "55" + formattedNum;
    }
    whatsappUrl = `https://wa.me/${formattedNum}`;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes,
          return_date: returnDate || null,
          contact_status: status
        })
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        alert("Erro ao salvar dados comercial.");
      }
    } catch (error) {
      console.error("Erro ao salvar interação no CRM:", error);
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative z-10 my-8 flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-20"
            >
              <X size={18} />
            </button>

            {/* Coluna 1: Informações Gerais do Lead */}
            <div className="flex-1 flex flex-col gap-6 md:border-r md:border-white/5 md:pr-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Sparkles size={10} className="fill-emerald-400/20" /> Lead Radar
                  </span>
                  {lead.is_favorite ? (
                    <span className="bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                      <Flame size={10} className="fill-rose-400" /> Leads Quentes
                    </span>
                  ) : null}
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                  {lead.name}
                </h2>
                <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-2 font-medium">
                  <MapPin size={13} className="text-emerald-400 shrink-0" />
                  {lead.address}
                </p>
              </div>

              {/* Fachada do Condomínio */}
              <div className="w-full h-48 rounded-[2rem] overflow-hidden bg-slate-950 border border-white/5 relative shrink-0">
                {lead.vision_image_url ? (
                  <img src={lead.vision_image_url} className="w-full h-full object-cover" alt="Fachada" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2 bg-slate-950">
                    <Sparkles size={32} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Sem Fachada Cadastrada</span>
                  </div>
                )}
              </div>

              {/* Atalhos de Ação Comercial (WhatsApp e Email) */}
              <div className="flex flex-col sm:flex-row gap-3">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-95"
                  >
                    <Phone size={16} className="fill-slate-950" />
                    Chamar WhatsApp
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-slate-800 text-slate-600 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-widest opacity-40 cursor-not-allowed"
                  >
                    <Phone size={16} />
                    Sem WhatsApp
                  </button>
                )}

                {lead.email && lead.email !== "N/D" ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-white/10 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95"
                  >
                    <Mail size={16} className="text-yellow-400" />
                    Mandar E-mail
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-slate-800 text-slate-600 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-widest opacity-40 cursor-not-allowed"
                  >
                    <Mail size={16} />
                    Sem E-mail
                  </button>
                )}
              </div>

              {/* Detalhes de Canais Web */}
              <div className="bg-slate-950/40 p-5 rounded-[2rem] border border-white/5 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <User size={12} className="text-emerald-400" /> Canais Encontrados
                </h4>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Telefone</span>
                    <span className="font-bold text-white">{phoneRaw || "N/D"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">E-mail</span>
                    <span className="font-bold text-white truncate max-w-[220px]">{lead.email || "N/D"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Website</span>
                    {lead.website && lead.website !== "N/D" ? (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline flex items-center gap-1 truncate max-w-[220px]">
                        {lead.website} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="font-bold text-slate-600">N/D</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Perfil Social</span>
                    {lead.social_url && lead.social_url !== "N/D" ? (
                      <a href={lead.social_url} target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline flex items-center gap-1 truncate max-w-[220px]">
                        Instagram/Social <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="font-bold text-slate-600">N/D</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Painel CRM (Notas, Status e Retorno) */}
            <div className="flex-1 flex flex-col gap-6 justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">CRM Otto Pinturas</h3>
                  <p className="text-xs text-slate-400 font-medium">Acompanhe as prospecções e registre o andamento do contato com o condomínio.</p>
                </div>

                {/* Seletor de Status do Funil */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} className="text-emerald-400" />
                    Status da Abordagem
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-emerald-400 appearance-none cursor-pointer"
                  >
                    <option value="Aguardando Abordagem">🟡 Aguardando Abordagem</option>
                    <option value="Contato Iniciado">🔵 Contato Iniciado (WhatsApp/Ligação)</option>
                    <option value="Proposta Enviada">📧 Proposta Comercial Enviada</option>
                    <option value="Reunião Agendada">📅 Reunião Agendada</option>
                    <option value="Negócio Fechado">🟢 Negócio Fechado (Pintura Otto)</option>
                    <option value="Sem Interesse">❌ Sem Interesse / Sem Demanda</option>
                  </select>
                </div>

                {/* Anotações da Conversa */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-emerald-400" />
                    O que você conversou com o cliente?
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva notas rápidas: com quem falou, o que ele respondeu, se enviou proposta, valor cobrado..."
                    rows={6}
                    className="w-full bg-slate-950 border border-white/10 focus:border-emerald-400 rounded-[1.5rem] p-4 text-sm text-white outline-none placeholder-slate-600 transition-colors focus:ring-1 focus:ring-emerald-400/15 resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Agendar data de retorno */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} className="text-yellow-400" />
                    Agendar retorno para próxima ligação
                  </label>
                  <input
                    type="datetime-local"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 focus:border-emerald-400 rounded-2xl p-4 text-xs font-bold text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Botão de Salvar no CRM */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/10 mt-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span className="uppercase tracking-widest text-xs">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span className="uppercase tracking-widest text-xs">Salvar Registro no CRM</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
