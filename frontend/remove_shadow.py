import re

filepath = r"c:\Users\spcom\Desktop\10D-3.0 - Qwen\frontend\cockpit.html"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove useAnticipationRadarRT
text = re.sub(r'// --- Hook: Real-time Anticipation Radar \(V110\.7 Shadow Mode\) ---.*?\};\n', '', text, flags=re.DOTALL)

# Remove AnticipationHUD
text = re.sub(r'// --- Component: AnticipationHUD \(V110\.7 Shadow Mode\) ---.*?\};\n', '', text, flags=re.DOTALL)

# Remove IntelligenceLab
text = re.sub(r'const IntelligenceLab = \(\) => \{.+?(\n\s*const NavBar = \(\{ onLogout \}\) => \{)', r'\1', text, flags=re.DOTALL)

# Remove anticipationSignals from Page10D
text = text.replace('const anticipationSignals = useAnticipationRadarRT();\n', '')
text = text.replace('anticipationSignals={anticipationSignals}', '')

# Remove "Shadow Anticipation Intelligence (45-64)" block from DesktopDashboard inside Page10D
shadow_block = r'''{/\* \[V110\.7\] SHADOW ANTICIPATION PANEL \(DESKTOP ONLY\) \*/}
                        <div className="flex flex-col gap-2 min-h-\[160px\] mt-4 border-t border-white/10 pt-4">
                            <h2 className="text-\[11px\] font-black uppercase tracking-\[0\.2em\] text-primary mb-2 flex items-center gap-2">
                                <span className="material-icons-round text-primary text-sm animate-pulse">visibility</span>
                                Shadow Anticipation Intelligence \(45-64\)
                            </h2>
                            <p className="text-\[9px\] text-slate-600 font-bold uppercase tracking-widest mb-1 italic">Precisions telemetry for active study</p>
                            <AnticipationHUD signals=\{anticipationSignals\} tickers=\{tickers\} />
                        </div>'''
text = re.sub(shadow_block, '', text, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("success")
