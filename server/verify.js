import { prisma } from "./src/config/database.js";

async function verify() {
  try {
    console.log("\n========== CAMPAIGNS ==========\n");

    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      JSON.stringify(campaigns, null, 2)
    );

    console.log("\n========== AUDIT LOGS ==========\n");

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      JSON.stringify(auditLogs, null, 2)
    );

    console.log("\n========== SUMMARY ==========\n");

    console.log(
      `Total Campaigns: ${campaigns.length}`
    );

    console.log(
      `Active Campaigns: ${
        campaigns.filter(
          (campaign) => campaign.status === "ACTIVE"
        ).length
      }`
    );

    console.log(
      `Draft Campaigns: ${
        campaigns.filter(
          (campaign) => campaign.status === "DRAFT"
        ).length
      }`
    );
  } catch (error) {
    console.error("Verification error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();