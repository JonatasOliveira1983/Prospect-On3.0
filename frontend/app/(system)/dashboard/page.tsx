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
  Play,
  Building2,
  ScrollText,
  Briefcase
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
  const [pilarTab, setPilarTab] = useState<'TODOS' | 'A' | 'B' | 'C'>('TODOS');

  // Estado de seleção de pilares para varredura (toggle individual)
  const [activePillars, setActivePillars] = useState<{ A: boolean; B: boolean; C: boolean }>({ A: true, B: true, C: true });
  const togglePilar = (key: 'A' | 'B' | 'C') => setActivePillars(prev => ({ ...prev, [key]: !prev[key] }));
  const anyPilarActive = Object.values(activePillars).some(Boolean);
  const activePilarsString = Object.keys(activePillars).filter(k => activePillars[k as 'A' | 'B' | 'C']).join(',');

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
    activeDemands: 0,
    pilarA: 0,
    pilarB: 0,
    pilarC: 0
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
      activeDemands: 0,
      pilarA: 0,
      pilarB: 0,
      pilarC: 0
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
          const scoreMatch = msg.match(/Score\s*(?:Urgência:)?\s*(\d+)/i);
          const detailsMatch = msg.match(/(?:OPORTUNIDADE ATIVA IDENTIFICADA em|SINAL DETECTADO:|OPORTUNIDADE ATIVA!)\s*(?:.+?)\s*\|\s*(.+)/i);
          
          let pilarAInc = 0;
          let pilarBInc = 0;
          let pilarCInc = 0;
          
          if (msg.includes("Pilar: A")) {
            pilarAInc = 1;
          } else if (msg.includes("Pilar: B")) {
            pilarBInc = 1;
          } else if (msg.includes("Pilar: C")) {
            pilarCInc = 1;
          }

          setScanMetrics(prev => ({ 
            ...prev, 
            activeDemands: prev.activeDemands + 1,
            pilarA: prev.pilarA + pilarAInc,
            pilarB: prev.pilarB + pilarBInc,
            pilarC: prev.pilarC + pilarCInc
          }));

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
    if (!anyPilarActive) return;
    setTurboLoading(true);
    startWebSocketScan();
    try {
      await api.scanStart("Condominios Residenciais", regiao, targetLeads, "Condominios", "Residenciais", activePilarsString);
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

  const pilarFilteredLeads = pilarTab === 'TODOS'
    ? filteredLeads
    : filteredLeads.filter(lead => {
        const p = (lead as any).pilar || 'A';
        return p === pilarTab;
      });

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

                  {/* Monitoramento Triplo dos 3 Pilares em Tempo Real */}
                  <div className="bg-slate-950/60 p-4 border border-white/5 rounded-2xl flex flex-col gap-3 mt-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400/80 block border-b border-white/5 pb-1">
                      Fluxo Ativo de Pilares Comerciais
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-500/5 border border-blue-500/10 p-2 text-center rounded-xl">
                        <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                          <Building2 size={12} />
                          <span className="text-[8px] font-bold uppercase tracking-wider">Pilar A</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{scanMetrics.pilarA}</span>
                        <span className="text-[7px] text-slate-500 block font-medium mt-0.5 uppercase">Condomínios</span>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 text-center rounded-xl">
                        <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                          <ScrollText size={12} />
                          <span className="text-[8px] font-bold uppercase tracking-wider">Pilar B</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{scanMetrics.pilarB}</span>
                        <span className="text-[7px] text-slate-500 block font-medium mt-0.5 uppercase">Públicos</span>
                      </div>

                      <div className="bg-purple-500/5 border border-purple-500/10 p-2 text-center rounded-xl">
                        <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                          <Briefcase size={12} />
                          <span className="text-[8px] font-bold uppercase tracking-wider">Pilar C</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{scanMetrics.pilarC}</span>
                        <span className="text-[7px] text-slate-500 block font-medium mt-0.5 uppercase">Corporativo</span>
                      </div>
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
              <span>Operação Sniper 3 Pilares Ativos</span>
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

        {/* Painel Sniper 3 Pilares Ativos */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-yellow-400/10 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col gap-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

          <div className="flex flex-col gap-2 relative z-10 border-b border-white/5 pb-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Tríplice Varredura Concorrente</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed font-sans">
              O sistema Otto v7.2 executa buscas e inteligência cibernética paralelamente em três pilares comerciais de alta conversão:
            </p>
          </div>

          {/* Grid dos 3 Pilares — Cards Interativos com Toggle Cyberpunk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">

            {/* PILAR A */}
            <button
              type="button"
              onClick={() => togglePilar('A')}
              aria-pressed={activePillars.A}
              className={`relative flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-left group cursor-pointer select-none focus:outline-none
                ${ activePillars.A
                  ? 'bg-blue-500/10 border-blue-400/50 shadow-[0_0_18px_rgba(96,165,250,0.25)] scale-[1.01]'
                  : 'bg-slate-900/40 border-white/5 opacity-40 saturate-0 hover:opacity-60 hover:saturate-100 hover:border-blue-500/20'
                }`}
            >
              {/* Badge ativo/inativo */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${
                  activePillars.A ? 'bg-blue-400/20 border-blue-400/40 text-blue-300' : 'bg-slate-800 border-white/5 text-slate-500'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${ activePillars.A ? 'bg-blue-400 animate-pulse' : 'bg-slate-600' }`} />
                  {activePillars.A ? 'ATIVO' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between pr-14">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Pilar A
                </span>
                <Building2 size={18} className={`transition-all ${ activePillars.A ? 'text-blue-400 group-hover:scale-110' : 'text-slate-600' }`} />
              </div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${ activePillars.A ? 'text-white' : 'text-slate-500' }`}>Condomínios</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Varredura profunda de atas de assembleias, mapeamento de fachadas e prospecção de fundos de obras ativas em condomínios residenciais.
              </p>
              {activePillars.A && (
                <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-blue-400/40 rounded-full" />
              )}
            </button>

            {/* PILAR B */}
            <button
              type="button"
              onClick={() => togglePilar('B')}
              aria-pressed={activePillars.B}
              className={`relative flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-left group cursor-pointer select-none focus:outline-none
                ${ activePillars.B
                  ? 'bg-emerald-500/10 border-emerald-400/50 shadow-[0_0_18px_rgba(52,211,153,0.25)] scale-[1.01]'
                  : 'bg-slate-900/40 border-white/5 opacity-40 saturate-0 hover:opacity-60 hover:saturate-100 hover:border-emerald-500/20'
                }`}
            >
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${
                  activePillars.B ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300' : 'bg-slate-800 border-white/5 text-slate-500'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${ activePillars.B ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600' }`} />
                  {activePillars.B ? 'ATIVO' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between pr-14">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Pilar B
                </span>
                <ScrollText size={18} className={`transition-all ${ activePillars.B ? 'text-emerald-400 group-hover:scale-110' : 'text-slate-600' }`} />
              </div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${ activePillars.B ? 'text-white' : 'text-slate-500' }`}>Editais Públicos</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Monitoramento de diários oficiais do estado e municípios, portais de compras governamentais e licitações para reforma e pintura de prédios públicos.
              </p>
              {activePillars.B && (
                <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-emerald-400/40 rounded-full" />
              )}
            </button>

            {/* PILAR C */}
            <button
              type="button"
              onClick={() => togglePilar('C')}
              aria-pressed={activePillars.C}
              className={`relative flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-left group cursor-pointer select-none focus:outline-none
                ${ activePillars.C
                  ? 'bg-purple-500/10 border-purple-400/50 shadow-[0_0_18px_rgba(192,132,252,0.25)] scale-[1.01]'
                  : 'bg-slate-900/40 border-white/5 opacity-40 saturate-0 hover:opacity-60 hover:saturate-100 hover:border-purple-500/20'
                }`}
            >
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${
                  activePillars.C ? 'bg-purple-400/20 border-purple-400/40 text-purple-300' : 'bg-slate-800 border-white/5 text-slate-500'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${ activePillars.C ? 'bg-purple-400 animate-pulse' : 'bg-slate-600' }`} />
                  {activePillars.C ? 'ATIVO' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between pr-14">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  Pilar C
                </span>
                <Briefcase size={18} className={`transition-all ${ activePillars.C ? 'text-purple-400 group-hover:scale-110' : 'text-slate-600' }`} />
              </div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${ activePillars.C ? 'text-white' : 'text-slate-500' }`}>Corporativo &amp; Facilities</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Varredura de sites corporativos, vagas de manutenção predial comercial, indústrias, shoppings e acordos diretos com grandes administradoras de condomínio.
              </p>
              {activePillars.C && (
                <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-purple-400/40 rounded-full" />
              )}
            </button>

          </div>

          {/* Rodapé de Ação com Configuração de Cidade e Quantidade de Leads */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-5 border-t border-white/5 relative z-10">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* INPUT: Cidade Alvo */}
              <div className="flex items-center gap-2.5 bg-slate-950 border border-white/10 hover:border-yellow-400/30 focus-within:border-yellow-400 px-4 py-3 rounded-2xl flex-1 group transition-colors">
                <MapPin size={16} className="text-slate-500 group-focus-within:text-yellow-400" />
                <div className="flex flex-col flex-1">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Cidade Alvo</label>
                  <input
                    type="text"
                    value={regiao}
                    onChange={(e) => setRegiao(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-white outline-none w-full p-0"
                    placeholder="Ex: Jundiai - SP, São Paulo - SP"
                  />
                </div>
              </div>

              {/* INPUT: Meta de Leads */}
              <div className="flex items-center gap-2.5 bg-slate-950 border border-white/10 hover:border-yellow-400/30 focus-within:border-yellow-400 px-4 py-3 rounded-2xl sm:w-48 group transition-colors">
                <Layers size={16} className="text-slate-500 group-focus-within:text-yellow-400" />
                <div className="flex flex-col flex-1">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Meta de Leads</label>
                  <input
                    type="number"
                    value={isNaN(targetLeads) ? "" : targetLeads}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTargetLeads(isNaN(val) ? 0 : val);
                    }}
                    className="bg-transparent border-none text-xs font-black text-white outline-none w-full p-0"
                    placeholder="Qtd Alvos"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleTurboScan}
                disabled={turboLoading || !anyPilarActive}
                className={`font-black px-8 sm:px-12 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 whitespace-nowrap ${
                  !anyPilarActive
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 shadow-[0_10px_25px_rgba(250,204,21,0.2)]'
                }`}
              >
                {turboLoading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
                <span className="uppercase tracking-widest text-xs">
                  {anyPilarActive ? `Iniciar Sniper · ${activePilarsString} Pilares` : 'Selecione um Pilar'}
                </span>
              </button>
              {!anyPilarActive && (
                <p className="text-[9px] text-rose-400/80 font-bold uppercase tracking-widest text-center">
                  ⚠ Ative ao menos 1 pilar para iniciar a varredura
                </p>
              )}
            </div>
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

        {/* Seletor de Abas de Pilares Comerciais */}
        <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8 border-b border-white/5 pb-4 z-10 relative">
          {[
            { id: 'TODOS', label: 'Todas as Obras', count: leads.length, desc: 'Todo o radar' },
            { id: 'A', label: 'Pilar A: Condomínios', count: leads.filter(l => ((l as any).pilar || 'A') === 'A').length, desc: 'Atas e fachadas' },
            { id: 'B', label: 'Pilar B: Públicos', count: leads.filter(l => (l as any).pilar === 'B').length, desc: 'Licitações gov' },
            { id: 'C', label: 'Pilar C: Corporativo', count: leads.filter(l => (l as any).pilar === 'C').length, desc: 'Vagas e facilities' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPilarTab(tab.id as any)}
              className={`relative flex flex-col items-start px-5 py-3 rounded-2xl border transition-all text-left group ${
                pilarTab === tab.id
                  ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md ${
                  pilarTab === tab.id ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </div>
              <span className="text-[9px] font-medium opacity-60 uppercase tracking-widest mt-0.5">{tab.desc}</span>
              {pilarTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-yellow-400 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-yellow-400" size={48} />
            <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sincronizando Radar...</span>
          </div>
        ) : (
          <LeadTable leads={pilarFilteredLeads} onSave={fetchLeads} />
        )}
      </div>
    </div>
  );
}
