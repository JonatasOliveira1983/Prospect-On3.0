"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Mail, Phone, FileText, Lock, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UsuariosAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Formulário de Cadastro
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("vendedor");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");

  // Toggle de exibição de senhas individuais por ID
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      fetchUsers(user.id);
    }
  }, []);

  const fetchUsers = async (callerId: number) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8002/api/admin/users", {
        headers: {
          "X-User-Id": callerId.toString(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Falha ao buscar usuários");
      }
    } catch (err) {
      console.error("Erro ao conectar no backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Nome, E-mail e Senha são campos obrigatórios");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:8002/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUser.id.toString(),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role: role,
          phone: phone.trim() || null,
          document: document.trim() || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro ao cadastrar novo vendedor.");
      }

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Vendedor comercial cadastrado com sucesso!");
        // Limpar campos
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setDocument("");
        setRole("vendedor");
        
        // Recarregar lista
        fetchUsers(currentUser.id);
        
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao conectar no servidor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (userId === currentUser.id) {
      setErrorMsg("Você não pode excluir a si mesmo!");
      return;
    }

    const confirmDelete = window.confirm(`Tem certeza absoluta que deseja remover o usuário ${userEmail}?`);
    if (!confirmDelete) return;

    setActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`http://localhost:8002/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": currentUser.id.toString(),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro ao deletar usuário.");
      }

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Usuário removido com sucesso!");
        fetchUsers(currentUser.id);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao deletar usuário.");
    } finally {
      setActionLoading(false);
    }
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
          <Users className="text-yellow-400" size={32} />
          Painel de Usuários & Vendedores
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Cadastre novos vendedores comerciais, controle credenciais com senhas visíveis e audite a carteira de leads exclusivos de cada um.
        </p>
      </div>

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Formulário de Cadastro */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 h-fit">
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/5">
            <UserPlus size={18} className="text-yellow-400" />
            Cadastrar Novo Vendedor
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Acesso</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all"
                placeholder="Ex: joao.comercial@gmail.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha Provisória</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all"
                placeholder="Ex: senha123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF / CPF</label>
                <input
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-yellow-400 outline-none transition-all"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil de Acesso</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-yellow-400 outline-none transition-all"
              >
                <option value="vendedor" className="bg-slate-950 text-white">Vendedor / Comercial</option>
                <option value="admin" className="bg-slate-950 text-white">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full mt-2 bg-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.1)] disabled:opacity-50"
            >
              {actionLoading ? "Cadastrando..." : "Cadastrar Conta"}
            </button>
          </form>
        </div>

        {/* Lado Direito: Listagem de Usuários */}
        <div className="xl:col-span-2 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6">
          <h2 className="text-base font-black text-white uppercase tracking-wider pb-3 border-b border-white/5">
            Vendedores Ativos no Sistema ({users.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs uppercase font-black tracking-wider text-yellow-400 animate-pulse">Carregando Contas...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-500">Nenhum vendedor cadastrado no sistema.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pr-2">Nome / Cargo</th>
                    <th className="pb-3 px-2">Credenciais (E-mail / Senha)</th>
                    <th className="pb-3 px-2">Cadastros</th>
                    <th className="pb-3 pl-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isShowPassword = !!showPasswords[u.id];

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-all group">
                        {/* Nome & Cargo */}
                        <td className="py-4 pr-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black uppercase text-sm ${
                              u.role === "admin" 
                                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" 
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[8px] bg-white/10 text-slate-300 font-extrabold uppercase px-1.5 py-0.5 rounded">VOCÊ</span>
                                )}
                              </p>
                              <span className={`inline-block mt-0.5 text-[8px] font-black uppercase tracking-widest`}>
                                {u.role === "admin" ? (
                                  <span className="text-yellow-400/80">Administrador</span>
                                ) : (
                                  <span className="text-slate-400">Vendedor Elite</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Credenciais */}
                        <td className="py-4 px-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <Mail size={12} className="text-slate-500" />
                            <span>{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Lock size={12} className="text-slate-500" />
                            <span className="font-black text-slate-200 tracking-wider">
                              {isShowPassword ? u.password : "••••••••"}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-500 hover:text-white transition-colors"
                              title={isShowPassword ? "Ocultar Senha" : "Mostrar Senha"}
                            >
                              {isShowPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Informações Extras */}
                        <td className="py-4 px-2 space-y-1 text-slate-400 font-medium">
                          {u.phone ? (
                            <p className="flex items-center gap-1.5">
                              <Phone size={12} className="text-slate-500" />
                              <span>{u.phone}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] italic text-slate-600">Sem Telefone</p>
                          )}
                          {u.document ? (
                            <p className="flex items-center gap-1.5">
                              <FileText size={12} className="text-slate-500" />
                              <span>{u.document}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] italic text-slate-600">Sem Documento</p>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-4 pl-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Link de Leads Elite */}
                            <Link
                              href={`/leads-quentes?userId=${u.id}&userName=${encodeURIComponent(u.name)}`}
                              className="bg-yellow-400/10 hover:bg-yellow-400 hover:text-slate-950 text-yellow-400 font-black px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center gap-1 border border-yellow-400/20 hover:border-yellow-400"
                            >
                              <ExternalLink size={12} />
                              Leads Elite
                            </Link>

                            {/* Botão Deletar */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              disabled={isSelf || actionLoading}
                              className={`p-2 rounded-lg transition-all duration-300 border ${
                                isSelf 
                                  ? "text-slate-600 border-white/5 cursor-not-allowed" 
                                  : "text-red-400 hover:text-white bg-red-500/10 border-red-500/10 hover:bg-red-500"
                              }`}
                              title={isSelf ? "Não é possível excluir a si mesmo" : "Excluir Usuário"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
