"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { checklist, imagePromptPresets, kpis, premiumPromptPacks } from "@/data/launchData";

type TextResult = { output?: string; error?: string };
type ImageResult = { imageBase64?: string; mimeType?: string; error?: string };
type Lead = { id: string; name: string; channel: string; audience: string; stage: string };
type Script = { id: string; audience: string; title: string; objective: string; content: string };
type Claim = { id: string; productLine: string; claimText: string; status: string };
type Campaign = { id: string; title: string; phase: string; objective: string; status: string };
type SessionUser = { name: string; email: string; role: string };

const tabs = [
  "Executive",
  "CRM",
  "Campaigns",
  "Scripts",
  "PromptStudio",
  "ClaimsGuard",
  "BrandVault",
  "ConsultorOps",
  "Automations",
] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Executive");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [prompt, setPrompt] = useState(imagePromptPresets[0]);
  const [style, setStyle] = useState("luxo editorial cinematografico");
  const [image, setImage] = useState<string>("");
  const [textTask, setTextTask] = useState("Gerar script de follow-up para consultor de salao premium");
  const [audience, setAudience] = useState<"B2C" | "B2B">("B2B");
  const [textOutput, setTextOutput] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [textError, setTextError] = useState("");
  const [imageError, setImageError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [leadName, setLeadName] = useState("");
  const [leadChannel, setLeadChannel] = useState("WhatsApp");
  const [leadAudience, setLeadAudience] = useState("B2C");
  const [scriptAudience, setScriptAudience] = useState("B2C");
  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptObjective, setScriptObjective] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [claimText, setClaimText] = useState("");
  const [claimStatus, setClaimStatus] = useState("seguro");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignPhase, setCampaignPhase] = useState("pre-lancamento");
  const [campaignObjective, setCampaignObjective] = useState("");
  const [campaignStart, setCampaignStart] = useState("");
  const [campaignEnd, setCampaignEnd] = useState("");

  const doneCount = useMemo(() => checklist.filter((item) => done[item.id]).length, [done]);
  const progress = Math.round((doneCount / checklist.length) * 100);

  async function loadData() {
    setLoadingData(true);
    const [meRes, leadsRes, scriptsRes, claimsRes, campaignsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/crm/leads"),
      fetch("/api/scripts"),
      fetch("/api/claims"),
      fetch("/api/campaigns"),
    ]);

    if (meRes.ok) setUser((await meRes.json()).user);
    if (leadsRes.ok) setLeads((await leadsRes.json()).items ?? []);
    if (scriptsRes.ok) setScripts((await scriptsRes.json()).items ?? []);
    if (claimsRes.ok) setClaims((await claimsRes.json()).items ?? []);
    if (campaignsRes.ok) setCampaigns((await campaignsRes.json()).items ?? []);
    setLoadingData(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function createLead() {
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: leadName, channel: leadChannel, audience: leadAudience }),
    });
    if (res.ok) {
      setLeadName("");
      await loadData();
    }
  }

  async function createScript() {
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience: scriptAudience,
        title: scriptTitle,
        objective: scriptObjective,
        content: scriptContent,
      }),
    });
    if (res.ok) {
      setScriptTitle("");
      setScriptObjective("");
      setScriptContent("");
      await loadData();
    }
  }

  async function createClaim() {
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productLine: "Balance System", claimText, status: claimStatus }),
    });
    if (res.ok) {
      setClaimText("");
      await loadData();
    }
  }

  async function createCampaign() {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: campaignTitle,
        phase: campaignPhase,
        objective: campaignObjective,
        startDate: campaignStart,
        endDate: campaignEnd,
      }),
    });
    if (res.ok) {
      setCampaignTitle("");
      setCampaignObjective("");
      await loadData();
    }
  }

  async function generateText() {
    setLoadingText(true);
    setTextError("");
    setTextOutput("");
    try {
      const res = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: textTask, audience }),
      });
      const data = (await res.json()) as TextResult;
      if (!res.ok) return setTextError(data.error ?? "Falha ao gerar texto.");
      setTextOutput(data.output ?? "");
    } catch {
      setTextError("Falha de rede ao chamar API de texto.");
    } finally {
      setLoadingText(false);
    }
  }

  async function generateImage() {
    setLoadingImage(true);
    setImageError("");
    setImage("");
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      const data = (await res.json()) as ImageResult;
      if (!res.ok || !data.imageBase64) return setImageError(data.error ?? "Falha ao gerar imagem.");
      setImage(`data:${data.mimeType ?? "image/png"};base64,${data.imageBase64}`);
    } catch {
      setImageError("Falha de rede ao chamar API de imagem.");
    } finally {
      setLoadingImage(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="panel mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="gold-text text-xs tracking-[0.22em] uppercase">Kalaïnne Professional</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Launch OS Enterprise</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">
              {user ? `${user.name} · ${user.role}` : "Carregando sessao..."}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-2 rounded border border-white/20 px-3 py-1 text-xs hover:border-[var(--gold)]"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded border px-3 py-1 text-xs tracking-wide ${
              activeTab === tab
                ? "border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--gold)]"
                : "border-white/15 text-white/80 hover:border-white/30"
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      {activeTab === "Executive" ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            {kpis.map((item) => (
              <article key={item.label} className="panel p-4">
                <p className="text-xs text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">{item.target}</p>
                <p className="mt-1 text-xs gold-text">{item.status}</p>
              </article>
            ))}
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Checklist de Execucao</h2>
                <span className="text-xs text-[var(--muted)]">{doneCount}/{checklist.length}</span>
              </div>
              <div className="mb-4 h-2 w-full rounded bg-white/10">
                <div className="h-2 rounded bg-[var(--gold)] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`w-full rounded border px-3 py-2 text-left text-sm ${
                      done[item.id] ? "border-emerald-700 bg-emerald-950/30 line-through text-white/60" : "border-white/10 bg-black/20 hover:border-[var(--gold)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-xs text-[var(--muted)]">{item.priority}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.phase} · {item.owner}</p>
                  </button>
                ))}
              </div>
            </article>
            <article className="panel p-5">
              <h2 className="mb-3 text-lg font-semibold">Indicadores Operacionais</h2>
              <p className="text-sm text-[var(--muted)]">
                Leads: {leads.length} · Scripts: {scripts.length} · Campanhas: {campaigns.length} · Status:{" "}
                {loadingData ? "sincronizando..." : "sincronizado"}
              </p>
            </article>
          </section>
        </>
      ) : null}

      {activeTab === "CRM" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Cadastrar Lead</h2>
            <div className="space-y-3">
              <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Nome do lead" className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <input value={leadChannel} onChange={(e) => setLeadChannel(e.target.value)} placeholder="Canal" className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <select value={leadAudience} onChange={(e) => setLeadAudience(e.target.value)} className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm">
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
              <button type="button" onClick={createLead} className="rounded bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black">Salvar lead</button>
            </div>
          </article>
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Pipeline</h2>
            <div className="space-y-2">{leads.map((lead) => <div key={lead.id} className="rounded border border-white/10 bg-black/20 p-3"><p className="font-medium">{lead.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{lead.audience} · {lead.channel} · {lead.stage}</p></div>)}</div>
          </article>
        </section>
      ) : null}

      {activeTab === "Campaigns" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Nova Campanha</h2>
            <div className="space-y-3">
              <input value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} placeholder="Titulo" className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <input value={campaignPhase} onChange={(e) => setCampaignPhase(e.target.value)} placeholder="Fase" className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <textarea value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} placeholder="Objetivo" className="min-h-20 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={campaignStart} onChange={(e) => setCampaignStart(e.target.value)} className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
                <input type="date" value={campaignEnd} onChange={(e) => setCampaignEnd(e.target.value)} className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              </div>
              <button type="button" onClick={createCampaign} className="rounded bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black">Criar campanha</button>
            </div>
          </article>
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Campanhas</h2>
            <div className="space-y-2">{campaigns.map((campaign) => <div key={campaign.id} className="rounded border border-white/10 bg-black/20 p-3"><p className="font-medium">{campaign.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{campaign.phase} · {campaign.status}</p><p className="mt-2 text-sm">{campaign.objective}</p></div>)}</div>
          </article>
        </section>
      ) : null}

      {activeTab === "Scripts" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Novo Script</h2>
            <div className="space-y-3">
              <select value={scriptAudience} onChange={(e) => setScriptAudience(e.target.value)} className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"><option value="B2C">B2C</option><option value="B2B">B2B</option></select>
              <input value={scriptTitle} onChange={(e) => setScriptTitle(e.target.value)} placeholder="Titulo" className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <input value={scriptObjective} onChange={(e) => setScriptObjective(e.target.value)} placeholder="Objetivo" className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <textarea value={scriptContent} onChange={(e) => setScriptContent(e.target.value)} placeholder="Conteudo" className="min-h-24 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
              <button type="button" onClick={createScript} className="rounded bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black">Salvar script</button>
            </div>
          </article>
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Biblioteca de Scripts</h2>
            <div className="space-y-2">{scripts.map((script) => <div key={script.id} className="rounded border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between"><p className="font-medium">{script.title}</p><span className="gold-text text-xs">{script.audience}</span></div><p className="mt-1 text-xs text-[var(--muted)]">{script.objective}</p><p className="mt-2 text-sm">{script.content}</p></div>)}</div>
          </article>
        </section>
      ) : null}

      {activeTab === "PromptStudio" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">IA de Texto</h2>
            <select value={audience} onChange={(e) => setAudience(e.target.value as "B2C" | "B2B")} className="mb-3 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"><option value="B2B">B2B</option><option value="B2C">B2C</option></select>
            <textarea value={textTask} onChange={(e) => setTextTask(e.target.value)} className="min-h-24 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <button type="button" onClick={generateText} disabled={loadingText} className="mt-3 rounded bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{loadingText ? "Gerando..." : "Gerar texto"}</button>
            <pre className="mt-3 max-h-72 overflow-auto rounded border border-white/10 bg-black/40 p-3 text-xs whitespace-pre-wrap">{textOutput || "Resultado da IA aparecera aqui."}</pre>
            {textError ? <p className="mt-2 text-xs text-rose-300">Erro: {textError}</p> : null}
          </article>
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Creative Lab</h2>
            <select value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mb-3 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm">{imagePromptPresets.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <input value={style} onChange={(e) => setStyle(e.target.value)} className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <button type="button" onClick={generateImage} disabled={loadingImage} className="mt-3 rounded bg-[var(--green)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loadingImage ? "Gerando..." : "Gerar imagem"}</button>
            <div className="mt-3 rounded border border-white/10 bg-black/40 p-3">
              {image ? (
                <Image
                  src={image}
                  alt="Imagem gerada"
                  width={1024}
                  height={1024}
                  unoptimized
                  className="h-auto w-full rounded"
                />
              ) : (
                <p className="text-xs text-[var(--muted)]">Imagem gerada aparecera aqui.</p>
              )}
            </div>
            {imageError ? <p className="mt-2 text-xs text-rose-300">Erro: {imageError}</p> : null}
          </article>
        </section>
      ) : null}

      {activeTab === "ClaimsGuard" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Novo Claim</h2>
            <textarea value={claimText} onChange={(e) => setClaimText(e.target.value)} className="min-h-24 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm" />
            <select value={claimStatus} onChange={(e) => setClaimStatus(e.target.value)} className="mt-3 w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"><option value="seguro">Seguro</option><option value="validar">Validar</option><option value="evitar">Evitar</option></select>
            <button type="button" onClick={createClaim} className="mt-3 rounded bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black">Salvar claim</button>
          </article>
          <article className="panel p-5">
            <h2 className="mb-3 text-lg font-semibold">Matriz de Claims</h2>
            <div className="space-y-2">{claims.map((claim) => <div key={claim.id} className="rounded border border-white/10 bg-black/20 p-3"><p className="text-sm">{claim.claimText}</p><p className="mt-1 text-xs text-[var(--muted)]">{claim.productLine} · {claim.status}</p></div>)}</div>
          </article>
        </section>
      ) : null}

      {activeTab === "BrandVault" ? (
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Brand Vault Premium</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {premiumPromptPacks.map((item) => (
              <div key={item.title} className="rounded border border-white/10 bg-black/20 p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.type}</p>
                <p className="mt-2 text-sm">{item.prompt}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "ConsultorOps" ? (
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Consultor Ops</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/90">
            <li>Meta semanal: 20 contatos novos B2B por consultor.</li>
            <li>Follow-up: 100% dos leads com retorno em ate 24h.</li>
            <li>Script: abertura tecnica + margem + prova social.</li>
            <li>Checklist: diagnostico, objecoes, fechamento, proxima acao.</li>
          </ul>
        </section>
      ) : null}

      {activeTab === "Automations" ? (
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Automations Hub</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Fluxos n8n recomendados: geracao diaria de criativos, alertas de follow-up, relatorio executivo e fila de prompts.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">Status: {loadingData ? "sincronizando..." : "sincronizado"}.</p>
        </section>
      ) : null}
    </main>
  );
}
