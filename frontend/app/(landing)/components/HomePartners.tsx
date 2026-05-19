"use client";

import Image from "next/image";
import { Handshake, ShieldCheck } from "lucide-react";

export default function HomePartners() {
  const partners = [
    "/AquivosOtto/Parceiros/Par001.png",
    "/AquivosOtto/Parceiros/Par002.png",
    "/AquivosOtto/Parceiros/Par003.png",
    "/AquivosOtto/Parceiros/Par004.png",
    "/AquivosOtto/Parceiros/Par005.png",
    "/AquivosOtto/Parceiros/Par006.png"
  ];

  const clients = [
    { src: "/AquivosOtto/Logos Clientes/FRASSON-300x218.jpg", name: "Frasson" },
    { src: "/AquivosOtto/Logos Clientes/PLANENGER-OTTO-PINTURAS-300x220.jpg", name: "Planenger" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-1-300x219.jpg", name: "Parceiro 1" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-2-300x219.jpg", name: "Parceiro 2" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-3-300x219.jpg", name: "Parceiro 3" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-4-300x219.jpg", name: "Parceiro 4" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-5-300x219.jpg", name: "Parceiro 5" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-6-300x219.jpg", name: "Parceiro 6" },
    { src: "/AquivosOtto/Logos Clientes/Parceiro-Otto-Pinturas-7-300x219.jpg", name: "Parceiro 7" },
    { src: "/AquivosOtto/Logos Clientes/atoba-otto-pinturas.png", name: "Atobá" },
    { src: "/AquivosOtto/Logos Clientes/cliente-otto-pinturas-passarelli.png", name: "Passarelli" },
    { src: "/AquivosOtto/Logos Clientes/matec-Engenharia-otto-Pinturas-300x220.jpg", name: "Matec" },
    { src: "/AquivosOtto/Logos Clientes/rs-construcao-otto-pinturas.png", name: "RS Construção" }
  ];

  // Double arrays to ensure smooth seamless looping transition in CSS marquee
  const loopedPartners = [...partners, ...partners, ...partners];
  const loopedClients = [...clients, ...clients, ...clients];

  return (
    <section className="py-20 lg:py-28 bg-slate-950 text-white relative overflow-hidden border-b border-white/5">
      
      {/* Keyframe Marquee Animation CSS Injection */}
      <style>{`
        @keyframes scrollRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-right {
          animation: scrollRight 30s linear infinite;
        }
        .animate-scroll-left {
          animation: scrollLeft 35s linear infinite;
        }
        .marquee-container:hover .marquee-inner {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black text-otto-yellow uppercase tracking-[0.2em] block mb-3">
            Garantia de Parceria e Confiança
          </span>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-none uppercase">
            parceiros & <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-otto-yellow">clientes</span> corporativos
          </h2>
          <p className="text-xs lg:text-sm text-slate-400 mt-4 leading-relaxed font-light">
            Trabalhamos ao lado das maiores construtoras, administradoras e indústrias para garantir durabilidade, segurança técnica e solidez predial.
          </p>
        </div>
      </div>

      {/* Marquee Row 1: Nossos Parceiros (Scroll Right) */}
      <div className="w-full relative mb-12 marquee-container select-none pointer-events-auto">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        
        <div className="flex w-max marquee-inner animate-scroll-right gap-6 px-4">
          {loopedPartners.map((src, index) => (
            <div 
              key={`partner-${index}`} 
              className="w-48 h-24 shrink-0 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 hover:border-otto-yellow/30 hover:bg-slate-900/70 transition-all duration-300 group"
            >
              <div className="relative w-full h-full grayscale opacity-45 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                <Image
                  src={src}
                  alt={`Parceiro Otto`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2: Grandes Clientes Atendidos (Scroll Left) */}
      <div className="w-full relative marquee-container select-none pointer-events-auto">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        
        <div className="flex w-max marquee-inner animate-scroll-left gap-6 px-4">
          {loopedClients.map((client, index) => (
            <div 
              key={`client-${index}`} 
              className="w-48 h-24 shrink-0 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 hover:border-otto-yellow/30 hover:bg-slate-900/70 transition-all duration-300 group"
            >
              <div className="relative w-full h-full grayscale opacity-45 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                <Image
                  src={client.src}
                  alt={client.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authority Stamp */}
      <div className="mt-16 flex flex-wrap justify-center items-center gap-6 lg:gap-12 px-6">
        <div className="flex items-center gap-2.5 text-slate-400 text-xs font-light">
          <ShieldCheck className="text-otto-yellow" size={16} />
          <span>Homologados nas Maiores Construtoras</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-400 text-xs font-light">
          <Handshake className="text-otto-yellow" size={16} />
          <span>Garantia de Entrega no Prazo Assegurada</span>
        </div>
      </div>

    </section>
  );
}
