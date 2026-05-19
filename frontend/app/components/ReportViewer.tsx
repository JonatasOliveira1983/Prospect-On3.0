"use client";
import { resolveLeadImageUrl } from '@/lib/api';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Building2, MapPin, Calendar, Eye,
  AlertTriangle, CheckCircle2, TrendingUp, Sparkles,
  Shield, Gauge, DollarSign, Layers, Car, Ruler,
  Briefcase, Clock,
  Check, CreditCard, Award, Info
} from "lucide-react";

interface ReportData {
  name: string;
  address: string;
  score?: number;
  category?: string;
  idade_anos?: number;
  num_torres?: number;
  num_apartamentos?: number;
  metragem_media?: string;
  area_total_estimada?: number;
  vagas_garagem?: number;
  data_abertura?: string;
  analyzed?: boolean;
  version?: string;
  vision_image_path?: string;
  vision_image_url?: string;
  satellite_image_url?: string;
  location_map_url?: string;
  vision_analysis?: {
    desgaste: string;
    urgencia: boolean;
    patologias?: string[];
    comentario_tecnico?: string;
    proposito_estrategico?: string;
  };
  market?: {
    avg_m2_price: number;
    avg_m2?: number;
    avg_unit_m2?: number;
    total_units?: number;
    bairro?: string;
  };
  valuation?: {
    unit_value?: number;
    total_asset_value?: number;
    appreciation_percent?: number;
    total_appreciation_gain: number;
    gain_per_unit: number;
  };
  empresa?: {
    nome_fantasia: string;
    razao_social: string;
    cnpj: string;
    sede_jundiai: string;
    escritorio_sp: string;
    whatsapp: string;
    email: string;
    slogan: string;
    experiencia: string;
    parceiros_tintas: string[];
    portfolio: Array<{ projeto: string; local: string; area: number }>;
  };
  proposta_comercial?: {
    orcamento_total: number;
    area_total_m2: number;
    preco_m2: number;
    itens_orcamento: Array<{ item: string; valor: number; percentual: string }>;
    memorial_descritivo: Array<{ etapa: number; titulo: string; descricao: string }>;
    cronograma: {
      prazo_dias: number;
      data_inicio_prevista: string;
      data_fim_prevista: string;
      marcos: Array<{ fase: string; percentual: number; dias: number }>;
    };
    condicoes_pagamento: {
      descricao: string;
      entrada_valor: number;
      parcela_valor: number;
      parcelas: number;
    };
    garantia: { anos: number; descricao: string };
    compliance: { nr35: string; nr18: string; art: string };
  };
}

interface ReportViewerProps {
  report: ReportData | null;
  reportUrl: string | null;
  onClose: () => void;
}

export default function ReportViewer({ report, reportUrl, onClose }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<"laudo" | "proposta">("laudo");

  if (!report) return null;

  const vision = report.vision_analysis || {} as any;
  const valuation = report.valuation || {} as any;
  const market = report.market || {} as any;
  const proposta = report.proposta_comercial;

  const desgasteColor = vision.desgaste === "Crítico"
    ? "text-rose-400" : vision.desgaste === "Elevado"
    ? "text-orange-400" : vision.desgaste === "Médio"
    ? "text-yellow-400" : "text-emerald-400";

  const desgasteBg = vision.desgaste === "Crítico"
    ? "bg-rose-500/10 border-rose-500/20" : vision.desgaste === "Elevado"
    ? "bg-orange-500/10 border-orange-500/20" : vision.desgaste === "Médio"
    ? "bg-yellow-500/10 border-yellow-500/20" : "bg-emerald-500/10 border-emerald-500/20";

  const handleDownloadPDF = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-lg flex items-start justify-center overflow-y-auto py-8"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-[850px] max-w-[95vw] relative"
        >
          {/* Floating Action Bar */}
          <div className="sticky top-0 z-50 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="glass px-1 py-1 rounded-full border border-white/10 flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("laudo")}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeTab === "laudo" ? "bg-primary text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Laudo de Valorização
                </button>
                <button
                  onClick={() => setActiveTab("proposta")}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeTab === "proposta" ? "bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Proposta Comercial
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {reportUrl && (
                <button
                  onClick={handleDownloadPDF}
                  className="glass px-4 py-2 rounded-full border border-primary/30 flex items-center gap-2 hover:bg-primary/20 transition-all group"
                >
                  <Download size={14} className="text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Baixar PDF</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="glass p-2.5 rounded-full border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all group"
              >
                <X size={14} className="text-slate-400 group-hover:text-rose-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-slate-950">
            {activeTab === "laudo" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="laudo">
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-8 border-b border-white/5">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/20">
                        <Sparkles size={18} className="text-primary" />
                      </div>
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Prospect-On v3.0</h3>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">{report.name}</h2>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={13} className="text-primary/60" />
                      <span className="text-sm font-medium">{report.address}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 border-b border-white/5">
                   {[
                    { icon: Building2, label: "Torres", value: report.num_torres || "—" },
                    { icon: Layers, label: "Apartamentos", value: report.num_apartamentos || market.total_units || "—" },
                    { icon: Calendar, label: "Idade", value: report.idade_anos ? `${report.idade_anos} anos` : "—" },
                    { icon: Ruler, label: "Metragem", value: report.metragem_media || "—" },
                    { icon: Car, label: "Vagas", value: report.vagas_garagem || "—" },
                    { icon: DollarSign, label: "m² Médio", value: market.avg_m2_price ? `R$ ${market.avg_m2_price.toLocaleString()}` : "—" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 border-r border-white/5 last:border-r-0">
                      <item.icon size={14} className="text-primary/40 mb-2" />
                      <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-8 space-y-10">
                  <section>
                    <div className="flex items-center gap-2 mb-5">
                      <Eye size={14} className="text-rose-400" />
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">1. Diagnóstico de Impacto — IA Vision</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Foto da Fachada Analisada (O visual que faltava!) */}
                      <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                         <img 
                           src={resolveLeadImageUrl(vision.image_url || report.vision_image_url)} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                           alt="Fachada Analisada"
                           onError={(e) => {
                             (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
                           }}
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute top-3 left-3 px-2 py-1 bg-rose-500/80 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-widest">
                            Foco de Análise Técnica
                         </div>
                      </div>

                      <div className="lg:col-span-7 space-y-4">
                        <div className={`rounded-2xl border p-5 ${desgasteBg}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <Gauge size={16} className={desgasteColor} />
                            <span className="text-[10px] font-bold uppercase text-slate-400">Nível de Deterioração</span>
                          </div>
                          <p className={`text-2xl font-black ${desgasteColor}`}>{vision.desgaste || "Normal"}</p>
                        </div>
                        
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {vision.patologias?.map((p: string, j: number) => (
                              <span key={j} className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/10">⚠ {p}</span>
                            ))}
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/40 pl-4 py-1">
                            "{vision.comentario_tecnico || "Identificada necessidade de revitalização corretiva."}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Valorização Patrimonial</h4>
                    </div>
                    <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 shadow-inner">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Fator Ganho</p>
                          <p className="text-xl font-black text-emerald-400">+{valuation.appreciation_percent || 12}%</p>
                        </div>
                        <div className="lg:col-span-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 text-right">Potencial de Ganho Total</p>
                          <p className="text-3xl font-black text-white text-right">R$ {(valuation.total_appreciation_gain || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-xl p-4 border border-primary/10 text-center">
                        <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">Ganho Estimado por Unidade</p>
                        <p className="text-2xl font-black text-primary">+ R$ {(valuation.gain_per_unit || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="proposta">
                <div className="relative min-h-[450px] flex flex-col justify-end overflow-hidden">
                    <div className="absolute inset-0">
                      <img 
                        src={resolveLeadImageUrl(report.vision_image_url)} 
                        className="w-full h-full object-cover" 
                        alt="Fachada"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                    </div>
                   <div className="relative z-10 p-10">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-shadow-glow">PROPOSTA 3.0 STRATEGIC</span>
                        </div>
                     </div>
                     <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none uppercase">{report.name}</h2>
                     <p className="text-xl text-slate-300 font-medium max-w-2xl">Investimento em preservação estrutural e valorização mobiliária.</p>
                     <div className="flex items-center gap-8 mt-10">
                        <div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">VGV do Projeto</span>
                           <span className="text-3xl font-black text-white">R$ {proposta?.orcamento_total.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div>
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Valorização Prevista</span>
                           <span className="text-3xl font-black text-emerald-400">+{valuation.appreciation_percent || 15}%</span>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="p-10 space-y-16 bg-slate-950/60">
                  <section className="relative">
                    <div className="flex flex-col lg:flex-row gap-12">
                       <div className="flex-1">
                          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">O PROPÓSITO</h4>
                          <h3 className="text-3xl font-black text-white tracking-tight mb-6 outline-text-shadow">Engenharia de Valor</h3>
                          <p className="text-lg text-slate-300 leading-relaxed font-['Inter'] italic mb-8 border-l-4 border-emerald-500 pl-6">
                            "{vision.proposito_estrategico || "A fachada é o principal ativo do seu edifício. Nossa intervenção remove riscos e garante longevidade estrutural."}"
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                <Shield className="text-emerald-400 mb-3" size={24} />
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Proteção Máxima</p>
                                <p className="text-[10px] text-slate-500 mt-1">Vedação elastomérica e térmica.</p>
                             </div>
                             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                <TrendingUp className="text-emerald-400 mb-3" size={24} />
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Valorização Real</p>
                                <p className="text-[10px] text-slate-500 mt-1">Impacto estético imediato.</p>
                             </div>
                          </div>
                       </div>
                       <div className="lg:w-1/3 bg-slate-900 rounded-3xl border border-white/5 p-8 flex flex-col justify-center items-center text-center">
                          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                             <Check className="text-emerald-400" size={32} />
                          </div>
                          <p className="text-xl font-bold text-white mb-2">LAUDO APROVADO</p>
                          <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Padrão Otto Pinturas</p>
                       </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-8">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <DollarSign size={14} className="text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Orçamento e Condições</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                            <table className="w-full text-left">
                               <thead className="bg-white/5">
                                 <tr>
                                   <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Item de Serviço</th>
                                   <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase">Valor Estimado</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {proposta?.itens_orcamento.map((item: any, idx: number) => (
                                   <tr key={idx} className="border-t border-white/5">
                                     <td className="px-6 py-4 text-sm text-slate-300">{item.item}</td>
                                     <td className="px-6 py-4 text-right text-sm font-bold text-white">R$ {item.valor.toLocaleString()}</td>
                                   </tr>
                                 ))}
                                 <tr className="bg-emerald-500/10 border-t-2 border-emerald-500/20">
                                   <td className="px-6 py-5 text-sm font-black text-emerald-400 uppercase tracking-widest">INVESTIMENTO TOTAL</td>
                                   <td className="px-6 py-5 text-right text-xl font-black text-emerald-400">R$ {proposta?.orcamento_total.toLocaleString()}</td>
                                 </tr>
                               </tbody>
                            </table>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
                             <CreditCard className="text-emerald-400 mb-6" size={28} />
                             <p className="text-[10px] font-black text-emerald-500 uppercase mb-4 tracking-widest">Condições de Pagamento</p>
                             <div className="space-y-6">
                                <div>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Aporte Inicial (30%)</p>
                                   <p className="text-2xl font-black text-white">R$ {proposta?.condicoes_pagamento.entrada_valor.toLocaleString()}</p>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Parcelamento (10x)</p>
                                   <p className="text-2xl font-black text-white">R$ {proposta?.condicoes_pagamento.parcela_valor.toLocaleString()}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-8 text-slate-500">
                      <Clock size={14} />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Cronograma de Mobilização</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                       {proposta?.cronograma.marcos.map((m: any, idx: number) => (
                         <div key={idx} className="text-center group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                               <span className="text-[10px] font-black text-white">{m.percentual}%</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">{m.fase}</p>
                         </div>
                       ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            <div className="border-t border-white/10 px-8 py-6 flex items-center justify-between bg-slate-900/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl border border-primary/20 flex items-center justify-center">
                     <span className="text-xs font-black text-primary">PO</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Prospect-On v3.0 Intelligence</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Otto Pinturas © 2026</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <Info size={12} className="text-slate-500" />
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Validação via Gemini 1.5 Pro</span>
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Confidencial</p>
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
