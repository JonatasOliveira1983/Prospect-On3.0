"use client";
import { api } from '@/lib/api';

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
  Clock,
  MessageSquare,
  Loader2,
  User,
  Sparkles,
  Flame,
  Star,
  Check,
  Image as ImageIcon,
  AlertCircle
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

  // Estado para correção de fachada
  const [fachadaUrl, setFachadaUrl] = useState(lead.vision_image_url || "");
  const [fachadaInputVisible, setFachadaInputVisible] = useState(false);
  const [fachadaPreview, setFachadaPreview] = useState(lead.vision_image_url || "");
  const [fachadaError, setFachadaError] = useState(false);

  // Normalização do telefone para WhatsApp
  const phoneRaw = lead.phone || lead.responsavel_contato || "";
  const phoneNumbersOnly = phoneRaw.replace(/\D/g, "");

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
      const body = {
        notes,
        return_date: returnDate || null,
        contact_status: status,
        vision_image_url: fachadaPreview || null
      };
      const res = await api.interaction(leadId, body);
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

  function handleApplyFachada() {
    setFachadaPreview(fachadaUrl);
    setFachadaError(false);
    setFachadaInputVisible(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-start md:items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
            className="bg-slate-900 border border-yellow-400/10 w-full max-w-4xl rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-2xl relative z-10 my-4 sm:my-8 flex flex-col md:flex-row gap-5 md:gap-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-20"
            >
              <X size={18} />
            </button>

            {/* ── Coluna 1: Informações do Lead ── */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-5 md:border-r md:border-white/5 md:pr-8">
              {/* Badges + Nome */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-400/20 flex items-center gap-1">
                    <Sparkles size={10} /> Lead Radar
                  </span>
                  {lead.is_favorite ? (
                    <span className="bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                      <Flame size={10} className="fill-rose-400" /> Lead Quente
                    </span>
                  ) : null}
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight pr-10">
                  {lead.name}
                </h2>
                <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-2 font-medium">
                  <MapPin size={13} className="text-yellow-400 shrink-0" />
                  {lead.address}
                </p>
              </div>

              {/* Fachada + Botão Corrigir */}
              <div className="flex flex-col gap-2">
                <div className="w-full h-36 sm:h-44 rounded-xl sm:rounded-[2rem] overflow-hidden bg-slate-950 border border-white/5 relative shrink-0">
                  {fachadaPreview && !fachadaError ? (
                    <img
                      src={fachadaPreview}
                      className="w-full h-full object-cover"
                      alt="Fachada"
                      onError={() => setFachadaError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2 bg-slate-950">
                      <ImageIcon size={28} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">
                        {fachadaError ? "Imagem Inválida" : "Sem Fachada Cadastrada"}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setFachadaInputVisible(v => !v)}
                    className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-yellow-400 hover:text-slate-900 text-slate-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border border-white/10 transition-all flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <ImageIcon size={10} /> Corrigir Foto
                  </button>
                </div>

                <AnimatePresence>
                  {fachadaInputVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 bg-slate-950 border border-yellow-400/30 rounded-xl p-3">
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-yellow-400 uppercase tracking-widest block mb-1">
                            Cole a URL da foto correta da fachada
                          </label>
                          <input
                            type="url"
                            value={fachadaUrl}
                            onChange={e => { setFachadaUrl(e.target.value); setFachadaError(false); }}
                            placeholder="https://exemplo.com/fachada.jpg"
                            className="w-full bg-transparent text-white text-xs font-medium outline-none placeholder-slate-600"
                          />
                        </div>
                        <button
                          onClick={handleApplyFachada}
                          disabled={!fachadaUrl}
                          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-slate-900 font-black px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all shrink-0 flex items-center gap-1"
                        >
                          <Check size={12} /> Aplicar
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1.5 px-1 flex items-center gap-1">
                        <AlertCircle size={9} /> A foto é salva ao clicar em "Salvar Registro no CRM".
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botões de Ação: WhatsApp e E-mail */}
              <div className="flex flex-col sm:flex-row gap-3">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-widest shadow-lg shadow-yellow-400/10 hover:scale-[1.02] active:scale-95"
                  >
                    <Phone size={15} className="fill-slate-900" />
                    Chamar WhatsApp
                  </a>
                ) : (
                  <button disabled className="flex-1 bg-slate-800 text-slate-600 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest opacity-40 cursor-not-allowed">
                    <Phone size={15} /> Sem WhatsApp
                  </button>
                )}

                {lead.email && lead.email !== "N/D" ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-white/10 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95"
                  >
                    <Mail size={15} className="text-yellow-400" />
                    Mandar E-mail
                  </a>
                ) : (
                  <button disabled className="flex-1 bg-slate-800 text-slate-600 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest opacity-40 cursor-not-allowed">
                    <Mail size={15} /> Sem E-mail
                  </button>
                )}
              </div>

              {/* Canais Encontrados */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <User size={11} className="text-yellow-400" /> Canais Encontrados
                </h4>
                {[
                  { label: 'Telefone', value: phoneRaw || 'N/D' },
                  { label: 'E-mail', value: lead.email || 'N/D' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-white truncate max-w-[200px]">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Website</span>
                  {lead.website && lead.website !== "N/D" ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="font-bold text-yellow-400 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                      {lead.website} <ExternalLink size={9} />
                    </a>
                  ) : <span className="font-bold text-slate-600">N/D</span>}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Perfil Social</span>
                  {lead.social_url && lead.social_url !== "N/D" ? (
                    <a href={lead.social_url} target="_blank" rel="noreferrer" className="font-bold text-yellow-400 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                      Instagram/Social <ExternalLink size={9} />
                    </a>
                  ) : <span className="font-bold text-slate-600">N/D</span>}
                </div>
              </div>
            </div>

            {/* ── Coluna 2: CRM ── */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-5 justify-between">
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mb-1">CRM Otto Pinturas</h3>
                  <p className="text-xs text-slate-400 font-medium">Registre o andamento do contato e o histórico da prospecção.</p>
                </div>

                {/* Status da Abordagem */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Star size={11} className="text-yellow-400" /> Status da Abordagem
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer"
                  >
                    <option value="Aguardando Abordagem">🟡 Aguardando Abordagem</option>
                    <option value="Contato Iniciado">🔵 Contato Iniciado (WhatsApp/Ligação)</option>
                    <option value="Proposta Enviada">📧 Proposta Comercial Enviada</option>
                    <option value="Reunião Agendada">📅 Reunião Agendada</option>
                    <option value="Negócio Fechado">✅ Negócio Fechado (Pintura Otto)</option>
                    <option value="Sem Interesse">❌ Sem Interesse / Sem Demanda</option>
                  </select>
                </div>

                {/* Anotações */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare size={11} className="text-yellow-400" /> O que você conversou com o cliente?
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas rápidas: com quem falou, o que respondeu, proposta enviada, valor cobrado..."
                    rows={5}
                    className="w-full bg-slate-950 border border-white/10 focus:border-yellow-400 rounded-[1.5rem] p-4 text-sm text-white outline-none placeholder-slate-600 transition-colors resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Agendamento de Retorno */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={11} className="text-yellow-400" /> Agendar retorno
                  </label>
                  <input
                    type="datetime-local"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 focus:border-yellow-400 rounded-2xl p-3.5 text-xs font-bold text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-yellow-400/10 mt-auto"
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
