"use client";
import { api, WS_URL } from '@/lib/api';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Building2, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Importação dinâmica para evitar erro de SSR (window is not defined)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Lead {
  name: string;
  address: string;
  score: number;
  category?: string;
  coords: { lat: number; lng: number };
  phone?: string;
  email?: string;
  website?: string;
  contact_status?: string;
}

export default function MapaRadar() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Carregar Leaflet no lado do cliente
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });

    api.leads()
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setLeads(data);
        setLoading(false);
      });
  }, []);

  const urgentCount = leads.filter(l => l.score > 7).length;

  const defaultCenter: [number, number] = [-23.1857, -46.8978];

  // Função para criar ícone customizado baseado no score
  const getIcon = (score: number) => {
    if (!L) return null;
    
    const color = score > 7 ? '#F43F5E' : (score > 5 ? '#22D3EE' : '#10B981');
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  return (
    <div className="bg-background min-h-screen text-foreground pb-20 p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="text-primary" size={20} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Radar de Guerra (OSM)</h2>
        </div>
        <p className="text-slate-400 font-medium">Inteligência geográfica 100% gratuita via OpenStreetMap</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <MapPin size={48} className="text-primary" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Condomínios Mapeados</span>
          <p className="text-3xl font-black text-white mt-1">{leads.length}</p>
        </div>
        <div className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <AlertTriangle size={48} className="text-rose-500" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Urgências Críticas</span>
          <p className="text-3xl font-black text-rose-500 mt-1">{urgentCount}</p>
        </div>

      </div>

      {/* Interactive Map Container */}
      <div className="glass rounded-3xl border border-white/5 h-[650px] relative overflow-hidden neon-blue z-0">
        {loading || !L ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-md z-20">
            <Loader2 className="text-primary animate-spin mb-4" size={48} />
            <p className="text-slate-400 font-bold tracking-widest uppercase">Sincronizando Mapas Gratuitos...</p>
          </div>
        ) : (
          <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="w-full h-full"
            style={{ background: '#0f172a' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles-dark"
            />
            {leads.map((lead, i) => {
              if (!lead.coords) return null;
              const score = lead.score || 0;
              const icon = getIcon(score);
              
              return (
                <Marker 
                  key={i} 
                  position={[lead.coords.lat, lead.coords.lng]}
                  icon={icon}
                >
                  <Popup>
                    <div className="p-2 min-w-[150px] text-slate-900">
                      <h3 className="font-bold text-sm mb-1">{lead.name}</h3>
                      <p className="text-[10px] text-slate-600 mb-2">{lead.address}</p>
                      <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                        {lead.phone && lead.phone !== 'N/D' && (
                          <span className="text-[9px] font-bold text-emerald-600">📞 {lead.phone}</span>
                        )}
                        {lead.email && lead.email !== 'N/D' && (
                          <span className="text-[9px] font-bold text-blue-600">✉️ {lead.email}</span>
                        )}
                        <span className={`text-[8px] font-black px-1 py-0.5 rounded w-fit ${lead.score > 7 ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                          Score: {lead.score}/10
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      <style jsx global>{`
        .leaflet-container {
          background-color: #0f172a !important;
        }
        .map-tiles-dark {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white !important;
          border-radius: 12px;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.9);
        }
        .leaflet-popup-content h3 {
          color: white !important;
        }
        .leaflet-popup-content p {
          color: #94a3b8 !important;
        }
      `}</style>

      {/* Floating Legend */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full border border-white/10 flex items-center gap-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 uppercase">Alta Prioridade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase">Média Prioridade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-300 uppercase">Baixa Prioridade</span>
        </div>
      </div>
    </div>
  );
}

