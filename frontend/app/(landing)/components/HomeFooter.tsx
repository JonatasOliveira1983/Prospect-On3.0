"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-otto-yellow/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-8 relative z-10">
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
            {/* Redes Sociais */}
            <div className="flex items-center gap-3 mt-5">
              <a href="https://wa.me/5511950201275" target="_blank" className="p-2 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 hover:text-green-300 transition-all active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center" title="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://www.instagram.com/ottopinturas_?igsh=cW5hN2t2eGJ1YW44" target="_blank" className="p-2 rounded-full bg-pink-600/20 border border-pink-500/30 text-pink-400 hover:bg-pink-600/30 hover:text-pink-300 transition-all active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <p className="mt-2 md:mt-0 flex items-center gap-2">
            Motor de Inteligência <span className="text-otto-yellow font-black tracking-widest text-[9px] border border-otto-yellow/30 px-2 py-1 rounded">PROSPECT-ON</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
