import { Target, Eye, ShieldCheck, Zap } from "lucide-react";

export default function HomePillars() {
  const pillars = [
    {
      title: "Missão",
      description: "Entregar soluções de pintura com excelência técnica, superando expectativas em prazo, qualidade e segurança para grandes estruturas.",
      icon: <Target size={28} className="text-otto-blue" />
    },
    {
      title: "Visão",
      description: "Ser a referência nacional em pinturas de grande porte, reconhecida pela inovação tecnológica e confiabilidade.",
      icon: <Eye size={28} className="text-otto-blue" />
    },
    {
      title: "Valores",
      description: "Segurança em primeiro lugar, transparência, pontualidade e respeito rigoroso às normas técnicas e ambientais.",
      icon: <ShieldCheck size={28} className="text-otto-blue" />
    },
    {
      title: "Compromisso",
      description: "Equipe especializada em trabalho em altura com NRs rigorosamente em dia, garantindo zero acidentes.",
      icon: <Zap size={28} className="text-otto-blue" />
    }
  ];

  return (
    <section className="py-24 bg-white text-otto-blue">
      <div className="container mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-black tracking-tight mb-6">Nossos Pilares</h2>
          <p className="text-xl text-slate-500 font-light">
            A base sólida que sustenta cada projeto executado pela Otto Pinturas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-otto-blue rounded-[2rem] p-8 border-b-4 border-otto-yellow shadow-2xl hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-otto-yellow rounded-xl flex items-center justify-center mb-6 shadow-lg">
                {pillar.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{pillar.title}</h3>
              <p className="text-slate-300 leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
