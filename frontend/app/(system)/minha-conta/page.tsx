"use client";

import { useState, useEffect } from "react";
import { User, Lock, Mail, Phone, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function MinhaContaPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDocument(user.document || "");
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("O nome é obrigatório");
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8002/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUser.id.toString(),
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          document: document.trim(),
          password: password ? password.trim() : null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro ao atualizar o cadastro.");
      }

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setCurrentUser(data.user);
        setPassword("");
        setConfirmPassword("");
        setSuccessMsg("Cadastro pessoal atualizado com sucesso!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
          <User className="text-yellow-400" size={32} />
          Minha Conta
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie as suas informações de cadastro pessoal e altere a sua senha privada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Resumo do Usuário */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-yellow-400/10 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-3xl font-black shadow-lg shadow-yellow-400/10">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
            <span className="inline-block mt-1 px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase rounded-full tracking-widest border border-yellow-400/20">
              {currentUser.role === "admin" ? "Administrador" : "Vendedor / Comercial"}
            </span>
          </div>
          <div className="w-full border-t border-white/5 pt-4 text-xs text-slate-400 text-left space-y-2">
            <p className="flex items-center gap-2">
              <Mail size={12} className="text-yellow-400" />
              <span className="truncate">{email}</span>
            </p>
            {phone && (
              <p className="flex items-center gap-2">
                <Phone size={12} className="text-yellow-400" />
                <span>{phone}</span>
              </p>
            )}
            {document && (
              <p className="flex items-center gap-2">
                <FileText size={12} className="text-yellow-400" />
                <span>{document}</span>
              </p>
            )}
          </div>
        </div>

        {/* Lado Direito: Formulário de Edição */}
        <div className="md:col-span-2 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider pb-3 border-b border-white/5">
              Editar Cadastro Pessoal
            </h2>

            {/* Alertas */}
            {successMsg && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold animate-pulse">
                <CheckCircle size={16} />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all focus:ring-1 focus:ring-yellow-400/20 font-medium"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail (Apenas Leitura)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all focus:ring-1 focus:ring-yellow-400/20 font-medium"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF / Documento</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all focus:ring-1 focus:ring-yellow-400/20 font-medium"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest">Alterar Senha de Acesso</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all focus:ring-1 focus:ring-yellow-400/20"
                      placeholder="Deixe em branco para manter a atual"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all focus:ring-1 focus:ring-yellow-400/20"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 hover:bg-yellow-300 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.15)] hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
