"use client";

export default function BuildingsBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* Container principal dos 3 prédios espelhados */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[80%] flex items-end justify-center gap-0 opacity-[0.12] lg:opacity-[0.18]">
        
        {/* Prédio Esquerdo */}
        <div className="relative flex-shrink-0" style={{ width: "22%", height: "75%" }}>
          <svg viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            {/* Corpo principal */}
            <rect x="20" y="40" width="160" height="460" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400" />
            {/* Janelas grid */}
            {Array.from({ length: 18 }).map((_, i) => (
              <g key={`lw-${i}`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <rect key={j} x={35 + j * 28} y={55 + i * 25} width="18" height="14" stroke="currentColor" strokeWidth="0.5" opacity="0.3" className="text-cyan-300" />
                ))}
              </g>
            ))}
            {/* Topo inclinado */}
            <path d="M20 40 L100 5 L180 40" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400" />
            {/* Antena */}
            <line x1="100" y1="5" x2="100" y2="-20" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.6" />
            <circle cx="100" cy="-22" r="3" stroke="currentColor" strokeWidth="0.8" className="text-yellow-400" opacity="0.8" />
          </svg>
          {/* Reflexo espelhado */}
          <div className="absolute bottom-0 left-0 w-full h-[45%] opacity-30" style={{ transform: "scaleY(-1)", transformOrigin: "bottom", filter: "blur(2px)" }}>
            <svg viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMin slice">
              <rect x="20" y="40" width="160" height="460" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.4" />
              {Array.from({ length: 8 }).map((_, i) => (
                <g key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <rect key={j} x={35 + j * 28} y={55 + i * 25} width="18" height="14" stroke="currentColor" strokeWidth="0.3" opacity="0.15" className="text-cyan-300" />
                  ))}
                </g>
              ))}
            </svg>
          </div>
          {/* Linha do chão */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>

        {/* Prédio Central (mais alto) */}
        <div className="relative flex-shrink-0 -mx-4 lg:-mx-8" style={{ width: "28%", height: "100%" }}>
          <svg viewBox="0 0 250 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            {/* Corpo principal */}
            <rect x="30" y="30" width="190" height="570" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400" />
            {/* Faixa central */}
            <rect x="30" y="30" width="190" height="6" fill="currentColor" className="text-otto-yellow" opacity="0.3" />
            {/* Janelas grid */}
            {Array.from({ length: 22 }).map((_, i) => (
              <g key={`cw-${i}`}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <rect key={j} x={42 + j * 30} y={50 + i * 25} width="20" height="15" stroke="currentColor" strokeWidth="0.5" opacity="0.25" className="text-cyan-300" />
                ))}
              </g>
            ))}
            {/* Antena/spire */}
            <line x1="125" y1="30" x2="125" y2="-15" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400" />
            <path d="M120 -15 L125 -35 L130 -15" stroke="currentColor" strokeWidth="1" className="text-yellow-400" opacity="0.8" />
            <circle cx="125" cy="-37" r="3" fill="currentColor" className="text-yellow-400" opacity="0.9" />
            {/* Entrada */}
            <rect x="90" y="555" width="70" height="45" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.4" />
            <line x1="125" y1="555" x2="125" y2="600" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400" opacity="0.3" />
          </svg>
          {/* Reflexo espelhado */}
          <div className="absolute bottom-0 left-0 w-full h-[40%] opacity-25" style={{ transform: "scaleY(-1)", transformOrigin: "bottom", filter: "blur(3px)" }}>
            <svg viewBox="0 0 250 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMin slice">
              <rect x="30" y="30" width="190" height="570" stroke="currentColor" strokeWidth="0.8" className="text-cyan-400" opacity="0.3" />
              {Array.from({ length: 10 }).map((_, i) => (
                <g key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <rect key={j} x={42 + j * 30} y={50 + i * 25} width="20" height="15" stroke="currentColor" strokeWidth="0.3" opacity="0.1" className="text-cyan-300" />
                  ))}
                </g>
              ))}
            </svg>
          </div>
          {/* Linha do chão */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        </div>

        {/* Prédio Direito */}
        <div className="relative flex-shrink-0" style={{ width: "22%", height: "80%" }}>
          <svg viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            {/* Corpo principal */}
            <rect x="20" y="50" width="160" height="450" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400" />
            {/* Faixas horizontais */}
            {[100, 180, 260, 340].map((y) => (
              <line key={y} x1="20" y1={y} x2="180" y2={y} stroke="currentColor" strokeWidth="0.8" opacity="0.2" className="text-cyan-400" />
            ))}
            {/* Janelas grid */}
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={`rw-${i}`}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <rect key={j} x={32 + j * 36} y={60 + i * 27} width="24" height="16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" className="text-cyan-300" />
                ))}
              </g>
            ))}
            {/* Topo escada */}
            <path d="M20 50 L50 30 L50 50" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.5" />
            <path d="M50 30 L80 15 L80 30" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.4" />
            <path d="M80 15 L120 10 L120 15" stroke="currentColor" strokeWidth="1" className="text-cyan-400" opacity="0.3" />
            <line x1="120" y1="10" x2="120" y2="-10" stroke="currentColor" strokeWidth="0.8" className="text-cyan-400" opacity="0.4" />
          </svg>
          {/* Reflexo espelhado */}
          <div className="absolute bottom-0 left-0 w-full h-[42%] opacity-28" style={{ transform: "scaleY(-1)", transformOrigin: "bottom", filter: "blur(2.5px)" }}>
            <svg viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMin slice">
              <rect x="20" y="50" width="160" height="450" stroke="currentColor" strokeWidth="0.8" className="text-cyan-400" opacity="0.35" />
              {Array.from({ length: 7 }).map((_, i) => (
                <g key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <rect key={j} x={32 + j * 36} y={60 + i * 27} width="24" height="16" stroke="currentColor" strokeWidth="0.3" opacity="0.12" className="text-cyan-300" />
                  ))}
                </g>
              ))}
            </svg>
          </div>
          {/* Linha do chão */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>
      </div>

      {/* Glow sutil na base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent blur-[1px]" />
    </div>
  );
}
