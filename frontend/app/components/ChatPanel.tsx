"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { BACKEND } from "@/lib/api";

interface Message {
  id: number;
  lead_id: string;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
  is_read: number;
}

interface Props {
  leadId: string;
  currentUser: { id: number; name: string; role: string };
  isReadOnly?: boolean;
}

export default function ChatPanel({ leadId, currentUser, isReadOnly }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    try {
      const r = await fetch(`${BACKEND}/api/leads/${leadId}/messages`, {
        headers: { "X-User-Id": String(currentUser.id) },
      });
      const d = await r.json();
      if (d.success) setMessages(d.messages || []);
    } catch {}
  }

  useEffect(() => {
    loadMessages();
    const iv = setInterval(loadMessages, 5000);
    return () => clearInterval(iv);
  }, [leadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`${BACKEND}/api/leads/${leadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id) },
        body: JSON.stringify({ message: newMsg.trim(), user_name: currentUser.name }),
      });
      setNewMsg("");
      await loadMessages();
    } catch {}
    setSending(false);
  }

  async function handleDelete(msgId: number) {
    if (!confirm("Deletar esta mensagem?")) return;
    try {
      await fetch(`${BACKEND}/api/leads/${leadId}/messages/${msgId}`, {
        method: "DELETE",
        headers: { "X-User-Id": String(currentUser.id) },
      });
      await loadMessages();
    } catch {}
  }

  function formatTime(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Hoje";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, m) => {
    const date = formatDate(m.created_at);
    const last = acc[acc.length - 1];
    if (last && last.date === date) {
      last.msgs.push(m);
    } else {
      acc.push({ date, msgs: [m] });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <MessageSquare size={14} className="text-yellow-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
          Bate-Papo do Lead
        </span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: "min(400px, 50vh)" }}>
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-8">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        )}
        {grouped.map((g) => (
          <div key={g.date}>
            {/* Separador de data */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">{g.date}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            {g.msgs.map((m) => {
              const isMine = m.user_id === currentUser.id;
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 group`}>
                  <div className={`max-w-[80%] ${isMine ? "order-2" : "order-1"}`}>
                    {!isMine && (
                      <span className="text-[10px] text-slate-500 ml-1 mb-0.5 block">{m.user_name}</span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm relative ${
                        isMine
                          ? "bg-yellow-400/20 text-yellow-200 rounded-br-md"
                          : "bg-slate-800 text-slate-200 rounded-bl-md"
                      }`}
                    >
                      {m.message}
                      <div className={`text-[9px] mt-1 flex items-center gap-1 ${isMine ? "text-yellow-400/40 justify-end" : "text-slate-500"}`}>
                        {formatTime(m.created_at)}
                        {isMine && (
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="opacity-0 group-hover:opacity-100 ml-1 text-rose-400/60 hover:text-rose-400 transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isReadOnly && (
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/30"
            />
            <button
              onClick={handleSend}
              disabled={!newMsg.trim() || sending}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 px-3 py-2.5 rounded-xl transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
