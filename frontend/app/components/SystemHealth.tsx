"use client";

import { useEffect, useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface ServiceHealth {
  status: string;
  latency?: string;
}

interface HealthReport {
  status: string;
  services: {
    overpass_osm: ServiceHealth;
    google_maps: ServiceHealth;
    gemini_vision: ServiceHealth;
    brasil_api: ServiceHealth;
  };
}

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function checkHealth() {
    try {
      const res = await api.health();
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (error) {
      console.error("Erro ao checar saúde:", error);
    }
  }

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Checa a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'text-emerald-400';
      case 'Healthy': return 'text-emerald-400';
      case 'Warning': return 'text-amber-400';
      case 'Offline': return 'text-rose-400';
      case 'Critical': return 'text-rose-400';
      case 'Invalid Key': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Online' || status === 'Healthy') return <CheckCircle size={14} className="text-emerald-400" />;
    if (status === 'Warning') return <AlertTriangle size={14} className="text-amber-400" />;
    return <XCircle size={14} className="text-rose-400" />;
  };

  if (!health) return null;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowDetails(!showDetails)}
        className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5 hover:border-primary/30 transition-all"
      >
        <div className="flex items-center gap-2">
          <Activity size={16} className={getStatusColor(health.status)} />
          <span className="text-xs text-muted font-medium uppercase tracking-wider">Sistema</span>
        </div>
        <div className={`h-2 w-2 rounded-full ${health.status === 'Healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'} shadow-[0_0_8px_rgba(52,211,153,0.5)]`} />
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-3 right-0 w-64 glass p-4 rounded-2xl border border-white/10 shadow-2xl z-50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <ShieldCheck size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-white">Status das Sentinelas</h4>
            </div>

            <div className="space-y-3">
              {Object.entries(health.services).map(([name, data]) => (
                <div key={name} className="flex items-center justify-between group">
                  <span className="text-xs text-slate-400 capitalize">{name.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${getStatusColor(data.status)}`}>{data.status}</span>
                    {getStatusIcon(data.status)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Último check: {new Date().toLocaleTimeString()}</span>
              <button
                onClick={(e) => { e.stopPropagation(); checkHealth(); }}
                className="text-[10px] text-primary hover:underline"
              >
                Recarregar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
