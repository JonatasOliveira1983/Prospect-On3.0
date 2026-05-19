"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  Home, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Lock,
  MessageSquare
} from "lucide-react";

export default function ResidentLanding() {
  const params = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLead() {
      if (!params || !params.slug) return;
      try {
        const res = await fetch(`/api/leads/by-slug/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setLead(data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do condomínio:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params && params.slug) fetchLead();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-danger mb-4" size={48} />
          <h1 className="text-2xl font-bold">Condomínio não localizado</h1>
          <p className="text-muted mt-2">O link pode estar expirado ou incorreto.</p>
        </div>
      </div>
    );
  }

  const buildingAge = lead.building_age || 15;
  const appreciationPotential = lead.patrimonial_intel?.appreciation_potential_pct || 15;
  const unitValue = lead.valuation?.unit_value || 750000;
  const gainPerUnit = unitValue * (appreciationPotential / 100);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
              <TrendingUp size={16} />
              RELATÓRIO DE VALORIZAÇÃO PATRIMONIAL
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              O seu apartamento no <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                {lead.name}
              </span> está sendo valorizado?
            </h1>
            
            <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
              A estética e manutenção da fachada são responsáveis por até 25% do valor de mercado do seu imóvel. Descubra como a revitalização ética impacta seu bolso.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/80 text-black font-bold px-8 py-4 rounded-2xl transition-all neon-blue flex items-center justify-center gap-2 group">
                Quero Valorizar Meu Imóvel
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="glass hover:bg-white/5 text-white font-bold px-8 py-4 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2">
                Ver Laudo Técnico
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Home size={80} />
              </div>
              <p className="text-muted font-bold text-sm mb-2">IDADE DO PRÉDIO</p>
              <h3 className="text-4xl font-bold text-white">{buildingAge} anos</h3>
              <p className="text-muted text-sm mt-4">Janela crítica para revitalização estética e estrutural.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-3xl border border-primary/30 relative overflow-hidden bg-primary/5"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={80} />
              </div>
              <p className="text-primary font-bold text-sm mb-2">POTENCIAL DE GANHO</p>
              <h3 className="text-4xl font-bold text-white">+{appreciationPotential}%</h3>
              <p className="text-muted text-sm mt-4">Valorização estimada por unidade após nova pintura.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-3xl border border-accent/30 relative overflow-hidden bg-accent/5"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-accent">
                <Wallet size={80} />
              </div>
              <p className="text-accent font-bold text-sm mb-2">LUCRO POR MORADOR</p>
              <h3 className="text-4xl font-bold text-white">R$ {(gainPerUnit/1000).toFixed(0)}k</h3>
              <p className="text-muted text-sm mt-4">Valor real injetado no seu patrimônio pessoal.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Pain & ROI Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-6">Por que investir na fachada agora?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Depreciação Acelerada</h4>
                    <p className="text-muted">Prédios com fachadas desgastadas perdem, em média, 1.5% de valor de mercado ao ano em comparação aos vizinhos reformados.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Retorno sobre o Investimento (ROI)</h4>
                    <p className="text-muted">A cada R$ 1,00 investido na pintura da fachada, o patrimônio do morador valoriza cerca de R$ 4,00.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Proteção Estrutural</h4>
                    <p className="text-muted">A pintura não é apenas estética; é a pele que protege o concreto contra infiltrações e corrosão de ferragens.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="glass-card p-10 rounded-[40px] border border-white/10 relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-full blur-[60px] opacity-20" />
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                  <Calculator size={24} className="text-primary" />
                  Simulador de Valorização
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-muted">Valor Atual do Apartamento (Est.)</span>
                      <span className="text-white font-bold">R$ {unitValue.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20 w-[60%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-primary font-bold">Valor Pós-Reforma Otto Pinturas</span>
                      <span className="text-primary font-extrabold">R$ {(unitValue + gainPerUnit).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-4 bg-primary/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '85%' }}
                        className="h-full bg-primary" 
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-muted text-xs uppercase tracking-widest font-bold">Lucro Patrimonial Líquido</p>
                      <p className="text-4xl font-black text-accent">R$ {(gainPerUnit).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted text-xs uppercase tracking-widest font-bold">ROI</p>
                      <p className="text-2xl font-bold text-white">4.2x</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics & Transparency */}
      <section className="py-24 bg-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <Lock className="mx-auto text-primary mb-6" size={48} />
            <h2 className="text-4xl font-bold text-white mb-6">Compromisso Ético e Transparência Radical</h2>
            <p className="text-xl text-muted mb-12">
              Na Otto Pinturas, o nosso cliente é você, o condômino. Não compactuamos com taxas ocultas, intermediários ou comissões irregulares.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {[
                "Orçamento 100% Itemizado e Aberto",
                "Conformidade Total com NR18 e NR35",
                "Seguro de Obra de R$ 1 Milhão incluso",
                "Garantia Real de 5 Anos em Contrato",
                "Equipe Própria Certificada",
                "Relatórios de Progresso via App"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 glass p-4 rounded-2xl border border-white/5">
                  <CheckCircle2 className="text-accent" size={20} />
                  <span className="text-white font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Short */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Quem já confiou na Otto Pinturas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Placeholders for partner/client logos */}
            <div className="h-20 glass rounded-xl flex items-center justify-center font-bold text-muted">Veduta</div>
            <div className="h-20 glass rounded-xl flex items-center justify-center font-bold text-muted">Golden Park</div>
            <div className="h-20 glass rounded-xl flex items-center justify-center font-bold text-muted">Solaris</div>
            <div className="h-20 glass rounded-xl flex items-center justify-center font-bold text-muted">Chácara Primavera</div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-accent/10 blur-[120px] rounded-full opacity-50" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="glass p-16 rounded-[50px] border border-white/10 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Leve essa valorização para sua próxima assembleia</h2>
            <p className="text-muted text-lg mb-10">
              O síndico e a administradora têm o dever de zelar pelo seu patrimônio. <br/>
              Solicite uma vistoria técnica gratuita e receba um laudo completo para apresentar.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-accent hover:bg-accent/80 text-black font-bold px-10 py-5 rounded-2xl transition-all neon-emerald flex items-center justify-center gap-2">
                <MessageSquare size={20} />
                Falar com Consultor no WhatsApp
              </button>
            </div>
            <p className="text-muted text-xs mt-8">
              Atendimento exclusivo para moradores do {lead.name}.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white font-bold text-xl">Otto Pinturas</div>
          <div className="text-muted text-sm">© 2026 - Especialista em Pinturas de Grande Porte</div>
          <div className="flex gap-6 text-muted text-sm">
            <a href="#" className="hover:text-primary">Termos</a>
            <a href="#" className="hover:text-primary">Privacidade</a>
            <a href="#" className="hover:text-primary">Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Calculator = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);
