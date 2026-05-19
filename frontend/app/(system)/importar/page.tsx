"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  Upload,
  FileJson,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Copy,
  Download,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const EXEMPLO_JSON = `[
  {
    "title": "Condomínio Residencial Park",
    "address": "Av. Principal, 123 - Jundiaí, SP",
    "phone_number": "(11) 99999-0001",
    "website": "https://parkresidencial.com.br",
    "rating": 4.5
  },
  {
    "name": "Edifício Golden Tower",
    "address": "Rua das Flores, 456 - Jundiaí, SP",
    "phone": "(11) 3333-4444",
    "email": "contato@goldentower.com.br",
    "rating": 4.2
  }
]`;

const EXEMPLO_CSV = `name,address,phone,email,website,rating
Condomínio Park,Av. Principal 123 Jundiaí SP,(11) 99999-0001,admin@park.com,https://park.com,4.5
Edifício Torres,Rua das Flores 456 Jundiaí SP,(11) 3333-4444,,https://torres.com,4.2`;

type ImportResult = {
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
  message: string;
};

function csvToJson(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || "";
      return obj;
    }, {} as Record<string, string>);
  });
}

export default function ImportarPage() {
  const [mode, setMode] = useState<"json" | "csv">("json");
  const [inputText, setInputText] = useState("");
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleTextChange(val: string) {
    setInputText(val);
    setResult(null);
    setParseError("");

    if (!val.trim()) {
      setPreview([]);
      return;
    }

    try {
      if (mode === "json") {
        const parsed = JSON.parse(val);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        setPreview(arr.slice(0, 5));
        setParseError("");
      } else {
        const rows = csvToJson(val);
        setPreview(rows.slice(0, 5));
        setParseError("");
      }
    } catch (e) {
      setParseError("Formato inválido. Verifique o JSON ou CSV.");
      setPreview([]);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (file.name.endsWith(".csv")) {
        setMode("csv");
      } else {
        setMode("json");
      }
      setInputText(text);
      handleTextChange(text);
    };
    reader.readAsText(file);
  }

  function loadExample() {
    const ex = mode === "json" ? EXEMPLO_JSON : EXEMPLO_CSV;
    setInputText(ex);
    handleTextChange(ex);
  }

  async function handleImport() {
    if (!inputText.trim()) return;
    setImporting(true);
    setResult(null);

    try {
      let leads: Record<string, unknown>[] = [];
      if (mode === "json") {
        const parsed = JSON.parse(inputText);
        leads = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        leads = csvToJson(inputText);
      }

      const res = await api.importLeads(leads);
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: 1,
        message: `Erro: ${e?.message || "Falha ao conectar com o servidor"}`,
      });
    } finally {
      setImporting(false);
    }
  }

  const leadsCount = (() => {
    try {
      if (!inputText.trim()) return 0;
      if (mode === "json") {
        const p = JSON.parse(inputText);
        return Array.isArray(p) ? p.length : 1;
      } else {
        return csvToJson(inputText).length;
      }
    } catch {
      return 0;
    }
  })();

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-yellow-400 font-black text-xs uppercase tracking-[0.3em]">
          <Upload size={14} className="fill-yellow-400/20 stroke-yellow-400" />
          <span>Importação Manual</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">
          Importar <span className="text-yellow-400">Leads</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium max-w-xl">
          Cole aqui o JSON ou CSV exportado por extensões como{" "}
          <span className="text-yellow-400 font-bold">G Maps Extractor</span>,{" "}
          <span className="text-yellow-400 font-bold">Instant Data Scraper</span> ou
          qualquer outra. O sistema normaliza os campos automaticamente.
        </p>
      </header>

      {/* Guia de extensões */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            name: "G Maps Extractor",
            desc: "Extensão Chrome gratuita. Extrai direto do Google Maps.",
            badge: "Recomendada",
            url: "https://chrome.google.com/webstore",
          },
          {
            name: "Instant Data Scraper",
            desc: "Extrai tabelas de qualquer página. Simples e gratuita.",
            badge: "Gratuita",
            url: "https://chrome.google.com/webstore",
          },
          {
            name: "Outscraper",
            desc: "75 leads gratuitos por mês. Dados mais completos.",
            badge: "75 grátis/mês",
            url: "https://outscraper.com",
          },
        ].map((ext) => (
          <div
            key={ext.name}
            className="bg-slate-950/40 border border-white/5 hover:border-yellow-400/20 rounded-2xl p-4 flex flex-col gap-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20 uppercase tracking-widest">
                {ext.badge}
              </span>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
            </div>
            <h4 className="text-white font-black text-sm uppercase tracking-tight">{ext.name}</h4>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed">{ext.desc}</p>
          </div>
        ))}
      </div>

      {/* Área de Importação */}
      <div className="bg-slate-950/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 space-y-5">

        {/* Seletor de formato + Carregar arquivo */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex bg-slate-900 p-1.5 rounded-xl gap-1">
            <button
              onClick={() => { setMode("json"); setInputText(""); setPreview([]); setParseError(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === "json" ? "bg-yellow-400 text-slate-900 shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              <FileJson size={14} /> JSON
            </button>
            <button
              onClick={() => { setMode("csv"); setInputText(""); setPreview([]); setParseError(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === "csv" ? "bg-yellow-400 text-slate-900 shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              <FileText size={14} /> CSV
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadExample}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-yellow-400/20 text-slate-400 hover:text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all"
            >
              <Sparkles size={12} /> Exemplo
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-yellow-400/20 text-slate-400 hover:text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all"
            >
              <Upload size={12} /> Arquivo
            </button>
            <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFileUpload} />
          </div>
        </div>

        {/* Área de texto */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={mode === "json"
              ? `Cole aqui o JSON exportado pela extensão...\n\nFormato aceito:\n[\n  { "title": "Condomínio X", "phone_number": "(11) 9999-0000", "address": "..." },\n  ...\n]`
              : `Cole aqui o CSV exportado pela extensão...\n\nFormato aceito:\nname,address,phone,email,website\nCondomínio X,Av. Principal 123,(11) 9999-0000,,...`
            }
            rows={12}
            className="w-full bg-slate-950 border border-white/5 focus:border-yellow-400 rounded-2xl p-4 text-xs font-mono text-slate-300 outline-none placeholder-slate-700 transition-colors resize-none leading-relaxed"
          />
          {inputText && (
            <div className="absolute top-3 right-3 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
              {leadsCount} lead{leadsCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Erro de parse */}
        <AnimatePresence>
          {parseError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-4 py-3 rounded-xl"
            >
              <AlertTriangle size={14} /> {parseError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview */}
        <AnimatePresence>
          {preview.length > 0 && !parseError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 size={12} className="text-yellow-400" />
                Preview — primeiros {preview.length} de {leadsCount} lead{leadsCount !== 1 ? "s" : ""}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-1 min-w-[500px]">
                  <thead>
                    <tr className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                      {["nome", "endereço", "telefone", "website", "avaliação"].map(h => (
                        <th key={h} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row: any, i) => (
                      <tr key={i} className="bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
                        <td className="px-3 py-2 text-[10px] font-bold text-white rounded-l-xl max-w-[160px] truncate">
                          {row.name || row.title || row.business_name || "—"}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-400 max-w-[160px] truncate">
                          {row.address || row.full_address || row.vicinity || "—"}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-yellow-400 font-mono">
                          {row.phone || row.phone_number || row.phone_1 || "—"}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-400 max-w-[120px] truncate">
                          {row.website || row.site || row.url || "—"}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-yellow-400 font-bold rounded-r-xl">
                          {row.rating ? `⭐ ${row.rating}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leadsCount > 5 && (
                  <p className="text-[9px] text-slate-600 mt-2 text-center">
                    + {leadsCount - 5} lead{leadsCount - 5 !== 1 ? "s" : ""} não exibido{leadsCount - 5 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultado da importação */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border font-bold text-sm ${
                result.success
                  ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {result.success
                ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                : <XCircle size={20} className="shrink-0 mt-0.5" />
              }
              <div className="flex flex-col gap-1">
                <span>{result.message}</span>
                {result.success && (
                  <span className="text-[10px] font-medium text-yellow-400/70">
                    {result.imported} importado{result.imported !== 1 ? "s" : ""} ·{" "}
                    {result.skipped} ignorado{result.skipped !== 1 ? "s" : ""} ·{" "}
                    {result.errors} erro{result.errors !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de importar */}
        <button
          onClick={handleImport}
          disabled={importing || leadsCount === 0 || !!parseError}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-yellow-400/10 disabled:shadow-none"
        >
          {importing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span className="uppercase tracking-widest text-xs">Importando {leadsCount} lead{leadsCount !== 1 ? "s" : ""}...</span>
            </>
          ) : (
            <>
              <ArrowRight size={18} />
              <span className="uppercase tracking-widest text-xs">
                {leadsCount > 0 ? `Importar ${leadsCount} Lead${leadsCount !== 1 ? "s" : ""} para o CRM` : "Cole os dados acima para importar"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Instrução de uso */}
      <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} className="text-yellow-400" /> Como usar com a Metodologia Sniper 3 Fases
        </h3>
        <ol className="space-y-2">
          {[
            "Instale a extensão G Maps Extractor no Chrome (gratuita)",
            'Acesse o Google Maps e busque usando as 3 fases: ex: "Condominios Residenciais Jundiaí SP"',
            "A extensão extrai todos os resultados visíveis e exporta como JSON ou CSV",
            "Cole o resultado aqui e clique em Importar",
            "Os leads aparecem automaticamente no CRM Prospetor com score calculado",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs font-medium text-slate-400">
              <span className="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
