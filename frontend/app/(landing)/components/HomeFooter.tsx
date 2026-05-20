"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-otto-yellow/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="mb-6 select-none active:scale-95 transition-transform inline-block">
              <Image 
                src="/AquivosOtto/Logo/Img001 logo Otto.png"
                alt="Logo Otto Pinturas"
                width={140}
                height={140}
                className="object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-6 font-light">
              Mais de 30 anos trazendo engenharia predial de ponta, segurança jurídica e acabamento premium para condomínios, indústrias e shoppings. O seu patrimônio valorizado com máxima segurança técnica.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-otto-yellow">Contato Direto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-slate-300">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-otto-yellow" />
                </div>
                <span className="font-bold text-xs">11 95020-1275</span>
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-otto-yellow" />
                </div>
                <span className="text-xs font-light">otto@ottopinturas.com.br</span>
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-otto-yellow" />
                </div>
                <span className="leading-tight text-xs font-light">R. Irmã Gabriela, 51<br/>Cidade Monções - SP</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-otto-yellow">Legal / Privacidade</h4>
            <ul className="space-y-3 text-slate-400 font-light text-xs">
              <li>
                <Link href="/politica-privacidade" className="hover:text-otto-yellow transition-colors cursor-pointer">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-uso" className="hover:text-otto-yellow transition-colors cursor-pointer">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-light relative">
          <p>&copy; {new Date().getFullYear()} Otto Pinturas. Todos os direitos reservados.</p>
          
          {/* Back to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="my-4 md:my-0 p-3 rounded-full bg-slate-900 border border-white/5 hover:border-otto-yellow hover:bg-slate-900/80 text-slate-400 hover:text-otto-yellow transition-all duration-300 active:scale-90 flex items-center justify-center shadow-2xl group cursor-pointer"
            title="Voltar ao Topo"
          >
            <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <p className="mt-2 md:mt-0 flex items-center gap-2">
            Motor de Inteligência <span className="text-otto-yellow font-black tracking-widest text-[9px] border border-otto-yellow/30 px-2 py-1 rounded">PROSPECT-ON</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
