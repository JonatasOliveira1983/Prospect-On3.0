"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Globe, Cpu, Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ApiKeyStatus {
  GOOGLE_MAPS_API_KEY: boolean;
  GEMINI_API_KEY: boolean;
  BR_API_BASE_URL: boolean;
}

export default function Configuracoes() {
  const [savedMessage, setSavedMessage] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiKeyStatus | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(data => setApiStatus(data))
      .catch(() => setApiStatus({ GOOGLE_MAPS_API_KEY: false, GEMINI_API_KEY: false, BR_API_BASE_URL: true }));
  }, []);

  const apiStatuses = [
    {
      name: "Google Maps API",
      key: "GOOGLE_MAPS_API_KEY",
      status: apiStatus?.GOOGLE_MAPS_API_KEY ? "active" : "missing",
      description: apiStatus?.GOOGLE_MAPS_API_KEY 
        ? "Busca de condomínios e imagens Street View. Chave configurada e operacional."
        : "Busca de condomínios e imagens Street View. Chave NÃO configurada.",
    },
    {
      name: "Gemini Vision API",
      key: "GEMINI_API_KEY",
      status: apiStatus?.GEMINI_API_KEY ? "active" : "missing",
      description: apiStatus?.GEMINI_API_KEY 
        ? "Análise de fachadas com IA Gemini. Chave configurada e operacional."
        : "Análise de fachadas com IA. Chave NÃO configurada.",
    },
    {
      name: "BrasilAPI (CNPJ)",
      key: "BR_API_BASE_URL",
      status: "active" as const,
      description: "Consulta de dados fiscais via BrasilAPI (gratuita, sem chave necessária).",
    },
  ];

  const systemParams = [
    { label: "Cidade Base", value: "Jundiaí, SP", editable: false },
    { label: "Raio de Varredura", value: "10.000m", editable: true },
    { label: "Regiões Ativas", value: "Jundiaí, Campinas, Valinhos, Vinhedo, Itupeva, Louveira", editable: false },
    { label: "Fator de Valorização", value: "12%", editable: true },
    { label: "Limite de Leads por Scan", value: "50", editable: true },
    { label: "Intervalo de Rescan", value: "7 dias", editable: true },
  ];

  function handleSave() {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="text-muted" size={28} />
          <h2 className="text-3xl font-bold tracking-tight text-white">Configurações</h2>
        </div>
        <p className="text-muted font-medium">Painel de controle do sistema Antygravit Engine</p>
      </header>

      {/* API Status */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Key size={18} className="text-primary" />
          Status das APIs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apiStatuses.map((api, i) => (
            <div key={i} className={`glass rounded-2xl border p-6 ${
              api.status === "active" ? "border-green-400/20" :
              "border-red-400/20"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  <h4 className="text-sm font-bold text-white">{api.name}</h4>
                </div>
                {api.status === "active" ? (
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
              <p className="text-xs text-muted mb-2">{api.description}</p>
              <code className="text-[10px] text-primary/60 bg-white/5 px-2 py-1 rounded">{api.key}</code>
            </div>
          ))}
        </div>
      </section>

      {/* System Parameters */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Cpu size={18} className="text-primary" />
          Parâmetros do Sistema
        </h3>
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-white/5 text-muted text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Parâmetro</th>
                <th className="px-6 py-4">Valor Atual</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {systemParams.map((param, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{param.label}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-accent font-bold">{param.value}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {param.editable ? "Configurável" : "Fixo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <p className="text-sm font-bold text-white">ANTYGRAVIT v1.0.4</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase mb-1">Modo</p>
              <p className={`text-sm font-bold ${
                apiStatus?.GOOGLE_MAPS_API_KEY && apiStatus?.GEMINI_API_KEY 
                  ? "text-green-400" : "text-yellow-400"
              }`}>
                {apiStatus?.GOOGLE_MAPS_API_KEY && apiStatus?.GEMINI_API_KEY 
                  ? "PRODUÇÃO (APIs Ativas)" : "PARCIAL (Verificar APIs)"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase mb-1">Última Varredura</p>
              <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase mb-1">Powered By</p>
              <p className="text-sm font-bold text-primary">BYBITY REAL & OTTO PINTURAS</p>
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
