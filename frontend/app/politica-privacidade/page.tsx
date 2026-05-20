"use client";
import HomeHeader from "@/app/(landing)/components/HomeHeader";
import HomeFooter from "@/app/(landing)/components/HomeFooter";

export default function PoliticaPrivacidade() {
  return (
    <div className="bg-slate-950 min-h-screen text-white font-sans selection:bg-otto-yellow selection:text-slate-900">
      <HomeHeader />
      
      <main className="container mx-auto px-6 py-20 max-w-4xl min-h-[70vh]">
        <h1 className="text-4xl font-black text-otto-yellow mb-8 uppercase tracking-widest">Política de Privacidade</h1>
        
        <div className="space-y-6 text-slate-300 font-light leading-relaxed">
          <p>
            A Otto Pinturas valoriza a sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD).
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Coleta de Informações</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, como quando você preenche formulários de contato, solicita orçamentos ou interage conosco. Esses dados podem incluir nome, e-mail, telefone e informações sobre o condomínio ou empresa.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Uso das Informações</h2>
          <p>
            As informações coletadas são utilizadas exclusivamente para prestação de nossos serviços, como envio de propostas comerciais, comunicação direta, atendimento ao cliente e personalização de serviços de pintura predial e industrial.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Compartilhamento e Segurança</h2>
          <p>
            Não vendemos nem alugamos suas informações pessoais. Implementamos medidas de segurança técnicas e administrativas robustas para proteger seus dados contra acessos não autorizados, perdas ou alterações.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Seus Direitos</h2>
          <p>
            De acordo com a LGPD, você tem o direito de solicitar acesso, correção, anonimização ou exclusão dos seus dados pessoais. Para exercer esses direitos, entre em contato conosco através do e-mail: otto@ottopinturas.com.br.
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
