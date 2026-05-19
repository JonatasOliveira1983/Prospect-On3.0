"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeadTable from "../../components/LeadTable";
import {
  Target,
  Users,
  Loader2,
  Search,
  Zap,
  LayoutDashboard,
  FileText,
  MapPin,
  Layers,
  Trash2,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Link,
  ChevronRight,
  TrendingUp,
  XCircle,
  Play
} from 'lucide-react';
import { api, WS_URL } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  address: string;
  score: number;
  category: string;
  source: string;
  urgency_score: number;
  demand: any;
  valuation: any;
  vision_analysis: any;
  market: any;
  vision_image_url?: string;
  intencao_ativa?: boolean;
  resumo_sinal?: string;
}

interface LogEntry {
  timestamp: string;
  agent: string;
  action: string;
  message: string;
  status: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [turboLoading, setTurboLoading] = useState(false);
  const [publicoAlvo, setPublicoAlvo] = useState("Condominios");
  const [palavraChave, setPalavraChave] = useState("Residenciais");
  const [regiao, setRegiao] = useState("São Paulo - SP");
  const [targetLeads, setTargetLeads] = useState(5);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterByRegion, setFilterByRegion] = useState(false);

  // Estados do HUD Sniper Cyberpunk
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<LogEntry[]>([]);
  const [currentLead, setCurrentLead] = useState<{
    name: string;
    address: string;
    phone?: string;
    email?: string;
    intencao_ativa?: boolean;
    score_urgencia?: number;
    resumo_sinal?: string;
  } | null>(null);

  const [faseStatuses, setFaseStatuses] = useState({
    fase1: 'pending', // Scout
    fase2: 'pending', // Semantic Extractor
    fase3: 'pending', // Detetive Web
    fase4: 'pending', // Demand Scout
  });

  const [scanMetrics, setScanMetrics] = useState({
    totalProcessed: 0,
    enrichedContacts: 0,
    activeDemands: 0
  });

  const [scanFinished, setScanFinished] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  async function fetchLeads() {
    try {
      const res = await api.leads();
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch (error) {
      console.error("Falha ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  }

  // Polling de fundo: atualiza a cada 10s automaticamente
  useEffect(() => {
    fetchLeads();
    const bgInterval = setInterval(fetchLeads, 10000);
    return () => clearInterval(bgInterval);
  }, []);

  // Scroll automático dos logs no HUD
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanLogs]);

  // Função para conectar e escutar o WebSocket real
  function startWebSocketScan() {
    setIsScanning(true);
    setScanFinished(false);
    setScanLogs([]);
    setFaseStatuses({
      fase1: 'working',
      fase2: 'pending',
      fase3: 'pending',
      fase4: 'pending',
    });
    setScanMetrics({
      totalProcessed: 0,
      enrichedContacts: 0,
      activeDemands: 0
    });
    setCurrentLead(null);

    // Conectar WebSocket
    const ws = new WebSocket(`${WS_URL}/ws/logs`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("📡 Sniper-WS: Conectado na escuta de varreduras ativas");
      setScanLogs([{
        timestamp: new Date().toLocaleTimeString(),
        agent: "System",
        action: "connection",
        message: "📡 Estabelecendo ponte segura com o pipeline de orquestração multiagentes...",
        status: "info"
      }]);
    };

    ws.onmessage = (event) => {
      try {
        const log: LogEntry = JSON.parse(event.data);
        
        // Adicionar log no topo/lista
        setScanLogs((prev) => [...prev, log].slice(-100)); // Guardar apenas os últimos 100 logs

        const msg = log.message || "";
        const agent = log.agent || "";
        const status = log.status || "";

        // Orquestração reativa de fases baseado no log recebido (Demand-First)
        if (agent === "DemandScoutAgent") {
          setFaseStatuses(prev => ({ ...prev, fase1: 'working' }));
          if (status === "success" || msg.includes("Sucesso") || log.action === "active_demand_found") {
            setFaseStatuses(prev => ({ ...prev, fase1: 'success' }));
          }
        } else if (agent === "BrowserScoutAgent" || agent === "PlacesClient" || agent === "HunterAgent") {
          setFaseStatuses(prev => ({ ...prev, fase1: 'success', fase2: 'working' }));
          if (status === "success" || msg.includes("Sucesso")) {
            setFaseStatuses(prev => ({ ...prev, fase2: 'success' }));
          }
        } else if (agent === "SemanticExtractorAgent") {
          setFaseStatuses(prev => ({ ...prev, fase1: 'success', fase2: 'success', fase3: 'working' }));
          if (status === "success" || msg.includes("Sucesso")) {
            setFaseStatuses(prev => ({ ...prev, fase3: 'success' }));
          } else if (status === "warning" || msg.includes("Descartado")) {
            setFaseStatuses(prev => ({ ...prev, fase3: 'warning' }));
          }
        } else if (agent === "WebEnrichmentAgent") {
          setFaseStatuses(prev => ({ ...prev, fase1: 'success', fase2: 'success', fase3: 'success', fase4: 'working' }));
          if (status === "success" || msg.includes("descoberto") || msg.includes("extraído") || msg.includes("Sucesso")) {
            setFaseStatuses(prev => ({ ...prev, fase4: 'success' }));
          }
        }

        // Mapeamento estruturado de contatos e demandas ativas baseadas em texto de logs
        if (msg.includes("➤ Processando:") || msg.includes("➤ Snipando Alvo Quente:")) {
          const match = msg.match(/(?:Processando:|Snipando Alvo Quente:)\s*(.+)/);
          if (match && match[1]) {
            setCurrentLead({
              name: match[1].trim(),
              address: "Localizando coordenadas e dados cadastrais...",
              intencao_ativa: true
            });
            setScanMetrics(prev => ({ ...prev, totalProcessed: prev.totalProcessed + 1 }));
            setFaseStatuses({
              fase1: 'success',
              fase2: 'working',
              fase3: 'pending',
              fase4: 'pending',
            });
          }
        }

        // Mapeia detalhes cadastrais capturados na Fase 2 / Fase 3
        if (msg.includes("Endereço:") || msg.includes("Endereço higienizado")) {
          const addrMatch = msg.match(/(?:Endereço|Endereço higienizado):\s*(.+)/i);
          if (addrMatch) {
            setCurrentLead(prev => prev ? { ...prev, address: addrMatch[1].trim() } : null);
          }
        }

        // Extrai enriquecimentos cadastrais no card do lead atual
        if (msg.includes("Novo website") || msg.includes("Novo E-mail") || msg.includes("Novo WhatsApp") || msg.includes("telefone:") || msg.includes("telefones:") || msg.includes("Email:") || msg.includes("Telefone:")) {
          setScanMetrics(prev => ({ ...prev, enrichedContacts: prev.enrichedContacts + 1 }));
          setCurrentLead(prev => {
            if (!prev) return null;
            let email = prev.email;
            let phone = prev.phone;
            
            const emailMatch = msg.match(/(?:E-mail|Email):\s*([^\s|]+)/i);
            if (emailMatch) email = emailMatch[1].trim();

            const phoneMatch = msg.match(/(?:WhatsApp|telefone|telefones|Telefone):\s*([^\s|]+)/i);
            if (phoneMatch) phone = phoneMatch[1].trim();

            return { ...prev, email: email || prev.email, phone: phone || prev.phone };
          });
        }

        // Extrai evidências de obras ou orçamentos aprovados
        if (msg.includes("🔥 SINAL DETECTADO") || msg.includes("🔥 OPORTUNIDADE ATIVA") || msg.includes("🔥 OPORTUNIDADE ATIVA IDENTIFICADA")) {
          setScanMetrics(prev => ({ ...prev, activeDemands: prev.activeDemands + 1 }));
          const scoreMatch = msg.match(/Score\s*(?:Urgência:)?\s*(\d+)/i);
          const detailsMatch = msg.match(/(?:OPORTUNIDADE ATIVA IDENTIFICADA em|SINAL DETECTADO:|OPORTUNIDADE ATIVA!)\s*(?:.+?)\s*\|\s*(.+)/i);
          setCurrentLead(prev => {
            if (!prev) return null;
            return {
              ...prev,
              intencao_ativa: true,
              score_urgencia: scoreMatch ? parseInt(scoreMatch[1]) : 9,
              resumo_sinal: detailsMatch ? detailsMatch[1].trim() : "Demanda de pintura predial ativa ou licitação encontrada."
            };
          });
        }

        // Conclusão geral de varreduras
        if (msg.includes("OPERAÇÃO DEMAND-FIRST CONCLUÍDA") || msg.includes("OPERAÇÃO CONCLUÍDA") || (agent === "ManagerAgent" && log.action === "complete")) {
          setFaseStatuses({
            fase1: 'success',
            fase2: 'success',
            fase3: 'success',
            fase4: 'success',
          });
          setScanFinished(true);
          setTurboLoading(false);
          fetchLeads();
        }

      } catch (err) {
        console.error("Erro ao tratar mensagem WS:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("Erro no WebSocket:", e);
    };

    ws.onclose = () => {
      console.log("🔌 Sniper-WS: Conexão fechada");
    };
  }

  async function handleTurboScan() {
    setTurboLoading(true);
    startWebSocketScan();
    try {
      const combinedQuery = `${publicoAlvo} ${palavraChave}`.trim();
      await api.scanStart(combinedQuery, regiao, targetLeads);
    } catch (error) {
      console.error("Erro no Turbo Scan:", error);
      setTurboLoading(false);
      setIsScanning(false);
      wsRef.current?.close();
    }
  }

  function handleCloseHUD() {
    setIsScanning(false);
    wsRef.current?.close();
    fetchLeads();
  }

  async function handleClearLeads() {
    if (!confirm("Deseja realmente limpar todos os leads do radar?")) return;
    try {
      const res = await api.leadsClear();
      const data = await res.json();
      if (data.success) {
        setLeads([]);
      }
    } catch (error) {
      console.error("Erro ao limpar leads:", error);
    }
  }

  const regionQuery = regiao ? regiao.split('-')[0].trim().toLowerCase() : "";
  const filteredLeads = filterByRegion && regionQuery
    ? leads.filter(lead => {
        const address = (lead.address || "").toLowerCase();
        const name = (lead.name || "").toLowerCase();
        return address.includes(regionQuery) || name.includes(regionQuery);
      })
    : leads;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10">
      
      {/* HUD Sniper Cyberpunk Holographic Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-hidden"
          >
            {/* Background Cyber Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-slate-950/80 to-slate-950 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none opacity-40 animate-pulse" />

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-slate-900/80 border border-yellow-400/20 rounded-[2.5rem] p-6 lg:p-10 shadow-[0_0_50px_rgba(250,204,21,0.15)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto z-10"
            >
              {/* Header HUD */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">
                      Varredura Sniper Ativa
                    </h2>
                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">
                      Inteligência Artificial de Prospecção Ativa Otto v7.2
                    </p>
                  </div>
                </div>

                {scanFinished && (
                  <button
                    onClick={handleCloseHUD}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-6 py-2.5 rounded-xl uppercase text-xs tracking-wider transition-all transform active:scale-95 shadow-[0_5px_15px_rgba(250,204,21,0.3)]"
                  >
                    Fechar & Ver Cockpit
                  </button>
                )}
              </div>

              {/* Grid Central */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Lado Esquerdo: Fases & Indicadores (4 Fases) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Status dos Agentes Especiais
                  </h3>

                  <div className="flex flex-col gap-3">
                    {/* FASE 1: INTELIGÊNCIA DE OBRAS */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      faseStatuses.fase1 === 'working' ? 'bg-yellow-400/5 border-yellow-400/30 text-white' :
                      faseStatuses.fase1 === 'success' ? 'bg-emerald-500/5 border-emerald-500/30 text-white' :
                      'bg-slate-950/40 border-white/5 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          faseStatuses.fase1 === 'working' ? 'bg-yellow-400/20 text-yellow-400 animate-pulse' :
                          faseStatuses.fase1 === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'
                        }`}>
                          <Zap size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">Fase 1: Captação de Demanda</h4>
                          <p className="text-[9px] font-semibold opacity-60">Buscando atas, editais e obras na cidade</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest font-mono text-yellow-400">
                        {faseStatuses.fase1 === 'working' && "VARRENDO"}
                        {faseStatuses.fase1 === 'success' && "CONCLUÍDO"}
                        {faseStatuses.fase1 === 'pending' && "PENDENTE"}
                      </span>
                    </div>

                    {/* FASE 2: MAPEAMENTO CADASTRAL */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      faseStatuses.fase2 === 'working' ? 'bg-yellow-400/5 border-yellow-400/30 text-white' :
                      faseStatuses.fase2 === 'success' ? 'bg-emerald-500/5 border-emerald-500/30 text-white' :
                      faseStatuses.fase2 === 'warning' ? 'bg-amber-500/5 border-amber-500/30 text-white' :
                      'bg-slate-950/40 border-white/5 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          faseStatuses.fase2 === 'working' ? 'bg-yellow-400/20 text-yellow-400 animate-pulse' :
                          faseStatuses.fase2 === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                          faseStatuses.fase2 === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600'
                        }`}>
                          <Search size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">Fase 2: Mapeamento Cadastral</h4>
                          <p className="text-[9px] font-semibold opacity-60">Localizando endereço, fachada e coordenadas</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {faseStatuses.fase2 === 'working' && "LOCALIZANDO"}
                        {faseStatuses.fase2 === 'success' && "MAPEDADO"}
                        {faseStatuses.fase2 === 'warning' && "SEM COORDENADAS"}
                        {faseStatuses.fase2 === 'pending' && "PENDENTE"}
                      </span>
                    </div>

                    {/* FASE 3: DETETIVE DE DECISORES */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      faseStatuses.fase3 === 'working' ? 'bg-yellow-400/5 border-yellow-400/30 text-white animate-pulse' :
                      faseStatuses.fase3 === 'success' ? 'bg-emerald-500/5 border-emerald-500/30 text-white' :
                      faseStatuses.fase3 === 'warning' ? 'bg-amber-500/5 border-amber-500/30 text-white' :
                      'bg-slate-950/40 border-white/5 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          faseStatuses.fase3 === 'working' ? 'bg-yellow-400/20 text-yellow-400 animate-bounce' :
                          faseStatuses.fase3 === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                          faseStatuses.fase3 === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600'
                        }`}>
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">Fase 3: Detetive de Decisores</h4>
                          <p className="text-[9px] font-semibold opacity-60">Rastreando CNPJ, síndico e administradora</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {faseStatuses.fase3 === 'working' && "INVESTIGANDO"}
                        {faseStatuses.fase3 === 'success' && "DEVELADO"}
                        {faseStatuses.fase3 === 'warning' && "DESCARTADO"}
                        {faseStatuses.fase3 === 'pending' && "PENDENTE"}
                      </span>
                    </div>

                    {/* FASE 4: SNIPER DE CONTATOS */}
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      faseStatuses.fase4 === 'working' ? 'bg-yellow-400/5 border-yellow-400/30 text-white animate-pulse' :
                      faseStatuses.fase4 === 'success' ? 'bg-emerald-500/5 border-emerald-500/30 text-white' :
                      'bg-slate-950/40 border-white/5 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          faseStatuses.fase4 === 'working' ? 'bg-yellow-400/20 text-yellow-400 animate-pulse' :
                          faseStatuses.fase4 === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-600'
                        }`}>
                          <Users size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider">Fase 4: Sniper de Contatos</h4>
                          <p className="text-[9px] font-semibold opacity-60">Cruzando contatos cadastrais e emails</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {faseStatuses.fase4 === 'working' && "ENRIQUECENDO"}
                        {faseStatuses.fase4 === 'success' && "SNIPADO"}
                        {faseStatuses.fase4 === 'pending' && "PENDENTE"}
                      </span>
                    </div>
                  </div>

                  {/* Estatísticas Acumuladas */}
                  <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl grid grid-cols-3 gap-2 text-center mt-2">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">Mapeados</span>
                      <span className="text-xl font-bold text-white font-mono">{scanMetrics.totalProcessed}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">Contatos</span>
                      <span className="text-xl font-bold text-emerald-400 font-mono">{scanMetrics.enrichedContacts}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">Obras Ativas</span>
                      <span className="text-xl font-bold text-amber-400 font-mono">{scanMetrics.activeDemands}</span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Terminal de Logs & Lead Monitor */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Monitor do Lead Atual */}
                  <div className="bg-slate-950/80 p-5 border border-yellow-400/10 rounded-3xl relative overflow-hidden flex flex-col gap-4 shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-[30px] rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[9px] font-black text-yellow-400 tracking-widest uppercase flex items-center gap-1.5">
                        <Building size={10} />
                        Alvo Analisado no Radar
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">
                        Realtime Feed
                      </span>
                    </div>

                    {currentLead ? (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-3"
                      >
                        <h4 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                          {currentLead.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-500 shrink-0" />
                          {currentLead.address}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                          <div className={`px-3 py-2.5 rounded-xl border flex items-center gap-2.5 ${
                            currentLead.phone ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500'
                          }`}>
                            <Phone size={14} className="shrink-0" />
                            <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                              {currentLead.phone || "Buscando Telefone/CNPJ..."}
                            </span>
                          </div>

                          <div className={`px-3 py-2.5 rounded-xl border flex items-center gap-2.5 ${
                            currentLead.email ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500'
                          }`}>
                            <Mail size={14} className="shrink-0" />
                            <span className="text-[10px] font-bold font-mono uppercase tracking-wider truncate">
                              {currentLead.email || "Buscando E-mail..."}
                            </span>
                          </div>
                        </div>

                        {/* Oportunidade de Obra Ativa Revelada */}
                        {currentLead.intencao_ativa && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-amber-400/10 border border-amber-400/30 p-3.5 rounded-2xl mt-1 flex flex-col gap-1.5 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 blur-[20px] rounded-full" />
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Zap size={11} className="fill-amber-400" />
                                🔥 SINAL DE OBRA ATIVA DETECTADO
                              </span>
                              <span className="text-[10px] font-black font-mono bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                                Score Urgência: {currentLead.score_urgencia}/10
                              </span>
                            </div>
                            <p className="text-[10px] text-white font-bold leading-relaxed pr-8">
                              {currentLead.resumo_sinal}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Aguardando o manager designar o primeiro condomínio...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Terminal de Logs */}
                  <div className="flex flex-col gap-2.5 flex-1 max-h-[300px]">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Fluxo de Logs em Tempo Real (WebSocket)
                    </span>

                    <div className="bg-slate-950/80 border border-white/5 rounded-3xl p-5 font-mono text-[10px] text-slate-300 overflow-y-auto flex-1 flex flex-col gap-2.5 max-h-[220px]">
                      {scanLogs.length === 0 ? (
                        <div className="text-slate-600 text-center py-10">
                          Aguardando início do broadcast de logs...
                        </div>
                      ) : (
                        scanLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2.5 leading-relaxed items-start border-b border-white/5 pb-1">
                            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                            <span className={`font-black shrink-0 ${
                              log.agent === "SemanticExtractorAgent" ? "text-blue-400" :
                              log.agent === "WebEnrichmentAgent" ? "text-emerald-400" :
                              log.agent === "DemandScoutAgent" ? "text-amber-400" : "text-yellow-400"
                            }`}>
                              [{log.agent}]:
                            </span>
                            <span className={
                              log.status === "success" ? "text-emerald-400 font-bold" :
                              log.status === "warning" ? "text-amber-400 font-bold" :
                              log.status === "error" ? "text-rose-400 font-bold" : "text-slate-300"
                            }>
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-xs uppercase tracking-[0.3em]">
              <Zap size={14} className="fill-yellow-400" />
              <span>Operação Sniper 4 Fases</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              CRM <span className="text-yellow-400">Prospector</span>
            </h1>
          </div>

          <button
            onClick={handleClearLeads}
            className="bg-slate-950/40 backdrop-blur-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 font-bold p-3 sm:p-4 rounded-2xl transition-all border border-white/5 hover:border-rose-500/30"
            title="Limpar Base de Leads"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Painel Sniper 4 Fases */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-yellow-400/10 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col gap-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

          {/* Grid das Fases de Busca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">

            {/* FASE 1 */}
            <div className="flex flex-col gap-2.5 p-4 sm:p-5 bg-slate-900/60 border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-yellow-400/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  Fase 1
                </span>
                <Users size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Público Alvo</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Atividade Principal do Seu Cliente Ideal: Segmentação do Seu Cliente Ideal.
              </p>
              <input
                type="text"
                value={publicoAlvo}
                onChange={(e) => setPublicoAlvo(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 sm:py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-colors mt-2"
                placeholder="Ex: Condominios, Industrias, Lojas de"
              />
            </div>

            {/* FASE 2 */}
            <div className="flex flex-col gap-2.5 p-4 sm:p-5 bg-slate-900/60 border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-yellow-400/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  Fase 2
                </span>
                <Search size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Palavra Chave</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Palavras que Limitam o Interesse e o Perfil do Seu Cliente Ideal.
              </p>
              <input
                type="text"
                value={palavraChave}
                onChange={(e) => setPalavraChave(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 sm:py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-colors mt-2"
                placeholder="Ex: Residenciais, Quimicas em, Calcados em"
              />
            </div>

            {/* FASE 3 */}
            <div className="flex flex-col gap-2.5 p-4 sm:p-5 bg-slate-900/60 border border-white/5 rounded-2xl sm:rounded-3xl group hover:border-yellow-400/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  Fase 3
                </span>
                <MapPin size={16} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Região Segmentada</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Começando de Baixo para Cima: segmentando Cidades Grandes na Busca.
              </p>
              <input
                type="text"
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 sm:py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-yellow-400 transition-colors mt-2"
                placeholder="Ex: Jundiai - SP, Curitiba - PR"
              />
            </div>

          </div>

          {/* Rodapé de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 px-4 py-3 rounded-2xl w-full sm:w-44 group">
                <Layers size={14} className="text-slate-500 group-focus-within:text-yellow-400" />
                <input
                  type="number"
                  value={isNaN(targetLeads) ? "" : targetLeads}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTargetLeads(isNaN(val) ? 0 : val);
                  }}
                  className="bg-transparent border-none text-xs font-black text-white outline-none w-full"
                  placeholder="Qtd Leads"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:inline">
                Meta de Leads no Radar
              </span>
            </div>

            <button
              onClick={handleTurboScan}
              disabled={turboLoading}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black px-8 sm:px-12 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_25px_rgba(250,204,21,0.2)]"
            >
              {turboLoading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
              <span className="uppercase tracking-widest text-xs">Iniciar Sniper 4 Fases</span>
            </button>
          </div>

        </div>
      </header>

      {/* Tabela de Leads */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 shadow-2xl relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 relative z-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Leads Identificados</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {filterByRegion ? `${filteredLeads.length} de ` : ""}{leads.length} alvos no radar
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle de Filtro por Cidade */}
            {regiao && (
              <button
                onClick={() => setFilterByRegion(!filterByRegion)}
                className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  filterByRegion
                    ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                    : "bg-slate-900 border-white/5 text-slate-500 hover:text-white"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterByRegion ? 'bg-yellow-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>Apenas {regiao.split('-')[0].trim()}</span>
              </button>
            )}

            <div className="flex bg-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <FileText size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-yellow-400 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutDashboard size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-yellow-400" size={48} />
            <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sincronizando Radar...</span>
          </div>
        ) : (
          <LeadTable leads={filteredLeads} onSave={fetchLeads} />
        )}
      </div>
    </div>
  );
}
