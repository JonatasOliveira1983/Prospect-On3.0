"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, Award, Briefcase, Play } from "lucide-react";
import Script from "next/script";

export default function HomeHero() {
  const [splineUrl, setSplineUrl] = useState<string>("https://prod.spline.design/p9DEvpgdmtwGsA57/scene.splinecode");

  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center bg-slate-950 overflow-hidden py-20 lg:py-28 border-b border-white/5">
      
      {/* Background Neon Halo Lights (Radial Gradients) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Deep blue overall overlay */}
        <div className="absolute inset-0 bg-[#020617]" />
        
        {/* Neon Cyan Glow behind the center-right (for the 3D element) */}
        <div className="absolute top-[20%] right-[10%] lg:right-[15%] w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen" />
        
        {/* Neon Gold/Yellow Glow behind the center-right */}
        <div className="absolute bottom-[20%] right-[5%] lg:right-[10%] w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] rounded-full bg-otto-yellow/5 blur-[100px] mix-blend-screen" />
        
        {/* Subtle grid lines for high-tech architectural drafting feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Spline 3D Scene rendered using official high-performance Web Component */}
      <div className="absolute top-[12%] lg:top-[5%] right-0 w-full lg:w-[50%] h-[400px] lg:h-[650px] z-0 overflow-hidden opacity-90 pointer-events-auto">
        <div className="w-full h-full relative">
          <Script 
            type="module" 
            src="https://unpkg.com/@splinetool/viewer@1.9.2/build/spline-viewer.js"
            strategy="afterInteractive"
          />
          {/* @ts-ignore */}
          <spline-viewer 
            url="https://prod.spline.design/p9DEvpgdmtwGsA57/scene.splinecode" 
            className="w-full h-full scale-[1.05]"
          />
          {/* Elegante máscara de fundo para cobrir a logo/marca d'água do Spline na versão gratuita */}
          <div className="absolute bottom-0 right-0 w-[140px] h-[45px] bg-[#020617] z-20 pointer-events-none select-none" />
        </div>
      </div>

      {/* Elegante blueprint de prédios no fundo do texto (Lado Esquerdo) */}
      <div className="absolute bottom-0 left-0 w-full lg:w-[55%] h-[60%] lg:h-[75%] z-0 pointer-events-none opacity-45 lg:opacity-60 mix-blend-screen select-none overflow-hidden">
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMinYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-cyan-400/25">
          {/* Building 1 (Modernist Slanted Top) */}
          <path d="M50 600V200L180 120V600" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="80" y1="240" x2="150" y2="240" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="80" y1="300" x2="150" y2="300" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="80" y1="360" x2="150" y2="360" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="80" y1="420" x2="150" y2="420" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="80" y1="480" x2="150" y2="480" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="80" y1="540" x2="150" y2="540" stroke="currentColor" strokeWidth="1" opacity="0.3" />

          {/* Building 2 (Tall Central Spire Tower) */}
          <path d="M220 600V100H230V60H235V100H245V600" stroke="currentColor" strokeWidth="1.5" />
          <line x1="220" y1="150" x2="245" y2="150" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="210" x2="245" y2="210" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="270" x2="245" y2="270" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="330" x2="245" y2="330" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="390" x2="245" y2="390" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="450" x2="245" y2="450" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="510" x2="245" y2="510" stroke="currentColor" strokeWidth="1" opacity="0.4" />

          {/* Building 3 (Corporate Box Grid) */}
          <rect x="280" y="240" width="150" height="360" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="315" y1="240" x2="315" y2="600" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="350" y1="240" x2="350" y2="600" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="385" y1="240" x2="385" y2="600" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="280" y1="290" x2="430" y2="290" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="280" y1="340" x2="430" y2="340" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="280" y1="390" x2="430" y2="390" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="280" y1="440" x2="430" y2="440" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="280" y1="490" x2="430" y2="490" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="280" y1="540" x2="430" y2="540" stroke="currentColor" strokeWidth="1" opacity="0.2" />

          {/* Building 4 (Sleek Diagonal Glass Facade) */}
          <path d="M460 600V300L550 380V600" stroke="currentColor" strokeWidth="1.5" />
          <line x1="460" y1="350" x2="550" y2="430" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="460" y1="400" x2="550" y2="480" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="460" y1="450" x2="550" y2="530" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <line x1="460" y1="500" x2="550" y2="580" stroke="currentColor" strokeWidth="1" opacity="0.3" />

          {/* Building 5 (Small Silhouette Block) */}
          <rect x="580" y="400" width="90" height="200" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <line x1="580" y1="440" x2="670" y2="440" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="580" y1="480" x2="670" y2="480" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="580" y1="520" x2="670" y2="520" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <line x1="580" y1="560" x2="670" y2="560" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-8 w-full flex flex-col justify-between min-h-[70vh]">
        
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-4 mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10 text-white/80 font-bold text-[10px] lg:text-xs tracking-widest uppercase backdrop-blur-sm">
            <Award size={12} className="text-otto-yellow animate-pulse" />
            Líder Nacional em Fachadas
          </div>
          <div className="text-white/40 text-[10px] lg:text-xs font-bold tracking-widest uppercase border-l border-white/10 pl-4">
            Engenharia & Solidez Predial
          </div>
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative">
          
          {/* LEFT COLUMN: Monumental Typography & Copy */}
          <div className="lg:col-span-8 flex flex-col justify-center text-left relative z-10 pointer-events-auto">
            

            
            {/* Monumental Overlapping Text */}
            <div className="relative mb-6 lg:mb-8 select-none">
              <span className="block text-[10px] lg:text-xs font-black text-otto-yellow uppercase tracking-[0.25em] mb-2">
                OTTO PINTURAS DE GRANDE PORTE
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-[7.5rem] xl:text-[9.5rem] font-black text-white leading-[0.9] tracking-tighter uppercase relative">
                engenharia
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-otto-yellow">
                  predial
                </span>
              </h1>
            </div>

            <p className="text-sm lg:text-base xl:text-lg text-slate-300 max-w-lg font-light leading-relaxed mb-10 lg:mb-14">
              Trazemos precisão técnica e acabamento premium para condomínios, indústrias e shoppings. O patrimônio do seu condomínio valorizado e assegurado com a máxima solidez de mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <a 
                href="#orcamento"
                className="group px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
              >
                Garantir Minha Vistoria
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a 
                href="#simulador"
                className="group px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-black text-sm border border-white/10 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Play size={14} className="fill-white" />
                Ver Simulador
              </a>
            </div>

          </div>



        </div>

        {/* BOTTOM SECTION: Floating Telemetry/Stats Pill Cards */}
        <div className="mt-16 lg:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 relative z-30 pointer-events-auto">
          
          {/* Stat card 1 */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl hover:border-white/10 transition-all group">
            <div className="p-3 rounded-xl bg-otto-yellow/10 border border-otto-yellow/20 text-otto-yellow shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black text-white leading-none">+30 Anos</h3>
              <p className="text-[10px] lg:text-xs text-slate-400 mt-1 font-light">
                Presença sólida de mercado nacional
              </p>
            </div>
          </div>

          {/* Stat card 2 */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl hover:border-white/10 transition-all group">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black text-white leading-none">100% ART</h3>
              <p className="text-[10px] lg:text-xs text-slate-400 mt-1 font-light">
                Segurança jurídica e engenharia garantidas
              </p>
            </div>
          </div>

          {/* Stat card 3 */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-2xl hover:border-white/10 transition-all group">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black text-white leading-none">+500 Fachadas</h3>
              <p className="text-[10px] lg:text-xs text-slate-400 mt-1 font-light">
                Obras de grande porte revitalizadas
              </p>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
