export type ChecklistItem = {
  id: number;
  title: string;
  phase: string;
  owner: string;
  priority: "Alta" | "Media" | "Baixa";
};

export const kpis = [
  { label: "Conversao B2C", target: "3.5%+", status: "Em monitoramento" },
  { label: "Fechamentos B2B", target: "5 parceiros/30 dias", status: "Prioritario" },
  { label: "Ticket Medio", target: "R$ 220+", status: "Meta principal" },
  { label: "SLA WhatsApp", target: "< 1h", status: "Critico" },
];

export const checklist: ChecklistItem[] = [
  { id: 1, title: "Validar claims seguros por produto", phase: "D-30 a D-21", owner: "Regulatorio", priority: "Alta" },
  { id: 2, title: "Finalizar pagina de produto e oferta de lancamento", phase: "D-20 a D-15", owner: "E-commerce", priority: "Alta" },
  { id: 3, title: "Gerar 10 criativos (hero, textura, lifestyle)", phase: "D-14 a D-10", owner: "Criacao", priority: "Alta" },
  { id: 4, title: "Treinar consultores com scripts B2B", phase: "D-10 a D-5", owner: "Comercial", priority: "Alta" },
  { id: 5, title: "Aquecer lista VIP no WhatsApp", phase: "D-7 a D-1", owner: "CRM", priority: "Media" },
  { id: 6, title: "Executar rotina Dia D (feed, stories, lista VIP)", phase: "D0", owner: "Marketing", priority: "Alta" },
  { id: 7, title: "Rodar follow-up D+7 e otimizar funil", phase: "D+1 a D+7", owner: "Growth", priority: "Media" },
];

export const imagePromptPresets = [
  "Hero editorial luxo: produto em pedestal negro, luz dourada suave, fundo esmeralda profundo",
  "Textura macro: fios brilhantes, gotas de serum, reflexo acetinado",
  "Lifestyle salao premium: consultora aplicando protocolo, ambiente minimalista",
];

export const premiumPromptPacks = [
  {
    title: "Pack Lancamento B2C",
    type: "Stories + Reels",
    prompt: "Sequencia de 5 frames: problema, ritual, prova, oferta VIP, CTA WhatsApp.",
  },
  {
    title: "Pack Parceiro B2B",
    type: "Apresentacao + follow-up",
    prompt: "Slide mental: margem, protocolo INCI, kit de entrada, suporte pos-venda, prova social de saloes.",
  },
];
