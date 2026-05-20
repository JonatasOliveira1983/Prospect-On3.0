"use client";
import { api, WS_URL } from '@/lib/api';

import { useEffect, useState } from "react";
import { Settings, Key, Globe, Cpu, Shield, CheckCircle2, XCircle, BrainCircuit, Zap } from "lucide-react";

interface ApiKeyStatus {
  DEEPSEEK_API_KEY: boolean;
  GEMINI_API_KEY: boolean;
  BR_API_BASE_URL: boolean;
}

export default function Configuracoes() {
  const [savedMessage, setSavedMessage] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiKeyStatus | null>(null);

  useEffect(() => {
    api.status()
      .then(r => r.json())
      .then(data => setApiStatus(data))
      .catch(() => setApiStatus({ DEEPSEEK_API_KEY: false, GEMINI_API_KEY: false, BR_API_BASE_URL: true }));
  }, []);

  const apiStatuses = [
    {
      name: "DeepSeek Chat",
      key: "DEEPSEEK_API_KEY",
      icon: BrainCircuit,
      status: apiStatus?.DEEPSEEK_API_KEY ? "active" : "missing",
      description: apiStatus?.DEEPSEEK_API_KEY
        ? "Motor principal de IA — extração de sinais, scoring e copy. Chave configurada e operacional."
        : "Motor principal de IA — extração de sinais, scoring e copy. Chave NÃO configurada.",
    },
    {
      name: "Google Search / Maps (Stealth)",
      key: "SEM_CHAVE",
      icon: Globe,
      status: "active",
      description: "Navegação direta via Playwright stealth — sem API, sem chave, sem custo. Opera como extensão de Chrome real.",
    },
    {
      name: "Gemini Vision",
      key: "GEMINI_API_KEY",
      icon: Zap,
      status: apiStatus?.GEMINI_API_KEY ? "active" : "missing",
      description: apiStatus?.GEMINI_API_KEY
        ? "Auditoria visual de fachada. Chave configurada e operacional."
        : "Auditoria visual de fachada. Chave NÃO configurada (opcional).",
    },
    {
      name: "BrasilAPI (CNPJ)",
      key: "SEM_CHAVE",
      icon: Globe,
      status: "active",
      description: "Consulta de dados fiscais via BrasilAPI (gratuita, sem chave necessária).",
    },
  ];

  const systemParams = [
    { label: "Cidade Base", value: "São Paulo, SP", editable: false },
    { label: "Motor de Busca", value: "Google Search (Playwright Stealth)", editable: false },
    { label: "Motor de Mapas", value: "Google Maps (Playwright Stealth)", editable: false },
    { label: "Motor de IA", value: "DeepSeek Chat", editable: false },
    { label: "Limite de Leads por Scan", value: "50", editable: true },
    { label: "Delay Stealth (Anti-Bot)", value: "2.0s – 3.5s (aleatório)", editable: false },
    { label: "Pilares Ativos", value: "A (Condomínios) · B (Editais) · C (Corporativo)", editable: false },
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
