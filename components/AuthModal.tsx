"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import type { User } from "@/lib/auth";

interface Props {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function AuthModal({ onSuccess, onClose }: Props) {
  const [mode, setMode]           = useState<"login" | "register">("login");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [showPwd, setShowPwd]     = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!isValidEmail(email)) { setError("Email invalide"); return; }
    if (password.length < 6)  { setError("Mot de passe trop court (6 caractères min)"); return; }

    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { user, error: err } = await fn(email.trim(), password);
    setLoading(false);

    if (err) {
      if (err.includes("Invalid login")) setError("Email ou mot de passe incorrect");
      else if (err.includes("already registered")) setError("Ce compte existe déjà — connecte-toi");
      else setError(err);
      return;
    }

    if (user) onSuccess(user);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl shadow-2xl px-6 pt-6 pb-10">
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === m ? "bg-white text-black shadow-sm" : "text-gray-400"
              }`}
            >
              {m === "login" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input
            type="email"
            inputMode="email"
            autoFocus
            className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-sm font-medium placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          />

          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              className="w-full bg-gray-50 rounded-2xl px-4 py-4 pr-12 text-sm font-medium placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPwd ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-semibold mt-3">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-black text-white rounded-2xl py-4 font-bold text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : mode === "login" ? "Se connecter" : "Créer le compte"
          }
        </button>
      </div>
    </div>
  );
}
