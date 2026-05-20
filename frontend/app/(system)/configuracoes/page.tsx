"use client";
import { api } from '@/lib/api';
import { useEffect, useState } from "react";
import { Settings, Key, Globe, Cpu, Shield, CheckCircle2, XCircle, BrainCircuit, Zap } from "lucide-react";

interface ServiceStatus {
  status: string;
  latency: string;
}

interface BackendHealthResponse {
  services: {
    overpass_osm: ServiceStatus;
    google_maps: ServiceStatus;
    deepseek_api: ServiceStatus;
    gemini_api: ServiceStatus;
    brasil_api: ServiceStatus;
  };
  status: string;
  timestamp?: string;
}

interface SystemConfig {
  limite_leads: number;
  cidade_base: string;
  motor_busca: string;
  motor_mapas: string;
  motor_ia: string;
  delay_stealth: string;
  pilares_ativos: string;
  pilar_varredura: string;
}

export default function Configuracoes() {
  const [savedMessage, setSavedMessage] = useState(false);
  const [apiStatus, setApiStatus] = useState<BackendHealthResponse | null>(null);
  
  // Estados para as configurações reais
  const [limiteLeads, setLimiteLeads] = useState<number>(50);
  const [cidadeBase, setCidadeBase] = useState<string>("São Paulo, SP");
  const [pilarVarredura, setPilarVarredura] = useState<string>("Todos");
  
  // Parâmetros estáticos/somente leitura carregados do backend
  const [readOnlyParams, setReadOnlyParams] = useState({
    motor_busca: "Google Search (Playwright Stealth)",
    motor_mapas: "Google Maps (Playwright Stealth)",
    motor_ia: "DeepSeek Chat",
    delay_stealth: "2.0s – 3.5s (aleatório)",
    pilares_ativos: "A (Condomínios) · B (Editais) · C (Corporativo)"
  });

  useEffect(() => {
    // Carregar status da API
    api.status()
      .then(r => r.json())
      .then((data: BackendHealthResponse) => setApiStatus(data))
      .catch(() => {
        setApiStatus({
          services: {
            overpass_osm: { status: "Offline", latency: "N/A" },
            google_maps: { status: "Offline", latency: "N/A" },
            deepseek_api: { status: "Offline", latency: "N/A" },
            gemini_api: { status: "Offline", latency: "N/A" },
            brasil_api: { status: "Online", latency: "N/A" }
          },
          status: "Warning"
        });
      });

    // Carregar configurações reais do backend
    api.getConfiguracoes()
      .then(r => r.json())
      .then((data: SystemConfig) => {
        setLimiteLeads(data.limite_leads);
        setCidadeBase(data.cidade_base);
        setPilarVarredura(data.pilar_varredura || "Todos");
        setReadOnlyParams({
          motor_busca: data.motor_busca || "Google Search (Playwright Stealth)",
          motor_mapas: data.motor_mapas || "Google Maps (Playwright Stealth)",
          motor_ia: data.motor_ia || "DeepSeek Chat",
          delay_stealth: data.delay_stealth || "2.0s – 3.5s (aleatório)",
          pilares_ativos: data.pilares_ativos || "A (Condomínios) · B (Editais) · C (Corporativo)"
        });
      })
      .catch((err) => {
        console.error("Erro ao carregar configurações do backend:", err);
      });
  }, []);

  const deepseekOnline = apiStatus?.services?.deepseek_api?.status === "Online";
  const geminiOnline = apiStatus?.services?.gemini_api?.status === "Online";
  const mapsOnline = apiStatus?.services?.google_maps?.status === "Online";

  const apiStatuses = [
    {
      name: "DeepSeek Chat",
      key: "DEEPSEEK_API_KEY",
      icon: BrainCircuit,
      status: deepseekOnline ? "active" : "missing",
      description: deepseekOnline
        ? "Motor principal de IA — extração de sinais, scoring e copy. Chave configurada e operacional."
        : "Motor principal de IA — extração de sinais, scoring e copy. Chave NÃO configurada ou inválida.",
    },
    {
      name: "Google Search / Maps (Stealth)",
      key: "SEM_CHAVE (STEALTH)",
      icon: Globe,
      status: "active",
      description: "Navegação direta via Playwright stealth — sem API, sem chave, sem custo. Opera como extensão de Chrome real.",
    },
    {
      name: "Gemini Vision",
      key: "GEMINI_API_KEY",
      icon: Zap,
      status: geminiOnline ? "active" : "missing",
      description: geminiOnline
        ? "Auditoria visual de fachada. Chave configurada e operacional."
        : "Auditoria visual de fachada. Chave NÃO configurada ou inválida (opcional).",
    },
    {
      name: "BrasilAPI (CNPJ)",
      key: "SEM_CHAVE",
      icon: Globe,
      status: apiStatus?.services?.brasil_api?.status === "Online" ? "active" : "missing",
      description: "Consulta de dados fiscais via BrasilAPI (gratuita, sem chave necessária).",
    },
  ];

  function handleSave() {
    api.saveConfiguracoes({
      limite_leads: limiteLeads,
      cidade_base: cidadeBase,
      pilar_varredura: pilarVarredura
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setSavedMessage(true);
          setTimeout(() => setSavedMessage(false), 3000);
        } else {
          alert("Erro ao salvar configurações no servidor.");
        }
      })
      .catch(err => {
        console.error("Erro ao salvar configurações:", err);
        alert("Erro de conexão ao salvar configurações.");
      });
  }

  return (
    <div className="bg-background min-h-screen text-foreground p-6">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="text-muted" size={28} />
          <h2 className="text-3xl font-bold tracking-tight text-white">Configurações</h2>
        </div>
        <p className="text-muted font-medium">Painel de controle — Prospect-On v4.0 (Browser Extension Mode)</p>
      </header>

      {/* API Status */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Key size={18} className="text-primary" />
          Status das Integrações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {apiStatuses.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`glass rounded-2xl border p-5 ${
                item.status === "active" ? "border-green-400/20" : "border-red-400/20"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-primary" />
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  </div>
                  {item.status === "active" ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                      <CheckCircle2 size={10} />
                      ATIVO
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                      <XCircle size={10} />
                      FALTANDO
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mb-2">{item.description}</p>
                <code className="text-[10px] text-primary/60 bg-white/5 px-2 py-1 rounded">{item.key}</code>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Parameters Form */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Cpu size={18} className="text-primary" />
          Parâmetros do Sistema (Editáveis)
        </h3>
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2">Cidade Base</label>
              <input
                type="text"
                value={cidadeBase}
                onChange={(e) => setCidadeBase(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all font-semibold"
                placeholder="Ex: São Paulo, SP"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2">Limite de Leads por Scan</label>
              <input
                type="number"
                value={limiteLeads}
                onChange={(e) => setLimiteLeads(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all font-semibold font-mono"
                min="1"
                max="500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2">Pilar de Varredura Padrão</label>
              <select
                value={pilarVarredura}
                onChange={(e) => setPilarVarredura(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all font-semibold cursor-pointer"
              >
                <option value="Todos" className="bg-background">Todos os Pilares</option>
                <option value="A" className="bg-background">Pilar A (Condomínios)</option>
                <option value="B" className="bg-background">Pilar B (Editais)</option>
                <option value="C" className="bg-background">Pilar C (Corporativo)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-muted uppercase mb-2">Parâmetros de Stealth & Motor</p>
              <ul className="space-y-2 text-xs text-muted">
                <li>• <strong className="text-white">Motor de Busca:</strong> {readOnlyParams.motor_busca}</li>
                <li>• <strong className="text-white">Motor de Mapas:</strong> {readOnlyParams.motor_mapas}</li>
                <li>• <strong className="text-white">Motor de IA:</strong> {readOnlyParams.motor_ia}</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase mb-2">Segurança & Pilares</p>
              <ul className="space-y-2 text-xs text-muted">
                <li>• <strong className="text-white">Anti-Bot Delay:</strong> {readOnlyParams.delay_stealth}</li>
                <li>• <strong className="text-white">Configuração de Pilares:</strong> {readOnlyParams.pilares_ativos}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Engine Version */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-primary" />
          Motor de Inteligência
        </h3>
        <div className="glass rounded-2xl border border-white/5 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted uppercase mb-1">Engine</p>
              <p className="text-sm font-bold text-white">Prospect-On v4.0</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase mb-1">Modo</p>
              <p className="text-sm font-bold text-green-400">
                BROWSER EXTENSION MODE
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase mb-1">Última Varredura</p>
              <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase mb-1">Powered By</p>
              <p className="text-sm font-bold text-primary">DeepSeek + Playwright Stealth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        {savedMessage && (
          <span className="text-sm text-accent font-medium self-center animate-pulse">
            ✓ Configurações salvas!
          </span>
        )}
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/80 text-white font-bold px-8 py-3 rounded-xl transition-all neon-blue"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
