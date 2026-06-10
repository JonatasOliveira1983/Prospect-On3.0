"use client";
import { useState, useEffect, useRef } from "react";
import { FileText, Download, Trash2, Upload, Eye, Printer, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BACKEND } from "@/lib/api";

interface DocFile {
  name: string;
  size: number;
  modified: number;
  url: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "🖼️";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "📊";
  if (["doc", "docx"].includes(ext || "")) return "📝";
  if (["ppt", "pptx"].includes(ext || "")) return "📽️";
  return "📁";
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = localStorage.getItem("currentUser");
    if (u) try { setCurrentUser(JSON.parse(u)); } catch {}
    fetchDocs();
  }, []);

  async function fetchDocs() {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND}/api/documents`);
      const data = await r.json();
      if (Array.isArray(data)) setDocs(data);
    } catch {}
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`${BACKEND}/api/documents/upload`, {
        method: "POST",
        headers: { "X-User-Id": String(currentUser?.id || "") },
        body: formData,
      });
      await fetchDocs();
    } catch (err) {
      alert("Erro ao enviar arquivo");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(name: string) {
    if (!confirm(`Deletar "${name}"?`)) return;
    try {
      await fetch(`${BACKEND}/api/documents/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: { "X-User-Id": String(currentUser?.id || "") },
      });
      await fetchDocs();
    } catch {
      alert("Erro ao deletar");
    }
  }

  const isAdmin = currentUser?.role === "admin";
  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Documentos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {docs.length} arquivo{docs.length !== 1 ? "s" : ""} disponível{docs.length !== 1 ? "eis" : ""}
            </p>
          </div>
        </div>

        {isAdmin && (
          <>
            <input
              ref={fileRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.jpg,.jpeg,.png,.gif"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-700 text-slate-900 font-bold text-sm transition-all"
            >
              <Upload size={16} />
              {uploading ? "Enviando..." : "Enviar Arquivo"}
            </button>
          </>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar documentos..."
          className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/30"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-bold">Nenhum documento encontrado</p>
          <p className="text-slate-600 text-xs mt-1">
            {isAdmin ? "Clique em 'Enviar Arquivo' para adicionar" : "Aguarde o administrador adicionar documentos"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.name}
              className="group bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:border-yellow-400/20 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">{getFileIcon(doc.name)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {formatSize(doc.size)} · {formatDate(doc.modified)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <Eye size={13} /> Ver
                </a>
                <a
                  href={doc.url}
                  download
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <Download size={13} /> Baixar
                </a>
                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  title="Imprimir"
                >
                  <Printer size={13} />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(doc.name)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                    title="Deletar"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
