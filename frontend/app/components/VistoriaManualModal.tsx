"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Building2, Layers, MapPin, AlertCircle, MessageSquare, Globe, Link } from "lucide-react";

interface Lead {
  id?: string;
  name: string;
  address: string;
  score: number;
  email?: string;
  social_url?: string;
  booking_url?: string;
  surveyor_analysis?: {
    andares_por_torre: number;
    total_torres: number;
    estimativa_area_m2: number;
  };
  vision_analysis?: {
    desgaste: string;
    urgencia: boolean;
  };
  market?: {
    avg_m2_price: number;
  };
}

interface Props {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
}

export default function VistoriaManualModal({ lead, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    andares: lead.surveyor_analysis?.andares_por_torre || 8,
    torres: lead.surveyor_analysis?.total_torres || 1,
    desgaste: lead.vision_analysis?.desgaste || "Médio",
    urgencia: lead.vision_analysis?.urgencia || false,
    preco_m2: lead.market?.avg_m2_price || 75,
    email: lead.email || "",
    social_url: lead.social_url || "",
    booking_url: lead.booking_url || ""
  });

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    const total_m2 = formData.andares * 420 * formData.torres;

    const updatedLead = {
      ...lead,
      email: formData.email,
      social_url: formData.social_url,
      booking_url: formData.booking_url,
      surveyor_analysis: {
        ...lead.surveyor_analysis,
        andares_por_torre: formData.andares,
        total_torres: formData.torres,
        estimativa_area_m2: total_m2
      },
      vision_analysis: {
        ...lead.vision_analysis,
        desgaste: formData.desgaste,
        urgencia: formData.urgencia
      },
      market: {
        ...lead.market,
        avg_m2_price: formData.preco_m2
      }
    };

    try {
      const res = await fetch('/api/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead)
      });

      if (res.ok) {
        onSave(updatedLead);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar vistoria:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden relative z-10 my-8"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <Building2 className="text-primary" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-white">Vistoria & Contatos</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[350px]">{lead.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Dados Estruturais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={12} /> Andares
                    </label>
                    <input
                      type="number"
                      value={isNaN(formData.andares) ? "" : formData.andares}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData({ ...formData, andares: isNaN(val) ? 0 : val });
                      }}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Building2 size={12} /> Torres
                    </label>
                    <input
                      type="number"
                      value={isNaN(formData.torres) ? "" : formData.torres}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData({ ...formData, torres: isNaN(val) ? 0 : val });
                      }}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={12} /> Desgaste da Fachada
                  </label>
                  <select
                    value={formData.desgaste}
                    onChange={(e) => setFormData({ ...formData, desgaste: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none"
                  >
                    <option value="Baixo">Baixo (Conservado)</option>
                    <option value="Médio">Médio (Desgaste Natural)</option>
                    <option value="Alto">Alto (Crítico)</option>
                    <option value="Extremo">Extremo (Infiltrações)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <input
                    type="checkbox"
                    id="urgencia"
                    checked={formData.urgencia}
                    onChange={(e) => setFormData({ ...formData, urgencia: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-900 text-primary"
                  />
                  <label htmlFor="urgencia" className="text-xs font-bold text-slate-200 cursor-pointer">
                    URGÊNCIA CRÍTICA (Score 10.0)
                  </label>
                </div>
              </div>

              <div className="space-y-6 border-l border-white/5 pl-8">
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">Canais Digitais (Sniper)</h4>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={12} /> E-mail de Contato
                  </label>
                  <input
                    type="email"
                    placeholder="sindico@condominio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Globe size={12} /> Perfil Social (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={formData.social_url}
                    onChange={(e) => setFormData({ ...formData, social_url: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Link size={12} /> Agendamento / Linktree
                  </label>
                  <input
                    type="text"
                    placeholder="https://linktr.ee/..."
                    value={formData.booking_url}
                    onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] bg-primary hover:bg-primary/80 text-slate-950 text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <AlertCircle className="animate-spin" size={16} /> : <Save size={16} />}
                Salvar Vistoria & Contatos
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
