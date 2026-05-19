"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Activity, Bot, Database, Search, Target, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_WS_URL } from "@/lib/config";

interface AgentLog {
  timestamp: string;
  agent: string;
  action: string;
  message: string;
  status: "info" | "success" | "warning" | "error" | "working";
}

const getAgentIcon = (agent: string) => {
  switch (agent) {
    case "ScoutAgent": return <Search size={14} className="text-blue-400" />;
    case "ContextAgent": return <Database size={14} className="text-emerald-400" />;
    case "AnalystAgent": return <Bot size={14} className="text-purple-400" />;
    case "HunterAgent": return <Target size={14} className="text-rose-400" />;
    case "SniperAgent": return <Target size={14} className="text-primary animate-pulse" />;
    case "MessengerAgent": return <Mail size={14} className="text-amber-400" />;
    default: return <Activity size={14} className="text-slate-400" />;
  }
};

export default function AgentConsole() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(`${BACKEND_WS_URL}/ws/logs`);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs(prev => [...prev.slice(-49), data]); // Keep last 50 logs
      } catch (e) {
        console.error("Erro ao parsear log:", e);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-primary" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">
            Agent Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            {isConnected ? "Live" : "Offline"}
          </span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-rose-500"}`} />
        </div>
      </div>

      {/* Logs Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center px-4">
            Aguardando comandos... <br/> (Pressione "Busca Sniper")
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAgentIcon(log.agent)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    <span className="text-[10px] font-bold text-slate-300">{log.agent}</span>
                  </div>
                  <span className={`text-xs leading-relaxed ${
                    log.status === 'error' ? 'text-rose-400' :
                    log.status === 'success' ? 'text-emerald-400' :
                    log.status === 'warning' ? 'text-amber-400' :
                    'text-slate-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
