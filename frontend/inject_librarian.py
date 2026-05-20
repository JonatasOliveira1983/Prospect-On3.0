import re

filepath = r"c:\Users\spcom\Desktop\10D-3.0 - Qwen\frontend\cockpit.html"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

librarian_comp = """
        const LibrarianSummary = ({ intel }) => {
            if (!intel || !intel.top_rankings) return null;
            
            const rankings = Array.isArray(intel.top_rankings) 
                ? intel.top_rankings 
                : Object.values(intel.top_rankings);
            
            const top = rankings.filter(r => r && typeof r === 'object').sort((a,b) => (b.win_rate || 0) - (a.win_rate || 0)).slice(0, 5);
            if (top.length === 0) return null;

            const status = intel.status || "IDLE";
            
            return (
                <div className="flex flex-col gap-2 mt-4 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <span className="material-icons-round text-primary text-sm">auto_awesome</span>
                            Bibliotecário (Top 5 Afinidade)
                        </h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            {status === "STUDYING" ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Estudando</>
                            ) : (
                                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Pronto</>
                            )}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        {top.map((r, i) => (
                            <div key={i} className="flex flex-col gap-1 p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-white">{r.symbol.replace('USDT', '')}</span>
                                    <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono font-black">
                                        <span className="material-icons-round text-[10px]">show_chart</span>
                                        {r.win_rate}%
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">PnL</span>
                                    <span className="text-[9px] font-mono text-white">${r.total_pnl ? r.total_pnl.toFixed(1) : '0.0'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

// --- Component: Page10D (Centralized HQ) ---"""

# Insert component definition
text = text.replace("// --- Component: Page10D (Centralized HQ) ---", librarian_comp)

# Insert component invocation
text = text.replace("{/* RADAR TERMINAL IN DESKTOP */}", "<LibrarianSummary intel={librarianIntel} />\n\n                        {/* RADAR TERMINAL IN DESKTOP */}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Insertion success")
