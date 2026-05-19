"use client";

import { Building2, Home, Plane, Factory, ArrowUpRight } from "lucide-react";

export default function HomeServices() {
  const services = [
    {
      title: "Pintura de Condomínios",
      description: "Profissionalismo andar por andar. Valorize o patrimônio dos moradores com cronogramas inteligentes, mapeamento de patologias e execução limpa.",
      url: "https://ottopinturas.com.br/pintura-de-condominios/",
      icon: <Building2 size={28} className="text-otto-blue" />
    },
    {
      title: "Pintura de Fachadas",
      description: "Mais valor para seu negócio. Retrofit completo, impermeabilização contra infiltrações severas e acabamento de alto padrão para torres comerciais.",
      url: "https://ottopinturas.com.br/pintura-de-fachadas/",
      icon: <Home size={28} className="text-otto-blue" />
    },
    {
      title: "Galpões e Hangares",
      description: "Competência gigante para todos os tamanhos. Maquinário e equipe de alta performance preparados para cobrir áreas logísticas massivas.",
      url: "https://ottopinturas.com.br/pintura-de-galpoes-e-hangares/",
      icon: <Plane size={28} className="text-otto-blue" />
    },
    {
      title: "Pinturas Industriais",
      description: "Revestimentos técnicos de alta severidade. Tintas Epóxi, Poliuretano e proteção intumescente anticorrosiva contra fogo e corrosão.",
      url: "https://ottopinturas.com.br/pinturas-industriais/",
      icon: <Factory size={28} className="text-otto-blue" />
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-slate-950 text-white relative border-b border-white/5">
      
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-1/2 left-0 w-1/4 h-full bg-gradient-to-tr from-otto-yellow/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 lg:mb-24 gap-8">
          <div className="max-w-3xl">
            <span className="text-xs font-black text-otto-yellow uppercase tracking-[0.2em] block mb-3">
              Especialidades Técnicas
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-none uppercase">
              nossas <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-otto-yellow">soluções</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-300 font-light mt-4 max-w-xl leading-relaxed">
              Estruturas complexas que exigem planejamento de engenharia minucioso, equipe certificada e tecnologia avançada de revestimento.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <a 
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              key={index} 
              className="group relative rounded-[2rem] p-8 lg:p-10 bg-slate-900/40 border border-white/5 backdrop-blur-md hover:border-otto-yellow/20 hover:bg-slate-900/60 transition-all duration-300 shadow-2xl flex flex-col sm:flex-row gap-6 lg:gap-8 items-start cursor-pointer hover:-translate-y-1.5"
            >
              {/* Outer glow background on hover */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-otto-yellow/0 to-otto-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Icon Container */}
              <div className="w-16 h-16 shrink-0 bg-otto-yellow rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-transform shadow-lg shadow-otto-yellow/10">
                {service.icon}
              </div>
              
              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-white mb-3 tracking-tight group-hover:text-otto-yellow transition-colors flex items-center gap-2">
                    {service.title}
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-otto-yellow" />
                  </h3>
                  <p className="text-slate-400 text-xs lg:text-sm leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
                
                {/* Outbound Link Indicator */}
                <div className="mt-4 text-[10px] font-bold text-otto-yellow uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                  Ver Ficha Técnica Oficial
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
