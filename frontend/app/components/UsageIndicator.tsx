'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Zap } from 'lucide-react';

interface UsageStat {
  service: string;
  calls_today: number;
  total_calls: number;
  last_used: string;
}

export default function UsageIndicator() {
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Falha ao buscar uso de IA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/50 border border-yellow-400/20 backdrop-blur-md">
      <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-widest">
        <Cpu size={14} />
        <span>Monitor de IA</span>
      </div>

      {stats.length === 0 ? (
        <div className="text-[10px] text-slate-400">Nenhum uso registrado hoje</div>
      ) : (
        <div className="flex flex-col gap-1">
          {stats.map((stat) => (
            <div key={stat.service} className="flex justify-between items-center gap-4">
              <span className="text-[10px] text-white/70 truncate max-w-[100px]">{stat.service}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${Math.min((stat.calls_today / 1500) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-yellow-400">{stat.calls_today}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 mt-1">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] text-emerald-500 font-medium">Sincronizado</span>
      </div>
    </div>
  );
}
