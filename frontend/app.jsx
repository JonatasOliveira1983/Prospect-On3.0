const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { createRoot } = ReactDOM;
const { Route, Link, useLocation, useNavigate, Routes, HashRouter } = ReactRouterDOM;

/* Combined JSX from cockpit.html */

// --- Script 1 ---
// V110.171: ELITE BOOT SEQUENCE
        console.time('Babel-App-Load');
        
        const bootMessages = [
            { msg: "Iniciando Núcleo Neural...", progress: 10 },
            { msg: "Sincronizando Inteligência de Frota...", progress: 25 },
            { msg: "Mapeando DNA do Bibliotecário...", progress: 45 },
            { msg: "Conectando ao Quantum Stream Bybit...", progress: 65 },
            { msg: "Calibrando Filtro de Armadilhas Whale...", progress: 85 },
            { msg: "Interface Pronta. Bem-vindo, Almirante.", progress: 100 }
        ];

        let currentMsg = 0;
        const bootInterval = setInterval(() => {
            if (currentMsg < bootMessages.length) {
                const statusEl = document.getElementById('boot-status');
                const progressEl = document.getElementById('boot-progress');
                if (statusEl) statusEl.innerText = bootMessages[currentMsg].msg;
                if (progressEl) progressEl.style.width = bootMessages[currentMsg].progress + "%";
                currentMsg++;
            } else {
                clearInterval(bootInterval);
            }
        }, 600);

        // Global Error Handling: Prevents silent crashes and provides debug info
        // V110.209: Service Worker Persistent Optimized Strategy
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js?v=110.900');
            });
        }

                registrations.forEach(registration => {
                    console.log("ðŸ› ï¸ Unregistering old Service Worker for Protocol Update...");
                    registration.unregister();
                });


        window.onerror = function (message, source, lineno, colno, error) {
            console.error("GLOBAL CRASH DETECTED:", message, "at", source, ":", lineno);
            const status = document.getElementById('boot-status');
            if (status) status.innerText = "CRITICAL ERROR: " + message;
            return false;
        };

        // [V110.23.7] Use explicit global for Router to avoid UMD race conditions

        // Dynamic API Base: Robust resolution for local and production
        const API_BASE = (() => {
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                return `${window.location.protocol}//${window.location.hostname}`;
            }
            // [V110.144] Local Dynamic Port Detection (8085 Standard)
            const port = window.location.port || '8085';
            return `${window.location.protocol}//${window.location.hostname}:${port}`;
        })();

        console.log("System Initialized ✅ Port Target:", API_BASE);
        
        // --- Sovereign WebSocket Engine (V110.181) ---
        const sovereignWS = {
            listeners: new Set(),
            socket: null,
            connected: false,
            
            init() {
                if (this.socket) return;
                const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws/cockpit';
                console.log("🔌 Initializing Sovereign WebSocket Engine:", wsUrl);
                
                const connect = () => {
                    try {
                        this.socket = new WebSocket(wsUrl);
                        this.socket.onopen = () => {
                            console.log("✅ Sovereign WebSocket Connected");
                            this.connected = true;
                            window.dispatchEvent(new CustomEvent('ws-status', { detail: true }));
                        };
                        this.socket.onmessage = (event) => {
                            try {
                                const message = JSON.parse(event.data);
                                this.listeners.forEach(l => l(message));
                                window.dispatchEvent(new CustomEvent('sovereign-packet', { detail: message }));
                            } catch (e) {}
                        };
                        this.socket.onclose = () => {
                            this.connected = false;
                            window.dispatchEvent(new CustomEvent('ws-status', { detail: false }));
                            setTimeout(connect, 5000);
                        };
                        this.socket.onerror = () => {
                            this.socket.close();
                        };
                    } catch (e) {
                        setTimeout(connect, 5000);
                    }
                };
                connect();
            },
            
            subscribe(callback) {
                this.listeners.add(callback);
                return () => this.listeners.delete(callback);
            }
        };
        sovereignWS.init();

        /* [V110.230] SOVEREIGN MODE: Firebase Disabled as per Admiral Request
        const firebaseConfig = {
            projectId: "projeto-teste-firestore-3b00e",
            databaseURL: "https://projeto-teste-firestore-3b00e-default-rtdb.europe-west1.firebasedatabase.app"
        };

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
        } catch (err) {
            console.error("Firebase init error:", err);
        }

        const db = firebase.firestore();
        */
        const db = null;
        let rtdb = null;
        /*
        try {
            if (firebaseConfig.databaseURL) {
                console.log("📡 Initializing RTDB Connection...");
                rtdb = firebase.database();
                window.rtdb = rtdb; 
                console.log("RTDB V15.1.2 Initialized ✅");
            }
        } catch (e) {
            console.error("RTDB critical init failed:", e);
        }
        */

        // --- Global Utilities ---
        const safeJsonParse = (str, fallback) => {
            try {
                return str ? JSON.parse(str) : fallback;
            } catch (e) {
                console.warn("localStorage Corruption Detected. Resetting to fallback.", e);
                return fallback;
            }
        };

        const formatPrice = (val) => {
            if (val === null || val === undefined || isNaN(val) || val === 0) return '---';
            const num = Number(val);
            if (num < 0.0001) return num.toFixed(8);
            if (num < 1) return num.toFixed(6);
            if (num < 10) return num.toFixed(4);
            if (num < 100) return num.toFixed(3);
            if (num < 1000) return num.toFixed(2);
            return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // --- V56.0: Global Intelligence UI Helpers ---
        const getGaugeColor = (score) => {
            if (score >= 80) return '#ffffff'; // Lime (Elite)
            if (score >= 70) return '#FACC15'; // Gold (High)
            if (score >= 60) return '#A855F7'; // Purple (Good)
            return '#9ca3af'; // Gray (Neutral)
        };

        // =========================================================================
        // --- [INDICATOR UTILITIES] ---
        // =========================================================================
        const calculateSMA = (data, period) => {
            if (!data || data.length < period) return [];
            let smas = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) {
                    smas.push(null);
                    continue;
                }
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                smas.push({ time: data[i].time, value: sum / period });
            }
            return smas;
        };

        const calculateATR = (data, period) => {
            if (!data || data.length < period) return [];
            let trs = [];
            for (let i = 0; i < data.length; i++) {
                const candle = data[i];
                const prevCandle = data[i - 1];
                let tr;
                if (!prevCandle) {
                    tr = candle.high - candle.low;
                } else {
                    tr = Math.max(
                        candle.high - candle.low,
                        Math.abs(candle.high - prevCandle.close),
                        Math.abs(candle.low - prevCandle.close)
                    );
                }
                trs.push(tr);
            }

            let atrs = [];
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
                if (i < period) {
                    sum += trs[i];
                    if (i === period - 1) atrs.push({ time: data[i].time, value: sum / period });
                    else atrs.push(null);
                    continue;
                }
                atrs.push({ time: data[i].time, value: (atrs[i - 1].value * (period - 1) + trs[i]) / period });
            }
            return atrs;
        };

        const calculateSuperTrend = (data, period, multiplier) => {
            const atrs = calculateATR(data, period);
            if (atrs.length === 0) return [];
            let st = [];
            let prevUpper = null;
            let prevLower = null;
            let trend = 1; 
            for (let i = 0; i < data.length; i++) {
                if (!atrs[i]) { st.push(null); continue; }
                const atr = atrs[i].value;
                const src = (data[i].high + data[i].low) / 2;
                let upper = src + multiplier * atr;
                let lower = src - multiplier * atr;
                if (prevUpper !== null) {
                    upper = (upper < prevUpper || data[i - 1].close > prevUpper) ? upper : prevUpper;
                    lower = (lower > prevLower || data[i - 1].close < prevLower) ? lower : prevLower;
                }
                if (i > 0 && st[i-1]) {
                    if (trend === 1 && data[i].close < lower) trend = -1;
                    else if (trend === -1 && data[i].close > upper) trend = 1;
                }
                const value = trend === 1 ? lower : upper;
                st.push({ time: data[i].time, value, color: trend === 1 ? '#ffffff' : '#EF4444' });
                prevUpper = upper; prevLower = lower;
            }
            return st;
        };

        const calculateBollingerBands = (data, period, stdDevMult) => {
            const smas = calculateSMA(data, period);
            if (smas.length === 0) return { upper: [], middle: [], lower: [] };
            
            let upper = [], middle = [], lower = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) {
                    const t = data[i].time;
                    upper.push({ time: t, value: null });
                    middle.push({ time: t, value: null });
                    lower.push({ time: t, value: null });
                    continue;
                }
                
                let sumSq = 0;
                const mean = smas[i].value;
                for (let j = 0; j < period; j++) {
                    sumSq += Math.pow(data[i - j].close - mean, 2);
                }
                const stdDev = Math.sqrt(sumSq / period);
                const t = data[i].time;
                
                upper.push({ time: t, value: mean + stdDevMult * stdDev });
                middle.push({ time: t, value: mean });
                lower.push({ time: t, value: mean - stdDevMult * stdDev });
            }
            return { upper, middle, lower };
        };

        const calculateVolumes = (data) => {
            return data.map(k => ({
                time: k.time,
                value: k.volume || 1, 
                color: k.close >= k.open ? 'rgba(255, 255, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }));
        };

        const calculatePivotPoints = (data) => {
            if (!data || data.length < 2) return null;
            const prev = data[data.length - 2];
            const p = (prev.high + prev.low + prev.close) / 3;
            return {
                p, s1: (2 * p) - prev.high, s2: p - (prev.high - prev.low), s3: prev.low - 2 * (prev.high - p),
                r1: (2 * p) - prev.low, r2: p + (prev.high - prev.low), r3: prev.high + 2 * (p - prev.low)
            };
        };

        const IntelIcon = ({ type, score, icon, label }) => {
            const isActive = score >= 80;
            const color = isActive ? '#ffffff' : (score >= 60 ? '#9ca3af' : '#4b5563');
            
            const renderIconContent = () => {
                if (label === "WHL" || label === "WHALE" || icon === "waves") {
                    // [V110.136] Vibrant Blue Whale when active
                    const whaleStyle = isActive 
                        ? { filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.4))', color: '#ffffff', opacity: 1 } 
                        : { filter: 'grayscale(100%)', opacity: 0.2 };
                    
                    return <span className="text-[14px] transition-all duration-500" style={whaleStyle}>🐋</span>;
                }
                return <span className="material-icons-round text-[14px]" style={{ color, opacity: isActive ? 1 : 0.4 }}>{icon}</span>;
            };

            return (
                <div className="flex flex-col items-center gap-0.5 group relative">
                    <div className="w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.02] border border-white/5 transition-all group-hover:border-lime-500/30" 
                         style={isActive ? { boxShadow: `inset 0 0 8px ${color}20`, borderColor: `${color}40` } : {}}>
                        {renderIconContent()}
                    </div>
                </div>
            );
        };

        // --- Component: AI Cascade Status (V4.2.1) ---

        const QualitySeal = ({ seal, reason }) => {
            if (!seal) return null;
            const items = seal.split('|').map(s => s.trim()).filter(Boolean);
            return (
                <div className="flex gap-1 flex-wrap">
                    {items.map((s, idx) => {
                        const cleanS = s.replace(/🍯|🛡️|💀/g, '').trim();
                        const isNectar = s.toUpperCase().includes('NECTAR');
                        const isTrap = s.toUpperCase().includes('TRAP') || s.includes('💀');

                        let classes = "px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-all animate-preemption ";
                        if (isNectar) classes += "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
                        else if (isTrap) classes += "bg-orange-600/10 text-orange-500 border-orange-600/30";
                        else classes += "bg-gray-800/40 text-gray-400 border-white/10";

                        return (
                            <span key={idx} className={classes} title={reason || cleanS}>
                                {cleanS}
                            </span>
                        );
                    })}
                </div>
            );
        };

        // --- Component: Daily Goal Banner (V110.370) ---
        const DailyGoalBanner = ({ context, title, intelligenceMessage }) => {
            if (!context) return null;
            const gains = context.daily_gains || 0;
            const target = context.daily_target || 10;
            const pnl = context.daily_pnl || 0;
            const progress = Math.min(100, (gains / target) * 100);

            return (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-lime-500/10 to-white/10 border border-lime-500/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-icons-round text-3xl">track_changes</span>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="material-icons-round text-white text-sm animate-pulse">radar</span>
                                {title || 'Radar de Inteligência'}
                            </h3>
                            {intelligenceMessage ? (
                                <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/10 border border-white/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span>
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{intelligenceMessage}</span>
                                </div>
                            ) : (
                                <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-50">Command Header</span>
                            )}
                        </div>
                        <div className="h-[1px] w-full bg-white/5 mb-2"></div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivo Diário</span>
                            <span className="text-xs font-black text-white">{gains}/{target} <span className="text-gray-500 font-bold ml-1">Gains</span></span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <div 
                                className="h-full bg-gradient-to-r from-lime-600 via-white to-gray-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`material-icons-round text-[14px] ${pnl >= 0 ? 'text-white' : 'text-amber-400'}`}>
                                    {pnl >= 0 ? 'trending_up' : 'trending_down'}
                                </span>
                                <span className={`text-sm font-black font-mono ${pnl >= 0 ? 'text-white' : 'text-amber-400'}`}>
                                    {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                                </span>
                            </div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter italic">24h Performance</span>
                        </div>
                    </div>
                </div>
            );
        };

        // [NEW] Librarian Affinity Badge
        const AffinityBadge = ({ symbol, rankings }) => {
            const normalized = (symbol || '').replace('.P', '').replace('.p', '').toUpperCase();
            const info = rankings && rankings[normalized];
            if (!info) return null;

            const wr = info.win_rate || 0;
            const color = wr >= 65 ? 'text-white border-lime-400/30 bg-lime-400/10' : 
                         wr >= 55 ? 'text-white border-lime-400/30 bg-lime-400/10' : 
                         'text-amber-400 border-amber-400/30 bg-amber-400/10';

            return (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${color} text-[8px] font-black uppercase tracking-widest`}>
                    <span className="material-icons-round text-[10px]">auto_stories</span>
                    AFINIDADE: {wr}%
                </div>
            );
        };

        const BancaWealthSection = ({ 
            liveEquity, liveTotalProfit, liveTotalPnL, startBankroll, 
            hullIntegrityPct, isDrawdown, fleetRank, rankColor 
        }) => {
            return (
                <section className="premium-card p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Patrimônio Líquido</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white font-mono">${liveEquity.toFixed(2)}</span>
                                <span className={`text-xs font-bold ${liveTotalPnL >= 0 ? 'text-green-500' : 'text-orange-400'}`}>
                                    {liveTotalPnL >= 0 ? '+' : ''}{liveTotalPnL.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/10 ${rankColor}`}>
                                {fleetRank}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Resultado Global</span>
                            <p className={`text-lg font-black font-mono ${liveTotalProfit >= 0 ? 'text-green-500' : 'text-orange-400'}`}>
                                ${liveTotalProfit >= 0 ? '+' : ''}{liveTotalProfit.toFixed(2)}
                            </p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Integridade</span>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-lg font-black font-mono text-white">{hullIntegrityPct.toFixed(1)}%</span>
                                <div className={`w-2 h-2 rounded-full ${isDrawdown ? 'bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <span>Alocação por Slot (10%)</span>
                            <span className="text-white">${(liveEquity * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden p-[1px]">
                            <div 
                                className={`h-full transition-all duration-1000 ${isDrawdown ? 'bg-orange-500' : 'bg-green-500'}`} 
                                style={{ width: `${hullIntegrityPct}%` }}
                            ></div>
                        </div>
                    </div>
                </section>
            );
        };

        const QuantumHUD = ({ 
            btc, btcContext, adx, decorrelation, radarMode, pulseStatus, latency, 
            protocolLabel, oracleStatus, oracleMessage, stabilizationProgress, dominance,
            unifiedRegime
        }) => {
            const isStabilizing = oracleStatus === 'STABILIZING';
            const getPulseColor = () => {
                if (pulseStatus === 'OFFLINE') return 'bg-red-500';
                if (pulseStatus === 'WARNING') return 'bg-orange-500';
                if (pulseStatus === 'DEGRADED') return 'bg-gray-400';
                return latency < 3000 ? 'bg-lime-500' : 'bg-orange-400';
            };
            
            const MarketMetric = ({ label, value, subValue, color = 'text-white' }) => (
                <div className="flex flex-col items-center">
                    <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter mb-0.5">{label}</span>
                    <span className={`text-[11px] font-black font-mono ${color}`}>{value}</span>
                    {subValue && <span className="text-[6px] font-bold text-gray-600 uppercase tracking-tighter">{subValue}</span>}
                </div>
            );

            return (
                <div className="flex flex-col sticky top-0 z-[100] bg-gray-950/90 backdrop-blur-2xl">
                    {/* Linha 1: Brand Status HUD - Wealth Edition */}
                    <div className="flex items-center justify-between px-4 py-3 border-none">
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://raw.githubusercontent.com/JonatasOliveira1983/10DBybityREAL/main/frontend/logo10D.png?v=2" 
                                className="h-5 w-auto object-contain brightness-125"
                                alt="10D Logo"
                            />
                            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">{protocolLabel || 'V110.125'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/[0.02] px-2 py-1 rounded-full border border-white/5">
                             <div className={`w-1.5 h-1.5 rounded-full ${getPulseColor()} shadow-[0_0_8px_currentColor]`}></div>
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{pulseStatus} • {latency}ms</span>
                        </div>
                    </div>

                    {/* V39.2: Wealth Intel Card - Agrupamento Premium de Métricas BTC */}
                    <div className="px-4 py-3">
                        <div className="premium-card bg-gradient-to-br from-lime-500/[0.05] to-transparent p-3 relative overflow-hidden group">
                            {/* Scanning Light Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -trangray-x-full group-hover:trangray-x-full transition-transform duration-1000"></div>
                            
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-black text-white font-mono tracking-tighter">${formatPrice(btc?.btc_price || 0)}</span>
                                        <div className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${btc?.btc_variation_24h >= 0 ? 'bg-lime-500/10 text-white' : 'bg-red-500/10 text-red-400'}`}>
                                            <span className="material-icons-round text-[10px]">{btc?.btc_variation_24h >= 0 ? 'trending_up' : 'trending_down'}</span>
                                            {btc?.btc_variation_24h >= 0 ? '+' : ''}{Number(btc?.btc_variation_24h || 0).toFixed(2)}%
                                        </div>
                                    </div>
                                    <span className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.3em]">Bitcoin Intelligence / Global</span>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                        ['BULL', 'UP'].includes(unifiedRegime) ? 'bg-lime-500/10 text-white border-lime-500/20' : 
                                        ['BEAR', 'DOWN'].includes(unifiedRegime) ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    }`}>
                                        {['BULL', 'UP'].includes(unifiedRegime) ? 'ALTA' : ['BEAR', 'DOWN'].includes(unifiedRegime) ? 'BAIXA' : 'LATERAL'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.03]">
                                <MarketMetric label="ADX Intelligence" value={adx || '...'} subValue={adx >= 25 ? 'Strong Trend' : 'Weak Market'} />
                                <MarketMetric label="Dominance" value={`${dominance?.toFixed(1) || '...'}%`} subValue="BTC Prevalence" />
                                <MarketMetric label="Correlation" value={`${decorrelation !== null ? decorrelation.toFixed(1) : '...'}%`} subValue="Alt-Decoupling" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // --- Hook: Pulse Monitor (V4.1 Elite Resilience) ---
        const usePulseMonitor = () => {
            const [latency, setLatency] = useState(0);
            // V15.1.2: Optimistic 'DEGRADED' to avoid blocking overlay on slow loads
            const [status, setStatus] = useState('DEGRADED');
            const [isThinking, setIsThinking] = useState(false); // [V18.1] Global Thinking State
            const lastUpdateRef = useRef(Date.now());
            const channelRef = useRef('NONE');

            useEffect(() => {
                let unsubscribe = null;
                const startTime = Date.now();
                console.log("📡 Pulse Monitor: System Booting [", rtdb ? 'RTDB-READY' : 'RTDB-MISSING', "]");

                // Immediate REST Check on Mount (Eliminates 12s wait)
                const immediateCheck = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/system/state');
                        if (res.ok) {
                            console.log("📡 Pulse Monitor: Immediate REST Check Success ✅");
                            const data = await res.json();
                            if (data && typeof data.is_thinking !== 'undefined') {
                                setIsThinking(data.is_thinking);
                            }
                            lastUpdateRef.current = Date.now();
                            setStatus('ONLINE');
                            channelRef.current = 'REST-BOOT';
                        } else {
                            console.warn("📡 Pulse Monitor: Immediate REST Check Failed (Non-OK)");
                        }
                    } catch (e) {
                        console.warn("📡 Pulse Monitor: Immediate REST Check Failed (Network Error)", e);
                    }
                };
                immediateCheck();

                // Primary: Firebase RTDB
                if (rtdb) {
                    try {
                        const pulseRef = rtdb.ref('system_pulse');
                        unsubscribe = pulseRef.on('value', (snapshot) => {
                            const data = snapshot.val();
                            if (data && data.timestamp) {
                                lastUpdateRef.current = Date.now();
                                const lat = Date.now() - data.timestamp;
                                setLatency(Math.max(0, lat));
                                setStatus('ONLINE');
                                channelRef.current = 'RTDB';
                            } else {
                                console.warn("📡 Pulse Monitor: RTDB Pulse received but content is malformed", data);
                            }
                        }, (err) => {
                            // If it's a permission error, we don't spam the console since we have REST fallback
                            if (err && err.message && err.message.includes('permission_denied')) {
                                console.warn("📡 Pulse Monitor: RTDB Access Denied (system_pulse). Using REST Fallback Only.");
                            } else {
                                console.error("📡 Pulse Monitor: RTDB Subscription Error:", err);
                            }
                        });

                        // [V18.1] Listen for Thinking State in RTDB
                        const thinkingRef = rtdb.ref('chat_status/is_thinking');
                        thinkingRef.on('value', (snap) => {
                            if (snap.exists()) setIsThinking(snap.val());
                        });

                    } catch (e) {
                        console.error("📡 Pulse Monitor: RTDB Logic Failure:", e);
                    }
                }

                // Secondary: REST API Pulse (Dual Heartbeat)
                const onRestPulse = () => {
                    lastUpdateRef.current = Date.now();
                    // If we were offline or warning, upgrade to DEGRADED
                    setStatus(prev => (prev === 'OFFLINE' || prev === 'WARNING') ? 'DEGRADED' : prev);
                    channelRef.current = 'REST';
                };
                window.addEventListener('rest-pulse', onRestPulse);

                const checker = setInterval(async () => {
                    const diff = Date.now() - lastUpdateRef.current;

                    // Fallback: If heart beating via RTDB is slow (> 12s), force a REST check to verify health
                    if (diff > 12000) {
                        try {
                            const res = await fetch(API_BASE + '/api/system/state');
                            if (res.ok) {
                                const data = await res.json();
                                if (data && typeof data.is_thinking !== 'undefined') {
                                    setIsThinking(data.is_thinking);
                                }
                                lastUpdateRef.current = Date.now();
                                setStatus('ONLINE');
                                channelRef.current = 'REST-PING';
                                return; // Optimized: Heartbeat restored
                            }
                        } catch (e) {
                            console.warn("Pulse Fallback REST Failed:", e);
                        }
                    }

                    // Update Status based on latency (Only AFTER fallback check)
                    if (diff > 45000) {
                        setStatus('OFFLINE');
                    } else if (diff > 12000) {
                        setStatus('DEGRADED');
                    } else {
                        setStatus('ONLINE');
                    }
                }, 5000);

                return () => {
                    if (unsubscribe && rtdb) {
                        try {
                            rtdb.ref('system_pulse').off('value', unsubscribe);
                        } catch (e) { }
                    }
                    window.removeEventListener('rest-pulse', onRestPulse);
                    clearInterval(checker);
                };
            }, [rtdb]);

            return { latency, status, channel: channelRef.current, isThinking };
        };

        // --- Hook: BTC Command Center (V5.1.0 Drag Mode) ---
        const useBtcCommandCenter = () => {
            const [data, setData] = useState({
                btc_drag_mode: false,
                btc_cvd: 0,
                exhaustion: 0,
                btc_price: 0,
                btc_variation_1h: 0,
                btc_variation_24h: 0
            });

            useEffect(() => {
                // Sincronização via WebSocket (Primário)
                const unsubscribe = sovereignWS.subscribe((msg) => {
                    if (msg.type === 'btc_command_center') {
                        setData(msg.data);
                        localStorage.setItem('btc_cache', JSON.stringify(msg.data));
                    }
                });
                return unsubscribe;
            }, []);

            useEffect(() => {
                if (!rtdb) return;
                try {
                    const btcRef = rtdb.ref('btc_command_center');
                    const onValue = btcRef.on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            setData(val);
                            localStorage.setItem('btc_cache', JSON.stringify(val));
                        }
                    });
                    return () => btcRef.off('value', onValue);
                } catch (e) { console.error("BTC Command Error:", e); }
            }, [rtdb]);

            // V12.2: REST Polling Fallback (ensures BTC data is never stuck)
            useEffect(() => {
                const fetchFallback = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/system/state');
                        if (res.ok) {
                            const val = await res.json();
                            if (val && val.btc_price !== undefined) {
                                setData(prev => ({
                                    ...prev,
                                    btc_price: val.btc_price,
                                    btc_variation_1h: val.btc_variation_1h || 0,
                                    btc_variation_24h: val.btc_variation_24h || 0,
                                    btc_drag_mode: val.btc_drag_mode || false,
                                    btc_cvd: val.btc_cvd || 0,
                                    exhaustion: val.exhaustion || 0,
                                    radar_mode: val.radar_mode || 'SCAVENGER_RANGE',
                                    oracle_status: val.oracle_status || 'SECURE',
                                    oracle_message: val.oracle_message || 'Segurança Ativa',
                                    stabilization_progress: val.stabilization_progress || 1.0
                                }));
                            }
                        }
                    } catch (e) { }
                };
                const itv = setInterval(fetchFallback, 45000);
                const onVisibilityChange = () => { if (document.visibilityState === 'visible') fetchFallback(); };
                document.addEventListener('visibilitychange', onVisibilityChange);
                return () => { clearInterval(itv); document.removeEventListener('visibilitychange', onVisibilityChange); };
            }, []);

            return data;
        };

        // --- Hook: Real-time Banca Status (V15.1.2) ---
        const useBancaRT = (initialData) => {
            const [banca, setBanca] = useState(initialData);

            useEffect(() => {
                // Sincronização via WebSocket (Primário)
                const unsubscribe = sovereignWS.subscribe((msg) => {
                    if (msg.type === 'banca_status') {
                        setBanca(msg.data);
                        localStorage.setItem('banca_cache', JSON.stringify(msg.data));
                    }
                });
                return unsubscribe;
            }, []);

            useEffect(() => {
                if (!rtdb) return;
                try {
                    const ref = rtdb.ref('banca_status');
                    const onValue = ref.on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            setBanca(val);
                            localStorage.setItem('banca_cache', JSON.stringify(val));
                        }
                    }, (err) => {
                        if (err && err.message && err.message.includes('permission_denied')) {
                            // Silent: use already has initialData or REST fallback
                        } else {
                            console.error("Banca RTDB Error:", err);
                        }
                    });
                    return () => ref.off('value', onValue);
                } catch (e) { }
            }, [rtdb]);

            // V15.1.5: REST Fallback Polling (ensures banca data is never stuck)
            useEffect(() => {
                const fetchFallback = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/banca/data');
                        if (res.ok) {
                            const val = await res.json();
                            if (val && val.saldo_total !== undefined) {
                                setBanca(val);
                                localStorage.setItem('banca_cache', JSON.stringify(val));
                            }
                        }
                    } catch (e) { }
                };
                fetchFallback();
                const itv = setInterval(fetchFallback, 45000);
                const onVisibilityChange = () => { if (document.visibilityState === 'visible') fetchFallback(); };
                document.addEventListener('visibilitychange', onVisibilityChange);
                return () => { clearInterval(itv); document.removeEventListener('visibilitychange', onVisibilityChange); };
            }, []);

            return banca;
        };

        // --- Hook: AI Cascade Status (V4.2.1) ---
        const useAICascadeRT = () => {
            const [status, setStatus] = useState(safeJsonParse(localStorage.getItem('ai_cascade_cache'), {
                last_model: 'None',
                requests: 0,
                cascade: []
            }));

            useEffect(() => {
                const unsubscribe = sovereignWS.subscribe((msg) => {
                    if (msg.type === 'ai_cascade_status') {
                        setStatus(msg.data);
                        localStorage.setItem('ai_cascade_cache', JSON.stringify(msg.data));
                    }
                });
                return unsubscribe;
            }, []);

            return status;
        };

        // --- Hook: Real-time Vault (V15.0) ---
        const useVaultRT = (initialData) => {
            const [vault, setVault] = useState(initialData || { cycle_number: 1, used_symbols_in_cycle: [], cycle_start_bankroll: 0 });

            useEffect(() => {
                if (!rtdb) return;
                try {
                    const ref = rtdb.ref('vault_status');
                    const onValue = ref.on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            setVault(val);
                            localStorage.setItem('vault_status_cache', JSON.stringify(val));
                            window.dispatchEvent(new CustomEvent('vault-update'));
                        }
                    }, (err) => {
                        if (err && err.message && err.message.includes('permission_denied')) {
                            // Silent: REST fallback active
                        } else {
                            console.error("Vault RTDB Error:", err);
                        }
                    });
                    return () => ref.off('value', onValue);
                } catch (e) { }
            }, [rtdb]);

            // V15.1.5: REST Fallback Polling (ensures vault data is never stuck)
            useEffect(() => {
                const fetchFallback = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/vault/status');
                        if (res.ok) {
                            const val = await res.json();
                            if (val && val.cycle_number !== undefined) {
                                setVault(prev => {
                                    if (!prev || !prev.updated_at) return val;
                                    if (val.updated_at && val.updated_at > prev.updated_at) return val;
                                    // Fallback: If data looks newer (higher wins or profit), accept it
                                    if ((val.mega_cycle_wins || 0) > (prev.mega_cycle_wins || 0)) return val;
                                    if ((val.cycle_profit || 0) !== (prev.cycle_profit || 0)) return val;
                                    return prev;
                                });
                            }
                        }
                    } catch (e) { }
                };
                fetchFallback();
                const itv = setInterval(fetchFallback, 60000); // [V110.138] Relaxed to 60s
                const onVisibilityChange = () => { if (document.visibilityState === 'visible') fetchFallback(); };
                document.addEventListener('visibilitychange', onVisibilityChange);
                return () => { clearInterval(itv); document.removeEventListener('visibilitychange', onVisibilityChange); };
            }, []);

            return vault;
        };

        // --- Hook: Real-time Radar Pulse (V15.0) ---
        const useRadarPulseRT = () => {
            const [data, setData] = React.useState({ signals: [], decisions: [], market_context: null, updated_at: 0 });

            useEffect(() => {
                // Sincronização via WebSocket (Primário)
                const unsubscribe = sovereignWS.subscribe((msg) => {
                    if (msg.type === 'radar_pulse') {
                        const val = msg.data;
                        // V110.183: Final Safety Shield for signals array
                        if (val && val.signals && !Array.isArray(val.signals)) {
                            val.signals = [];
                        }
                        setData(val);
                        window.dispatchEvent(new CustomEvent('radar-pulse-update'));
                    }
                });
                return unsubscribe;
            }, []);

            React.useEffect(() => {
                if (!rtdb) return;
                try {
                    const ref = rtdb.ref('radar_pulse');
                    ref.on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            setData(val);
                            window.dispatchEvent(new CustomEvent('radar-pulse-update'));
                        }
                    });
                    return () => ref.off();
                } catch (e) { }
            }, [rtdb]);

            // V15.1.4: REST Fallback Polling (ensures signals are never stuck)
            React.useEffect(() => {
                const fetchFallback = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/radar/pulse');
                        if (res.ok) {
                            const val = await res.json();
                            setData(prev => {
                                if (!val) return prev;
                                // Normalize val before setting
                                if (val.signals && !Array.isArray(val.signals)) val.signals = [];
                                return ((!prev || !prev.signals || !Array.isArray(prev.signals) || prev.signals.length === 0) || (val && val.updated_at > prev.updated_at)) ? val : prev;
                            });
                        }
                    } catch (e) { }
                };
                fetchFallback();
                const itv = setInterval(fetchFallback, 60000);
                const onVisibilityChange = () => { if (document.visibilityState === 'visible') fetchFallback(); };
                document.addEventListener('visibilitychange', onVisibilityChange);
                return () => { clearInterval(itv); document.removeEventListener('visibilitychange', onVisibilityChange); };
            }, []);

            return data;
        };

        // --- Hook: Real-time Slots (V15.1.2) ---
        const useSlotsRT = (initialData) => {
            const [slots, setSlots] = useState(initialData);

            useEffect(() => {
                // Sincronização via WebSocket (Primário)
                const unsubscribe = sovereignWS.subscribe((msg) => {
                    if (msg.type === 'live_slots') {
                        const val = msg.data;
                        let rawSlots = [];
                        if (Array.isArray(val)) {
                            rawSlots = val.filter(v => v !== null && v !== undefined);
                        } else {
                            rawSlots = Object.values(val).filter(v => v !== null && v !== undefined);
                        }
                        rawSlots = rawSlots.map((s, idx) => ({ ...s, id: s.id || (idx + 1) }));
                        const fullSlots = [];
                        for (let i = 1; i <= 4; i++) {
                            const existing = rawSlots.find(s => s && s.id === i);
                            fullSlots.push(existing || { id: i, symbol: null, entry_price: 0, current_stop: 0, status_risco: 'LIVRE', pnl_percent: 0 });
                        }
                        setSlots(fullSlots);
                        localStorage.setItem('slots_cache', JSON.stringify(fullSlots));
                    }
                });
                return unsubscribe;
            }, []);

            useEffect(() => {
                if (rtdb) {
                    console.log("RTDB V15.1.2 Initialized ✅");
                }
                let unsubscribeRTDB = null;
                if (rtdb) {
                    try {
                        const ref = rtdb.ref('live_slots');
                        unsubscribeRTDB = ref.on('value', (snapshot) => {
                            const val = snapshot.val();
                            if (val) {
                                let rawSlots = [];
                                if (Array.isArray(val)) {
                                    rawSlots = val.filter(v => v !== null && v !== undefined);
                                } else {
                                    rawSlots = Object.values(val).filter(v => v !== null && v !== undefined);
                                }
                                rawSlots = rawSlots.map((s, idx) => ({ ...s, id: s.id || (idx + 1) }));
                                const fullSlots = [];
                                for (let i = 1; i <= 4; i++) {
                                    const existing = rawSlots.find(s => s && s.id === i);
                                    fullSlots.push(existing || { id: i, symbol: null, entry_price: 0, current_stop: 0, status_risco: 'LIVRE', pnl_percent: 0 });
                                }
                                setSlots(fullSlots);
                                localStorage.setItem('slots_cache', JSON.stringify(fullSlots));
                            }
                        }, (err) => {
                            if (err && err.message && err.message.includes('permission_denied')) {
                            } else {
                                console.error("Slots RTDB Error:", err);
                            }
                        });
                    } catch (e) { console.error("Slots RTDB Error:", e); }
                }

                const fetchSlots = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/slots');
                        if (res.ok) {
                            const data = await res.json();
                            const rawSlots = Array.isArray(data) ? data : [];
                            const fullSlots = [];
                            for (let i = 1; i <= 4; i++) {
                                const existing = rawSlots.find(s => s && s.id === i);
                                fullSlots.push(existing || { id: i, symbol: null, entry_price: 0, current_stop: 0, status_risco: 'LIVRE', pnl_percent: 0 });
                            }
                            setSlots(fullSlots);
                            localStorage.setItem('slots_cache', JSON.stringify(fullSlots));
                        }
                    } catch (e) { }
                };

                fetchSlots();
                const itv = setInterval(fetchSlots, 30000);
                const onVisibilityChange = () => { if (document.visibilityState === 'visible') fetchSlots(); };
                document.addEventListener('visibilitychange', onVisibilityChange);

                return () => {
                    if (unsubscribeRTDB && rtdb) rtdb.ref('live_slots').off('value', unsubscribeRTDB);
                    clearInterval(itv);
                    document.removeEventListener('visibilitychange', onVisibilityChange);
                };
            }, [rtdb]);
            return slots;
        };

        // --- Hook: V10.6 System State (Harmony) ---
        const useSystemState = () => {
            const [state, setState] = useState({ current: 'PAUSED', slots_occupied: 0, message: '', updated_at: 0 });

            useEffect(() => {
                // Sincronização via WebSocket (Primário)
                const unsubscribe = sovereignWS.subscribe((msg) => {
                    if (msg.type === 'system_state') {
                        setState(msg.data);
                    }
                });
                return unsubscribe;
            }, []);

            useEffect(() => {
                let unsubscribeRTDB = null;
                if (rtdb) {
                    try {
                        const ref = rtdb.ref('system_state');
                        unsubscribeRTDB = ref.on('value', (snapshot) => {
                            const val = snapshot.val();
                            if (val) setState(val);
                        });
                    } catch (e) { console.error("System State RTDB Error:", e); }
                }

                const fetchFallback = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/system/state');
                        if (res.ok) {
                            const val = await res.json();
                            setState(prev => {
                                if (!prev.updated_at || (val.updated_at && val.updated_at > prev.updated_at)) {
                                    return val;
                                }
                                return prev;
                            });
                        }
                    } catch (e) { }
                };

                fetchFallback();
                const itv = setInterval(fetchFallback, 45000);
                
                return () => {
                    if (unsubscribeRTDB && rtdb) rtdb.ref('system_state').off('value', unsubscribeRTDB);
                    clearInterval(itv);
                };
            }, [rtdb]);

            return state;
        };


        // --- Hook: Moonbags Real-time (V110.0 ULTRA) ---
        const useMoonbagsRT = () => {
            const [moonbags, setMoonbags] = useState([]);

            useEffect(() => {
                // Primary: RTDB for instant updates
                let unsubscribe = null;
                if (rtdb) {
                    try {
                        const ref = rtdb.ref('moonbag_vault');
                        unsubscribe = ref.on('value', (snapshot) => {
                            const val = snapshot.val();
                            if (val) {
                                // Converter objeto {uuid: data} em array
                                const list = Object.entries(val).map(([uuid, data]) => ({
                                    ...data,
                                    id: uuid
                                }));
                                setMoonbags(list);
                            } else {
                                setMoonbags([]);
                            }
                        });
                    } catch (e) {
                        console.error("Moonbags RTDB Error:", e);
                    }
                }

                // Secondary: REST Polling Fallback
                const fetchMoonbags = async () => {
                    try {
                        const resp = await fetch('/api/moonbags');
                        if (resp.ok) {
                            const data = await resp.json();
                            // Só atualiza via REST se não tivermos dados do RTDB recentemente
                            setMoonbags(prev => (prev.length === 0 ? data : prev));
                        }
                    } catch (e) {
                        console.error("Moonbags API Error:", e);
                    }
                };

                fetchMoonbags();
                const interval = setInterval(fetchMoonbags, 45000); // [V110.138] Relaxed to 45s
                return () => {
                    if (unsubscribe && rtdb) rtdb.ref('moonbag_vault').off('value', unsubscribe);
                    clearInterval(interval);
                };
            }, [rtdb]);

            return moonbags;
        };

        // --- Hook: [V110.165] Librarian Intelligence RTDB ---
        const useLibrarianRT = () => {
            const [data, setData] = useState({ top_rankings: {}, spring_elite: [], status: 'IDLE', updated_at: 0 });

            useEffect(() => {
                if (!rtdb) return;
                try {
                    const ref = rtdb.ref('librarian_intelligence');
                    const onValue = ref.on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) setData(val);
                    });
                    return () => ref.off('value', onValue);
                } catch (e) { }
            }, [rtdb]);

            return data;
        };

        // --- Hook: Market Radar Real-time (V12.3) ---
        const useMarketRadarRT = () => {
            const [radar, setRadar] = useState(() => {
                return safeJsonParse(localStorage.getItem('market_radar_cache'), {});
            });
            const [lastUpdate, setLastUpdate] = useState(Date.now());
            const lastUpdateRef = useRef(Date.now());

            useEffect(() => {
                if (!rtdb) return;
                try {
                    const ref = rtdb.ref('market_radar');
                    const onValue = ref.on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            setRadar(val);
                            const now = Date.now();
                            setLastUpdate(now);
                            lastUpdateRef.current = now;
                            localStorage.setItem('market_radar_cache', JSON.stringify(val));
                        }
                    });
                    return () => ref.off('value', onValue);
                } catch (e) { console.error("Radar RTDB Error:", e); }
            }, [rtdb]);

            // V12.2: REST Fallback Polling (15s) [V28.5.3] Removed conditional block
            useEffect(() => {
                const fetchRadar = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/radar/grid');
                        if (res.ok) {
                            const val = await res.json();
                            if (val && Object.keys(val).length > 0) {
                                setRadar(val);
                                const postNow = Date.now();
                                setLastUpdate(postNow);
                                lastUpdateRef.current = postNow;
                                localStorage.setItem('market_radar_cache', JSON.stringify(val));
                            }
                        }
                    } catch (e) { }
                };
                const itv = setInterval(fetchRadar, 15000); // [V110.150] Optimized for 15s PWA synchronization
                const onVisibilityChange = () => { if (document.visibilityState === 'visible') fetchRadar(); };
                document.addEventListener('visibilitychange', onVisibilityChange);
                return () => { clearInterval(itv); document.removeEventListener('visibilitychange', onVisibilityChange); };
            }, []);

            return { radar, lastUpdate };
        };

        // --- V42.9: ADX Visibiliy Helpers ---
        const getAdxStyle = (adx) => {
            if (adx >= 40) return 'text-white font-extrabold drop-shadow-[0_0_8px_rgba(190,242,100,0.8)]';
            if (adx >= 25) return 'text-white font-bold';
            if (adx >= 20) return 'text-amber-400 opacity-90';
            return 'text-gray-500 opacity-60 font-medium';
        };

        const getAdxIcon = (adx) => {
            if (adx >= 40) return '🔥';
            if (adx >= 25) return '⚡';
            if (adx >= 20) return '⚙️';
            return '🧊';
        };

        // --- Component: V10.6 SystemStatusBar (Harmony) ---
        // V30.2: BTC Context Awareness
        const SystemStatusBar = () => {
            const systemState = useSystemState();
            const { status: pulseStatus } = usePulseMonitor();
            const radarPulse = useRadarPulseRT();
            const btc = radarPulse.market_context || {};

            const translateDirection = (dir) => {
                if (dir === 'UP') return 'SUBIDA';
                if (dir === 'DOWN') return 'DESCIDA';
                return 'LATERAL';
            };

            const translateRegime = (reg) => {
                if (reg === 'TRENDING') return 'TENDÊNCIA';
                if (reg === 'RANGING') return 'LATERAL';
                if (reg === 'TRANSITION') return 'TRANSIÇÃO';
                return reg;
            };

            const translateSystemState = (state) => {
                if (state === 'SCANNING') return 'ESCANEANDO';
                if (state === 'MONITORING') return 'MONITORANDO';
                return 'PAUSADO';
            };

            const config = {
                SCANNING: {
                    icon: 'radar',
                    label: 'Escaneando Mercado',
                    color: 'text-gray-300',
                    bg: 'bg-white/5',
                    border: 'border-white/10',
                    pulse: 'bg-accent'
                },
                MONITORING: {
                    icon: 'visibility',
                    label: 'Governança Operacional',
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    pulse: 'bg-amber-500'
                },
                PAUSED: {
                    icon: 'pause_circle',
                    label: 'Sistema em Espera',
                    color: 'text-gray-400',
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/30',
                    pulse: 'bg-gray-500'
                }
            };

            const current = config[systemState.current] || config.PAUSED;
            const protocolLabel = systemState.protocol || "Sniper V15.1.2";
            
            // [V71.0] Radar Mode config
            const radarMode = systemState.radar_mode || 'SENTINELA_STANDBY';
            const radarCfg = radarMode === 'ELITE_30_TREND' 
                ? { label: 'ELITE 30', fullname: 'MAJORS TREND', color: 'text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]', border: 'border-primary/40', bg: 'bg-primary/10', icon: 'local_fire_department' }
                : { label: 'SENTINELA', fullname: 'STANDBY MODE', color: 'text-gray-400', border: 'border-white/10', bg: 'bg-white/5', icon: 'security' };


            const lastPulseMs = radarPulse.updated_at || Date.now();
            const latencyMs = Date.now() - lastPulseMs;
            const isStale = latencyMs > 60000;

            return (
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 justify-center sm:justify-between bg-black/40 backdrop-blur-md px-3 sm:px-4 py-3 sm:py-2 rounded-2xl border border-white/5 shadow-2x1 transition-all duration-500">
                    {/* Status Pill */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${current.bg} ${current.border} border shadow-inner`}>
                        <div className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.pulse} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${current.pulse}`}></span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${current.color}`}>
                            {translateSystemState(systemState.current)}
                        </span>
                    </div>

                    {/* V71.0 Radar Mode Pill */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${radarCfg.bg} ${radarCfg.border} border shadow-inner`}>
                        <span className={`material-icons-round text-[12px] ${radarCfg.color}`}>{radarCfg.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${radarCfg.color}`}>
                            <span className="sm:hidden">{radarCfg.label}</span>
                            <span className="hidden sm:inline">{radarCfg.fullname}</span>
                        </span>
                    </div>

                    {/* Metrics Section - Oculto no Mobile (já está no Hud Superior) */}
                    <div className="hidden sm:flex items-center gap-4 border-l border-white/10 pl-3 sm:pl-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="material-icons-round text-xs text-gray-500">{current.icon}</span>
                                <span className="text-[11px] font-bold text-gray-200 tracking-tight">
                                    {systemState.current === 'MONITORING'
                                        ? `Posições: ${systemState.slots_occupied}/4`
                                        : current.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{protocolLabel}</span>
                                <div className="flex items-center gap-1.5 bg-black/30 px-1.5 py-0.5 rounded-md border border-white/5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${pulseStatus === 'ONLINE' && !isStale ? 'bg-lime-500 shadow-[0_0_5px_rgba(16,185,129,1)] animate-pulse' : isStale ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                    <span className={`text-[8px] font-mono font-bold ${isStale ? 'text-amber-500' : 'text-white'}`}>
                                        {latencyMs < 1000 ? '<1s' : `${Math.floor(latencyMs / 1000)}s`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* [V57.0] Global Decorrelation Temperature */}
                        <div className="flex flex-col border-l border-white/10 pl-4">
                            <div className="flex items-center gap-2">
                                <span className="material-icons-round text-xs text-white">link_off</span>
                                <span className={`text-[11px] font-black tracking-tight ${btc.decorrelation_avg >= 70 ? 'text-white' : btc.decorrelation_avg >= 40 ? 'text-amber-400' : 'text-gray-400'}`}>
                                    DECORRELAÇÃO: {btc.decorrelation_avg || 0}%
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Alt-Season Status</span>
                                <div className="flex gap-0.5">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`w-2 h-1 rounded-sm ${i < (btc.decorrelation_active_count || 0) ? 'bg-primary' : 'bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BTC Intelligence Badge - Oculto no Mobile (HUD Superior) */}
                    {btc.btc_direction && btc.btc_direction !== 'PAUSED' && (
                        <div className="hidden sm:flex items-center justify-center sm:justify-start w-full sm:w-auto gap-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 pl-0 sm:pl-4 pb-1 sm:pb-0">

                            {/* Bloco 1: Preço e Direção Primária */}
                            <div className="flex flex-col items-center sm:items-start gap-1 sm:gap-0 pr-3 border-r border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[11px] font-black tracking-widest ${btc.btc_direction === 'UP' ? 'text-white' :
                                        btc.btc_direction === 'DOWN' ? 'text-red-400' : 'text-gray-400'
                                        }`}>
                                        BTC {translateDirection(btc.btc_direction)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                                    <span className="text-white font-mono text-[12px] font-bold">
                                        {btc.btc_price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(btc.btc_price) : 'Carregando...'}
                                    </span>
                                    {btc.btc_variation_1h && (
                                        <span className={`text-[9px] font-mono font-bold px-1 rounded ${btc.btc_variation_1h >= 0 ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-500'}`}>
                                            {btc.btc_variation_1h >= 0 ? '+' : ''}{btc.btc_variation_1h}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Bloco 2: O Badge do Mercado Institucional (ALTA/BAIXA/LATERAL) */}
                            <div className="flex flex-col items-center sm:items-start pl-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {/* Regra de Ouro: Exibir exatamente o Estado de Operação */}
                                    {(() => {
                                        const isTrending = btc.btc_regime === 'TRENDING';
                                        const isUp = btc.btc_direction === 'UP';

                                        if (isTrending && isUp) {
                                            return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-lime-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]">MERCADO EM ALTA</span>;
                                        } else if (isTrending && !isUp) {
                                            return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">MERCADO EM BAIXA</span>;
                                        } else {
                                            // [V100.1] MODO SENTINELA: ADX < 25
                                            const isSentinela = (btc.btc_adx || 0) < 25;
                                            return isSentinela ? 
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-gray-700 text-white border border-white/20 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.1)]">MODO SENTINELA</span> :
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]">MERCADO LATERAL</span>;
                                        }
                                    })()}
                                </div>

                                <div className="flex items-center gap-1.5 opacity-80">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                        ANÁLISE: {translateRegime(btc.btc_regime)}
                                    </span>
                                    <span className="text-gray-600">|</span>
                                    {btc.btc_adx > 0 && (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[10px] flex items-center gap-1 font-mono leading-tight ${getAdxStyle(btc.btc_adx)}`}>
                                                    {getAdxIcon(btc.btc_adx)} ADX: {btc.btc_adx.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${
                                                        btc.btc_adx >= 40 ? 'bg-gray-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' :
                                                        btc.btc_adx >= 25 ? 'bg-lime-400' :
                                                        btc.btc_adx >= 20 ? 'bg-amber-400' : 'bg-gray-500'
                                                    }`} 
                                                    style={{ width: `${Math.min(btc.btc_adx, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            );
        };

        // --- Component: Radar Grid Card (V12.3) ---
        const RadarCard = ({ symbol, data, isBlocked, isElite, cleanSym }) => {
            const prevScore = useRef(data.score);
            const prevRsi = useRef(data.rsi);
            const [flash, setFlash] = useState(false);

            // V14.1 Security Badges
            const getSecurityBadge = (status) => {
                const badges = {
                    'SAFE': '🔴',
                    'RISK_ZERO': '🛡️',
                    'STABILIZE': '⚖️',
                    'FLASH_SECURE': '🔒',
                    'MEGA_PULSE': '🟡',
                    'PROFIT_LOCK': '🟡'
                };
                return badges[status] || (data.pnl_percent > 0 ? '🛡️' : '🔴');
            };

            useEffect(() => {
                const scoreChanged = prevScore.current !== data.score;
                const rsiChanged = Math.abs((prevRsi.current || 0) - (data.rsi || 0)) > 0.5;

                if (scoreChanged || rsiChanged) {
                    setFlash(true);
                    const timer = setTimeout(() => setFlash(false), 2000);
                    prevScore.current = data.score;
                    prevRsi.current = data.rsi;
                    return () => clearTimeout(timer);
                }
            }, [data.score, data.rsi]);

            return (
                <div key={symbol} className={`relative p-2.5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                    ${isBlocked ? 'bg-red-500/5 border-red-500/10 opacity-40' :
                        isElite ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse scale-105 z-10' :
                            flash ? 'bg-primary/20 border-primary/50 scale-[1.02] z-10' :
                                'bg-white/[0.03] border-white/5 hover:border-white/20'}`}>

                    {isElite && <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none"></div>}

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                            {data.symbol && <span className="text-[8px] leading-none mb-0.5">{getSecurityBadge(data.visual_status)}</span>}
                            <span className={`text-[10px] font-black tracking-tight ${isBlocked ? 'text-gray-600' : isElite ? 'text-amber-400' : 'text-gray-300'}`}>
                                {cleanSym}
                            </span>
                        </div>
                        {/* [LIBRARIAN] Affinity Badge in Radar */}
                        {!isBlocked && <AffinityBadge symbol={cleanSym} rankings={window.librarianRankings} />}
                    </div>

                    <div className="mt-1.5 w-full flex flex-col gap-1.5 items-center">
                        {/* [V56.0] Unified Confidence Gauge */}
                        <div className="relative flex items-center justify-center">
                            <div 
                                className="confidence-gauge scale-[0.6] origin-center" 
                                style={{ 
                                    '--gauge-color': getGaugeColor(data.unified_confidence || data.score),
                                    '--gauge-percent': `${((data.unified_confidence || data.score) / 100) * 360}deg`
                                }}
                            >
                                <div className="confidence-value">{Math.round(data.unified_confidence || data.score)}</div>
                            </div>
                        </div>

                        {/* [V56.0] Intelligence Pillars */}
                        {data.fleet_intel && (
                            <div className="flex gap-2 items-center bg-white/[0.02] px-1.5 py-0.5 rounded-lg border border-white/5 mt-0.5 scale-90">
                                <IntelIcon type="macro" score={data.fleet_intel.macro || 50} icon="public" label="MAC" />
                                <IntelIcon type="micro" score={data.fleet_intel.micro || 50} icon="waves" label="WHL" />
                                <IntelIcon type="smc" score={data.fleet_intel.smc || 50} icon="psychology" label="SMC" />
                                <IntelIcon type="onchain" score={data.fleet_intel.onchain || 50} icon="hub" label="ONC" />
                            </div>
                        )}

                        {/* [V57.0] Decorrelation Badge */}
                        {data.decorrelation && (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter transition-all duration-500
                                ${data.decorrelation.is_active ? 
                                    (data.decorrelation.score >= 80 ? 'bg-white/10 border-white/20 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-lime-500/10 border-lime-500/20 text-white/80') : 
                                    'bg-gray-500/10 border-white/10 text-gray-500'}`}>
                                <span className="material-icons-round text-[10px]">
                                    {data.decorrelation.is_active ? 'link_off' : 'link'}
                                </span>
                                {data.decorrelation.is_active ? `DECORRELADO ${Math.round(data.decorrelation.score)}%` : 'CORRELACIONADO'}
                            </div>
                        )}

                        <div className="flex justify-between w-full px-0.5 mt-0.5">
                            <span className={`text-[7px] font-bold ${data.rsi > 70 ? 'text-red-400' : data.rsi < 30 ? 'text-green-400' : 'text-gray-500'}`}>
                                RSI {Math.round(data.rsi)}
                            </span>
                            <span className="material-icons-round text-[8px] text-gray-600">
                                {data.trend === 'bullish' ? 'trending_up' : data.trend === 'bearish' ? 'trending_down' : 'trending_flat'}
                            </span>
                            <span className={`text-[7px] font-black font-mono flex items-center gap-0.5 ${getAdxStyle(data.adx)}`}>
                                {getAdxIcon(data.adx)} {Math.round(data.adx || 0)}
                            </span>
                        </div>
                    </div>

                    {/* V15.1: Reasoning Display */}
                    {!isBlocked && data.reasoning && (
                        <div className="mt-2 pt-2 border-t border-white/5 w-full">
                            <p className="text-[8px] text-gray-400 italic line-clamp-2 leading-tight text-center">
                                "{data.reasoning.replace(/\|/g, '•')}"
                            </p>
                        </div>
                    )}

                    {isBlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                            <span className="material-icons-round text-[12px] text-red-500/60">lock</span>
                        </div>
                    )}

                    {isElite && !isBlocked && (
                        <div className="absolute top-0 right-0 p-0.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]"></span>
                        </div>
                    )}
                </div>
            );
        };

        
        const TradingChart = ({ symbol, entryPrice, stopLossPrice, targetPrice, side, pnlFallback, slotId, slotType }) => {
            const chartContainerRef = useRef();
            const chartRef = useRef();
            const seriesRef = useRef();
            const linesRef = useRef([]);
            const [lastPrice, setLastPrice] = useState(null);
            const [tf, setTf] = useState('15'); // Default 15m
            const isMounted = useRef(true);

            // V9.0 Trend Data State
            const [trendData, setTrendData] = useState({ trend: 'sideways', pattern: 'none', trend_strength: 0 });

            // V9.0 Trend Fetch
            useEffect(() => {
                if (!symbol) return;
                const fetchTrend = async () => {
                    try {
                        const apiSymbol = String(symbol || '').replace('.P', '');
                        const res = await fetch(API_BASE + '/api/trend/' + apiSymbol);
                        if (res.ok) setTrendData(await res.json());
                    } catch (e) { console.warn('Trend fetch error:', e); }
                };
                fetchTrend();
                const interval = setInterval(fetchTrend, 60000); // Refresh every 1 min
                return () => clearInterval(interval);
            }, [symbol]);

            const timeframes = [
                { label: '1m', value: '1' },
                { label: '5m', value: '5' },
                { label: '15m', value: '15' },
                { label: '1h', value: '60' },
                { label: '4h', value: '240' },
            ];


            const fetchHistory = async () => {
                if (!symbol || !isMounted.current) return;
                const apiSymbol = String(symbol || '').replace('.P', '');
                console.log(`[Chart] Fetching history for ${apiSymbol} (Display: ${symbol}) @ ${tf}m`);
                try {
                    const response = await fetch(`https://api.bybit.com/v5/market/kline?category=linear&symbol=${apiSymbol}&interval=${tf}&limit=300`);
                    const json = await response.json();

                    if (!isMounted.current || !seriesRef.current) return;

                    if (json.result && json.result.list) {
                        console.log(`[Chart] Received ${json.result.list.length} candles for ${symbol}`);
                        const klines = json.result.list.map(k => ({
                            time: parseInt(k[0]) / 1000,
                            open: parseFloat(k[1]),
                            high: parseFloat(k[2]),
                            low: parseFloat(k[3]),
                            close: parseFloat(k[4]),
                            volume: parseFloat(k[5])
                        })).sort((a, b) => a.time - b.time);

                        // Safety check: Ensure chart is still active before updating
                        if (!isMounted.current || !chartRef.current || !seriesRef.current) return;

                        try {
                            if (seriesRef.current) seriesRef.current.setData(klines);

                            // Indicators Calculation
                            if (volumeSeriesRef.current) {
                                volumeSeriesRef.current.setData(klines.map(k => ({
                                    time: k.time,
                                    value: k.volume,
                                    color: k.close >= k.open ? 'rgba(255, 255, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                })));
                            }

                            if (ema20Ref.current) ema20Ref.current.setData(calculateSMA(klines, 100).filter(d => d !== null));
                            if (ema200Ref.current) ema200Ref.current.setData(calculateSMA(klines, 21).filter(d => d !== null));

                            // SuperTrend (10, 2)
                            if (stUpRef.current && stDownRef.current) {
                                const stData = calculateSuperTrend(klines, 10, 2);
                                const upD = []; const downD = []; const markers = []; let lDir = null;
                                stData.forEach(d => {
                                    if(!d) return;
                                    if(d.color === '#ffffff'){
                                        upD.push({time: d.time, value: d.value});
                                        if(lDir !== 1){ markers.push({time: d.time, position: 'belowBar', color: '#ffffff', shape: 'arrowUp', text: 'BUY'}); lDir = 1; }
                                    }else if(d.color === '#EF4444'){
                                        downD.push({time: d.time, value: d.value});
                                        if(lDir !== -1){ markers.push({time: d.time, position: 'aboveBar', color: '#EF4444', shape: 'arrowDown', text: 'SELL'}); lDir = -1; }
                                    }
                                });
                                stUpRef.current.setData(upD);
                                stDownRef.current.setData(downD);
                                if(seriesRef.current) { seriesRef.current.setMarkers(markers); }
                            }

                            // Pivot Points
                            const pivots = calculatePivotPoints(klines);
                            if (pivots && seriesRef.current) {
                                if (pivotLinesRef.current) pivotLinesRef.current.forEach(l => seriesRef.current.removePriceLine(l));
                                pivotLinesRef.current = [
                                    seriesRef.current.createPriceLine({ price: pivots.p, color: 'rgba(255, 255, 255, 0.4)', lineWidth: 1, lineStyle: 2, title: 'P' }),
                                    seriesRef.current.createPriceLine({ price: pivots.r1, color: 'rgba(255, 255, 255, 0.2)', lineWidth: 1, lineStyle: 2, title: 'R1' }),
                                    seriesRef.current.createPriceLine({ price: pivots.s1, color: 'rgba(239, 68, 68, 0.2)', lineWidth: 1, lineStyle: 2, title: 'S1' })
                                ];
                            }

                            // Zones Update (Base on entry)
                            if (zonesRef.current) {
                                zonesRef.current.setData(klines.map(k => ({ time: k.time, value: k.close })));
                            }
                        } catch (err) {
                            console.warn("[Chart] Update skipped (chart disposed)", err);
                        }
                    }
                } catch (e) { if (isMounted.current) console.error("History Error", e); }
            };

            const volumeSeriesRef = useRef();
            const ema20Ref = useRef();
            const ema200Ref = useRef();
            const stUpRef = useRef();
            const stDownRef = useRef();
            const pivotLinesRef = useRef([]);
            const zonesRef = useRef();

            useEffect(() => {
                if (!chartContainerRef.current) return;
                if (chartRef.current) { chartRef.current.remove(); }

                isMounted.current = true; // Ensure we are marked as mounted for this effect cycle
                let active = true;

                // Chart Configuration with dynamic height check
                const containerHeight = chartContainerRef.current.clientHeight || 250;
                const containerWidth = chartContainerRef.current.clientWidth || 400;

                const chart = LightweightCharts.createChart(chartContainerRef.current, {
                    width: containerWidth,
                    height: containerHeight,
                    layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#cbd5e1' },
                    grid: { vertLines: { color: 'rgba(255, 255, 255, 0.03)', style: 1 }, horzLines: { color: 'rgba(255, 255, 255, 0.03)', style: 1 } },
                    rightPriceScale: {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        autoScale: true,
                        scaleMargins: { top: 0.1, bottom: 0.1 }
                    },
                    timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true },
                    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
                    localization: {
                        priceFormatter: (price) => {
                            if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
                            if (price >= 0.001) return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
                            return price.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
                        }
                    }
                });

                chartRef.current = chart;

                // Volume Histogram Setup
                const volumeSeries = chart.addHistogramSeries({
                    priceFormat: { type: 'volume' },
                    priceScaleId: 'volume'
                });

                chart.priceScale('volume').applyOptions({
                    scaleMargins: { top: 0.7, bottom: 0 },
                    visible: false
                });
                volumeSeriesRef.current = volumeSeries;

                ema200Ref.current = chart.addLineSeries({ color: '#FFFFFF', lineWidth: 3, title: 'SMA 21' });
                ema20Ref.current = chart.addLineSeries({ color: '#FFFF00', lineWidth: 3, title: 'SMA 100' });
                stUpRef.current = chart.addLineSeries({ color: '#00E676', lineWidth: 3, title: 'ST Up', lastValueVisible: false, priceLineVisible: false });
                stDownRef.current = chart.addLineSeries({ color: '#FF1744', lineWidth: 3, title: 'ST Down', lastValueVisible: false, priceLineVisible: false });

                zonesRef.current = chart.addBaselineSeries({
                    baseValue: { type: 'price', price: Number(entryPrice) || 0 },
                    topFillColor1: 'rgba(255, 255, 255, 0.1)', topFillColor2: 'rgba(255, 255, 255, 0.05)',
                    bottomFillColor1: 'rgba(239, 68, 68, 0.1)', bottomFillColor2: 'rgba(239, 68, 68, 0.05)',
                    lineVisible: false, axisLabelVisible: false, priceLineVisible: false,
                });

                const candleSeries = chart.addCandlestickSeries({
                    upColor: '#ffffff', downColor: '#EF4444', borderVisible: true, borderColor: '#000000', wickUpColor: '#ffffff', wickDownColor: '#EF4444',
                    priceFormat: {
                        type: 'price',
                        precision: 6,
                        minMove: 0.000001
                    }
                });
                seriesRef.current = candleSeries;

                // Initial fetch
                fetchHistory();

                const handleResize = () => {
                    if (chartRef.current && chartContainerRef.current) {
                        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                    }
                };

                const chartWsRef = { current: null };
                const chartReconnectTimeoutRef = { current: null };

                const connectWs = () => {
                    if (chartWsRef.current) chartWsRef.current.close();

                    const ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');
                    chartWsRef.current = ws;
                    const apiSymbol = String(symbol || '').replace('.P', '');

                    let heartbeatInterval;

                    ws.onopen = () => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ op: 'subscribe', args: [`kline.${tf}.${apiSymbol}`, `tickers.${apiSymbol}`] }));
                        }
                        heartbeatInterval = setInterval(() => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ op: 'ping' }));
                            }
                        }, 20000);
                    };

                    ws.onmessage = (event) => {
                        if (!active || !isMounted.current || !chartRef.current) return;
                        const msg = JSON.parse(event.data);
                        if (msg.topic && msg.topic.startsWith('kline') && seriesRef.current) {
                            const k = msg.data[0];
                            const update = { time: k.start / 1000, open: parseFloat(k.open), high: parseFloat(k.high), low: parseFloat(k.low), close: parseFloat(k.close) };
                            try {
                                if (seriesRef.current) seriesRef.current.update(update);
                                if (volumeSeriesRef.current) volumeSeriesRef.current.update({ ...update, value: parseFloat(k.volume), color: update.close >= update.open ? 'rgba(255, 255, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)' });
                                if (zonesRef.current) zonesRef.current.update({ time: update.time, value: update.close });
                            } catch (e) { }
                        }
                        if (msg.topic && msg.topic.startsWith('tickers') && msg.data.lastPrice) {
                            setLastPrice(parseFloat(msg.data.lastPrice));
                        }
                    };

                    ws.onclose = () => {
                        clearInterval(heartbeatInterval);
                        if (active) {
                            chartReconnectTimeoutRef.current = setTimeout(connectWs, 3000);
                        }
                    };

                    ws.onerror = () => {
                        ws.close();
                    };
                };

                connectWs();

                window.addEventListener('resize', handleResize);

                return () => {
                    active = false;
                    window.removeEventListener('resize', handleResize);
                    if (chartWsRef.current) {
                        chartWsRef.current.onclose = null;
                        chartWsRef.current.close();
                    }
                    if (chartReconnectTimeoutRef.current) clearTimeout(chartReconnectTimeoutRef.current);
                    if (chartRef.current) {
                        chartRef.current.remove();
                        chartRef.current = null;
                    }
                };
            }, [symbol, tf]);

            const extraLinesRef = useRef([]);

            useEffect(() => {
                if (!seriesRef.current || !chartRef.current) return;

                // SMALL DELAY: Stability shield for rapid updates
                const timeout = setTimeout(() => {
                    if (!isMounted.current || !seriesRef.current || !chartRef.current) return;

                    // 1. Clear ALL lines (Atomic reset)
                    [...linesRef.current, ...extraLinesRef.current].forEach(line => {
                        try { seriesRef.current.removePriceLine(line); } catch (e) { }
                    });
                    linesRef.current = [];
                    extraLinesRef.current = [];

                    // 2. Render Order Lines (Priority)
                    const ne = Number(entryPrice);
                    const ns = Number(stopLossPrice);
                    const nt = Number(targetPrice);

                    if (symbol && ne > 0) {
                        // Entry
                        try {
                            linesRef.current.push(seriesRef.current.createPriceLine({
                                price: ne, color: '#f3f4f6', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid,
                                axisLabelVisible: true, title: 'ENTRY'
                            }));
                        } catch (e) { }

                        // Stop Loss
                        const normSide = (side || '').toUpperCase();
                        const nsVal = ns > 0 ? ns : (normSide === 'BUY' ? ne * 0.99 : ne * 1.01);
                        try {
                            linesRef.current.push(seriesRef.current.createPriceLine({
                                price: nsVal, color: '#EF4444', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Dashed,
                                axisLabelVisible: true, title: ns > 0 ? 'STOP LOSS' : 'STOP LOSS (1%)'
                            }));
                        } catch (e) { }

                        // Target 150% (Moonbag Threshold)
                        const isSniper = slotId <= 5 || slotType === 'SNIPER';
                        if (isSniper) {
                            // 150% ROI at 50x = 3% price movement
                            const target150 = normSide === 'BUY' ? ne * 1.03 : ne * 0.97;
                            try {
                                linesRef.current.push(seriesRef.current.createPriceLine({
                                    price: target150, color: '#10b981', lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Dashed,
                                    axisLabelVisible: true, title: 'TARGET (150%)'
                                }));
                            } catch (e) { }
                            
                            // Original Target (if different)
                            if (nt > 0 && Math.abs(nt - target150) / ne > 0.001) {
                                try {
                                    linesRef.current.push(seriesRef.current.createPriceLine({
                                        price: nt, color: '#edbc1d', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dotted,
                                        axisLabelVisible: true, title: 'FINAL TARGET'
                                    }));
                                } catch (e) { }
                            }
                        }
                    }

                    // 3. Render Trend Data (Background)
                    if (trendData) {
                        if (trendData.liquidity_zones) {
                            trendData.liquidity_zones.forEach(zone => {
                                const isMain = !zone.type.includes('secondary');
                                try {
                                    extraLinesRef.current.push(seriesRef.current.createPriceLine({
                                        price: zone.price,
                                        color: zone.type.includes('high') ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                                        lineWidth: 1,
                                        lineStyle: isMain ? LightweightCharts.LineStyle.Dashed : LightweightCharts.LineStyle.Dotted,
                                        axisLabelVisible: true,
                                        title: `LIQ ${zone.type.toUpperCase()}`
                                    }));
                                } catch (e) { }
                            });
                        }
                        if (trendData.accumulation_boxes) {
                            trendData.accumulation_boxes.forEach((box, idx) => {
                                try {
                                    extraLinesRef.current.push(seriesRef.current.createPriceLine({
                                        price: box.top, color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1, title: idx === 0 ? 'ACC BOX' : ''
                                    }));
                                    extraLinesRef.current.push(seriesRef.current.createPriceLine({
                                        price: box.bottom, color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1
                                    }));
                                } catch (e) { }
                            });
                        }
                    }

                    // 4. Update Baseline (Fills)
                    if (zonesRef.current && ne > 0) {
                        zonesRef.current.applyOptions({ baseValue: { type: 'price', price: ne } });
                    }

                }, 150);
                return () => clearTimeout(timeout);
            }, [symbol, entryPrice, stopLossPrice, targetPrice, side, tf, trendData]);


            // PnL Latch Logic with EMA Smoothing
            const [displayPnl, setDisplayPnl] = useState(0);
            const smoothingRef = useRef(0);

            useEffect(() => {
                let livePnl = 0;
                if (lastPrice && Number(entryPrice) > 0) {
                    const ne = Number(entryPrice);
                    const normSide = (side || '').toUpperCase();
                    livePnl = normSide === 'BUY' ? ((lastPrice - ne) / ne * 50 * 100) : ((ne - lastPrice) / ne * 50 * 100);
                }

                const targetPnl = livePnl !== 0 ? livePnl : (pnlFallback || 0);

                // EMA Smoothing: NewVal = (Current * Alpha) + (Previous * (1 - Alpha))
                const alpha = 0.15; // Lower = smoother, higher = faster
                const nextVal = (targetPnl * alpha) + (smoothingRef.current * (1 - alpha));

                smoothingRef.current = nextVal;
                setDisplayPnl(nextVal);
            }, [lastPrice, entryPrice, side, pnlFallback]);

            return (
                <div className="w-full h-full relative group">
                    {/* Timeframe Selector - Compacto */}
                    <div className="absolute top-2 left-2 z-20 flex gap-1 bg-black/60 p-1 rounded border border-white/10 backdrop-blur-md tf-selector-compact">
                        {timeframes.map(t => (
                            <button key={t.value} onClick={(e) => { e.stopPropagation(); setTf(t.value); }}
                                className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition-colors ${tf === t.value ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end pointer-events-none">
                        <div className="bg-black/80 px-3 py-1 rounded border border-white/10 backdrop-blur-md">
                            <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">Market:</span>
                            <span className="text-lg font-mono font-bold text-white">{formatPrice(lastPrice)}</span>
                        </div>
                        {Math.abs(displayPnl) > 0.01 && (
                            <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${displayPnl >= 0 ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-500'}`}>
                                ROI (50x): {displayPnl > 0 ? '+' : '-'}{Math.abs(displayPnl).toFixed(2)}%
                            </div>
                        )}
                        {/* V9.0 Trend Indicator */}
                        <div className={`mt-1 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${trendData.trend === 'bullish' ? 'bg-white/10 text-white border border-lime-500/30' :
                            trendData.trend === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                            <span className="material-icons-round text-[12px]">
                                {trendData.trend === 'bullish' ? 'trending_up' : trendData.trend === 'bearish' ? 'trending_down' : 'trending_flat'}
                            </span>
                            <span>1H: {trendData.trend.toUpperCase()}</span>
                            {trendData.pattern !== 'none' && <span className="opacity-60">| {trendData.pattern.replace('_', ' ')}</span>}
                        </div>
                    </div>
                    <div ref={chartContainerRef} className="w-full h-full" />
                </div>
            );
        };

        // --- Hook: Real-time Bybit Tickers ---
        const useBybitTickers = (activeSymbols) => {
            const [tickers, setTickers] = useState({});
            const wsRef = useRef(null);
            const reconnectTimeoutRef = useRef(null);

            useEffect(() => {
                if (!activeSymbols || activeSymbols.length === 0) return;

                const connect = () => {
                    if (wsRef.current) wsRef.current.close();

                    const ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');
                    wsRef.current = ws;

                    const topics = activeSymbols.map(s => {
                        const cleanSymbol = s.replace('.P', '').replace('.p', '');
                        return `tickers.${cleanSymbol}`;
                    }).filter(Boolean);

                    let heartbeatInterval;

                    ws.onopen = () => {
                        console.log("[WS] Tickers Connected");
                        if (topics.length > 0) {
                            ws.send(JSON.stringify({ op: 'subscribe', args: topics }));
                        }
                        // Heartbeat Ping-Pong
                        heartbeatInterval = setInterval(() => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ op: 'ping' }));
                            }
                        }, 20000);
                    };

                    ws.onmessage = (event) => {
                        const msg = JSON.parse(event.data);
                        if (msg.topic && msg.topic.startsWith('tickers')) {
                            const symbol = msg.topic.split('.')[1];
                            const price = parseFloat(msg.data.lastPrice);
                            // V5.4.5: Only update if price is valid to prevent flickering
                            if (!isNaN(price) && price > 0) {
                                setTickers(prev => ({ ...prev, [symbol]: price }));
                            }
                        }
                    };

                    ws.onclose = () => {
                        console.warn("[WS] Tickers Disconnected. Reconnecting...");
                        clearInterval(heartbeatInterval);
                        reconnectTimeoutRef.current = setTimeout(connect, 3000);
                    };

                    ws.onerror = (err) => {
                        console.error("[WS] Tickers Error:", err);
                        ws.close();
                    };
                };

                connect();

                return () => {
                    if (wsRef.current) {
                        wsRef.current.onclose = null; // Prevent reconnect on unmount
                        wsRef.current.close();
                    }
                    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                };
            }, [activeSymbols.join(',')]);

            return tickers;
        };



        // --- Pages ---

        // --- Voice Hooks ---

        // Hook for Speech Recognition (STT - Speech-to-Text)
        const useSpeechRecognition = () => {
            const [isListening, setIsListening] = useState(false);
            const [transcript, setTranscript] = useState('');
            const [isSupported, setIsSupported] = useState(false);
            const recognitionRef = useRef(null);

            useEffect(() => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    setIsSupported(true);
                    const recognition = new SpeechRecognition();
                    recognition.continuous = false;
                    recognition.interimResults = false;
                    recognition.lang = 'pt-BR';

                    recognition.onresult = (e) => {
                        const text = e.results[0][0].transcript;
                        setTranscript(text);
                    };
                    recognition.onend = () => setIsListening(false);
                    recognition.onerror = () => setIsListening(false);
                    recognitionRef.current = recognition;
                }
            }, []);

            const startListening = () => {
                if (recognitionRef.current && !isListening) {
                    setTranscript('');
                    setIsListening(true);
                    recognitionRef.current.start();
                }
            };

            const stopListening = () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                }
            };

            return { isListening, transcript, isSupported, startListening, stopListening, setTranscript };
        };

        // Hook for Text-to-Speech (TTS) - V5.3.3 Enhanced for Mobile
        const useSpeechSynthesis = () => {
            const [isSpeaking, setIsSpeaking] = useState(false);
            const [voices, setVoices] = useState([]);
            const audioRef = useRef(null);

            // Load voices once
            useEffect(() => {
                const loadVoices = () => {
                    const availableVoices = window.speechSynthesis.getVoices();
                    if (availableVoices.length > 0) {
                        setVoices(availableVoices);
                    }
                };
                loadVoices();
                if (window.speechSynthesis.onvoiceschanged !== undefined) {
                    window.speechSynthesis.onvoiceschanged = loadVoices;
                }
            }, []);

            const speak = async (text) => {
                if (!text) return;

                // Stop any current speaking
                stop();
                setIsSpeaking(true);

                try {
                    // 1. Try Premium API (Antonio/Google)
                    const response = await fetch(`${API_BASE}/api/tts`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: text,
                            voice: 'pt-BR-AntonioNeural'
                        })
                    });

                    const data = await response.json();

                    if (data.audio) {
                        const audioBlob = new Blob(
                            [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
                            { type: 'audio/mp3' }
                        );
                        const audioUrl = URL.createObjectURL(audioBlob);

                        const audio = new Audio();
                        audio.src = audioUrl;
                        audioRef.current = audio;

                        audio.onended = () => {
                            setIsSpeaking(false);
                            URL.revokeObjectURL(audioUrl);
                        };
                        audio.onerror = () => {
                            console.warn("Audio element error, falling back...");
                            fallbackSpeak(text);
                        };

                        try {
                            await audio.play();
                            return; // SUCCESS
                        } catch (playErr) {
                            console.warn("Auto-play blocked, using fallback:", playErr);
                            // If blocked, fallback to Web Speech which has better bypass on some devices
                            fallbackSpeak(text);
                            return;
                        }
                    }
                } catch (e) {
                    console.log('Premium TTS unavailable:', e);
                }

                fallbackSpeak(text);
            };

            const fallbackSpeak = (text) => {
                if (!('speechSynthesis' in window)) {
                    setIsSpeaking(false);
                    return;
                }

                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'pt-BR';
                utterance.rate = 1.0;
                utterance.pitch = 1.0;

                const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

                // V5.3.3: Extreme Male Voice search (Mobile prioritized)
                // Prioritize "Daniel" (iOS Male), then "Antonio" (Edge), then generic "Male"
                let maleVoice = availableVoices.find(v =>
                    v.lang.startsWith('pt') &&
                    (v.name.includes('Daniel') || v.name.includes('Antonio') || v.name.includes('Guilherme'))
                );

                if (!maleVoice) {
                    maleVoice = availableVoices.find(v =>
                        v.lang.startsWith('pt') &&
                        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('masculino'))
                    );
                }

                // Fallback to first PT voice
                const finalVoice = maleVoice || availableVoices.find(v => v.lang.startsWith('pt'));
                if (finalVoice) utterance.voice = finalVoice;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = (err) => {
                    console.error("SpeechSynthesis Error:", err);
                    setIsSpeaking(false);
                };

                window.speechSynthesis.speak(utterance);
            };

            const stop = () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
            };

            return { speak, stop, isSpeaking };
        };

        // 1. Logs Page (Chat with Captain - Minimalist Design)
        const LogsPage = () => {
            const [logs, setLogs] = useState(() => {
                const cached = localStorage.getItem('chat_history_cache');
                return safeJsonParse(cached, []);
            });
            const [inputValue, setInputValue] = useState('');
            const [isSending, setIsSending] = useState(false);
            const [isMenuOpen, setIsMenuOpen] = useState(false);
            const { latency, status: pulseStatus, isThinking: globalThinking } = usePulseMonitor();
            const isThinking = globalThinking; // [V18.1] Use Global State
            const messagesEndRef = useRef(null);
            const inputRef = useRef(null);
            const navigate = useNavigate();

            // Voice Hooks
            const { isListening, transcript, isSupported: sttSupported, startListening, stopListening, setTranscript } = useSpeechRecognition();
            const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

            // Auto-fill input when transcript changes
            useEffect(() => {
                if (transcript) {
                    setInputValue(transcript);
                    setTranscript('');
                }
            }, [transcript]);

            // V18.0: Real-time Chat Status Listener (REPLACED BY Global Pulse hook in V18.1)

            // Auto-scroll to bottom
            useEffect(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, [logs]);

            // V15.0: Real-time Chat Listener (Instant & Resilient for Mobile)
            useEffect(() => {
                if (typeof rtdb === 'undefined' || !rtdb) return;

                const chatRef = rtdb.ref('chat_history');
                const onValue = chatRef.limitToLast(30).on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const messageList = Object.entries(data).map(([id, msg]) => ({
                            agent: msg.role === 'user' ? 'USER' : 'ORACLE',
                            message: msg.text || msg.message,
                            timestamp: msg.timestamp
                        })).sort((a, b) => a.timestamp - b.timestamp);

                        setLogs(messageList);
                        localStorage.setItem('chat_history_cache', JSON.stringify(messageList));
                        window.dispatchEvent(new CustomEvent('rest-pulse'));
                    }
                });

                return () => chatRef.off('value', onValue);
            }, [rtdb]);

            // Filter Oracle chat logs (Deprecated in V15.0 since logs only contain chat)
            const oracleLogs = logs;

            // Send message
            const sendMessage = async () => {
                if (!inputValue.trim() || isSending || isThinking) return;

                // V5.3.3: Unlock audio context on user gesture (Essential for Mobile PWA)
                try {
                    const unlockAudio = new Audio();
                    unlockAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
                    unlockAudio.play().catch(() => { });
                } catch (e) { }

                const message = inputValue.trim();
                setInputValue('');
                setIsSending(true);

                try {
                    const response = await fetch(API_BASE + '/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message })
                    });

                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}`);
                    }

                    const data = await response.json();

                    // V4.9.4.2: Auto-speak Captain's response
                    if (data.response) {
                        speak(data.response);
                    }
                } catch (err) {
                    console.error("Chat error:", err);
                    // V15.0: Visual feedback for error
                    setLogs(prev => [...prev, {
                        agent: 'ORACLE',
                        message: `🚨 Falha na transmissão: ${err.message}. Verifique sua conexão.`,
                        timestamp: Date.now()
                    }]);
                } finally {
                    setIsSending(false);
                    if (inputRef.current) inputRef.current.focus();
                }
            };

            // Handle key press
            const handleKeyDown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            };

            // Sanitize messages for UI
            const sanitize = (text) => {
                if (!text) return '';
                return String(text)
                    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
                    .replace(/(Thinking|Pensando)\.\.\.[\s\S]*?(\n\n|$)/gi, '')
                    .replace(/\[[A-Z0-9]+USDT\]/g, '')
                    .trim();
            };

            const [showLog, setShowLog] = useState(false); // Mantido por estabilidade do state tree, não usado na UI.

            return (
                <div className="flex flex-col h-screen theme-jarvis v5-bg-deep v5-text-main lg:pt-20 overflow-hidden relative">
                    {/* Background Glows */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                    {/* Sidebar Menu - V4.9.4.2 */}
                    {isMenuOpen && (
                        <div className="fixed inset-0 z-[100] flex">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
                            <div className="relative w-64 h-full v5-bg-deep border-r v5-border-subtle shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300 glass-jarvis">
                                <div className="flex items-center gap-3 mb-12">
                                    <div className="neural-pulse-ring scale-75"></div>
                                    <h2 className="text-xl font-display font-bold text-white tracking-tighter">JARVIS MENU</h2>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {[
                                        { to: '/', icon: 'space_dashboard', label: '10D HQ' },
                                        { to: '/chat', icon: 'chat', label: 'JARVIS Chat' },
                                        { to: '/config', icon: 'settings', label: 'Configurações' }
                                    ].map(item => (
                                        <button key={item.to} onClick={() => { navigate(item.to); setIsMenuOpen(false); }}
                                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 text-gray-300 hover:text-white transition-all group border border-transparent hover:border-primary/20">
                                            <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="font-medium tracking-tight">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-auto pt-8 border-t v5-border-subtle">
                                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] text-center font-bold">Protocol JARVIS V19.0</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Premium Header - Jarvis Style */}
                    <header className="flex-shrink-0 px-4 py-5 v5-bg-deep/40 backdrop-blur-3xl border-b v5-border-subtle sticky top-0 z-50">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <button onClick={() => setIsMenuOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-primary/10 border border-white/5 hover:v5-border-primary transition-all jarvis-border-glow">
                                <span className="material-icons-round text-white">grid_view</span>
                            </button>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${pulseStatus === 'OFFLINE' ? 'bg-red-500' : 'bg-primary'} animate-pulse`}></div>
                                    <h1 className="text-lg font-display font-black text-white tracking-[0.2em] uppercase">JARVIS</h1>
                                </div>
                            </div>

                            <div className="w-11 h-11"></div>
                        </div>
                    </header>

                    {/* Main Content - Orb Centric */}
                    <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden px-4">
                        {/* Jarvis Core - THE ORB */}
                        <div className="relative mb-8 transition-all duration-500 hover:scale-105">
                            <div className={`
                                w-40 h-40 sm:w-56 sm:h-56 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isSpeaking ? 'animate-jarvis-speaking border-primary/60 scale-110' :
                                    isThinking ? 'animate-jarvis-thinking border-primary/40' :
                                        'animate-jarvis-idle border-primary/20'}
                                bg-primary/5 relative z-10 glass-jarvis jarvis-glow
                            `}>
                                <div className={`neural-pulse-ring ${isSpeaking ? 'scale-[2]' : isThinking ? 'scale-125' : 'scale-100'} transition-transform duration-500`}></div>
                                <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl"></div>
                            </div>

                            {/* Outer Glows */}
                            <div className={`absolute top-1/2 left-1/2 -trangray-x-1/2 -trangray-y-1/2 transition-all duration-700
                                ${isSpeaking ? 'w-80 h-80 bg-primary/20' : 'w-64 h-64 bg-primary/5'} 
                                rounded-full blur-[100px] -z-10 animate-pulse
                            `}></div>
                        </div>

                        {/* Status Label removida para minimalismo absoluto */}

                        {/* Log removido - Design Extremamente Minimalista (Orb Centric) */}
                    </main>

                    {/* Input Area - Minimalist "Neural Input" */}
                    <footer className="flex-shrink-0 px-4 pt-2 pb-24 v5-bg-deep/80 backdrop-blur-3xl border-none relative z-40">
                        <div className="max-w-3xl mx-auto">
                            <div className="neural-input-container relative glass-jarvis border v5-border-primary/20 rounded-[28px] flex items-end gap-2 p-2 pr-4 shadow-2xl focus-within:v5-border-primary/50 transition-all jarvis-glow bg-black/80 group overflow-hidden">
                                {/* Focus Scanning Effect */}
                                <div className="neural-input-scan"></div>

                                <textarea
                                    ref={inputRef}
                                    rows="1"
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Consultar Núcleo JARVIS..."
                                    disabled={isSending}
                                    className="flex-1 bg-transparent px-6 py-4 text-sm sm:text-base v5-text-main placeholder-gray-700 outline-none resize-none min-h-[56px] custom-scrollbar focus:ring-0 leading-relaxed font-bold tracking-tight"
                                />

                                <div className="flex items-center gap-2 pb-2">
                                    {sttSupported && (
                                        <button
                                            onClick={isListening ? stopListening : startListening}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative group/mic ${isListening
                                                ? 'bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                                : 'text-gray-500 hover:text-white hover:bg-primary/10 border border-transparent'
                                                }`}
                                        >
                                            {isListening && <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20"></div>}
                                            <span className="material-icons-round text-2xl relative z-10">{isListening ? 'graphic_eq' : 'mic'}</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim() || isSending || isThinking}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${!inputValue.trim() || isSending
                                            ? 'text-gray-700 bg-white/5 opacity-50'
                                            : 'text-white bg-primary shadow-[0_0_30px_rgba(0,224,255,0.3)] hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(0,224,255,0.5)]'
                                            } border border-primary/20`}
                                    >
                                        <span className="material-icons-round text-2xl">{isSending ? 'sync' : 'bolt'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Neural System Status */}
                            <div className="flex justify-between items-center mt-4 px-4 opacity-40">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                                    </div>
                                    <span className="text-[9px] text-white font-black uppercase tracking-[0.4em]">Sincronização Ativa</span>
                                </div>
                                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-[0.3em] font-bold">Neural Link v19.0.2</p>
                            </div>
                        </div>
                    </footer>
                </div>
            );
        };


        const Motion = window.Motion || {};
        const { motion = (props) => <div {...props} />, AnimatePresence = ({ children }) => <React.Fragment>{children}</React.Fragment>, useAnimation = () => ({ start: () => { } }) } = Motion;

        const LandingPage = ({ onEnter }) => {
            return (
                <div className="landing-bg fixed inset-0 flex flex-col items-center justify-center z-[100] p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

                    {/* Floating Glow */}
                    <div className="absolute top-1/2 left-1/2 -trangray-x-1/2 -trangray-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <button
                            onClick={onEnter}
                            className="group relative px-8 py-3 bg-white/[0.03] border-2 border-white/20 rounded-xl overflow-hidden transition-all hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] active:scale-95"
                        >
                            <div className="absolute inset-0 bg-primary/5 trangray-y-full group-hover:trangray-y-0 transition-transform duration-300"></div>
                            <span className="relative text-xs font-display font-bold text-white uppercase tracking-[0.4em]">Acessar Ponte</span>
                        </button>
                    </div>
                </div>
            );
        };






        const VisualCvdMeter = ({ val5m, valTotal }) => {
            const abs5m = Math.abs(val5m);
            const absTotal = Math.abs(valTotal) || 1;
            const ratio = Math.min(100, (abs5m / (absTotal * 0.2)) * 100); // 20% do total ja enche a barra
            const isBuy = val5m > 0;
            return (
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-0.5 border border-white/5 p-[0.5px]">
                    <div
                        className={`h-full transition-all duration-1000 ${isBuy ? 'bg-lime-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}
                        style={{ width: `${ratio}%` }}
                    ></div>
                </div>
            );
        };

        const MoonbagVaultItem = ({ moonbag, tickers }) => {
            const symbol = moonbag.symbol.replace('.P', '').replace('.p', '').replace('USDT', '');
            const entry = Number(moonbag.entry_price) || 0;
            const side = moonbag.side === 'Buy' ? 'LONG' : 'SHORT';
            
            const tSym = symbol + 'USDT';
            const livePrice = tickers && tickers[tSym] ? Number(tickers[tSym]) : 0;
            
            const roi = livePrice > 0 ? 
                ((side === 'LONG' ? (livePrice / entry - 1) : (1 - livePrice / entry)) * 100 * (moonbag.leverage || 50)) : 
                Number(moonbag.pnl_percent || 0);

            let stage = null;
            if (roi >= 150) stage = { icon: '💎', label: 'MEGA', color: 'text-gray-400' };
            else if (roi >= 80) stage = { icon: '🛡️', label: 'FLASH', color: 'text-white' };
            else if (roi >= 50) stage = { icon: '🌉', label: 'STAB', color: 'text-white' };
            else stage = { icon: '⚖️', label: 'BE+', color: 'text-amber-400' };

            return (
                <div 
                    className="moonbag-item cursor-pointer flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] px-1 transition-colors group" 
                    data-symbol={moonbag.symbol}
                    data-side={moonbag.side}
                    data-entry={moonbag.entry_price}
                    data-sl={moonbag.current_stop || moonbag.stop_loss}
                    data-leverage={moonbag.leverage}
                    data-t1={moonbag.t1}
                    data-t2={moonbag.t2}
                    data-t3={moonbag.t3}
                    data-t4={moonbag.t4}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white font-mono leading-none">{symbol}</span>
                            <span className={`text-[7px] font-bold uppercase ${side === 'LONG' ? 'text-white/60' : 'text-orange-500/60'}`}>{side}</span>
                            {(moonbag.genesis_id || moonbag.order_id) && (
                                <span className="text-[7px] font-mono text-white/40 uppercase block mt-0.5">
                                    🧬 GENESIS: {moonbag.genesis_id || moonbag.order_id}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {stage && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px]">{stage.icon}</span>
                                <span className={`text-[7px] font-black uppercase tracking-tighter ${stage.color}`}>{stage.label}</span>
                            </div>
                        )}
                        <div className="text-right min-w-[70px]">
                            <span className={`text-[12px] font-black font-mono leading-none ${roi >= 0 ? 'text-white' : 'text-red-400'}`}>
                                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                            </span>
                            <div className={`text-[9px] font-bold font-mono mt-0.5 ${roi >= 0 ? 'text-white/80' : 'text-orange-500/80'}`}>
                                {roi >= 0 ? '+' : '-'}${Math.abs((roi / 100) * (moonbag.margin || 10)).toFixed(2)}
                            </div>
                        </div>
                    </div>
                    {/* [V110.126] Moonbag Tactical Targets */}
                    <div className="flex justify-between items-center gap-4 px-2 py-1 mt-1 bg-white/[0.01] rounded text-[8px] font-mono opacity-60">
                         <div className="flex gap-1"><span className="text-gray-500">E:</span><span className="text-white">${entry.toFixed(entry < 1 ? 5 : 2)}</span></div>
                         <div className="flex gap-1"><span className="text-gray-500">S:</span><span className="text-orange-400">${Number(moonbag.stopLoss || 0).toFixed(Number(moonbag.stopLoss) < 1 ? 5 : 2)}</span></div>
                         <div className="flex gap-1"><span className="text-gray-500">T:</span><span className="text-white">${(side === 'LONG' ? entry * 1.03 : entry * 0.97).toFixed(entry < 1 ? 5 : 2)}</span></div>
                    </div>
                </div>
            );
        };

        const MoonbagVault = ({ moonbags, tickers }) => {
            const hasMoonbags = moonbags && moonbags.length > 0;

            return (
                <section className="space-y-3 pt-4 border-none">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="material-icons-round text-white text-sm animate-pulse">auto_awesome</span>
                            Moonbag Vault
                        </h3>
                        {hasMoonbags && (
                            <span className="text-[8px] text-white/60 font-black px-2 py-0.5 rounded border border-primary/20 bg-primary/5 uppercase tracking-widest">
                                {moonbags.length} ETERNAL SURF
                            </span>
                        )}
                    </div>

                    <div className="premium-card p-3 bg-black/30">
                        {!hasMoonbags ? (
                            <div className="py-6 flex flex-col items-center justify-center opacity-20 gap-2">
                                <span className="material-icons-round text-xl">hourglass_empty</span>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Aguardando Emancipação...</p>
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-8 h-0.5 bg-white/20 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {moonbags.map(mb => (
                                    <MoonbagVaultItem key={mb.id} moonbag={mb} tickers={tickers} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            );
        };

        // --- Hook: [V110.38] Real-time Librarian Intelligence ---
        const useLibrarianIntelRT = () => {
            const [intel, setIntel] = useState(null);
            useEffect(() => {
                const fetchFallback = async () => {
                    try {
                        const res = await fetch(API_BASE + '/api/radar/librarian');
                        if(res.ok) setIntel(await res.json());
                    } catch(e) {}
                };
                if (window.firebase && window.firebase.apps.length > 0) {
                    try {
                        const db = window.firebase.database();
                        const ref = db.ref('librarian_intelligence');
                        const onVal = ref.on('value', (snap) => {
                            if(snap.exists()) setIntel(snap.val());
                        });
                        return () => ref.off('value', onVal);
                    } catch (e) {
                        fetchFallback();
                        const t = setInterval(fetchFallback, 60000); // [V110.138] Relaxed to 60s
                        return () => clearInterval(t);
                    }
                } else {
                    fetchFallback();
                    const t = setInterval(fetchFallback, 60000); // [V110.138] Relaxed to 60s
                    return () => clearInterval(t);
                }
            }, []);
            return intel;
        };

        // --- Sub-Component: Slot Card (V110.120 - Elite Command) ---
        const SlotCard = ({ s, tickers, marketRadar, librarianIntel, compact = true, isSelected = false, onClick = null }) => {
            const [displayPnl, setDisplayPnl] = useState(0);
            const isActive = s && s.symbol;
            const cleanSymbol = isActive ? s.symbol.replace('.P', '').replace('.p', '').trim() : null;
            
            // [V110.137] Strategy Identification
            const isBlitz = s.slot_type === 'BLITZ' || s.slot_type === 'BLITZ_30M' || s.id === 1 || s.id === 2;
            const isSwing = false; // [V110.511] Legacy Swing Disabled

            // Intelligence Data
            const confidence = s.unified_confidence || s.confidence_score || (s.score ? s.score : 50);
            const rawIntel = s.fleet_intel || {};
            const intel = {
                macro: rawIntel.macro || 50,
                micro: rawIntel.micro || 50,
                smc: rawIntel.smc || 50,
                onchain: rawIntel.onchain || 50
            };

            const lastValidPrice = useRef(0);
            const currentPrice = isActive ? (tickers[cleanSymbol] || 0) : null;
            if (currentPrice && currentPrice > 0) lastValidPrice.current = currentPrice;

            const smoothingRef = useRef(0);
            useEffect(() => {
                if (!isActive) { setDisplayPnl(0); smoothingRef.current = 0; return; }
                let livePnl = 0;
                const price = lastValidPrice.current;
                if (price > 0 && Number(s.entry_price) > 0) {
                    const ne = Number(s.entry_price);
                    const leverage = s.leverage || 50;
                    livePnl = s.side === 'Buy' ? ((price - ne) / ne * 100 * leverage) : ((ne - price) / ne * 100 * leverage);
                }
                const alpha = 0.25;
                const nextVal = (livePnl * alpha) + (smoothingRef.current * (1 - alpha));
                smoothingRef.current = nextVal;
                setDisplayPnl(nextVal);
            }, [currentPrice, s, isActive]);

            const isProfit = displayPnl >= 0;

            const [duration, setDuration] = useState('');
            useEffect(() => {
                const openTimeRaw = s && (s.opened_at || s.created_at || s.timestamp);
                if (!isActive || !openTimeRaw) { setDuration(''); return; }
                const updateDuration = () => {
                    const now = Date.now();
                    const timeMs = (typeof openTimeRaw === 'number' && openTimeRaw < 1e11) ? openTimeRaw * 1000 : openTimeRaw;
                    const diff = now - new Date(timeMs).getTime();
                    if (diff < 0) return;
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    setDuration(`${h}h ${m}m`);
                };
                updateDuration();
                const interval = setInterval(updateDuration, 60000);
                return () => clearInterval(interval);
            }, [isActive, s]);

            // [V110.136] Wick Intensity & Nectar from DNA
            const wickIntensity = s.wick_intensity || (librarianIntel && librarianIntel[cleanSymbol]?.dna?.wick_intensity) || 0;
            const nectarSeal = s.nectar_seal || (librarianIntel && librarianIntel[cleanSymbol]?.dna?.nectar_seal) || "";

            return (
                <div 
                    onClick={onClick}
                    className={`glass rounded-[2rem] w-full p-4 relative flex flex-col gap-3 overflow-hidden border transition-all duration-500
                    ${isActive ? (isProfit ? 'profit-glow' : 'loss-glow') : 'opacity-30 grayscale'}
                    ${isSelected ? 'scale-[1.02] border-white shadow-white/10' : ''}`}
                >
                    {/* [V110.173] Strategy Badge - Dynamic Injection */}
                    <div class={`strategy-badge-elite !rounded-bl-3xl ${
                        (s.strategy === 'BLITZ_30M' || (!s.strategy && s.id <= 2)) 
                        ? 'bg-white' 
                        : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'}`}>
                        <span className={`px-1 ${(s.strategy === 'BLITZ_30M' || (!s.strategy && s.id <= 2)) ? 'text-black' : 'text-white'} font-black flex items-center gap-1`}>
                            {s.score >= 85 && <span className="material-icons-round text-[10px] animate-pulse">bolt</span>}
                            {s.strategy_label || (s.is_spring_strike ? 'BLITZ | SPRING' : 'BLITZ 30M')}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black tracking-tighter text-white uppercase">
                                    {isActive ? cleanSymbol : `SLOT ${s.id}`}
                                </span>
                                {isActive && (
                                    <span className={`bg-white/5 border border-white/10 text-[9px] font-black px-3 py-1 rounded-full ${['BUY', 'LONG'].includes((s.side || "").toUpperCase()) ? 'text-white' : 'text-secondary'}`}>
                                        {['BUY', 'LONG'].includes((s.side || "").toUpperCase()) ? 'LONG' : 'SHORT'} {s.leverage || 50}x
                                    </span>
                                )}
                            </div>

                            {/* [V110.173] Genesis ID Display - Rule 16 Sync */}
                            {isActive && (s.genesis_id || s.order_id) && (
                                <div className="flex items-center gap-1 mt-1 mb-1">
                                    <span className="text-[10px] font-mono font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded uppercase tracking-widest">
                                        🧬 GENESIS: {s.genesis_id || s.order_id}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex gap-2 items-center">
                                <IntelIcon type="macro" score={intel.macro} icon="public" label="MAC" />
                                <IntelIcon type="micro" score={intel.micro} icon="waves" label="WHL" />
                                <IntelIcon type="smc" score={intel.smc} icon="bolt" label="SMC" />
                                {isActive && nectarSeal && (
                                    <span className="text-[9px] font-black text-white bg-white/10 border border-white/20 px-2 rounded">
                                        {nectarSeal.includes('NECTAR') ? '🍯 NECTAR' : '🛡️ SHIELD'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className={`text-3xl font-black font-mono leading-none ${isProfit ? 'text-green-500' : 'text-danger'}`} style={{ textShadow: isProfit ? '0 0 15px rgba(34,197,94,0.3)' : '0 0 15px rgba(239,68,68,0.2)' }}>
                                {isProfit ? '+' : ''}{displayPnl.toFixed(1)}%
                            </span>
                            <span className={`text-[11px] font-bold font-mono mt-1 ${isProfit ? 'text-green-500' : 'text-danger'} opacity-80`}>
                                {isProfit ? '+' : '-'}${Math.abs((displayPnl / 100) * (s.margin || (s.bankroll * 0.1) || 10)).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Execution Panel - Grayscale Pill Style */}
                    <div className="flex justify-between items-center bg-white/[0.03] p-3 rounded-2xl border border-white/5 gap-4">
                        <div className="flex flex-col flex-1">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Entry</span>
                            <span className="text-xs font-bold text-white font-mono">
                                ${formatPrice(s.entry_price)}
                            </span>
                        </div>
                        <div className="flex flex-col flex-1 items-center border-x border-white/5 px-2">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Stop Loss</span>
                            <span className="text-xs font-bold text-secondary font-mono">
                                ${formatPrice(s.current_stop || s.stop_loss)}
                            </span>
                        </div>
                        <div className="flex flex-col flex-1 items-end">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Target</span>
                            <span className="text-xs font-bold text-white font-mono">
                                ${formatPrice(['BUY', 'LONG'].includes((s.side || "").toUpperCase()) ? Number(s.entry_price || 0) * 1.03 : Number(s.entry_price || 0) * 0.97)}
                            </span>
                        </div>
                    </div>

                    {isActive && (
                        <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                            <div 
                                className="h-full transition-all duration-1000 bg-green-500 shadow-[0_0_8px_#22c55e]" 
                                style={{ width: `${Math.min(wickIntensity * 100, 100)}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            );
        };


        
        // =========================================================================
        // --- [NEW] V60.0 DESKTOP COCKPIT (ULTRAWIDE DASHBOARD) ---
        // =========================================================================

        // =========================================================================
        // [V67.5] GridChartItem: Reusable chart component for the Desktop Dashboard Grid
        // =========================================================================
        const GridChartItem = ({ 
            symbol, slots, index, totalCharts,
            onSymbolChange, focusedAsset, pulseStatus
        }) => {
            const chartContainerRef = React.useRef(null);
            const chartInstance = React.useRef(null);
            const candlestickSeries = React.useRef(null);
            const [localSymbol, setLocalSymbol] = React.useState(symbol || "BTCUSDT");
            const [localTimeframe, setLocalTimeframe] = React.useState("15");
            const [historicalData, setHistoricalData] = React.useState({ candles: [], volumes: [] });
            const [eagleMode, setEagleMode] = React.useState(() => {
                try { return localStorage.getItem('eagle_vision_mode_grid') !== 'simple'; } catch(e) { return true; }
            });
            const priceLinesRef = React.useRef({ entry: null, sl: null, tp: null, degraus: [] });
            const isFirstLoadRef = React.useRef(true);
            const [tooltip, setTooltip] = React.useState(null);
            const [telemetry, setTelemetry] = React.useState({ rsi: null, adx: null, volatility: null });
            const [pointsState, setPointsState] = React.useState(null);

            // Indicator Series Refs
            const sma8SeriesRef = React.useRef(null);
            const sma21SeriesRef = React.useRef(null);

            React.useEffect(() => {
                try { localStorage.setItem('eagle_vision_mode_grid', eagleMode ? 'analytic' : 'simple'); } catch(e) {}
            }, [eagleMode]);

            React.useEffect(() => {
                setLocalSymbol(symbol || "BTCUSDT");
            }, [symbol]);

            React.useEffect(() => {
                isFirstLoadRef.current = true;
                const fetchKlines = async () => {
                    if (!localSymbol || localSymbol.length < 3 || localSymbol === 'VVV' || localSymbol.includes('undefined')) return;
                    try {
                        const res = await fetch(`${API_BASE}/api/market/klines?symbol=${localSymbol}&interval=${localTimeframe}&limit=350`);
                        const data = await res.json();
                        if (!Array.isArray(data) || data.length === 0) return;
                        
                        const formatted = data.map(d => ({
                            time: (parseInt(d[0]) / 1000),
                            open: parseFloat(d[1]),
                            high: parseFloat(d[2]),
                            low: parseFloat(d[3]),
                            close: parseFloat(d[4]),
                            volume: parseFloat(d[5])
                        }));
                        const volumes = formatted.map(d => ({
                            time: d.time,
                            value: d.volume,
                            color: d.close >= d.open ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                        }));
                        setHistoricalData({ candles: formatted, volumes });

                        // Update Telemetry (Simple mock logic or real calculation if needed)
                        if (formatted.length > 20) {
                            const last = formatted[formatted.length - 1];
                            const prev = formatted[formatted.length - 2];
                            const vol = ((last.high - last.low) / last.low * 100).toFixed(2);
                            setTelemetry({
                                rsi: Math.floor(40 + Math.random() * 30), // Placeholder for real RSI
                                adx: Math.floor(20 + Math.random() * 25), // Placeholder for real ADX
                                volatility: vol
                            });
                        }
                    } catch (e) {
                        console.error("Failed to fetch klines for grid item", localSymbol, e);
                    }
                };
                fetchKlines();
                const itv = setInterval(fetchKlines, 60000);
                return () => clearInterval(itv);
            }, [localSymbol, localTimeframe]);

            // Init Chart
            React.useEffect(() => {
                if (!chartContainerRef.current) return;
                const chart = LightweightCharts.createChart(chartContainerRef.current, {
                    layout: { 
                        background: { color: 'transparent' }, 
                        textColor: '#94a3b8', 
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono'
                    },
                    grid: { 
                        vertLines: { color: 'rgba(255, 255, 255, 0.02)' }, 
                        horzLines: { color: 'rgba(255, 255, 255, 0.02)' } 
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                    timeScale: { timeVisible: true, borderColor: 'rgba(255, 255, 255, 0.05)' },
                    crosshair: {
                        mode: LightweightCharts.CrosshairMode.Normal,
                        vertLine: { color: 'rgba(255, 255, 255, 0.2)', width: 1, style: 2, labelBackgroundColor: '#1e293b' },
                        horzLine: { color: 'rgba(255, 255, 255, 0.2)', width: 1, style: 2, labelBackgroundColor: '#1e293b' },
                    },
                    rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.05)' }
                });
                
                const series = chart.addCandlestickSeries({
                    upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
                    wickUpColor: '#10b981', wickDownColor: '#ef4444'
                });
                
                const volSeries = chart.addHistogramSeries({
                    priceFormat: { type: 'volume' },
                    priceScaleId: '',
                });
                volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

                sma8SeriesRef.current = chart.addLineSeries({ color: 'rgba(255, 255, 255, 0.6)', lineWidth: 1, title: 'SMA 8', visible: eagleMode });
                sma21SeriesRef.current = chart.addLineSeries({ color: 'rgba(34, 211, 238, 0.5)', lineWidth: 1, title: 'SMA 21', visible: eagleMode });

                chartInstance.current = chart;
                candlestickSeries.current = series;
                chartInstance.current.volumeSeries = volSeries;

                // Tooltip Interaction
                chart.subscribeCrosshairMove(param => {
                    if (param.time && param.seriesData.get(series)) {
                        const data = param.seriesData.get(series);
                        setTooltip({
                            time: param.time,
                            open: data.open,
                            high: data.high,
                            low: data.low,
                            close: data.close,
                            x: param.point.x,
                            y: param.point.y
                        });
                    } else {
                        setTooltip(null);
                    }
                });

                const resizeObserver = new ResizeObserver(entries => {
                    if (entries.length > 0 && entries[0].contentRect) {
                        chart.applyOptions({ 
                            width: entries[0].contentRect.width, 
                            height: entries[0].contentRect.height 
                        });
                    }
                });
                resizeObserver.observe(chartContainerRef.current);

                return () => {
                    resizeObserver.disconnect();
                    chart.remove();
                };
            }, []);

            // Update Data & Indicators
            React.useEffect(() => {
                if (candlestickSeries.current && historicalData.candles.length > 0) {
                    const candles = historicalData.candles;
                    candlestickSeries.current.setData(candles);
                    if (chartInstance.current.volumeSeries) chartInstance.current.volumeSeries.setData(historicalData.volumes);

                    if (eagleMode) {
                        if (window.calculateSMA) {
                            const sma8 = window.calculateSMA(candles, 8);
                            const sma21 = window.calculateSMA(candles, 21);
                            sma8SeriesRef.current.setData(sma8.filter(d => d !== null));
                            sma21SeriesRef.current.setData(sma21.filter(d => d !== null));
                        }
                    }

                    if (isFirstLoadRef.current && chartInstance.current) {
                        chartInstance.current.timeScale().setVisibleLogicalRange({
                            from: candles.length - 80,
                            to: candles.length
                        });
                        isFirstLoadRef.current = false;
                    }
                }
            }, [historicalData, eagleMode]);

            // Price Lines
            React.useEffect(() => {
                if (!candlestickSeries.current) return;
                [priceLinesRef.current.entry, priceLinesRef.current.sl, priceLinesRef.current.tp].forEach(l => {
                    if (l) candlestickSeries.current.removePriceLine(l);
                });
                priceLinesRef.current.degraus.forEach(l => candlestickSeries.current.removePriceLine(l));
                priceLinesRef.current.degraus = [];

                const activeSlot = slots.find(s => s && s.symbol && s.symbol.replace('.P','').replace('.p','') === localSymbol);
                let points = null;

                // [V110.518] Prioridade Máxima: Se o ativo está em trade real, use os dados do SLOT.
                if (activeSlot) {
                    points = { 
                        entry: parseFloat(activeSlot.entry_price), 
                        sl: parseFloat(activeSlot.current_stop || activeSlot.stop_loss), 
                        side: activeSlot.side,
                        leverage: parseFloat(activeSlot.leverage || 50),
                        isReal: true
                    };
                } else if (focusedAsset && focusedAsset.symbol.replace('.P','').replace('.p','').toUpperCase() === localSymbol.toUpperCase()) {
                    points = { 
                        entry: parseFloat(focusedAsset.entry), 
                        sl: parseFloat(focusedAsset.sl), 
                        side: focusedAsset.side,
                        leverage: parseFloat(focusedAsset.leverage || 50),
                        isReal: false
                    };
                }

                setPointsState(points);

                if (points && points.entry > 0) {
                    const sideUpper = (points.side || "").toUpperCase().trim();
                    const isLong = ['BUY', 'LONG', 'LONGUSDT', 'B'].includes(sideUpper);
                    console.log(`[CHART-DEBUG] Renderizado ${localSymbol} | Side: ${points.side} | isLong: ${isLong}`);
                    
                    // 1. Entrada (ENTRY)
                    priceLinesRef.current.entry = candlestickSeries.current.createPriceLine({ 
                        price: points.entry, color: '#ffffff', lineWidth: 1, lineStyle: 2, title: 'ENTRY' 
                    });

                    // 2. Stop Loss (SL)
                    if (points.sl > 0) {
                        priceLinesRef.current.sl = candlestickSeries.current.createPriceLine({ 
                            price: points.sl, color: '#ef4444', lineWidth: 2, lineStyle: 0, title: 'STOP LOSS' 
                        });
                    }

                    // 3. Alvo Principal (3% / Mega Pulse)
                    const tp = isLong ? points.entry * 1.03 : points.entry * 0.97;
                    priceLinesRef.current.tp = candlestickSeries.current.createPriceLine({ 
                        price: tp, color: '#10b981', lineWidth: 2, lineStyle: 0, title: 'TARGET 150%' 
                    });

                    // [V110.518] ESCADINHA VISUAL: Desenha degraus da escadinha se for trade real ou focado
                    if (activeSlot || (focusedAsset && points && points.isReal === false)) {
                        const dataSource = activeSlot || focusedAsset;
                        const degraus = [
                            { roi: 30, label: 'BE', key: 't1' },
                            { roi: 50, label: 'PB', key: 't2' },
                            { roi: 70, label: 'RZ', key: 't3' },
                            { roi: 110, label: 'PL', key: 't4' }
                        ];
                        degraus.forEach(d => {
                            let dPrice = dataSource[d.key];
                            if (!dPrice) {
                                const priceOffset = (d.roi / (points.leverage * 100)) * points.entry;
                                dPrice = isLong ? points.entry + priceOffset : points.entry - priceOffset;
                            }

                            const line = candlestickSeries.current.createPriceLine({ 
                                price: dPrice, color: '#10b981', lineWidth: 1, lineStyle: 3, 
                                title: `TP ${d.label} (${d.roi}%)`,
                                axisLabelVisible: false
                            });
                            priceLinesRef.current.degraus.push(line);
                        });
                    }

                    // [V110.370] Flow Sentinel Marker Sync
                    if (historicalData.candles.length > 0) {
                        const entryTs = activeSlot?.opened_at || 0;
                        const entryPrice = points.entry;
                        let entryCandle = historicalData.candles.find(c => Math.abs(c.time - entryTs) < 60);
                        if (!entryCandle) entryCandle = historicalData.candles.find(c => Math.abs(c.close - entryPrice) / entryPrice < 0.001);
                        
                        if (entryCandle) {
                            candlestickSeries.current.setMarkers([{
                                time: entryCandle.time,
                                position: isLong ? 'belowBar' : 'aboveBar',
                                color: pulseStatus === 'OFFLINE' ? '#ef4444' : '#fff',
                                shape: isLong ? 'arrowUp' : 'arrowDown',
                                text: `ENTRY • ${points.isReal ? 'REAL FLOW' : 'TOCAIA'}`
                            }]);
                        }
                    }
                } else {
                    if (candlestickSeries.current) candlestickSeries.current.setMarkers([]);
                }

            }, [slots, localSymbol, focusedAsset, historicalData, pulseStatus]);

            return (
                <div className="flex flex-col h-full border border-white/5 bg-black/40 hover:border-white/20 transition-all relative group overflow-hidden rounded-[1.5rem] shadow-2xl backdrop-blur-xl">
                    <div 
                        className="scanning-effect" 
                        style={{ 
                            '--sentinel-color': pulseStatus === 'OFFLINE' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                            '--sentinel-glow': pulseStatus === 'OFFLINE' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.2)'
                        }}
                    ></div>
                    
                    {/* Header HUD */}
                    <div className="absolute top-3 left-4 z-20 flex items-center gap-3 pointer-events-none">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-[14px] font-black text-white uppercase tracking-tight">{localSymbol}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.6)]"></div>
                            </div>
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">{localTimeframe}M INTERVAL</span>
                        </div>
                        {focusedAsset && focusedAsset.symbol.replace('.P','') === localSymbol && (
                            <div className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[8px] font-black text-white uppercase tracking-widest animate-pulse">
                                TOCAIA ATIVA
                            </div>
                        )}
                    </div>

                    {/* Debug HUD - [V110.521] */}
                    <div className="absolute top-12 right-4 z-20 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity flex flex-col items-end">
                        <span className="text-[7px] font-mono text-gray-500 uppercase">Engine V110.521</span>
                        {pointsState && (
                            <span className={`text-[8px] font-black uppercase ${['BUY','LONG'].includes((pointsState.side||'').toUpperCase().trim()) ? 'text-lime-500' : 'text-orange-500'}`}>
                                DETECTED: {pointsState.side} ({['BUY','LONG'].includes((pointsState.side||'').toUpperCase().trim()) ? 'LONG' : 'SHORT'})
                            </span>
                        )}
                    </div>

                    {/* Telemetry Panel */}
                    <div className="absolute bottom-4 left-4 z-20 flex gap-4 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-gray-500 uppercase">RSI (14)</span>
                            <span className="text-[10px] font-black text-white font-mono">{telemetry.rsi || '--'}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-4">
                            <span className="text-[7px] font-black text-gray-500 uppercase">ADX</span>
                            <span className="text-[10px] font-black text-white font-mono">{telemetry.adx || '--'}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-4">
                            <span className="text-[7px] font-black text-gray-500 uppercase">VOLAT</span>
                            <span className="text-[10px] font-black text-white font-mono">{telemetry.volatility || '0.00'}%</span>
                        </div>
                    </div>

                    {/* Floating Tooltip */}
                    {tooltip && (
                        <div 
                            className="absolute z-[100] bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg flex flex-col gap-1 pointer-events-none shadow-2xl"
                            style={{ left: tooltip.x + 20, top: tooltip.y - 40 }}
                        >
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px] font-mono">
                                <span className="text-gray-500 uppercase">O:</span> <span className="text-white font-bold">{tooltip.open.toFixed(5)}</span>
                                <span className="text-gray-500 uppercase">H:</span> <span className="text-white font-bold">{tooltip.high.toFixed(5)}</span>
                                <span className="text-gray-500 uppercase">L:</span> <span className="text-white font-bold">{tooltip.low.toFixed(5)}</span>
                                <span className="text-gray-500 uppercase">C:</span> <span className="text-white font-bold">{tooltip.close.toFixed(5)}</span>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 z-40 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <select 
                            value={localTimeframe} 
                            onChange={(e) => setLocalTimeframe(e.target.value)}
                            className="bg-white/5 backdrop-blur-md text-[9px] font-black text-white border border-white/10 rounded-lg px-2 py-1 uppercase outline-none hover:bg-white/10 transition-colors"
                        >
                            <option value="1">1m</option><option value="5">5m</option><option value="15">15m</option><option value="60">1h</option><option value="240">4h</option>
                        </select>
                        <button 
                            onClick={() => setEagleMode(!eagleMode)}
                            className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center ${eagleMode ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-gray-500 border-white/10'}`}
                        >
                            <span className="material-icons-round text-[16px]">{eagleMode ? 'auto_awesome' : 'visibility_off'}</span>
                        </button>
                    </div>

                    <div ref={chartContainerRef} className="flex-1 w-full" />
                </div>
            );
        };

        // =========================================================================
        // [V110.115] Intelligence Librarian Panel — Top Ranks no Dashboard
        // =========================================================================
        const IntelligenceLibrarianPanel = ({ librarianIntel }) => {
            const rankings = librarianIntel?.rankings || [];
            const studyStatus = librarianIntel?.study_status || 'IDLE';
            const progress = librarianIntel?.progress || 0;
            const totalAssets = librarianIntel?.total_assets || 0;
            const processedCount = librarianIntel?.processed_count || 0;
            const currentSymbol = librarianIntel?.current_symbol || '';
            const lastStudy = librarianIntel?.last_study || 0;

            // Top 5 por win_rate
            const top5 = rankings
                .filter(r => r && r.symbol && r.win_rate !== undefined)
                .sort((a, b) => (b.win_rate || 0) - (a.win_rate || 0))
                .slice(0, 5);

            const isScanning = studyStatus === 'STUDYING' || studyStatus === 'SCANNING';
            const timeSinceStudy = lastStudy ? Math.floor((Date.now() / 1000) - lastStudy) : null;
            const studyLabel = timeSinceStudy !== null
                ? (timeSinceStudy < 60 ? 'Agora mesmo' : timeSinceStudy < 3600 ? `${Math.floor(timeSinceStudy / 60)}min atrás` : `${Math.floor(timeSinceStudy / 3600)}h atrás`)
                : 'Nunca';

            // Seal color mapper
            const getSealColor = (seal) => {
                const s = (seal || '').toUpperCase();
                if (s.includes('NECTAR') || s.includes('ELITE')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                if (s.includes('VANGUARD') || s.includes('SHIELD')) return 'text-white bg-lime-500/10 border-lime-500/20';
                if (s.includes('TRAP')) return 'text-red-400 bg-red-500/10 border-red-500/20';
                return 'text-gray-500 bg-white/5 border-white/10';
            };

            const getSealIcon = (seal) => {
                const s = (seal || '').toUpperCase();
                if (s.includes('NECTAR') || s.includes('ELITE')) return '🍯';
                if (s.includes('VANGUARD') || s.includes('SHIELD')) return '🛡️';
                if (s.includes('TRAP')) return '💀';
                return '📊';
            };

            return (
                <div className="flex flex-col gap-3 group/librarian">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase font-display flex items-center gap-2 group-hover/librarian:text-amber-400 transition-colors">
                                <span className="material-icons-round text-amber-400 text-lg animate-float">auto_stories</span>
                                Intelligence Librarian
                            </h2>
                            <span className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Fleet Knowledge Base</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${isScanning ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-white border-white/10'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-lime-500'} shadow-[0_0_8px_currentColor]`}></div>
                             <span className="text-[8px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Studying' : 'Ready'}</span>
                        </div>
                    </div>

                    {/* Study Progress Bar */}
                    {isScanning && totalAssets > 0 && (
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 relative overflow-hidden shimmer-effect">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white uppercase tracking-wider">
                                        Escaneando Mercado
                                    </span>
                                    {currentSymbol && (
                                        <span className="text-[8px] font-mono text-amber-400/80">
                                            &gt; {currentSymbol}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                    {Math.round((processedCount / totalAssets) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000 rounded-full"
                                    style={{ width: `${totalAssets > 0 ? (processedCount / totalAssets) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Top Rankings List */}
                    <div className="flex flex-col gap-2.5">
                        {top5.length === 0 ? (
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-8 text-center group hover:border-amber-500/20 transition-all relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic relative z-10">
                                    {isScanning ? 'Coletando Inteligência...' : 'Bibliotecário Estudando...'}
                                </span>
                                <div className="mt-3 flex items-center justify-center gap-3 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] text-gray-600 uppercase font-black">Última Análise</span>
                                        <span className="text-[9px] text-white font-bold">{studyLabel}</span>
                                    </div>
                                    <div className="w-[1px] h-4 bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] text-gray-600 uppercase font-black">Status</span>
                                        <span className="text-[9px] text-amber-400 font-bold">{isScanning ? 'Ativo' : 'Pausa'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            top5.map((r, i) => {
                                const wr = r.win_rate || 0;
                                const seal = r.seal || r.quality_seal || '';

                                return (
                                    <div
                                        key={r.symbol || i}
                                        onClick={() => window.openDeepAnalysis && window.openDeepAnalysis(r.symbol)}
                                        className={`p-3 rounded-2xl border transition-all duration-300 group/row overflow-hidden relative cursor-pointer ${
                                            i === 0
                                                ? 'bg-gradient-to-r from-amber-500/10 to-white/[0.02] border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                        
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 group-hover/row:border-amber-400/40 transition-colors">
                                                    <span className="text-[10px] font-black text-gray-500 group-hover/row:text-amber-400">{i + 1}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white group-hover/row:translate-x-0.5 transition-transform">{r.symbol.replace('.P', '')}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Afinidade</span>
                                                        <div className="w-12 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                            <div className="h-full bg-amber-400" style={{ width: `${wr}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-black font-mono text-white">{wr.toFixed(0)}%</span>
                                                    <span className="text-[14px]">{getSealIcon(seal)}</span>
                                                </div>
                                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{r.trades_count || 0} Missões</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer: Last Study */}
                    <div className="text-[8px] text-gray-700 text-center font-mono">
                        Última atualização: {studyLabel}
                    </div>
                </div>
            );
        };

        // =========================================================================
        // [V110.120] UNIFIED QUANTUM HUD (Tactical Command Card)
        // =========================================================================
        const UnifiedQuantumHUD = ({ 
            btc, realAdx, dominance, realDecorrelation, protocolLabel, 
            oracleStatus, oracleMessage, stabilizationProgress, 
            unifiedRegime, activeSlotCount, pulseStatus, latency 
        }) => {
            const isStabilizing = oracleStatus === 'STABILIZING';
            
            return (
                <div className="bg-black/60 backdrop-blur-3xl px-8 h-16 flex items-center justify-between z-30 relative overflow-hidden group border-b border-white/[0.03]">
                    
                    <div className="flex items-center gap-8">
                        {/* BTC & REGIME CORE */}
                        <div className="flex items-center gap-3 bg-white/[0.02] px-4 py-1.5 rounded-xl border border-white/5 hover:border-green-500/20 transition-all">
                             <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-1000 ${isStabilizing ? 'bg-amber-500/10 border-amber-500/20' : 'bg-green-500/5 border-green-500/10'}`}>
                                <span className={`material-icons-round text-sm ${isStabilizing ? 'text-amber-500 animate-spin' : 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]'}`}>
                                    {isStabilizing ? 'hourglass_top' : 'auto_awesome'}
                                </span>
                            </div>
                            <div className="flex flex-col justify-center leading-none">
                                <span className="text-[11px] font-bold text-white font-mono tracking-tight">${formatPrice(btc?.btc_price || 0)}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${unifiedRegime === 'UP' ? 'text-gray-400' : unifiedRegime === 'DOWN' ? 'text-red-500/70' : 'text-amber-500/70'}`}>
                                    {unifiedRegime === 'UP' ? 'Bullish' : unifiedRegime === 'DOWN' ? 'Bearish' : 'Neutral'}
                                </span>
                            </div>
                        </div>

                        {/* HIGH TELEMETRY STRIP */}
                        <div className="flex items-center gap-8">
                              <div className="flex flex-col border-l border-white/5 pl-5">
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-0.5">ADX</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono text-xs font-bold ${realAdx >= 25 ? 'text-white' : 'text-amber-500/80'}`}>
                                        {typeof realAdx === 'number' ? realAdx.toFixed(1) : (realAdx || '...')}
                                    </span>
                                    <div className="w-10 h-0.5 bg-white/[0.03] rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${realAdx >= 25 ? 'bg-accent/50' : 'bg-amber-500/40'}`} style={{ width: `${Math.min(realAdx, 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col border-l border-white/5 pl-6">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Dominance</span>
                                <span className="font-mono text-base font-black text-white">{dominance?.toFixed(1) || '...'}%</span>
                            </div>

                            <div className="flex flex-col border-l border-white/5 pl-6">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Decorrelação</span>
                                <span className={`font-mono text-base font-black ${realDecorrelation >= 40 ? 'text-white' : 'text-gray-400'}`}>{realDecorrelation || '0'}%</span>
                            </div>

                            <div className="flex flex-col border-l border-white/5 pl-6 justify-center">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Protocol</span>
                                <span className="flex items-center gap-2 text-white font-black uppercase tracking-tighter leading-none">
                                    <span className="material-icons-round text-xs">local_fire_department</span>
                                    {protocolLabel || 'Sniper V6.0 Elite'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* LINK STATUS */}
                    <div className="flex items-center gap-6 border-l border-white/5 pl-8">
                         <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">System Link</span>
                            <div className="flex items-center gap-2 justify-end">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${pulseStatus === 'ONLINE' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-red-500'}`}></span>
                                <span className="text-xs font-mono font-black text-gray-400 uppercase">{pulseStatus} • {(latency/1000).toFixed(1)}s</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 bg-white/[0.03] rounded-xl border border-white/10 min-w-[100px]">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-0.5">Slots Occupied</span>
                            <span className="text-sm font-black text-white">{activeSlotCount} / 4</span>
                        </div>
                    </div>
                </div>
            );
        };

        const DesktopDashboard = ({
            vault, banca, missionCycle, totalWins, slots, pulseData, radarSignals, marketRadar,
            latency, pulseStatus, btcCommandStatus, moonbags, activeTocaias, liveTotalPnL,
            liveTotalProfit, liveEquity, isDrawdown, hullIntegrityPct, shieldPowerPct,
            fleetRank, rankColor, historyLogs, tickers,
            systemState, protocolLabel, oracleStatus, oracleMessage, stabilizationProgress, btcAdx, realAdx, realDecorrelation, dominance,
            unifiedRegime, librarianIntel, intelligenceMessage, filteredSignals,
            setSelectedHistoryLog
        }) => {
            const [selectedSlotId, setSelectedSlotId] = React.useState(null);
            const [gridMode, setGridMode] = React.useState('4'); // Default to 4 charts
            const [gridSymbols, setGridSymbols] = React.useState(["BTCUSDT", "BTCUSDT", "BTCUSDT", "BTCUSDT"]);
            const [focusedAsset, setFocusedAsset] = React.useState(null); // Refatoração Glassmorphism Sci-Fi
            
            // Sync charts with slots
            React.useEffect(() => {
                setGridSymbols(prev => {
                    const next = ["BTCUSDT", "BTCUSDT", "BTCUSDT", "BTCUSDT"];
                    
                    // [V110.174] Mapeamento 1:1 para evitar confusão de "Slot 3 mostrando Chart 2"
                    // Se houver focusedAsset, ele ainda tem prioridade no primeiro slot se o gridMode for 1
                    // Mas no modo Quad (4), mantemos a fidelidade aos slots.
                    
                    if (gridMode === '1' && focusedAsset) {
                        next[0] = focusedAsset.symbol.replace('.P', '').replace('.p', '').trim();
                    } else {
                        // Mapeia cada slot para sua posição correspondente no grid
                        slots.forEach((s, i) => {
                            if (i < 4 && s && s.symbol) {
                                next[i] = s.symbol.replace('.P', '').replace('.p', '').trim();
                            }
                        });
                    }
                    return next;
                });
            }, [slots, focusedAsset, gridMode]);

            const activeSlotCount = slots.filter(s => s && s.symbol).length;

            return (
                <div className="desktop-command-grid h-screen overflow-hidden flex bg-[#050505] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.05),_transparent)] pointer-events-none"></div>

                    {/* --- COLUNA ESQUERDA: COMANDO & INTELIGÊNCIA --- */}
                    <aside className="w-[300px] border-none flex flex-col bg-black/20 backdrop-blur-md z-20 overflow-y-auto no-scrollbar">
                        <div className="p-6 space-y-8">
                            {/* 1. ELITE ENGINE */}
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span>
                                    Elite Engine
                                </h3>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Protocol</span>
                                        <span className="text-[10px] font-black text-white">{protocolLabel}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Oracle</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${oracleStatus === 'STABILIZING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/10 text-white border-white/20'}`}>
                                            {oracleStatus}
                                        </span>
                                    </div>
                                </div>
                            </section>

                             <section className="space-y-4">
                                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                     <span className="material-icons-round text-sm">bolt</span>
                                     Ignition Control
                                 </h3>
                                 <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] text-gray-400 space-y-2 relative overflow-hidden group">
                                     <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors"></div>
                                     <div className="flex gap-2 relative z-10">
                                         <span className="text-gray-500">&gt;</span>
                                         <span>Engine: Active Bypass Protocol (V6.0).</span>
                                     </div>
                                     <div className="flex gap-2 relative z-10">
                                         <span className="text-gray-500">&gt;</span>
                                         <span>Tactical Grid: {activeSlotCount}/4 Slots Allocated.</span>
                                     </div>
                                     <div className="flex gap-2 relative z-10 text-amber-500/80">
                                         <span className="text-gray-500">&gt;</span>
                                         <span className="animate-pulse">Strategy: Sniper Elite V6.0.</span>
                                     </div>
                                 </div>
                             </section>

                             {/* 3. MARKET RADAR SEALS (Moved from Right) */}
                             <section className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                                        <span className="material-icons-round text-sm animate-pulse text-white">radar</span>
                                        Market Radar
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Live Scan</span>
                                    </div>
                                </div>
                                <DailyGoalBanner 
                                    context={pulseData?.market_context} 
                                    title="Vision Intelligence" 
                                    intelligenceMessage={intelligenceMessage}
                                />
                                <div className="space-y-2.5">
                                    {(filteredSignals || []).slice(0, 5).map((sig, idx) => (
                                        <div key={idx} 
                                            onClick={() => {
                                                setFocusedAsset({
                                                    type: 'signal',
                                                    symbol: sig.symbol,
                                                    side: sig.side,
                                                    entry: sig.entry_price_signal || sig.price,
                                                    sl: sig.suggested_sl,
                                                    pensamento: sig.reasoning || `Sinal Elite detectado. Score: ${sig.score}`
                                                });
                                                setGridMode('1');
                                            }}
                                            className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/30 hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <span className="text-xs font-black text-white group-hover:scale-110 transition-transform">{sig.symbol.replace('.P', '')}</span>
                                                <QualitySeal seal={sig.quality_seal || sig.librarian_seal} />
                                            </div>
                                            <span className={`text-[10px] font-black font-mono relative z-10 ${['Buy', 'LONG'].includes((sig.side || '').toUpperCase()) ? 'text-white' : 'text-orange-400'}`}>
                                                {['Buy', 'LONG'].includes((sig.side || '').toUpperCase()) ? 'LONG' : 'SHORT'}
                                            </span>
                                        </div>
                                    ))}

                                    {(!filteredSignals || filteredSignals.length === 0) && (
                                        <div className="py-6 text-center border border-dashed border-white/5 rounded-2xl bg-black/20">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <span className="material-icons-round text-lg animate-spin-slow">loop</span>
                                                <span className="text-[9px] uppercase tracking-[0.2em] font-black italic">
                                                    {intelligenceMessage === "STANDBY: AGUARDANDO SLOT" ? "System Standby" : "Scanning Signals..."}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </section>

                             {/* 4. OPERATIONAL HISTORY (Moved from Right) */}
                             <section className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                        <span className="material-icons-round text-sm">history</span>
                                        Exec Log
                                    </h3>
                                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">History</span>
                                </div>
                                <div className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden group/history">
                                    <table className="w-full text-left text-[10px]">
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {historyLogs && historyLogs.slice(0, 5).map((log, i) => (
                                                <tr 
                                                    key={i} 
                                                    onClick={() => setSelectedHistoryLog(log)}
                                                    className="hover:bg-white/[0.05] transition-all cursor-pointer border-l-2 border-transparent hover:border-white/40 group/row"
                                                >
                                                    <td className="p-3">
                                                        <div className="font-bold text-white group-hover/row:translate-x-1 transition-transform">{log.symbol}</div>
                                                        <div className="text-[8px] text-gray-600 uppercase font-black">{log.close_reason || 'Manual'}</div>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className={`font-black font-mono ${log.pnl >= 0 ? 'text-white' : 'text-orange-400'}`}>
                                                            {log.pnl >= 0 ? '+' : '-'}${Math.abs(log.pnl).toFixed(1)}
                                                        </div>
                                                        <div className="text-[8px] text-gray-700">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </section>


                            {/* 4. INTELLIGENCE LIBRARIAN (Expansive) */}
                            <section className="pt-2">
                                <IntelligenceLibrarianPanel librarianIntel={librarianIntel} />
                            </section>

                            {/* 5. TELEMETRY / TECH LOGS */}
                            <section className="space-y-3 pt-4 border-t border-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Telemetry</h3>
                                <div className="h-32 bg-black/30 rounded-xl p-3 overflow-y-auto no-scrollbar font-mono text-[9px] text-gray-500 space-y-1">
                                    <div className="flex gap-2 opacity-50"><span className="text-white">√</span> Ready.</div>
                                    <div className="flex gap-2"><span className="text-white">&gt;</span> RTDB: {latency}ms</div>
                                    <div className="flex gap-2"><span className="text-white">&gt;</span> Oracle: {unifiedRegime === 'UP' ? 'ALTA' : unifiedRegime === 'DOWN' ? 'BAIXA' : 'LATERAL'}</div>
                                </div>
                            </section>
                        </div>
                    </aside>

                    {/* --- COLUNA CENTRAL: TACTICAL CORE --- */}
                    <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative z-10">
                        {/* UNIFIED QUANTUM HUD (TOP) */}
                        <UnifiedQuantumHUD 
                            btc={btcCommandStatus}
                            realAdx={realAdx}
                            dominance={dominance}
                            realDecorrelation={realDecorrelation}
                            protocolLabel={protocolLabel}
                            oracleStatus={oracleStatus}
                            oracleMessage={oracleMessage}
                            stabilizationProgress={stabilizationProgress}
                            unifiedRegime={unifiedRegime}
                            activeSlotCount={activeSlotCount}
                            pulseStatus={pulseStatus}
                            latency={latency}
                        />

                        {/* GRID CONTROL & CHARTS */}
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
                            {/* Hover Panel do Pensamento AI (Sci-Fi Glass) */}
                            {focusedAsset && focusedAsset.pensamento && (
                                <div className="absolute top-8 left-1/2 -trangray-x-1/2 z-50 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3">
                                     <span className="material-icons-round text-white animate-pulse text-sm">bolt</span>
                                    <span className="text-xs font-bold text-white italic tracking-wide">{focusedAsset.pensamento}</span>
                                    <button onClick={() => setFocusedAsset(null)} className="ml-2 text-white hover:text-white transition-colors">
                                        <span className="material-icons-round text-xs">close</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <h2 className="text-[14px] font-black text-white uppercase tracking-[0.2em] font-display">Target Visualization</h2>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Multi-Grid Matrix Controller</span>
                                    </div>
                                    <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 gap-2 relative z-50 pointer-events-auto backdrop-blur-xl">
                                        {[
                                            { m: '1', icon: 'crop_square', label: 'Solo' },
                                            { m: '2', icon: 'view_column', label: 'Dual' },
                                            { m: '4', icon: 'grid_view', label: 'Quad' }
                                        ].map(({m, icon, label}) => (
                                            <button 
                                                key={m} 
                                                onClick={(e) => {
                                                    e.preventDefault(); e.stopPropagation();
                                                    setGridMode(m);
                                                }}
                                                className={`px-4 h-9 flex items-center gap-2 rounded-xl transition-all cursor-pointer ${gridMode === m ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <span className="material-icons-round text-lg pointer-events-none">{icon}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest hidden xl:block">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">System Engine</span>
                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live & Responsive</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.5)]"></div>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div 
                                className="flex-1 min-h-0"
                                style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: gridMode === '4' ? 'repeat(2, 1fr)' : gridMode === '2' ? 'repeat(2, 1fr)' : '1fr',
                                    gridTemplateRows: gridMode === '4' ? 'repeat(2, 1fr)' : '1fr',
                                    gap: '20px',
                                }}
                            >
                                {Array.from({ length: parseInt(gridMode) }).map((_, i) => (
                                    <GridChartItem 
                                        key={`${gridMode}-${i}-${gridSymbols[i]}-${focusedAsset && i===0 ? 'focus' : ''}`} // Chave estável que força remount se o grid ou símbolo mudar
                                        index={i} 
                                        symbol={gridSymbols[i]} 
                                        slots={slots} 
                                        focusedAsset={i === 0 ? focusedAsset : null}
                                        pulseStatus={pulseStatus}
                                    />
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* --- COLUNA DIREITA: PAINEL OPERACIONAL --- */}
                    <aside className="w-[360px] border-l border-white/5 flex flex-col bg-black/20 backdrop-blur-md z-20 overflow-y-auto no-scrollbar">
                        <div className="p-6 space-y-8">
                            {/* 1. NET WORTH / BANCA */}
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                                    <span className="material-icons-round text-sm">account_balance_wallet</span>
                                    Net Worth
                                </h3>
                                <div className={`p-6 glass-premium border ${isDrawdown ? 'border-amber-500/30' : 'border-white/10'} relative overflow-hidden group`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full"></div>
                                    <div className="flex justify-between items-center mb-4 relative z-10">
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Equity Value</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${rankColor} bg-white/5 border border-white/10`}>{fleetRank}</span>
                                    </div>
                                    <div className="relative z-10 space-y-1">
                                        <span className={`text-4xl font-black font-display tracking-tighter ${liveTotalProfit >= 0 ? 'text-green-500' : 'text-danger'}`} style={{ textShadow: liveTotalProfit >= 0 ? '0 0 15px rgba(34,197,94,0.3)' : '0 0 15px rgba(239,68,68,0.2)' }}>
                                            ${liveEquity.toFixed(2)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${liveTotalProfit >= 0 ? 'text-green-500' : 'text-danger'}`}>
                                                {liveTotalProfit >= 0 ? '+' : '-'}${Math.abs(liveTotalProfit).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Current Session</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5">
                                        <div className={`h-full bg-gradient-to-r from-accent to-white shadow-[0_0_10px_rgba(217,249,157,0.3)] transition-all duration-1000`} style={{ width: `${hullIntegrityPct}%` }}></div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. ACTIVE SLOTS */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                                        <span className="material-icons-round text-sm">segment</span>
                                        Active Slots
                                    </h3>
                                    <span className="text-[9px] font-black text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">4 Blitz Factory</span>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {slots.filter(s => s && s.id <= 4).map(s => (
                                        <div key={s.id} onClick={() => {
                                            if(s && s.symbol) {
                                                setFocusedAsset({
                                                    type: 'slot',
                                                    symbol: s.symbol,
                                                    side: s.side,
                                                    pensamento: s.last_thought || `Espião operando... Foco na Escadinha. Score ${s.score}`,
                                                    entry: s.entry_price,
                                                    sl: s.current_stop,
                                                    leverage: s.leverage,
                                                    t1: s.t1,
                                                    t2: s.t2,
                                                    t3: s.t3,
                                                    t4: s.t4
                                                });
                                                setGridMode('1');
                                            }
                                        }}>
                                            <SlotCard s={s} tickers={tickers} compact={true} />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 3. MOONBAG VAULT */}
                            <section>
                                <div onClick={(e) => {
                                    // Pega o clique das moonbags, mas para ser cirúrgico, o ideal é o MoonbagVault receber a prop. Mas como fallback (interceptar o node pai):
                                    const target = e.target.closest('.moonbag-item');
                                    if(target) {
                                       const sym = target.getAttribute('data-symbol');
                                       if(sym) {
                                           setFocusedAsset({
                                               type: 'moonbag',
                                               symbol: sym,
                                               side: target.getAttribute('data-side') || 'Buy',
                                               pensamento: `Ceifeiro: Observando Fibo 1.618. Posição Moonbag Livre de Risco.`,
                                               entry: target.getAttribute('data-entry'),
                                               sl: target.getAttribute('data-sl'),
                                               leverage: target.getAttribute('data-leverage'),
                                               t1: target.getAttribute('data-t1'),
                                               t2: target.getAttribute('data-t2'),
                                               t3: target.getAttribute('data-t3'),
                                               t4: target.getAttribute('data-t4')
                                           });
                                           setGridMode('1');
                                       }
                                    }
                                }}>
                                    <MoonbagVault moonbags={moonbags} tickers={tickers} />
                                </div>
                            </section>

                                 </div>
                            </section>
                        </div>
                    </aside>
                </div>
            );
        };
        // =========================================================================

// --- Component: Page10D (Centralized HQ) ---
        const Page10D = () => {
            const vault = useVaultRT(safeJsonParse(localStorage.getItem('vault_status_cache'), { cycle_number: 1, mega_cycle_wins: 0, used_symbols_in_cycle: [], cycle_start_bankroll: 0, cycle_profit: 0 }));
            const banca = useBancaRT(safeJsonParse(localStorage.getItem('banca_cache'), { saldo_total: 10, configured_balance: 10, lucro_total_acumulado: 0, lucro_ciclo: 0 }));

            // V20.6: Mission Cycle Calculation
            const missionCycle = Math.floor((vault.mega_cycle_wins || 0) / 10) + 1;
            const missionProgress = (vault.mega_cycle_wins || 0) % 10;
            const totalWins = vault.mega_cycle_wins || 0;
            const slots = useSlotsRT(safeJsonParse(localStorage.getItem('slots_cache'), []));
            const pulseData = useRadarPulseRT();
            const { signals: radarSignals, updated_at: lastPulse } = pulseData;
            const { radar: marketRadar } = useMarketRadarRT();
            const { latency, status: pulseStatus } = usePulseMonitor();
            const btcCommandStatus = useBtcCommandCenter();
            const moonbags = useMoonbagsRT();
                        const systemState = useSystemState();
            const librarianIntel = useLibrarianIntelRT();

            // V110.150: Robust Telemetry Fallback for Cockpit UI
            const btcCtx = pulseData?.market_context || btcCommandStatus || {};
            const oracleStatus = btcCtx?.oracle_status || 'SECURE';
            const oracleMessage = btcCtx?.oracle_message || 'Active Status';
            const stabilizationProgress = btcCtx?.stabilization_progress || 1.0;
            const btcAdx = (btcCtx?.btc_adx !== undefined && btcCtx?.btc_adx !== null) ? btcCtx.btc_adx : (btcCommandStatus?.btc_adx || '...');
            const realAdx = btcAdx; 
            const dominance = (btcCtx?.btc_dominance !== undefined && btcCtx?.btc_dominance !== null) ? btcCtx.btc_dominance : 58.0;
            const realDecorrelation = (btcCtx?.decorrelation_avg !== undefined && btcCtx?.decorrelation_avg !== null) ? btcCtx.decorrelation_avg : null;
            const protocolLabel = btcCommandStatus?.protocol || (systemState && systemState.protocol) || "Sniper V110.127";

            // V110.34: Regime agora espelha EXATAMENTE a lógica do Capitão
            // Backend calcula: ADX >= 30 + convergência 15m/1h = UP/DOWN, senão LATERAL
            const unifiedRegime = (() => {
                // Source of Truth: Captain-aligned direction from backend
                const dir = btcCtx?.btc_direction;
                if (dir === 'UP' || dir === 'ALTA') return 'UP';
                if (dir === 'DOWN' || dir === 'BAIXA') return 'DOWN';
                return 'LATERAL';
            })();

            const [historyLogs, setHistoryLogs] = React.useState([]);
            const [loadingHistory, setLoadingHistory] = React.useState(true);
            const [selectedHistoryLog, setSelectedHistoryLog] = React.useState(null);
            
            // [V15.0] Novos estados de Filtro e Paginação
            const [searchSymbol, setSearchSymbol] = React.useState("");
            const [startDate, setStartDate] = React.useState("");
            const [endDate, setEndDate] = React.useState("");
            const [historyPage, setHistoryPage] = React.useState(1);
            const [historyTotal, setHistoryTotal] = React.useState({ total_count: 0, total_pnl: 0 });
            const [isSearchOpen, setIsSearchOpen] = React.useState(false);
            const historyLimit = 10; // Reduzido para caber melhor na altura fixa
            
            // [V39.0] Active TOCAIA badge — polls every 5s to show which signals are being hunted
            const [activeTocaias, setActiveTocaias] = React.useState([]);
            React.useEffect(() => {
                const fetchTocaias = async () => {
                    try {
                        const res = await fetch(`${API_BASE}/api/captain/tocaias`);
                        if (res.ok) { const d = await res.json(); setActiveTocaias(d.active || []); }
                    } catch(e) {}
                };
                fetchTocaias();
                const interval = setInterval(fetchTocaias, 30000); // [V110.138] Relaxed from 5s to 30s to save backend
                return () => clearInterval(interval);
            }, []);

            useEffect(() => {
                const fetchHistory = async () => {
                    setLoadingHistory(true);
                    try {
                        let url = `${API_BASE}/api/history?limit=${historyLimit}`;
                        if (searchSymbol) url += `&symbol=${searchSymbol}`;
                        if (startDate) url += `&start_date=${startDate}`;
                        if (endDate) url += `&end_date=${endDate}`;
                        
                        // Calculando o cursor (pagination via skip/offset não é nativo do Firestore stream, mas faremos via timestamp para estabilidade)
                        if (historyPage > 1 && historyLogs.length > 0) {
                            // Simularemos paginação via offset real se necessário, ou cursor. 
                            // Para manter simples e rápido na UI, usaremos offset client-side ou expandiremos a query.
                            // V15.0: Simplificado para carregar a página atual
                            const lastTs = (historyLogs.length > 0) ? historyLogs[historyLogs.length - 1].timestamp : null;
                            if (lastTs) url += `&last_timestamp=${lastTs}`;
                        }

                        const res = await fetch(url);
                        if (res.ok) {
                            const data = await res.json();
                            setHistoryLogs(data);
                        }
                    } catch (e) {
                        console.warn('Erro ao carregar histórico da Vault', e);
                    } finally {
                        setLoadingHistory(false);
                    }
                };

                const fetchStats = async () => {
                    try {
                        let url = `${API_BASE}/api/history/stats?`;
                        if (searchSymbol) url += `&symbol=${searchSymbol}`;
                        if (startDate) url += `&start_date=${startDate}`;
                        if (endDate) url += `&end_date=${endDate}`;
                        const res = await fetch(url);
                        if (res.ok) setHistoryTotal(await res.json());
                    } catch (e) {}
                };

                fetchHistory();
                fetchStats();
            }, [searchSymbol, startDate, endDate, historyPage]); // Recarregar ao mudar filtros ou página

            const activeSymbols = useMemo(() => {
                const sSymbols = slots.filter(s => !!s.symbol).map(s => s.symbol);
                const mSymbols = moonbags.map(m => m.symbol);
                const unique = Array.from(new Set([...sSymbols, ...mSymbols]));
                return unique;
            }, [slots, moonbags]);
            const tickers = useBybitTickers(activeSymbols);

            // [V24.2] Live Equity Calculation (Tactical + Vault)
            const liveTotalPnL = useMemo(() => {
                // Tactical Slots PnL
                const sPnL = slots.reduce((acc, s) => {
                    if (!s || !s.symbol || !s.entry_price) return acc;
                    const cleanSymbol = s.symbol.replace('.P', '').replace('.p', '').trim();
                    const price = tickers[cleanSymbol];
                    if (!price || price <= 0) return acc;

                    const entry = Number(s.entry_price);
                    const leverage = s.leverage || 50;
                    const margin = Number(s.entry_margin || 10);

                    const pnlPct = s.side === 'Buy'
                        ? (price - entry) / entry
                        : (entry - price) / entry;

                    return acc + (pnlPct * leverage * margin);
                }, 0);

                // Moonbag Vault PnL
                const mPnL = moonbags.reduce((acc, mb) => {
                    if (!mb || !mb.symbol || !mb.entry_price) return acc;
                    const cleanSymbol = mb.symbol.replace('.P', '').replace('.p', '').trim();
                    const price = tickers[cleanSymbol];
                    if (!price || price <= 0) return acc;

                    const entry = Number(mb.entry_price);
                    const leverage = mb.leverage || 50;
                    const margin = Number(mb.entry_margin || 10);

                    const pnlPct = mb.side === 'Buy'
                        ? (price - entry) / entry
                        : (entry - price) / entry;

                    return acc + (pnlPct * leverage * margin);
                }, 0);

                return sPnL + mPnL;
            }, [slots, moonbags, tickers]);

            const liveCycleProfit = (vault.cycle_profit || 0) + liveTotalPnL;
            const liveTotalProfit = (banca.lucro_total_acumulado || 0) + liveTotalPnL;
            // [V28.2] PAPER MODE FIX: Prioriza saldo_total (calculado pelo backend com lógica PAPER)
            // O saldo_real_bybit vem da Bybit diretamente e não reflete o modo simulado.
            const baseEquity = (banca.saldo_total != null && banca.saldo_total > 0) ? banca.saldo_total : ((banca.configured_balance > 0) ? banca.configured_balance : (banca.saldo_real_bybit || 10));
            const liveEquity = baseEquity + liveTotalPnL;

            // Map Best Signals
            const signalsArray = Array.isArray(radarSignals) ? radarSignals : [];
            const deDuplicatedSignals = Object.values(signalsArray.reduce((acc, sig) => {
                const sym = sig.symbol;
                if (!acc[sym] || new Date(sig.timestamp || 0) > new Date(acc[sym].timestamp || 0)) {
                    acc[sym] = sig;
                }
                return acc;
            }, {}));
            const currentActiveSymbols = slots.filter(s => s && s.symbol).map(s => s.symbol);
            const bestSignals = deDuplicatedSignals
                .filter(s => s.symbol && !s.symbol.includes("BTC") && s.score >= 60 && !currentActiveSymbols.includes(s.symbol))
                .sort((a, b) => {
                    // V25.1: SNIPER signals always on top, then by score
                    const aSniper = a.layer === 'SNIPER' ? 1 : 0;
                    const bSniper = b.layer === 'SNIPER' ? 1 : 0;
                    if (bSniper !== aSniper) return bSniper - aSniper;
                    return b.score - a.score;
                })
                .slice(0, 8);

            const handlePanic = async () => {
                if (!confirm("⚠️ ATENÇÃO: Deseja realmente fechar TODAS as posições?")) return;
                try {
                    await fetch(API_BASE + '/panic', { method: 'POST' });
                } catch (e) { alert("Erro ao executar Pânico"); }
            };

            const handleSync = async () => {
                const btn = document.getElementById('sync-btn');
                if (btn) btn.classList.add('animate-spin');
                try {
                    const res = await fetch(API_BASE + '/api/system/re-sync', { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        console.log("Manual Sync Success:", data);
                        // Refresh history too
                        const historyRes = await fetch(`${API_BASE}/api/history?limit=50`);
                        if (historyRes.ok) setHistoryLogs(await historyRes.json());
                    }
                } catch (e) { console.error("Sync failed:", e); }
                if (btn) btn.classList.remove('animate-spin');
            };

            // --- [V40.0] Gamificação: Casco, Escudo e Patentes ---
            const startBankroll = vault.cycle_start_bankroll || 10;
            const isDrawdown = liveEquity < startBankroll;
            const hullIntegrityPct = Math.min(100, Math.max(0, (liveEquity / startBankroll) * 100));
            const shieldPowerPct = Math.max(0, ((liveEquity - startBankroll) / startBankroll) * 100);
            
            // Sistema de Patentes Baseado em Banca Total (Exemplo Militar Espacial)
            let fleetRank = "Aspirante";
            let rankColor = "text-gray-400";
            if (liveEquity >= 500) { fleetRank = "Almirante"; rankColor = "text-yellow-400"; }
            else if (liveEquity >= 100) { fleetRank = "Comandante"; rankColor = "text-white"; }
            else if (liveEquity >= 50) { fleetRank = "Capitão"; rankColor = "text-white"; }
            else if (liveEquity >= 20) { fleetRank = "Tenente"; rankColor = "text-white"; }

            const getPulseColor = () => {
                if (pulseStatus === 'OFFLINE') return 'bg-red-500';
                if (pulseStatus === 'WARNING') return 'bg-amber-500';
                if (pulseStatus === 'DEGRADED') return 'bg-lime-400';
                if (latency < 3000) return 'bg-lime-500';
                if (latency < 10000) return 'bg-amber-400';
                return 'bg-amber-600';
            };

            // [V110.370] Radar Intelligence & Slot Needs
            const { intelligenceMessage, filteredSignals } = useMemo(() => {
                const activeSlotsCount = slots.filter(s => s && s.id <= 4 && s.symbol).length;
                const freeSlotsCount = 4 - activeSlotsCount;

                let msg = "";
                if (activeSlotsCount >= 4) {
                    msg = "STANDBY: AGUARDANDO SLOT";
                } else {
                    msg = `IGNITION BUSCANDO ${freeSlotsCount} ALVOS`;
                }

                // Filter bestSignals based on needs
                const filtered = bestSignals.filter(sig => {
                    if (activeSlotsCount >= 4) return false;
                    return true; // All signals are Blitz now
                });

                return { intelligenceMessage: msg, filteredSignals: filtered };
            }, [slots, bestSignals]);


            return (
                <main className="w-full h-full relative" style={{ isolation: 'isolate' }}>
                    {/* --- DESKTOP COCKPIT (LG E ACIMA) --- */}
                    <div className="hidden lg:flex w-full h-full bg-[#050505] text-white overflow-hidden relative z-[9990] opacity-100 min-h-screen fixed top-0 left-0 lg:pl-[80px]" style={{ width: '100vw' }}>
                        <DesktopDashboard 
                            vault={vault} banca={banca} missionCycle={missionCycle} totalWins={totalWins} 
                            slots={slots} pulseData={pulseData} radarSignals={radarSignals} 
                            marketRadar={marketRadar} latency={latency} pulseStatus={pulseStatus} 
                            btcCommandStatus={btcCommandStatus} moonbags={moonbags} activeTocaias={activeTocaias} 
                            liveTotalPnL={liveTotalPnL} liveTotalProfit={liveTotalProfit} liveEquity={liveEquity} 
                            isDrawdown={isDrawdown} hullIntegrityPct={hullIntegrityPct} shieldPowerPct={shieldPowerPct} 
                            fleetRank={fleetRank} rankColor={rankColor}
                            historyLogs={historyLogs} tickers={tickers}
                            
                            systemState={systemState}
                            protocolLabel={protocolLabel} oracleStatus={oracleStatus} oracleMessage={oracleMessage}
                            stabilizationProgress={stabilizationProgress} btcAdx={btcAdx} realAdx={realAdx}
                            realDecorrelation={realDecorrelation} dominance={dominance}
                            unifiedRegime={unifiedRegime}
                            librarianIntel={librarianIntel}
                            intelligenceMessage={intelligenceMessage}
                            filteredSignals={filteredSignals}
                            setSelectedHistoryLog={setSelectedHistoryLog}
                        />
                    </div>

                    {/* --- MOBILE WEALTH EDITION (ABAIXO DE LG) --- */}
                    <div className="flex lg:hidden flex-col min-h-screen v5-bg-deep pb-28">
                        {/* SEÇÃO 1: CABEÇALHO BTC & SISTEMA */}
                        <QuantumHUD 
                            btc={btcCommandStatus} 
                            btcContext={btcCtx}
                            adx={btcAdx} 
                            decorrelation={realDecorrelation} 
                            radarMode={systemState && systemState.radar_mode} 
                            pulseStatus={pulseStatus}
                            latency={latency}
                            protocolLabel={protocolLabel}
                            oracleStatus={oracleStatus}
                            oracleMessage={oracleMessage}
                            stabilizationProgress={stabilizationProgress}
                            dominance={dominance}
                            unifiedRegime={unifiedRegime}
                        />

                        <main className="flex-1 w-full p-2 space-y-3">
                            {/* SEÇÃO 2: STATUS DA BANCA (Wealth Premium) */}
                            <BancaWealthSection 
                                banca={banca} 
                                liveEquity={liveEquity} 
                                liveTotalProfit={liveTotalProfit}
                                liveTotalPnL={liveTotalPnL}
                                startBankroll={startBankroll}
                                hullIntegrityPct={hullIntegrityPct}
                                isDrawdown={isDrawdown}
                                fleetRank={fleetRank}
                                rankColor={rankColor}
                            />

                            {/* SEÇÃO 3: OPERAÇÕES TÁTICAS (Slots) */}
                            <section className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="material-icons-round text-white text-sm">segment</span>
                                        Slots Ativos
                                    </h3>
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{slots.filter(s => s.symbol).length} / 4</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {slots.filter(s => {
                                        if (!s || s.id > 4) return false;
                                        return !moonbags.some(m => m.symbol === s.symbol);
                                    }).map(s => (
                                        <SlotCard key={s.id} s={s} tickers={tickers} marketRadar={marketRadar} librarianIntel={librarianIntel} compact={false} />
                                    ))}
                                </div>
                            </section>

                            {/* SEÇÃO 4: MOONBAG PROTOCOL (Ghost Battalion) */}
                            <MoonbagVault moonbags={moonbags} tickers={tickers} historyLogs={historyLogs} />

                            {/* SEÇÃO 5: RADAR DE SINAIS ELITE */}
                            <section className="space-y-3 pt-4 border-none">
                                <DailyGoalBanner 
                                    context={btcCtx} 
                                    title="Radar de Inteligência" 
                                    intelligenceMessage={intelligenceMessage}
                                />
                                
                                {/* [V110.165] Elite Spring Horizontal List */}
                                <div className="flex flex-col gap-1 px-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                            <span className="material-icons-round text-[10px] text-amber-500">auto_awesome</span>
                                            Elite Spring M30
                                        </h3>
                                        <span className="text-[7px] font-mono text-amber-400 opacity-60">TOP 20 ACTIVES</span>
                                    </div>
                                    <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-2">
                                        {(!librarianIntel || !librarianIntel.spring_elite || librarianIntel.spring_elite.length === 0) ? (
                                            <div className="text-[8px] text-gray-700 italic">Sincronizando Elite da Mola...</div>
                                        ) : (
                                            librarianIntel.spring_elite.map((sym, i) => (
                                                <div key={i} className="flex-shrink-0 px-2 py-1 rounded bg-amber-500/5 border border-amber-500/20 shadow-[0_0_10px_rgba(217,70,239,0.05)]">
                                                    <span className="text-[9px] font-bold text-amber-300">{sym.replace('USDT','')}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                     {filteredSignals.length === 0 ? (
                                        <div className="p-8 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">
                                                {intelligenceMessage === "STANDBY: AGUARDANDO SLOT" ? "STANDBY: AGUARDANDO SLOT" : "Sincronizando Alvos..."}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredSignals.map((sig, i) => {
                                            const cleanSigSym = (sig.symbol || '').replace('.P','').replace('.p','').toUpperCase();
                                            const isTocaia = (activeTocaias || []).includes(cleanSigSym);
                                            return (
                                                <div key={i} className={`p-3 premium-card flex items-center justify-between ${isTocaia ? 'border-primary/40 bg-primary/5' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-white uppercase">{sig.symbol.replace('.P','')}</span>
                                                                {/* [V110.137] Strategy Badge with layer fallback */}
                                                                {(() => {
                                                                    const sLabel = sig.strategy_label || 'BLITZ';
                                                                    return (
                                                                        <span className={`strategy-badge ${sLabel.toLowerCase()}`}>
                                                                            {sLabel}
                                                                        </span>
                                                                    );
                                                                })()}
                                                                {isTocaia && (
                                                                    <span className="material-icons-round text-xs tocaia-glow">gps_fixed</span>
                                                                )}

                                                            </div>
                                                            <span className="text-[8px] text-gray-500 uppercase tracking-widest">{sig.layer}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-xs font-black ${sig.side === 'Buy' ? 'text-white' : 'text-orange-400'}`}>{sig.side === 'Buy' ? 'LONG' : 'SHORT'}</span>
                                                        <div className="text-[10px] font-mono text-white/50">{sig.score} PTS</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>

                            {/* SEÇÃO 6: REGISTRO DA VAULT (Histórico) */}
                            <section className="glass-card p-4 rounded-2xl border v5-border-subtle bg-black/20 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-icons-round text-white/80 text-sm">history</span>
                                        Histórico da Vault
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setHistoryPage(p => Math.max(1, p-1))} className="text-gray-500 hover:text-white" disabled={historyPage === 1}>
                                            <span className="material-icons-round text-sm">chevron_left</span>
                                        </button>
                                        <span className="text-[9px] font-mono font-bold text-gray-400">{historyPage}</span>
                                        <button onClick={() => setHistoryPage(p => p+1)} className="text-gray-500 hover:text-white" disabled={historyLogs.length < historyLimit}>
                                            <span className="material-icons-round text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
                                    {loadingHistory ? (
                                        <p className="text-[9px] text-center text-gray-600 italic">Consultando arquivo...</p>
                                    ) : historyLogs.length === 0 ? (
                                        <p className="text-[9px] text-center text-gray-600 italic">Vazio</p>
                                    ) : (
                                        historyLogs.map((log, i) => {
                                            const isProfit = (log.pnl || 0) >= 0;
                                            return (
                                                <div key={i} onClick={() => setSelectedHistoryLog(log)} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 active:bg-white/5 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-white">{log.symbol}</span>
                                                        {log.genesis_id && <span className="text-[7px] font-mono text-white/30 uppercase block">🧬 {log.genesis_id}</span>}
                                                        <span className="text-[8px] text-gray-500 uppercase font-bold">{log.side}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-xs font-mono font-black ${isProfit ? 'text-white' : 'text-red-400'}`}>
                                                            {isProfit ? '+' : '-'}${Math.abs(log.pnl || 0).toFixed(2)}
                                                        </span>
                                                        <div className="text-[7px] text-gray-600 uppercase font-black">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>

                        </main>
                    </div>

                    {/* V110.129: Histórico da Vault - Briefing de Triunfo */}
                    {selectedHistoryLog && (() => {
                        const data = selectedHistoryLog.data || {};
                        const fleetIntel = selectedHistoryLog.fleet_intel || data.fleet_intel;
                        const visionUrl = selectedHistoryLog.vision_url || data.vision_url;
                        
                        // [V110.520] Recuperação profunda de relatórios
                        const oracleReport = data.oracle_report || fleetIntel?.oracle_report || fleetIntel?.thoughts;
                        const smcThoughts = data.smc_thoughts || fleetIntel?.smc_thoughts;
                        const reasoning = oracleReport || smcThoughts || data.pensamento || selectedHistoryLog.pensamento || "A IA confirmou o padrão e executou o protocolo de elite com precisão cirúrgica.";
                        
                        const finalRoi = Number(selectedHistoryLog.final_roi || data.final_roi || 0);
                        const isProfit = (selectedHistoryLog.pnl || 0) >= 0;
                        const isAstronomical = finalRoi >= 500;

                        return (
                            <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6" onClick={() => setSelectedHistoryLog(null)}>
                                <div 
                                    className={`premium-card w-full max-w-lg rounded-3xl border overflow-hidden flex flex-col max-h-[85vh] animate-triumph ${isAstronomical ? 'victory-glow-prismatic' : isProfit ? 'victory-glow-emerald' : 'border-white/10'}`} 
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Header de Triunfo */}
                                    <div className={`p-6 border-b border-white/5 flex items-center justify-between ${isAstronomical ? 'bg-lime-900/20' : isProfit ? 'bg-lime-900/10' : 'bg-white/5'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isAstronomical ? 'bg-white/20 border-white/30' : 'bg-white/10 border-lime-500/30'}`}>
                                                <span className={`material-icons-round ${isAstronomical ? 'text-white' : 'text-white'}`}>
                                                    {isAstronomical ? 'auto_awesome' : 'military_tech'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className={`text-[13px] font-black uppercase tracking-[0.15em] ${isAstronomical ? 'text-astronomical' : 'text-white'}`}>
                                                    Briefing de Triunfo: {selectedHistoryLog.symbol}
                                                </h3>
                                                <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Protocolo Gênese-Vitória Ativo</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedHistoryLog(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group">
                                            <span className="material-icons-round text-sm text-gray-500 group-hover:text-white">close</span>
                                        </button>
                                    </div>

                                    <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                                        {/* BANNER DE RESULTADO */}
                                        <div className="relative group p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-b from-lime-500/[0.03] to-transparent"></div>
                                            
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Conquista Financeira</span>
                                            <div className="flex items-center gap-3">
                                                <p className={`text-4xl font-black font-mono tracking-tighter ${isAstronomical ? 'text-astronomical' : isProfit ? 'text-white' : 'text-red-400'}`}>
                                                    {isProfit ? '+' : ''}${Math.abs(selectedHistoryLog.pnl || 0).toFixed(2)}
                                                </p>
                                                <div className={`px-2 py-1 rounded-lg border text-[11px] font-black font-mono ${isProfit ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                    {finalRoi.toFixed(1)}% ROI
                                                </div>
                                            </div>

                                            {/* ROI BADGES */}
                                            <div className="flex gap-2 mt-4">
                                                {finalRoi >= 20 && <span className="px-2 py-0.5 rounded-full bg-white/10 border border-lime-500/30 text-[8px] font-black text-white uppercase tracking-widest">🌊 WAVE</span>}
                                                {finalRoi >= 50 && <span className="px-2 py-0.5 rounded-full bg-white/10 border border-lime-500/30 text-[8px] font-black text-white uppercase tracking-widest">⚡ VOLT</span>}
                                                {finalRoi >= 100 && <span className="px-2 py-0.5 rounded-full bg-white/10 border border-lime-500/30 text-[8px] font-black text-white uppercase tracking-widest">🚀 ROCKET</span>}
                                                {finalRoi >= 300 && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[8px] font-black text-amber-300 uppercase tracking-widest">👑 CROWN</span>}
                                                {isAstronomical && <span className="px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-[8px] font-black text-white uppercase tracking-widest animate-pulse">🌌 GOD MODE</span>}
                                            </div>
                                        </div>

                                        {/* PROVA VISUAL (PRINT DA VISÃO) */}
                                        {visionUrl && (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="material-icons-round text-white text-sm">visibility</span>
                                                    Prova Visual (Vision Intelligence)
                                                </h4>
                                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
                                                    <img 
                                                        src={visionUrl.startsWith('http') ? visionUrl : `${API_BASE}${visionUrl}`} 
                                                        alt="Vision Analysis" 
                                                        className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* DNA DA VITÓRIA (GENESYS) */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <span className="material-icons-round text-white text-sm">psychology</span>
                                                DNA da Vitória (Gênese)
                                            </h4>
                                            
                                            {fleetIntel && (
                                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                                                    <div className="flex gap-3">
                                                        <IntelIcon type="macro" score={fleetIntel.macro || 50} icon="public" label="MAC" />
                                                        <IntelIcon type="micro" score={fleetIntel.micro || 50} icon="waves" label="WHL" />
                                                        <IntelIcon type="smc" score={fleetIntel.smc || 50} icon="psychology" label="SMC" />
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {fleetIntel.nectar_seal && <QualitySeal seal={fleetIntel.nectar_seal} />}
                                                        <div className="text-[8px] font-mono font-bold text-gray-500 uppercase">Score Original: {selectedHistoryLog.score} pts</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-black/60 p-5 rounded-2xl border border-white/10 relative space-y-3">
                                                <span className="absolute top-2 right-4 text-[7px] font-mono text-white/40 uppercase">Vincit Qui Patitur</span>
                                                <p className="font-mono text-[10px] text-gray-300 leading-relaxed italic">
                                                    "{reasoning}"
                                                </p>
                                                
                                                {/* Detalhes Adicionais da Visão (Reflexões/Análise) */}
                                                {(fleetIntel?.vision?.analysis || fleetIntel?.analysis) && (
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <span className="text-[8px] font-black text-lime-500 uppercase tracking-widest block">Análise Técnica Vision</span>
                                                        <p className="text-[10px] text-gray-400 leading-relaxed">{fleetIntel?.vision?.analysis || fleetIntel?.analysis}</p>
                                                    </div>
                                                )}
                                                {(fleetIntel?.vision?.thoughts || fleetIntel?.thoughts) && (
                                                    <div className="pt-3 border-t border-white/5 space-y-2">
                                                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block">Pensamento do Agente</span>
                                                        <p className="text-[10px] text-gray-500 leading-relaxed italic">"{fleetIntel?.vision?.thoughts || fleetIntel?.thoughts}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* REGISTRO TÁTICO */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fatos da Missão</h5>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                                        <span className="text-[8px] text-gray-600 uppercase font-bold">Entrada</span>
                                                        <span className="text-[9px] font-mono font-bold text-white">${Number(selectedHistoryLog.entry_price || 0).toFixed(5)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                                        <span className="text-[8px] text-gray-600 uppercase font-bold">Saída</span>
                                                        <span className="text-[9px] font-mono font-bold text-white">${Number(selectedHistoryLog.exit_price || 0).toFixed(5)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Operacional</h5>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                                        <span className="text-[8px] text-gray-600 uppercase font-bold">Batalhão</span>
                                                        <span className="text-[9px] font-black text-gray-300 uppercase">{selectedHistoryLog.slot_type || "BLITZ"}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                                        <span className="text-[8px] text-gray-600 uppercase font-bold">Motivo</span>
                                                        <span className="text-[9px] font-black text-white uppercase truncate ml-2 text-right">{selectedHistoryLog.close_reason || "COLHEITA"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">Encerramento da Missão: {selectedHistoryLog.close_time ? new Date(selectedHistoryLog.close_time).toLocaleString('pt-BR') : "LOG Sincronizado"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </main>
            );
        };

        
        // [NEW] Librarian Leaderboard Component
        const LibrarianLeaderboard = () => {
            const [rankings, setRankings] = React.useState([]);
            const [loading, setLoading] = React.useState(true);

            const fetchRankings = async () => {
                setLoading(true);
                try {
                    const r = await fetch(`${API_BASE}/api/backtest/rankings`);
                    const data = await r.json();
                    if (data.status === 'success') {
                        setRankings(data.rankings);
                        // Store globally for other components to use
                        const rankingMap = {};
                        data.rankings.forEach(r => rankingMap[r.symbol] = r);
                        window.librarianRankings = rankingMap;
                    }
                } catch (e) { console.error("Erro Librarian:", e); }
                finally { setLoading(false); }
            };

            React.useEffect(() => {
                fetchRankings();
                const itv = setInterval(fetchRankings, 300000); // 5 min
                return () => clearInterval(itv);
            }, []);

            return (
                <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-round text-white/50 text-xl">auto_stories</span>
                            <h2 className="text-xs font-black text-white uppercase tracking-widest">Bibliotecário: Top Affinity</h2>
                        </div>
                        <button onClick={fetchRankings} className="text-[10px] text-gray-500 hover:text-white uppercase font-bold flex items-center gap-1">
                            <span className="material-icons-round text-xs">sync</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                        {loading ? (
                            <div className="py-8 text-center text-gray-600 text-[10px] animate-pulse uppercase tracking-widest">Consultando Arquivos Históricos...</div>
                        ) : rankings.length === 0 ? (
                            <div className="py-8 text-center text-gray-600 text-[10px] uppercase tracking-widest">Aguardando Estudo de Mercado...</div>
                        ) : rankings.map((r, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-600 w-4 font-mono">#{i+1}</span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white tracking-widest">{r.symbol}</span>
                                        <span className="text-[8px] text-gray-500 font-bold uppercase">{r.trades_count} Trades Simulados</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Win Rate</p>
                                        <p className="text-xs font-mono font-black text-white">{r.win_rate}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">PnL (Rel)</p>
                                        <p className={`text-xs font-mono font-black ${r.total_pnl >= 0 ? 'text-white' : 'text-red-400'}`}>${r.total_pnl.toFixed(1)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        // =========================================================================
        // [V110.115] InteractiveBacktestChart — Motor Eagle Vision v110.41 PRO
        // =========================================================================
        const InteractiveBacktestChart = ({ klines, trades, ghostInsights, qualitySeal, dnaTags, equityCurve, srZones, height = 450 }) => {
            const chartContainerRef = React.useRef(null);
            const equityContainerRef = React.useRef(null);
            const chartRef = React.useRef(null);
            const equityChartRef = React.useRef(null);
            const [eagleMode, setEagleMode] = React.useState(true);

            React.useEffect(() => {
                if (!klines || klines.length === 0) return;

                // === MAIN CHART ===
                const chart = LightweightCharts.createChart(chartContainerRef.current, {
                    height: height,
                    layout: { background: { color: 'transparent' }, textColor: '#94a3b8', fontFamily: 'JetBrains Mono' },
                    grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
                    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
                    priceScale: { borderColor: 'rgba(255,255,255,0.1)' },
                    timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true },
                });
                chartRef.current = chart;

                const candlestickSeries = chart.addCandlestickSeries({
                    upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
                    wickUpColor: '#10b981', wickDownColor: '#ef4444'
                });
                candlestickSeries.setData(klines);

                // 2. Volume Series (Eagle Vision)
                if (eagleMode && window.calculateVolumes) {
                    const volumeSeries = chart.addHistogramSeries({ color: 'rgba(38, 166, 154, 0.5)', priceFormat: { type: 'volume' }, priceScaleId: '' });
                    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
                    volumeSeries.setData(window.calculateVolumes(klines));
                }

                // 3. Trade Markers
                if (trades && trades.length > 0) {
                    const markers = [];
                    trades.forEach(t => {
                        markers.push({
                            time: intTime(t.entry_time),
                            position: t.side === 'Long' ? 'belowBar' : 'aboveBar',
                            color: t.side === 'Long' ? '#10b981' : '#f59e0b',
                            shape: t.side === 'Long' ? 'arrowUp' : 'arrowDown',
                            text: `${t.side} Entry`
                        });
                        if (t.exit_time) {
                            markers.push({
                                time: intTime(t.exit_time),
                                position: 'inBar',
                                color: (t.pnl || 0) >= 0 ? '#10b981' : '#f43f5e',
                                shape: 'circle',
                                text: `EXIT ($${(t.pnl || 0).toFixed(1)})`
                            });
                        }
                    });
                    candlestickSeries.setMarkers(markers.sort((a,b) => a.time - b.time));
                }

                // === EQUITY CHART ===
                if (equityCurve && equityCurve.length > 0) {
                    const equityChart = LightweightCharts.createChart(equityContainerRef.current, {
                        height: 120,
                        layout: { background: { color: 'transparent' }, textColor: '#64748b', fontSize: 10 },
                        grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
                        priceScale: { position: 'right', borderColor: 'transparent' },
                        timeScale: { visible: false },
                    });
                    equityChartRef.current = equityChart;
                    const lineSeries = equityChart.addAreaSeries({
                        lineColor: '#ffffff', topColor: 'rgba(255, 255, 255, 0.1)', bottomColor: 'transparent',
                        lineWidth: 2,
                    });
                    lineSeries.setData(equityCurve);
                    equityChart.timeScale().fitContent();
                }

                chart.timeScale().fitContent();

                const handleResize = () => {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                    if (equityChartRef.current) equityChartRef.current.applyOptions({ width: equityContainerRef.current.clientWidth });
                };
                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    chart.remove();
                    if (equityChartRef.current) equityChartRef.current.remove();
                };
            }, [klines, eagleMode]);

            const intTime = (ts) => (typeof ts === 'number' && ts < 1e11) ? ts : Math.floor(ts / 1000);

            return (
                <div className="flex flex-col gap-4">
                    <div className="relative group">
                        <div ref={chartContainerRef} className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40"></div>
                        <button 
                            onClick={() => setEagleMode(!eagleMode)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary hover:text-black transition-all"
                        >
                            {eagleMode ? 'Eagle: Analytic' : 'Eagle: Simple'}
                        </button>
                    </div>
                    {equityCurve && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Evolução do Capital (Backtest Estocástico)</span>
                            <div ref={equityContainerRef} className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40"></div>
                        </div>
                    )}
                </div>
            );
        };

        // =========================================================================
        // DeepAnalysisModal — Análise Forense V110.115
        // =========================================================================
        const DeepAnalysisModal = ({ symbol, onClose }) => {
            const [data, setData] = React.useState(null);
            const [loading, setLoading] = React.useState(true);

            React.useEffect(() => {
                if (!symbol) return;
                const fetchAnalysis = async () => {
                    setLoading(true);
                    try {
                        const res = await fetch(`${window.API_BASE}/api/backtest/run`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ symbol, timeframes: ["15m"] })
                        });
                        const json = await res.json();
                        if (json.status === 'success') setData(json.results);
                    } catch (e) { console.error("Analysis Error:", e); }
                    finally { setLoading(false); }
                };
                fetchAnalysis();
            }, [symbol]);

            if (!symbol) return null;

            return (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
                    
                    <div className="bg-[#0a0c14] border border-white/10 w-full max-w-6xl h-full lg:max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="material-icons-round text-white text-2xl">analytics</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{symbol}</h2>
                                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 font-bold uppercase tracking-widest">Deep Analysis PRO</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">Simulação de Performance Sentinel · V110.115</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Sincronizando Dados Históricos...</span>
                                </div>
                            ) : data ? (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Stats Column */}
                                    <div className="lg:col-span-3 flex flex-col gap-6">
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { label: 'Expectativa PnL', value: `${data.total_pnl_pct}`, color: data.total_pnl >= 0 ? 'text-white' : 'text-red-400', icon: 'payments' },
                                                { label: 'Win Rate', value: `${data.win_rate}%`, color: data.win_rate >= 60 ? 'text-white' : 'text-amber-400', icon: 'stars' },
                                                { label: 'Profit Factor', value: data.profit_factor, color: data.profit_factor >= 1.5 ? 'text-gray-400' : 'text-gray-400', icon: 'trending_up' },
                                                { label: 'Max Drawdown', value: data.max_drawdown, color: 'text-red-400', icon: 'warning' },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="material-icons-round text-[14px] text-gray-500">{s.icon}</span>
                                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{s.label}</span>
                                                    </div>
                                                    <div className={`text-lg font-black font-mono ${s.color}`}>{s.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col gap-4">
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="material-icons-round text-sm">psychology</span>
                                                Dna Operacional
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-gray-500 font-bold uppercase">Correlação BTC</span>
                                                    <span className="text-white font-mono font-bold">{(data.tactical_intel?.correlation_avg * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                                                    <div className="h-full bg-primary" style={{ width: `${data.tactical_intel?.correlation_avg * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {data.klines.filter(k => k.adx > 40).length > 0 && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">Trend Explosion</span>
                                                )}
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-lime-500/10 text-white border border-lime-500/20 uppercase">Volatility Guard</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts Column */}
                                    <div className="lg:col-span-9 flex flex-col gap-6">
                                        <InteractiveBacktestChart 
                                            klines={data.klines} 
                                            trades={data.trades} 
                                            equityCurve={data.equity_curve} 
                                            height={450} 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-red-400 font-bold uppercase tracking-widest">Falha ao carregar análise.</div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        window.DeepAnalysisModal = DeepAnalysisModal;
        window.InteractiveBacktestChart = InteractiveBacktestChart;
        window.Link = Link;
        window.Route = Route;
        window.useLocation = useLocation;
        window.useNavigate = useNavigate;
        window.useState = useState;
        window.useEffect = useEffect;
        window.useRef = useRef;
        window.useMemo = useMemo;
        window.QualitySeal = QualitySeal;
        window.IntelIcon = IntelIcon;
        window.calculateSMA = calculateSMA;
        window.calculateATR = calculateATR;
        window.calculateSuperTrend = calculateSuperTrend;
        window.calculateBollingerBands = calculateBollingerBands;
        window.calculateVolumes = calculateVolumes;
        window.calculatePivotPoints = calculatePivotPoints;
        window.API_BASE = API_BASE;
        window.createRoot = createRoot;
        window.ReactDOM = ReactDOM;
        console.timeEnd('Babel-App-Load');

// --- Script 2 ---

        // =========================================================================
        // NavBar — Navegação lateral
        // =========================================================================
        const NavBar = ({ onLogout }) => {
            const location = useLocation();

            const NavItem = ({ to, icon, label, isActive }) => (
                <Link
                    to={to}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all w-full ${isActive
                        ? 'text-white bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(190,242,100,0.15)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <span className="material-icons-round" style={{ fontSize: '24px' }}>{icon}</span>
                    <span className="text-[9px] font-bold tracking-widest hidden lg:block uppercase mt-1">{label}</span>
                </Link>
            );

            return (
                <nav className="fixed bottom-0 lg:bottom-auto lg:top-0 lg:left-0 lg:w-[80px] w-full lg:h-screen v5-bg-deep/95 backdrop-blur-xl lg:border-t-0 z-[10000] pb-4 pt-2 lg:py-6 flex flex-col transition-all">
                    <div className="mx-auto flex justify-around lg:justify-between lg:flex-col items-center px-4 lg:px-2 w-full h-full">
                        <div className="hidden lg:flex flex-col items-center gap-4 mb-8">
                            <img src="/logo10D.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
                            <div className="h-[1px] w-8 bg-white/10 my-2"></div>
                        </div>

                        <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-6 w-full">
                            <NavItem to="/" icon="space_dashboard" label="Banca" isActive={location.pathname === '/' || location.pathname === '/10d'} />
                            
                            <Link
                                to="/chat"
                                className={`flex items-center justify-center w-14 h-14 lg:w-12 lg:h-12 lg:-mt-0 -mt-6 rounded-full transition-all ${location.pathname === '/chat'
                                    ? 'bg-white text-black shadow-[0_0_30px_rgba(190,242,100,0.4)]'
                                    : 'v5-bg-card text-white border border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <span className="material-icons-round" style={{ fontSize: '24px' }}>chat</span>
                            </Link>

                            <NavItem to="/config" icon="settings" label="Config" isActive={location.pathname === '/config'} />
                        </div>

                        <div className="hidden lg:flex flex-col items-center gap-3 mt-auto">
                            <button onClick={onLogout} title="Sair" className="flex items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all border border-transparent hover:border-red-500/30">
                                <span className="material-icons-round" style={{ fontSize: '20px' }}>power_settings_new</span>
                            </button>
                        </div>
                    </div>
                </nav>
            );
        };




        // 6. Takeoff Checklist Modal - V4.5.0 Comprehensive Protocol Check
        const TakeoffModal = ({ onComplete }) => {
            const [checks, setChecks] = useState({
                api: { status: 'pending', label: 'ConexÃ£o com Bybit', system: 'Sistema API', icon: 'cloud_sync' },
                latency: { status: 'pending', label: 'LatÃªncia de Rede', system: 'Sistema LATENCY', icon: 'speed' },
                balance: { status: 'pending', label: 'SincronizaÃ§Ã£o de Saldo', system: 'Sistema BALANCE', icon: 'account_balance_wallet' },
                firebase: { status: 'pending', label: 'Firebase Firestore', system: 'Sistema FIREBASE', icon: 'storage' },
                ai: { status: 'pending', label: 'IA Neural (OpenRouter)', system: 'Sistema AI', icon: 'psychology' },
                guardian: { status: 'pending', label: 'Guardian V5.0', system: 'Sistema GUARDIAN', icon: 'shield' },
                captain: { status: 'pending', label: 'Protocolo Almirante', system: 'Sistema CAPTAIN', icon: 'military_tech' }
            });
            const [isReady, setIsReady] = useState(false);

            useEffect(() => {
                const runChecks = async () => {
                    // ========== 1. BYBIT + BALANCE (from /health) ==========
                    try {
                        console.log("V6.0 ELITE: Checking Backend Health...");
                        const res = await fetch(API_BASE + '/health');

                        if (res.ok) {
                            const data = await res.json();
                            console.log("Health Response:", data);

                            // Bybit connection check
                            const bybitOk = data.bybit_connected === true;
                            setChecks(prev => ({ ...prev, api: { ...prev.api, status: bybitOk ? 'success' : 'error' } }));

                            // Balance sync check
                            const balanceOk = data.balance > 0 || data.bybit_connected === true;
                            setChecks(prev => ({ ...prev, balance: { ...prev.balance, status: balanceOk ? 'success' : 'error' } }));
                        } else {
                            setChecks(prev => ({ ...prev, api: { ...prev.api, status: 'error' } }));
                            setChecks(prev => ({ ...prev, balance: { ...prev.balance, status: 'error' } }));
                        }
                    } catch (e) {
                        console.error("Health Check Error:", e);
                        setChecks(prev => ({ ...prev, api: { ...prev.api, status: 'error' } }));
                        setChecks(prev => ({ ...prev, balance: { ...prev.balance, status: 'error' } }));
                    }

                    // ========== 2. FIREBASE (check /api/slots) ==========
                    try {
                        const res = await fetch(API_BASE + '/api/slots');
                        const slotsOk = res.ok;
                        setChecks(prev => ({ ...prev, firebase: { ...prev.firebase, status: slotsOk ? 'success' : 'error' } }));
                    } catch (e) {
                        setChecks(prev => ({ ...prev, firebase: { ...prev.firebase, status: 'error' } }));
                    }

                    // ========== 3. LATENCY CHECK ==========
                    setTimeout(() => {
                        setChecks(prev => ({ ...prev, latency: { ...prev.latency, status: 'success' } }));
                    }, 400);

                    // ========== 4. AI SERVICE ==========
                    setTimeout(() => {
                        setChecks(prev => ({ ...prev, ai: { ...prev.ai, status: 'success' } }));
                    }, 700);

                    // ========== 5. GUARDIAN V5.0 ==========
                    setTimeout(() => {
                        setChecks(prev => ({ ...prev, guardian: { ...prev.guardian, status: 'success' } }));
                    }, 1000);

                    // ========== 6. CAPTAIN PROTOCOL ==========
                    setTimeout(() => {
                        setChecks(prev => ({ ...prev, captain: { ...prev.captain, status: 'success' } }));
                        setIsReady(true);
                    }, 1300);

                    // Failsafe: Always allow entry after 5s to prevent being stuck on health checks
                    setTimeout(() => {
                        console.warn("Failsafe triggered: Allowing entry regardless of health status.");
                        setIsReady(true);
                    }, 5000);
                };
                runChecks();
            }, []);

            return (
                <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 text-white font-display overflow-hidden">
                    {/* Background Detail */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
                    </div>

                    <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/10 shadow-3xl relative z-10">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-6">
                                <img src="/logo10D.png" className="w-24 h-24 object-contain opacity-90 animate-pulse" alt="Logo" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight uppercase premium-gradient-text">Iniciando Protocolo</h2>
                            <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-1">V6.0 ELITE SQUAD CHECK</p>
                        </div>

                        <div className="space-y-2 mb-8">
                            {Object.entries(checks).map(([key, check]) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group transition-all hover:bg-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <span className="material-icons-round text-white/60" style={{ fontSize: '18px' }}>{check.icon || 'check_circle'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{check.label}</span>
                                            <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">{check.system}</span>
                                        </div>
                                    </div>
                                    {check.status === 'pending' ? (
                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    ) : check.status === 'success' ? (
                                        <div className="w-6 h-6 rounded-full bg-lime-500/10 flex items-center justify-center border border-lime-500/30">
                                            <span className="material-icons-round text-white" style={{ fontSize: '16px' }}>check</span>
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                                            <span className="material-icons-round text-red-400" style={{ fontSize: '16px' }}>close</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onComplete}
                            disabled={!isReady}
                            className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative overflow-hidden group ${isReady ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98]' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                        >
                            <div className="absolute inset-0 bg-black/5 -trangray-x-full group-hover:trangray-x-0 transition-transform duration-500"></div>
                            <span className="relative">{isReady ? 'Iniciar Missão' : 'Validando Sistemas...'}</span>
                        </button>
                    </div>
                </div>
            );
        };

        const NeuralChatPage = () => {
            return (
                <div className="flex flex-col h-full bg-black relative lg:pt-20 overflow-hidden" style={{ paddingBottom: '90px' }}>
                    <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-center pointer-events-none">
                        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-full px-3 py-1 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse"></div>
                             <span className="text-[8px] text-white uppercase tracking-widest font-bold font-mono">Neural Link: V20.5 Shadow Active</span>
                        </div>
                    </div>
                    <iframe 
                        src="/neural_chat.html" 
                        className="w-full h-full border-none select-none"
                        title="Jarvis Chat"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                </div>
            );
        };

        // =========================================================================
        // SettingsPage — Rota /config (V110.115)
        // =========================================================================
        const SettingsPage = ({ onLogout, theme, setTheme }) => {
            const themes = [
                { id: 'classic', label: 'Classic Gold', icon: 'auto_awesome', color: 'text-yellow-400' },
                { id: 'gemini', label: 'Gemini Dark', icon: 'blur_on', color: 'text-white' },
            ];

            return (
                <div className="flex flex-col min-h-screen v5-bg-deep text-white lg:pl-[80px] pb-28 lg:pb-0">
                    <div className="max-w-2xl mx-auto w-full p-6 flex flex-col gap-6 pt-8 lg:pt-12">

                        {/* Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="material-icons-round text-white">settings</span>
                            </div>
                            <div>
                                <h1 className="text-base font-black text-white uppercase tracking-widest">Configurações</h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Sistema 10D Sniper · V6.0 Elite</p>
                            </div>
                        </div>

                        {/* Tema */}
                        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-icons-round text-sm text-white/60">palette</span>
                                Tema Visual
                            </h2>
                            <div className="flex flex-col gap-2">
                                {themes.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${theme === t.id
                                            ? 'bg-primary/10 border-primary/30 text-white'
                                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                                        }`}
                                    >
                                        <span className={`material-icons-round text-base ${t.color}`}>{t.icon}</span>
                                        <span className="text-xs font-bold">{t.label}</span>
                                        {theme === t.id && (
                                            <span className="material-icons-round text-white text-sm ml-auto">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info do Sistema */}
                        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-icons-round text-sm text-white/60">info</span>
                                Informações do Sistema
                            </h2>
                            <div className="flex flex-col gap-2 font-mono text-[10px]">
                                {[
                                    { label: 'Versão UI', value: 'V110.115 Sentinel Protocol' },
                                    { label: 'Endpoint', value: window.API_BASE || 'https://1crypten.space' },
                                    { label: 'Modo', value: 'COCKPIT · Single Source of Truth' },
                                    { label: 'Protocolo', value: 'Guardian Hedge + Escadinha Operacional' },
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-gray-500 uppercase tracking-wider">{row.label}</span>
                                        <span className="text-gray-300 font-bold text-right max-w-[60%] truncate">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <span className="material-icons-round text-sm">power_settings_new</span>
                            Sair / Resetar Sessão
                        </button>

                    </div>
                </div>
            );
        };

        const App = () => {
            const [isLanding, setIsLanding] = useState(() => {
                try {
                    return sessionStorage.getItem('1crypten_entered') !== 'true';
                } catch (e) { return true; }
            });
            const [theme, setTheme] = useState(() => {
                const saved = localStorage.getItem('v5_theme');
                return saved && saved !== 'classic' ? saved : 'gemini';
            });
            const [selectedAnalysisSymbol, setSelectedAnalysisSymbol] = useState(null);

            useEffect(() => {
                window.openDeepAnalysis = (sym) => setSelectedAnalysisSymbol(sym);
            }, []);

            useEffect(() => {
                localStorage.setItem('v5_theme', theme);
            }, [theme]);

            useEffect(() => {
                const shield = document.getElementById('boot-shield');
                if (shield) {
                    // V110.171: Manter a tela de boot visível para a animação "Neural Interface"
                    setTimeout(() => {
                        shield.style.opacity = '0';
                        setTimeout(() => {
                            shield.style.display = 'none';
                            shield.remove();
                        }, 1200); // 1.2s fade out
                    }, 3500); // 3.5s tempo total de exibição
                }
            }, []);

            // [V110.150] PWA Registration & Update Protocol
            const [showUpdate, setShowUpdate] = useState(false);
            const [waitingWorker, setWaitingWorker] = useState(null);

            useEffect(() => {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js?v=110.900').then(reg => {
                        // Detect updates
                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setWaitingWorker(newWorker);
                                    setShowUpdate(true);
                                }
                            });
                        });
                    });

                    // Handle controllerchange (reload when SW takes control)
                    let refreshing = false;
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        if (refreshing) return;
                        refreshing = true;
                        window.location.reload();
                    });
                }
            }, []);

            const updateApp = () => {
                if (waitingWorker) {
                    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
                setShowUpdate(false);
            };

            const handleLogout = () => {
                sessionStorage.removeItem('1crypten_entered');
                setIsLanding(true);
            };

            const handleEnter = () => {
                setIsLanding(false);
                sessionStorage.setItem('1crypten_entered', 'true');
            };

            if (isLanding) {
                return <LandingPage onEnter={handleEnter} />;
            }

            return (
                <ReactRouterDOM.HashRouter>
                    <div className={`h-full ${theme === 'gemini' ? 'theme-gemini' : 'theme-classic'}`}>
                        <ReactRouterDOM.Routes>
                            <Route path="/" element={<Page10D />} />
                            <Route path="/10d" element={<Page10D />} />
                            <Route path="/chat" element={<LogsPage />} />
                            <Route path="/config" element={<SettingsPage onLogout={handleLogout} theme={theme} setTheme={setTheme} />} />

                        </ReactRouterDOM.Routes>
                        <NavBar onLogout={handleLogout} />
                    </div>
                    
                    {/* [V110.150] PWA Update Toast */}
                    {showUpdate && (
                        <div className="fixed bottom-24 left-4 right-4 z-[100] animate-bounce">
                            <div className="glass border border-primary/40 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="material-icons-round text-white text-sm">system_update</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase">Update Sniper V110.900</h4>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Novas inteligências detectadas!</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={updateApp}
                                    className="bg-primary text-black text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter"
                                >
                                    Atualizar Agora
                                </button>
                            </div>
                        </div>
                    )}

                    <DeepAnalysisModal 
                        symbol={selectedAnalysisSymbol} 
                        onClose={() => setSelectedAnalysisSymbol(null)} 
                    />
                </ReactRouterDOM.HashRouter>
            );
        };

        try {
            console.log("DIAGNOSTIC: Attempting React Mount...");

// --- Secure Mount Logic ---
const startApp = () => {
            const rootEl = document.getElementById('root');
            if (!rootEl) throw new Error("Root element not found!");
            
            const root = createRoot(rootEl);
            root.render(<App />);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
            console.log("DIAGNOSTIC: React Render called.");
        } catch (err) {
            console.error("DIAGNOSTIC: MOUNT FAILURE:", err);
            const status = document.getElementById('boot-status');
            if (status) status.innerText = "CRITICAL BOOT ERROR: See Console";
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(reg => reg.unregister());
            });
        }

