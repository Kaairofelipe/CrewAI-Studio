import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { ClaimStatus, LeadStage, PrismaClient, Role } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL em falta: copie .env.example para .env na pasta web.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
  log: ["warn", "error"],
});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@kalainne.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Kalainne@2026";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin Kalaïnne",
      role: Role.admin,
      passwordHash: adminHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: "Admin Kalaïnne",
      role: Role.admin,
      passwordHash: adminHash,
      isActive: true,
    },
  });

  await prisma.scriptTemplate.createMany({
    data: [
      {
        audience: "B2C",
        title: "Abordagem VIP Lancamento",
        objective: "Converter lead quente no dia D",
        content:
          "Oi [nome], aqui e da Kalaïnne. Abrimos agora a condicao VIP do Balance System. Quer que eu te envie a proposta personalizada para seu tipo de cabelo?",
      },
      {
        audience: "B2B",
        title: "Prospeccao Salao Premium",
        objective: "Abrir parceria profissional",
        content:
          "Ola [nome], estamos selecionando saloes parceiros para o Balance System com protocolo completo e argumento tecnico validado. Posso te apresentar margem e kit de entrada?",
      },
    ],
    skipDuplicates: true,
  });

  const demoTitle = "Lancamento Balance System - Semana 1";
  let campaign = await prisma.campaign.findFirst({
    where: { title: demoTitle, ownerId: admin.id },
  });
  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        title: demoTitle,
        phase: "pre-lancamento",
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        status: "active",
        objective: "Aumentar lista VIP e fechar 5 parceiros B2B",
        ownerId: admin.id,
      },
    });

    await prisma.lead.createMany({
      data: [
        {
          name: "Studio Bella Elegance",
          channel: "WhatsApp",
          audience: "B2B",
          stage: LeadStage.contato,
          ownerId: admin.id,
        },
        {
          name: "Cliente VIP Ana",
          channel: "Instagram",
          audience: "B2C",
          stage: LeadStage.proposta,
          ownerId: admin.id,
        },
      ],
    });

    await prisma.checklistItem.createMany({
      data: [
        {
          campaignId: campaign.id,
          title: "Publicar hero shot de lancamento",
          ownerArea: "Marketing",
          priority: "Alta",
        },
        {
          campaignId: campaign.id,
          title: "Disparar lista VIP as 08:00",
          ownerArea: "CRM",
          priority: "Alta",
        },
      ],
    });
  }

  await prisma.claimRule.createMany({
    data: [
      {
        productLine: "Balance System",
        claimText: "Rotina completa de cronograma capilar com protocolo em etapas.",
        status: ClaimStatus.seguro,
        evidenceRef: "FDS/FISPQ Balance System",
      },
      {
        productLine: "Balance System",
        claimText: "Repara 100% dos danos em 1 aplicacao.",
        status: ClaimStatus.evitar,
        evidenceRef: "Sem evidencias laboratoriais conclusivas",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
