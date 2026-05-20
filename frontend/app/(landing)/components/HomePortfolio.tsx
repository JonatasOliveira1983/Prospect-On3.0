"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, X, ArrowUpRight, Scale, MapPin } from "lucide-react";

interface Project {
  id: string;
  img: string;
  client: string;
  location: string;
  description: string;
  size: string;
  category: "condo" | "commercial" | "industrial";
}

export default function HomePortfolio() {
  const [activeCategory, setActiveCategory] = useState<"all" | "condo" | "commercial" | "industrial">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // Reseta a quantidade visível ao alterar categoria ou buscar
  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory, searchQuery]);

  const projects: Project[] = useMemo(() => [
    {
      id: "Img001",
      img: "/AquivosOtto/Portifólio Completo/Img001.png",
      client: "Aliansce Sonae",
      location: "Parque Dom Pedro Shopping - Campinas / SP",
      description: "Restauração e pintura completa das fachadas do maior shopping de Campinas.",
      size: "36.000 m²",
      category: "commercial"
    },
    {
      id: "Img002",
      img: "/AquivosOtto/Portifólio Completo/Img002.png",
      client: "Shopping Granja Vianna",
      location: "Cotia / SP",
      description: "Revitalização e retrofit técnico de fachadas e marquises comerciais.",
      size: "25.000 m²",
      category: "commercial"
    },
    {
      id: "Img003",
      img: "/AquivosOtto/Portifólio Completo/Img003.jpg",
      client: "Port Corporate Tower (Bradesco Seguros)",
      location: "Rio de Janeiro / RJ",
      description: "Pintura técnica total externa e interna da icônica torre corporativa carioca.",
      size: "80.000 m²",
      category: "commercial"
    },
    {
      id: "Img004",
      img: "/AquivosOtto/Portifólio Completo/Img004.jpg",
      client: "Condomínio Edifício Campo de Siena",
      location: "Chácara Klabin - São Paulo / SP",
      description: "Parceria de longo prazo (>10 anos) envolvendo 2 repinturas completas e retrofit predial.",
      size: "10.000 m²",
      category: "condo"
    },
    {
      id: "Img005",
      img: "/AquivosOtto/Portifólio Completo/Img005.jpg",
      client: "Lico Residence",
      location: "Guarujá / SP",
      description: "Pintura de altíssimo padrão com acabamento premium e proteção contra maresia.",
      size: "Sob Consulta",
      category: "condo"
    },
    {
      id: "Img006",
      img: "/AquivosOtto/Portifólio Completo/img006.jpg",
      client: "Lico Office",
      location: "Guarujá / SP",
      description: "Retrofit e pintura de fachada de centro corporativo empresarial.",
      size: "Sob Consulta",
      category: "commercial"
    },
    {
      id: "Img007",
      img: "/AquivosOtto/Portifólio Completo/img007.jpg",
      client: "Hospital Maternidade Paulo Sacramento",
      location: "Jundiaí / SP",
      description: "Retrofit completo de fachada utilizando revestimentos de alta assepsia e durabilidade.",
      size: "35.000 m²",
      category: "commercial"
    },
    {
      id: "Img008",
      img: "/AquivosOtto/Portifólio Completo/img008.jpg",
      client: "Continental",
      location: "Ponta Grossa / PR",
      description: "Tratamento de fachada industrial e aplicação de tintas elastoméricas de alta durabilidade.",
      size: "35.000 m²",
      category: "industrial"
    },
    {
      id: "Img009",
      img: "/AquivosOtto/Portifólio Completo/Img009.png",
      client: "Condomínio Villagio Di Firenze",
      location: "Jundiaí / SP",
      description: "Pintura total externa de condomínio fechado residencial com padrão Otto.",
      size: "17.000 m²",
      category: "condo"
    },
    {
      id: "Img010",
      img: "/AquivosOtto/Portifólio Completo/img010.jpg",
      client: "Condomínio Edifício Parque Imperial",
      location: "São Paulo / SP",
      description: "Lavagem técnica especializada, restauração predial e reposição de pastilhas de fachada.",
      size: "23.000 m²",
      category: "condo"
    },
    {
      id: "Img011",
      img: "/AquivosOtto/Portifólio Completo/Img011.png",
      client: "Veduta Verde (Carfam Empreendimentos)",
      location: "Jundiaí / SP",
      description: "Revitalização e pintura técnica de 31 residências de altíssimo padrão.",
      size: "45.000 m²",
      category: "condo"
    },
    {
      id: "Img012",
      img: "/AquivosOtto/Portifólio Completo/Img012.png",
      client: "Veduta Rossa (Carfam Empreendimentos)",
      location: "Jundiaí / SP",
      description: "Pintura de condomínio fechado de luxo envolvendo 37 residências exclusivas.",
      size: "60.000 m²",
      category: "condo"
    },
    {
      id: "Img013",
      img: "/AquivosOtto/Portifólio Completo/Img013.png",
      client: "Veduta Blu (Carfam Empreendimentos)",
      location: "Jundiaí / SP",
      description: "Revitalização completa de condomínio de alto padrão envolvendo 70 residências.",
      size: "85.000 m²",
      category: "condo"
    },
    {
      id: "Img014",
      img: "/AquivosOtto/Portifólio Completo/Img014.png",
      client: "PK Center Empreendimentos (RALC Construções)",
      location: "Uberlândia / MG",
      description: "Revestimento de alto rendimento para Galpão Logístico de grande porte.",
      size: "90.000 m²",
      category: "industrial"
    },
    {
      id: "Img015",
      img: "/AquivosOtto/Portifólio Completo/Img015.png",
      client: "Schoot Brasil Ltda (RALC Construções)",
      location: "Itupeva / SP",
      description: "Tratamento técnico anticorrosivo e pintura em área industrial pesada.",
      size: "30.000 m²",
      category: "industrial"
    },
    {
      id: "Img016",
      img: "/AquivosOtto/Portifólio Completo/Img016.png",
      client: "Seminário Igreja São Geraldo",
      location: "Sorocaba / SP",
      description: "Pintura e restauração de patrimônio religioso histórico preservando características originais.",
      size: "4.000 m²",
      category: "commercial"
    },
    {
      id: "Img017",
      img: "/AquivosOtto/Portifólio Completo/Img017.png",
      client: "Sutran Indústria e Comércio Ltda",
      location: "Itupeva / SP",
      description: "Pintura de fachadas e demarcação técnica de piso industrial de alta resistência.",
      size: "10.000 m²",
      category: "industrial"
    },
    {
      id: "Img018",
      img: "/AquivosOtto/Portifólio Completo/Img018.jpg",
      client: "Husky do Brasil (RALC Construções)",
      location: "Jundiaí / SP",
      description: "Pintura externa e tratamento de junta em Galpão de alta tecnologia.",
      size: "2.000 m²",
      category: "industrial"
    },
    {
      id: "Img019",
      img: "/AquivosOtto/Portifólio Completo/Img019.jpg",
      client: "Prologis CCP8 Arujá (RALC Construções)",
      location: "Arujá / SP",
      description: "Pintura elastomérica de fachada e demarcação viária técnica em Galpão Logístico.",
      size: "59.000 m²",
      category: "industrial"
    },
    {
      id: "Img020",
      img: "/AquivosOtto/Portifólio Completo/Img020.jpg",
      client: "GR Properties Rodoanel (RALC)",
      location: "São Paulo / SP",
      description: "Execução rápida e segura de pintura em megagalpão no trecho do Rodoanel.",
      size: "35.000 m²",
      category: "industrial"
    },
    {
      id: "Img021",
      img: "/AquivosOtto/Portifólio Completo/Img021.jpg",
      client: "Gráfica Editora Aquarela S.A. (RALC)",
      location: "Barueri / SP",
      description: "Pintura e restauração de fachadas industriais em polo gráfico logístico.",
      size: "20.000 m²",
      category: "industrial"
    },
    {
      id: "Img022",
      img: "/AquivosOtto/Portifólio Completo/Img022.jpg",
      client: "Crowncork (RALC Construções)",
      location: "Cabreúva / SP",
      description: "Tratamento químico contra corrosão e pintura industrial técnica.",
      size: "28.000 m²",
      category: "industrial"
    },
    {
      id: "Img023",
      img: "/AquivosOtto/Portifólio Completo/Img023.jpg",
      client: "GR Properties Campinas (RALC)",
      location: "Campinas / SP",
      description: "Pintura técnica externa de Centro Logístico de grande porte.",
      size: "38.000 m²",
      category: "industrial"
    },
    {
      id: "Img024",
      img: "/AquivosOtto/Portifólio Completo/Img024.jpg",
      client: "Aurora Business Park 2 (RALC)",
      location: "Itu / SP",
      description: "Pintura de fachadas e revestimentos de alta durabilidade em complexo corporativo.",
      size: "56.000 m²",
      category: "industrial"
    },
    {
      id: "Img025",
      img: "/AquivosOtto/Portifólio Completo/Img025.jpg",
      client: "GR Properties Jundiaí (RALC)",
      location: "Jundiaí / SP",
      description: "Pintura de estruturas metálicas e paredes de concreto de galpão modular.",
      size: "65.000 m²",
      category: "industrial"
    },
    {
      id: "Img026",
      img: "/AquivosOtto/Portifólio Completo/Img026.jpg",
      client: "GR Properties Louveira (RALC)",
      location: "Louveira / SP",
      description: "Pintura técnica de Galpão Logístico seguindo rígidos protocolos de segurança.",
      size: "60.000 m²",
      category: "industrial"
    },
    {
      id: "Img027",
      img: "/AquivosOtto/Portifólio Completo/Img027.jpg",
      client: "Crown Embalagens da Amazônia",
      location: "Ponta Grossa / PR",
      description: "Revestimentos térmicos e pinturas anticorrosivas em parque fabril de metalurgia.",
      size: "28.000 m²",
      category: "industrial"
    },
    {
      id: "Img028",
      img: "/AquivosOtto/Portifólio Completo/Img028.jpg",
      client: "ColorMatrix América do Sul Ltda",
      location: "Louveira / SP",
      description: "Tratamento de piso epóxi e pintura interna/externa de galpão de aditivos.",
      size: "5.000 m²",
      category: "industrial"
    }
  ], []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = activeCategory === "all" || project.category === activeCategory;
      const matchesSearch = 
        project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, projects]);

  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  return (
    <section className="py-24 lg:py-32 bg-slate-950 text-white relative border-b border-white/5" id="portfolio">
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <span className="text-xs font-black text-otto-yellow uppercase tracking-[0.2em] block mb-3">
            Portfolio de Autoridade
          </span>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-none uppercase">
            grandes <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-otto-yellow">obras</span> realizadas
          </h2>
          <p className="text-sm lg:text-base text-slate-300 font-light mt-4 leading-relaxed">
            Navegue pelos nossos casos de sucesso reais. Mais de 1 milhão de metros quadrados revitalizados em condomínios de luxo, indústrias e shoppings.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-12 pb-6 border-b border-white/5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
                activeCategory === "all"
                  ? "bg-otto-yellow text-otto-blue shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Ver Todas
            </button>
            <button
              onClick={() => setActiveCategory("condo")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
                activeCategory === "condo"
                  ? "bg-otto-yellow text-otto-blue shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Condomínios
            </button>
            <button
              onClick={() => setActiveCategory("commercial")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
                activeCategory === "commercial"
                  ? "bg-otto-yellow text-otto-blue shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Shoppings & Corporativos
            </button>
            <button
              onClick={() => setActiveCategory("industrial")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
                activeCategory === "industrial"
                  ? "bg-otto-yellow text-otto-blue shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              Galpões & Indústrias
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por cliente ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-900 border border-white/5 text-xs text-white focus:outline-none focus:border-otto-yellow/50 transition-colors placeholder:text-slate-500 font-light"
            />
          </div>
        </div>

        {/* Dynamic Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-otto-yellow/20 hover:bg-slate-900/60 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
            >
              {/* Aspect Ratio image container */}
              <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
                <Image
                  src={project.img}
                  alt={project.client}
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Badge for Size */}
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-black tracking-wider uppercase text-otto-yellow flex items-center gap-1 shadow-2xl">
                  <Scale size={10} />
                  {project.size}
                </div>
              </div>

              {/* Text content block */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-otto-yellow transition-colors line-clamp-1 flex items-center justify-between gap-2">
                    {project.client}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-otto-yellow shrink-0" />
                  </h3>
                  
                  {/* Location badge */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-light">
                    <MapPin size={10} className="text-otto-yellow shrink-0" />
                    <span className="line-clamp-1">{project.location}</span>
                  </div>

                  <p className="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-2 font-light">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-bold tracking-widest uppercase text-otto-yellow">
                  <span>Visualizar Detalhes</span>
                  <span className="text-white/30">{project.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty search state */}
        {filteredProjects.length === 0 && (
          <div className="w-full text-center py-20 bg-slate-900/10 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-8">
            <SlidersHorizontal size={36} className="text-slate-500 mb-4 animate-pulse" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Nenhum projeto encontrado</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-light">
              Tente redefinir seu termo de busca ou navegar por outras abas de especialidade.
            </p>
          </div>
        )}

        {/* Carregar Mais Button */}
        {filteredProjects.length > visibleCount && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="group relative px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] inline-flex items-center gap-2"
            >
              Carregar Mais Casos
              <span className="text-otto-yellow transition-transform group-hover:translate-y-0.5">↓</span>
            </button>
          </div>
        )}

      </div>

      {/* Glassmorphic Modal Lightbox for Project Details */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh] md:max-h-[600px] pointer-events-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-white hover:text-otto-yellow transition-all active:scale-95 shadow-2xl"
              title="Fechar Detalhes"
            >
              <X size={18} />
            </button>

            {/* Left Column: Huge Cover Image */}
            <div className="relative w-full md:w-1/2 h-48 sm:h-64 md:h-full bg-slate-950 shrink-0">
              <Image
                src={selectedProject.img}
                alt={selectedProject.client}
                fill
                quality={85}
                className="object-cover object-center"
              />
            </div>

            {/* Right Column: Detailed copy info */}
            <div className="p-8 lg:p-10 flex flex-col justify-between flex-1 overflow-y-auto">
              <div>
                <span className="text-[10px] font-black text-otto-yellow uppercase tracking-[0.25em] block mb-2">
                  Caso Real de Sucesso
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                  {selectedProject.client}
                </h3>
                
                {/* Specific metrics badge in modal */}
                <div className="flex items-center gap-6 mt-6 pb-6 border-b border-white/5">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Área Coberta</span>
                    <span className="text-xl font-black text-otto-yellow block mt-0.5">{selectedProject.size}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Código Obra</span>
                    <span className="text-xl font-black text-white block mt-0.5">{selectedProject.id}</span>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Endereço da Obra</span>
                    <p className="text-xs text-white/95 mt-1 leading-relaxed font-light flex items-center gap-1.5">
                      <MapPin size={12} className="text-otto-yellow shrink-0" />
                      {selectedProject.location}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Descrição do Escopo</span>
                    <p className="text-xs lg:text-sm text-slate-300 mt-1 leading-relaxed font-light">
                      {selectedProject.description}
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                <a
                  href="#orcamento"
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-3 rounded-full bg-otto-yellow hover:bg-otto-yellow/90 text-otto-blue font-black text-xs text-center transition-all duration-300"
                >
                  Solicitar Vistoria Grátis
                </a>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-black text-xs border border-white/10 text-center transition-all"
                >
                  Fechar Visualização
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
