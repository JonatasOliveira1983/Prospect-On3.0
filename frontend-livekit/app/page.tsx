'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  BarVisualizer,
  Chat,
  useChat,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Mic, ShieldCheck, Zap, Radio, Send, Terminal } from 'lucide-react';

// LiveKit CSS
import '@livekit/components-styles';

export default function JarvisVoiceChat() {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const resp = await fetch('http://localhost:8085/api/livekit/token?participant_name=Almirante');
        const data = await resp.json();
        
        if (data.token) {
          setToken(data.token);
          setUrl(process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://jonatas-3qv4oa8h.livekit.cloud');
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        setError('Interface Neural Offline.');
      }
    }
    fetchToken();
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!token || !url) return <LoadingState />;

  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect={true}
      audio={true}
      video={false}
      className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden selection:bg-emerald-500/30"
    >
      {/* Background FX - Enhanced Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 relative z-10">
        
        {/* Header Shadow Edition */}
        <header className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center space-x-2 px-4 py-1.5 border border-emerald-500/40 rounded-full bg-emerald-950/30 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] font-bold text-emerald-300 uppercase">Audio Neural Link</span>
          </div>
          
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-stone-600 select-none drop-shadow-2xl">
              JARVIS <span className="text-emerald-500 opacity-90">v20.5</span>
            </h1>
            <p className="text-[10px] text-stone-400 tracking-[0.5em] uppercase font-light mt-2 italic shadow-sm">
              Elite Neural Protocol • Private Command
            </p>
          </div>
        </header>

        {/* Visualizer Orb - Maximum Visibility & High Intensity Glow */}
        <div className="relative group perspective-1000 my-4 transform scale-110">
          {/* Main outer glow */}
          <div className="absolute -inset-24 bg-emerald-500/20 rounded-full blur-[120px] group-hover:bg-emerald-500/40 transition duration-1000 animate-pulse"></div>
          {/* Secondary tight glow */}
          <div className="absolute -inset-8 bg-emerald-400/10 rounded-full blur-2xl"></div>
          
          <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] bg-stone-950/80 rounded-full border-[3px] border-emerald-500/50 backdrop-blur-3xl flex items-center justify-center overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1),inset_0_0_80px_rgba(16,185,129,0.2)] transform transition duration-1000 group-hover:scale-105 group-hover:border-emerald-400">
            
            {/* Visualizer Lines - High Frequency & Brightness */}
            <BarVisualizer 
              className="w-full h-64 opacity-100 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" 
              barCount={19} 
            />

            {/* Neural Pulse Status - More visible */}
            <div className="absolute bottom-16 flex flex-col items-center bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] uppercase mb-2 font-black drop-shadow-md">Neural Core: Optimized</span>
              <div className="flex space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(52,211,153,1)] [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(52,211,153,1)] [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(52,211,153,1)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Command & Control */}
        <div className="w-full max-w-lg flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Manual Input Field (Requested typing box) */}
          <div className="w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-stone-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-3 backdrop-blur-xl focus-within:border-emerald-500/50 transition duration-300">
               <Terminal className="w-4 h-4 text-emerald-500 mr-3" />
               <ChatInput />
            </div>
          </div>

          <footer className="flex flex-col items-center space-y-6 w-full">
            <div className="group relative p-1.5 bg-stone-900/60 rounded-full border border-stone-800/80 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition duration-500">
              <VoiceAssistantControlBar controls={{ leave: false }} />
            </div>

            <div className="flex items-center space-x-4 opacity-40 hover:opacity-100 transition duration-500">
               <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-stone-700"></div>
               <div className="flex items-center space-x-2 text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                  <Mic className="w-3 h-3 text-emerald-500" />
                  <span>Pronto para o comando vocal</span>
               </div>
               <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-stone-700"></div>
            </div>
          </footer>
        </div>

      </div>

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function ChatInput() {
  const { send, chatMessages } = useChat();
  const [msg, setMsg] = useState('');

  const handleSend = () => {
    if (msg.trim()) {
      send(msg);
      setMsg('');
    }
  };

  return (
    <>
      <input 
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Digite seu comando neural..."
        className="flex-1 bg-transparent border-none outline-none text-emerald-50 text-sm placeholder:text-stone-600 font-mono tracking-tight"
      />
      <button 
        onClick={handleSend}
        className="ml-2 p-1.5 text-stone-500 hover:text-emerald-400 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-emerald-500 font-mono tracking-[0.5em] uppercase text-[10px]">
      <div className="relative mb-8">
        <Zap className="w-8 h-8 animate-bounce text-emerald-400" />
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
      </div>
      Sincronizando Links Neurais...
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-red-500 p-8 text-center font-mono">
      <ShieldCheck className="w-16 h-16 mb-6 animate-pulse" />
      <h2 className="text-xl font-bold mb-4 uppercase tracking-[0.2em] border-b border-red-900/50 pb-2">Erro de Protocolo</h2>
      <p className="text-stone-500 text-xs mb-8">{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900 hover:text-white text-xs tracking-[0.4em] uppercase transition-all duration-500"
      >
        Reboot Neural
      </button>
    </div>
  );
}
