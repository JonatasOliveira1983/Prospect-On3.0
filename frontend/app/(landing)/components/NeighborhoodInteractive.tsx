"use client";

import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, RotateCcw, HelpCircle, ArrowRight, MousePointerClick } from "lucide-react";

interface BuildingState {
  isPainted: boolean;
  clickX: number;
  clickY: number;
}

export default function NeighborhoodInteractive() {
  const [buildings, setBuildings] = useState<BuildingState[]>([
    { isPainted: false, clickX: 0, clickY: 0 },
    { isPainted: false, clickX: 0, clickY: 0 },
    { isPainted: false, clickX: 0, clickY: 0 },
    { isPainted: false, clickX: 0, clickY: 0 },
  ]);

  const [hasClicked, setHasClicked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  const totalPainted = buildings.filter((b) => b.isPainted).length;

  const handlePaint = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (buildings[index].isPainted) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setBuildings((prev) => {
      const next = [...prev];
      next[index] = { isPainted: true, clickX: x, clickY: y };
      return next;
    });

    setHasClicked(true);

    // Haptic feedback if supported
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
  };

  const handleReset = () => {
    setBuildings([
      { isPainted: false, clickX: 0, clickY: 0 },
      { isPainted: false, clickX: 0, clickY: 0 },
      { isPainted: false, clickX: 0, clickY: 0 },
      { isPainted: false, clickX: 0, clickY: 0 },
    ]);
    setShowCelebration(false);
    setConfetti([]);
  };

  // Trigger celebration when all 4 buildings are painted
  useEffect(() => {
    if (totalPainted === 4) {
      setShowCelebration(true);
      // Spawn confetti particles (simple squares)
      const colors = ["#22d3ee", "#FACC15", "#10B981", "#EC4899", "#3B82F6"];
      const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage x
        y: Math.random() * 20 + 80, // starting y near bottom
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
      }));
      setConfetti(newConfetti);
    }
  }, [totalPainted]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-4 lg:p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* Target Tracker Panel */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-otto-yellow/10 border border-otto-yellow/20">
            <Sparkles size={18} className="text-otto-yellow animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Simulador de Fachadas</h4>
            <p className="text-xs font-black text-white">Revitalização de Fachadas Otto</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tracker bubble */}
          <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
            totalPainted === 4 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
              : "bg-white/5 text-white/70 border border-white/10"
          }`}>
            Progresso: {totalPainted} de 4 Fachadas
          </div>

          {totalPainted > 0 && (
            <button 
              onClick={handleReset}
              className="p-1.5 rounded-full hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-all active:scale-95"
              title="Reiniciar Simulação"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Play Area Wrapper with Touch Scroll for Mobile */}
      <div className="w-full overflow-x-auto scrollbar-none pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[430px] md:min-w-0 relative w-full min-h-[280px] flex items-end justify-center gap-2.5 lg:gap-4 px-2 py-4 select-none">
        
        {/* Helper Pointer */}
        {!hasClicked && (
          <div className="absolute top-[25%] left-[10%] lg:left-[15%] z-30 pointer-events-none animate-bounce flex flex-col items-center gap-2">
            <div className="px-2.5 py-1 rounded bg-otto-yellow text-otto-blue text-[9px] font-black tracking-wider uppercase shadow-[0_8px_20px_rgba(250,204,21,0.3)] whitespace-nowrap border border-white/15 flex items-center gap-1.5">
              <MousePointerClick size={10} />
              Clique nas Fachadas para Restaurar
            </div>
          </div>
        )}

        {/* Confetti Explosion System */}
        {totalPainted === 4 && confetti.map((c) => (
          <div
            key={c.id}
            className="absolute bottom-0 w-2 h-2 rounded-sm opacity-0 pointer-events-none animate-[confetti-fall_4s_ease-out_infinite]"
            style={{
              left: `${c.x}%`,
              backgroundColor: c.color,
              animationDelay: `${c.delay}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}

        {/* BUILDING 1: THE CORPORATE TOWER */}
        <div 
          onClick={(e) => handlePaint(0, e)}
          className={`relative group cursor-pointer transition-all duration-300 ${
            buildings[0].isPainted ? "hover:scale-[1.02]" : "hover:translate-y-[-4px]"
          }`}
          style={{ width: "90px", height: "230px" }}
        >
          {/* Tag Flutuante do Prédio */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 z-20 ${
            buildings[0].isPainted 
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
              : "bg-slate-800 text-slate-400 border border-white/5 group-hover:text-white"
          }`}>
            {buildings[0].isPainted ? "C. Apolo (Valorizado)" : "C. Apolo"}
          </div>

          {/* SVG LAYER 1: UNPAINTED STATE */}
          <svg viewBox="0 0 90 230" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
            <rect x="5" y="20" width="80" height="210" fill="#334155" rx="3" />
            <rect x="12" y="28" width="28" height="190" fill="#1e293b" opacity="0.3" />
            <rect x="50" y="28" width="28" height="190" fill="#1e293b" opacity="0.3" />
            <line x1="45" y1="20" x2="45" y2="5" stroke="#475569" strokeWidth="1.5" />
            <circle cx="45" cy="5" r="1.5" fill="#ef4444" className="animate-pulse" />

            {/* Cracks */}
            <path d="M 15,45 L 25,58 L 20,70" stroke="#1e293b" strokeWidth="1.2" fill="none" opacity="0.8" />
            <path d="M 75,110 L 68,122 L 72,135" stroke="#1e293b" strokeWidth="1.2" fill="none" opacity="0.8" />

            {/* Windows - Dark */}
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i}>
                <rect x="16" y={35 + i * 25} width="20" height="13" fill="#0f172a" rx="1.5" />
                <rect x="54" y={35 + i * 25} width="20" height="13" fill="#0f172a" rx="1.5" />
              </g>
            ))}
          </svg>

          {/* SVG LAYER 2: PAINTED STATE */}
          <svg 
            viewBox="0 0 90 230" 
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_10px_30px_rgba(34,211,238,0.2)]"
            style={{
              clipPath: buildings[0].isPainted 
                ? `circle(150% at ${buildings[0].clickX}px ${buildings[0].clickY}px)` 
                : `circle(0% at 0px 0px)`,
              transition: "clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <rect x="5" y="20" width="80" height="210" fill="#0b0f19" rx="3" stroke="#22d3ee" strokeWidth="1.2" />
            <rect x="5" y="20" width="3" height="210" fill="#22d3ee" opacity="0.8" />
            <rect x="82" y="20" width="3" height="210" fill="#22d3ee" opacity="0.8" />
            <line x1="45" y1="20" x2="45" y2="5" stroke="#22d3ee" strokeWidth="1.5" />
            <circle cx="45" cy="5" r="2.5" fill="#22d3ee" />

            {/* Windows - Glowing yellow */}
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i}>
                <rect x="16" y={35 + i * 25} width="20" height="13" fill="#facc15" rx="1.5" opacity="0.9" />
                <rect x="54" y={35 + i * 25} width="20" height="13" fill="#facc15" rx="1.5" opacity="0.85" />
              </g>
            ))}
          </svg>
        </div>

        {/* BUILDING 2: THE COZY RESIDENTIAL APARTMENTS */}
        <div 
          onClick={(e) => handlePaint(1, e)}
          className={`relative group cursor-pointer transition-all duration-300 ${
            buildings[1].isPainted ? "hover:scale-[1.02]" : "hover:translate-y-[-4px]"
          }`}
          style={{ width: "95px", height: "195px" }}
        >
          {/* Tag Flutuante do Prédio */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 z-20 ${
            buildings[1].isPainted 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-slate-800 text-slate-400 border border-white/5 group-hover:text-white"
          }`}>
            {buildings[1].isPainted ? "Ed. Solange (Protegido)" : "Ed. Solange"}
          </div>

          {/* SVG LAYER 1: UNPAINTED STATE */}
          <svg viewBox="0 0 95 195" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
            <path d="M 5,25 L 47.5,5 L 90,25 Z" fill="#334155" />
            <rect x="10" y="25" width="75" height="165" fill="#475569" rx="2" />
            <path d="M 10,25 Q 25,40 35,25" fill="none" stroke="#1e293b" strokeWidth="3" opacity="0.5" />

            {/* Windows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i}>
                <rect x="20" y={38 + i * 36} width="16" height="18" fill="#0f172a" rx="1" />
                <rect x="58" y={38 + i * 36} width="16" height="18" fill="#0f172a" rx="1" />
                <rect x="54" y={50 + i * 36} width="24" height="9" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
              </g>
            ))}
          </svg>

          {/* SVG LAYER 2: PAINTED STATE */}
          <svg 
            viewBox="0 0 95 195" 
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            style={{
              clipPath: buildings[1].isPainted 
                ? `circle(150% at ${buildings[1].clickX}px ${buildings[1].clickY}px)` 
                : `circle(0% at 0px 0px)`,
              transition: "clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <path d="M 5,25 L 47.5,5 L 90,25 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="10" y="25" width="75" height="165" fill="#f8fafc" rx="2" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="46" y="25" width="3" height="165" fill="#facc15" opacity="0.8" />

            {/* Windows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i}>
                <rect x="20" y={38 + i * 36} width="16" height="18" fill="#fef08a" rx="1" stroke="#facc15" strokeWidth="0.5" />
                <rect x="58" y={38 + i * 36} width="16" height="18" fill="#fef08a" rx="1" stroke="#facc15" strokeWidth="0.5" />
                <rect x="54" y={50 + i * 36} width="24" height="9" fill="#0f172a" rx="1" />
                {/* Balcony Railings */}
                <line x1="56" y1={50 + i * 36} x2="56" y2={59 + i * 36} stroke="#facc15" strokeWidth="0.6" />
                <line x1="62" y1={50 + i * 36} x2="62" y2={59 + i * 36} stroke="#facc15" strokeWidth="0.6" />
                <line x1="68" y1={50 + i * 36} x2="68" y2={59 + i * 36} stroke="#facc15" strokeWidth="0.6" />
                <line x1="74" y1={50 + i * 36} x2="74" y2={59 + i * 36} stroke="#facc15" strokeWidth="0.6" />
                {/* Micro flower buds */}
                <circle cx="58" cy={48 + i * 36} r="2" fill="#10b981" />
                <circle cx="70" cy={48 + i * 36} r="2" fill="#10b981" />
              </g>
            ))}
          </svg>
        </div>

        {/* BUILDING 3: CONTEMPORARY BOUTIQUE LOFT */}
        <div 
          onClick={(e) => handlePaint(2, e)}
          className={`relative group cursor-pointer transition-all duration-300 ${
            buildings[2].isPainted ? "hover:scale-[1.02]" : "hover:translate-y-[-4px]"
          }`}
          style={{ width: "95px", height: "165px" }}
        >
          {/* Tag Flutuante do Prédio */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 z-20 ${
            buildings[2].isPainted 
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
              : "bg-slate-800 text-slate-400 border border-white/5 group-hover:text-white"
          }`}>
            {buildings[2].isPainted ? "Plaza Center (Moderno)" : "Plaza Center"}
          </div>

          {/* SVG LAYER 1: UNPAINTED STATE */}
          <svg viewBox="0 0 95 165" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
            <rect x="5" y="30" width="85" height="130" fill="#334155" rx="3" />
            <path d="M 12,45 L 25,50 L 20,62 L 35,67" stroke="#1e293b" strokeWidth="1.2" fill="none" opacity="0.8" />
            <rect x="55" y="42" width="10" height="10" fill="#1e293b" opacity="0.5" />

            {/* Windows */}
            {Array.from({ length: 3 }).map((_, i) => (
              <g key={i}>
                <rect x="12" y={75 + i * 28} width="25" height="15" fill="#0f172a" rx="1" />
                <rect x="58" y={75 + i * 28} width="25" height="15" fill="#0f172a" rx="1" />
              </g>
            ))}
          </svg>

          {/* SVG LAYER 2: PAINTED STATE */}
          <svg 
            viewBox="0 0 95 165" 
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
            style={{
              clipPath: buildings[2].isPainted 
                ? `circle(150% at ${buildings[2].clickX}px ${buildings[2].clickY}px)` 
                : `circle(0% at 0px 0px)`,
              transition: "clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <rect x="5" y="30" width="85" height="130" fill="#1e293b" rx="3" stroke="#334155" strokeWidth="0.8" />
            
            <linearGradient id="woodGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <rect x="5" y="30" width="8" height="130" fill="url(#woodGrad2)" />
            <rect x="82" y="30" width="8" height="130" fill="url(#woodGrad2)" />
            <rect x="13" y="36" width="69" height="5" fill="#facc15" opacity="0.9" />

            {/* Windows */}
            {Array.from({ length: 3 }).map((_, i) => (
              <g key={i}>
                <rect x="16" y={70 + i * 30} width="25" height="16" fill="#fef08a" rx="1" stroke="#f59e0b" strokeWidth="0.5" />
                <rect x="54" y={70 + i * 30} width="25" height="16" fill="#fef08a" rx="1" stroke="#f59e0b" strokeWidth="0.5" />
              </g>
            ))}
          </svg>
        </div>

        {/* BUILDING 4: NEW - THE NEOCLASSICAL APARTMENTS */}
        <div 
          onClick={(e) => handlePaint(3, e)}
          className={`relative group cursor-pointer transition-all duration-300 ${
            buildings[3].isPainted ? "hover:scale-[1.02]" : "hover:translate-y-[-4px]"
          }`}
          style={{ width: "90px", height: "180px" }}
        >
          {/* Tag Flutuante do Prédio */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 z-20 ${
            buildings[3].isPainted 
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
              : "bg-slate-800 text-slate-400 border border-white/5 group-hover:text-white"
          }`}>
            {buildings[3].isPainted ? "Ed. Roma (Revitalizado)" : "Ed. Roma"}
          </div>

          {/* SVG LAYER 1: UNPAINTED STATE */}
          <svg viewBox="0 0 90 180" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]">
            {/* Crown Archtop */}
            <path d="M 10,25 A 35,35 0 0,1 80,25 Z" fill="#334155" />
            {/* Main Block */}
            <rect x="10" y="25" width="70" height="150" fill="#475569" rx="2" />
            {/* Vertical column lines representing old concrete relief */}
            <line x1="22" y1="25" x2="22" y2="175" stroke="#334155" strokeWidth="2" />
            <line x1="68" y1="25" x2="68" y2="175" stroke="#334155" strokeWidth="2" />
            {/* Wear cracks */}
            <path d="M 30,50 L 40,62 L 35,75" stroke="#1e293b" strokeWidth="1.2" fill="none" opacity="0.8" />
            {/* Windows - Dark */}
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i}>
                <rect x="30" y={35 + i * 34} width="30" height="18" fill="#0f172a" rx="1.5" />
              </g>
            ))}
          </svg>

          {/* SVG LAYER 2: PAINTED STATE */}
          <svg 
            viewBox="0 0 90 180" 
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_10px_30px_rgba(99,102,241,0.2)]"
            style={{
              clipPath: buildings[3].isPainted 
                ? `circle(150% at ${buildings[3].clickX}px ${buildings[3].clickY}px)` 
                : `circle(0% at 0px 0px)`,
              transition: "clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Crown Archtop */}
            <path d="M 10,25 A 35,35 0 0,1 80,25 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth="0.8" />
            {/* Main Block - Soft Cream/Grey Neoclassical */}
            <rect x="10" y="25" width="70" height="150" fill="#f1f5f9" rx="2" stroke="#cbd5e1" strokeWidth="0.8" />
            {/* Royal Indigo Column Reliefs */}
            <rect x="18" y="25" width="6" height="150" fill="#312e81" opacity="0.9" />
            <rect x="66" y="25" width="6" height="150" fill="#312e81" opacity="0.9" />
            <rect x="10" y="25" width="70" height="4" fill="#312e81" />
            {/* Windows - Glowing cozily */}
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i}>
                <rect x="30" y={35 + i * 34} width="30" height="18" fill="#fef08a" rx="1.5" stroke="#facc15" strokeWidth="0.5" />
                <line x1="45" y1={35 + i * 34} x2="45" y2={53 + i * 34} stroke="#ca8a04" strokeWidth="0.5" />
              </g>
            ))}
          </svg>
        </div>
      </div>
      </div>

      {/* Celebration Panel (Triggers when 4/4 buildings are painted) */}
      <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
        showCelebration ? "max-h-[300px] opacity-100 mt-6" : "max-h-0 opacity-0 pointer-events-none"
      }`}>
        <div className="w-full p-5 lg:p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="flex items-start gap-4 flex-col sm:flex-row text-left">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck size={28} className="animate-[float_3s_ease-in-out_infinite]" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-white tracking-tight">
                Quadra Totalmente Revitalizada
              </h3>
              <p className="text-xs lg:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                Todas as fachadas foram restauradas com o padrão de engenharia e acabamento Otto Pinturas. O valor patrimonial do condomínio e do bairro foi reestabelecido.
              </p>
              <div className="inline-block mt-3 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                Vistoria Técnica Cortesia Garantida
              </div>
            </div>
          </div>

          <a 
            href="#orcamento" 
            className="w-full lg:w-auto px-8 py-3.5 rounded-full bg-otto-yellow hover:bg-otto-yellow/90 text-otto-blue text-center font-black tracking-wide text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
          >
            Agendar Minha Vistoria
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Decorative guidelines helper */}
      <div className="w-full text-center mt-3">
        <p className="text-[10px] text-white/30 flex items-center justify-center gap-1.5">
          <HelpCircle size={10} />
          Clique em cada uma das fachadas acima para simular a restauração predial completa.
        </p>
      </div>

      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-250px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
}
