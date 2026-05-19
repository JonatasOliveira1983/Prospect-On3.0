import HomeHeader from "./(landing)/components/HomeHeader";
import HomeHero from "./(landing)/components/HomeHero";
import NeighborhoodInteractive from "./(landing)/components/NeighborhoodInteractive";
import HomeServices from "./(landing)/components/HomeServices";
import HomePortfolio from "./(landing)/components/HomePortfolio";
import HomePartners from "./(landing)/components/HomePartners";
import HomeFooter from "./(landing)/components/HomeFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Outfit'] overflow-x-hidden">
      <HomeHeader />
      <main className="flex-1">
        {/* Hero Section with Spline 3D viewport */}
        <HomeHero />

        {/* Interactive Skyline Simulator */}
        <div id="simulador" className="py-20 bg-slate-950 border-b border-white/5 relative z-10">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black text-otto-yellow uppercase tracking-[0.2em] block mb-3">
                Simulador Interativo
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
                Simule a <span className="text-otto-yellow">Revitalização</span> Predial
              </h2>
              <p className="text-xs lg:text-sm text-slate-400 mt-3 font-light leading-relaxed">
                Clique em cada uma das fachadas desgastadas abaixo para ver o impacto estético e a valorização patrimonial da restauração Otto.
              </p>
            </div>
            <NeighborhoodInteractive />
          </div>
        </div>

        {/* Services, Portfolio & Partners Sections */}
        <HomeServices />
        <HomePortfolio />
        <HomePartners />
      </main>
      <HomeFooter />
    </div>
  );
}
