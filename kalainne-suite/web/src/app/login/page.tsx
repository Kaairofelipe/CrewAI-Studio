"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@kalainne.local");
  const [password, setPassword] = useState("Kalainne@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha no login.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Erro de rede durante autenticacao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6">
      <section className="panel w-full p-8">
        <p className="gold-text text-xs tracking-[0.2em] uppercase">Kalaïnne Professional</p>
        <h1 className="mt-2 text-3xl font-semibold">Acesso da Plataforma</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Login local temporario para operacao enterprise inicial.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">E-mail</label>
            <input
              className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Senha</label>
            <input
              type="password"
              className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
