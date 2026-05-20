"use client";
import HomeHeader from "@/app/(landing)/components/HomeHeader";
import HomeFooter from "@/app/(landing)/components/HomeFooter";

export default function TermosUso() {
  return (
    <div className="bg-slate-950 min-h-screen text-white font-sans selection:bg-otto-yellow selection:text-slate-900">
      <HomeHeader />
      
      <main className="container mx-auto px-6 py-20 max-w-4xl min-h-[70vh]">
        <h1 className="text-4xl font-black text-otto-yellow mb-8 uppercase tracking-widest">Termos de Uso</h1>
        
        <div className="space-y-6 text-slate-300 font-light leading-relaxed">
          <p>
            Bem-vindo ao site da Otto Pinturas. Ao acessar e utilizar este site, você concorda com os presentes Termos de Uso. Leia-os atentamente antes de continuar a navegação.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p>
            O uso do nosso site está condicionado à aceitação e ao cumprimento destes Termos. A utilização contínua após qualquer alteração constitui a aceitação das novas condições.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Serviços da Otto Pinturas</h2>
          <p>
            Este site tem como objetivo apresentar os serviços de pintura predial, industrial e comercial oferecidos pela Otto Pinturas, facilitando o contato para orçamentos e informações técnicas.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo presente neste site (textos, logotipos, imagens, design) é de propriedade exclusiva da Otto Pinturas ou possui as devidas licenças de uso. É proibida a reprodução, cópia ou distribuição sem autorização prévia por escrito.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Isenção de Responsabilidade</h2>
          <p>
            Nos esforçamos para manter as informações do site sempre atualizadas e precisas. No entanto, não garantimos a exatidão absoluta de todos os dados a qualquer momento, podendo ocorrer alterações sem aviso prévio.
          </p>

          <p className="pt-8 text-sm text-slate-500">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
