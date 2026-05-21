"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, resolveLeadImageUrl } from "@/lib/api";
import {
  History,
  Search,
  Loader2,
  MapPin,
  Layers,
  Calendar,
  User,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Building,
  ScrollText,
  Briefcase
} from "lucide-react";
import Link from "next/link";

interface HistoryEntry {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  city: string;
  pilares: string;
  total_leads: number;
  leads_a: number;
  leads_b: number;
  leads_c: number;
  timestamp: string;
  leads_json: any;
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export default function HistoricoBuscasPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch (e) {
        console.error("Erro ao parsear currentUser", e);
      }
    }

    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.searchHistory();
        if (!res.ok) {
          if (res.status === 401) {
            setError("Faça login para ver o histórico de buscas.");
            return;
          }
          throw new Error(`Erro ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          // Ordenar do mais recente para o mais antigo
          const sorted = (data.history || []).sort(
            (a: HistoryEntry, b: HistoryEntry) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setHistory(sorted);
        } else {
          setError("Erro ao carregar histórico.");
        }
      } catch (err: any) {
        console.error("Erro ao carregar histórico:", err);
        setError(err.message || "Erro ao carregar histórico.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getPilarIcon = (pilar: string) => {
    if (pilar.includes("A")) return <Building size={16} />;
    if (pilar.includes("B")) return <ScrollText size={16} />;
    if (pilar.includes("C")) return <Briefcase size={16} />;
    return <Layers size={16} />;
  };

  const getPilarLabel = (pilar: string) => {
    const labels: string[] = [];
    if (pilar.includes("A")) labels.push("Condomínios");
    if (pilar.includes("B")) labels.push("Editais");
    if (pilar.includes("C")) labels.push("Corporativo");
    return labels.join(" · ");
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const getLeadFromJson = (entry: HistoryEntry, pilar: string, index: number) => {
    try {
      const leads = entry.leads_json?.pilares?.[pilar]?.leads;
      return leads?.[index] || null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pl-0 lg:pl-72">
      {/* Header */}
      <div className="relative border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 bg-yellow-400/10 rounded-xl">
              <History size={28} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Histórico de Buscas
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Todas as varreduras de demanda salvas automaticamente
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl inline-block">
              <p className="text-red-400 text-lg">{error}</p>
              <Link
                href="/"
                className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 underline"
              >
                Voltar para o início
              </Link>
            </div>
          </motion.div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="p-8 bg-slate-800/30 border border-white/5 rounded-2xl">
              <Search size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                Nenhuma busca registrada ainda
              </p>
              <p className="text-slate-500 text-sm mt-2">
                As buscas feitas no Cockpit serão salvas automaticamente aqui.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-yellow-400 text-slate-900 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
              >
                <Search size={18} />
                Ir para o Cockpit
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden hover:border-yellow-400/20 transition-all duration-300"
              >
                {/* Cabeçalho da busca */}
                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-yellow-400/10 rounded-xl">
                      {getPilarIcon(entry.pilares)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold text-lg">
                          {entry.city}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-700/50 rounded-full text-xs text-slate-300">
                          {getPilarLabel(entry.pilares)}
                        </span>
                        <span className="px-2.5 py-0.5 bg-yellow-400/10 rounded-full text-xs text-yellow-400 font-bold">
                          {entry.total_leads} leads
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(entry.timestamp)}
                        </span>
                        {currentUser?.role === "admin" && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {entry.user_name} ({entry.user_email})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedId === entry.id ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={20} className="text-slate-400" />
                  </motion.div>
                </button>

                {/* Detalhes expandidos */}
                {expandedId === entry.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5 px-5 pb-5"
                  >
                    {/* Resumo por pilar */}
                    <div className="grid grid-cols-3 gap-4 mt-5">
                      <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
                          <Building size={18} />
                          <span className="text-xs font-bold">PILAR A</span>
                        </div>
                        <span className="text-2xl font-bold text-white">
                          {entry.leads_a}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Condomínios
                        </p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                          <ScrollText size={18} />
                          <span className="text-xs font-bold">PILAR B</span>
                        </div>
                        <span className="text-2xl font-bold text-white">
                          {entry.leads_b}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">Editais</p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                          <Briefcase size={18} />
                          <span className="text-xs font-bold">PILAR C</span>
                        </div>
                        <span className="text-2xl font-bold text-white">
                          {entry.leads_c}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Corporativo
                        </p>
                      </div>
                    </div>

                    {/* Leads por pilar */}
                    {["A", "B", "C"].map((pilar) => {
                      const pilarData = entry.leads_json?.pilares?.[pilar];
                      const leads = pilarData?.leads || [];
                      const pilarLabels: Record<string, string> = {
                        A: "Condomínios",
                        B: "Editais",
                        C: "Corporativo",
                      };
                      const pilarColors: Record<string, string> = {
                        A: "text-yellow-400",
                        B: "text-blue-400",
                        C: "text-emerald-400",
                      };

                      if (leads.length === 0) return null;

                      return (
                        <div key={pilar} className="mt-5">
                          <h3
                            className={`text-sm font-bold ${pilarColors[pilar]} mb-3`}
                          >
                            Pilar {pilar} — {pilarLabels[pilar]} ({leads.length}{" "}
                            leads)
                          </h3>
                          <div className="space-y-2">
                            {leads.slice(0, 10).map((lead: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl hover:bg-slate-900/60 transition-colors"
                              >
                                <span className="text-xs text-slate-600 w-6 text-center">
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white font-medium truncate">
                                    {lead.name || lead.title || "N/D"}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                                    {lead.address && (
                                      <span className="flex items-center gap-1">
                                        <MapPin size={10} />
                                        {lead.address}
                                      </span>
                                    )}
                                    {lead.phone &&
                                      lead.phone !== "N/D" && (
                                        <span className="flex items-center gap-1">
                                          <Phone size={10} />
                                          {lead.phone}
                                        </span>
                                      )}
                                    {lead.email &&
                                      lead.email !== "N/D" && (
                                        <span className="flex items-center gap-1">
                                          <Mail size={10} />
                                          {lead.email}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {leads.length > 10 && (
                              <p className="text-xs text-slate-600 text-center py-2">
                                +{leads.length - 10} leads adicionais...
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}