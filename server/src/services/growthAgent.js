import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function analyzeGrowthOpportunities(merchantId) {
  const [products, customers, orders] = await Promise.all([
    prisma.product.findMany({
      where: { merchantId },
    }),

    prisma.customer.findMany({
      where: { merchantId },
    }),

    prisma.order.findMany({
      where: {
        merchantId,
        status: "PAID",
      },
    }),
  ]);

  const opportunities = [];

  /*
   * OPPORTUNITY 1
   * Laptop → accessory upsell
   */

  const laptop = products.find(
    (product) =>
      product.category?.toLowerCase() === "laptops"
  );

  const accessories = products.filter(
    (product) =>
      product.category?.toLowerCase() === "accessories"
  );

  if (laptop && accessories.length > 0) {
    const averageAccessoryPrice =
      accessories.reduce(
        (sum, product) => sum + product.price,
        0
      ) / accessories.length;

    const estimatedCustomers = Math.max(
      1,
      Math.round(customers.length * 0.4)
    );

    const estimatedRevenue = Math.round(
      estimatedCustomers * averageAccessoryPrice
    );

    opportunities.push({
      type: "UPSELL",
      title: "Laptop accessory upsell",
      priority: "HIGH",

      explanation:
        "Customers purchasing high-value laptops are strong candidates for complementary accessories such as laptop bags, wireless mice and mechanical keyboards.",

      recommendation:
        `Offer laptop accessories to customers who purchased or are considering a laptop.`,

      products: accessories.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
      })),

      estimatedCustomers,
      estimatedRevenue,

      action: {
        type: "CREATE_CAMPAIGN",
        requiresApproval: true,
      },
    });
  }

  /*
   * OPPORTUNITY 2
   * High-value customer reactivation
   */

  const highValueCustomers = customers.filter(
    (customer) => customer.totalSpent >= 50000
  );

  if (highValueCustomers.length > 0) {
    const estimatedRevenue = highValueCustomers.length * 999;

    opportunities.push({
      type: "REACTIVATION",
      title: "High-value customer reactivation",
      priority: "MEDIUM",

      explanation:
        "Several customers have significant historical spending. A targeted campaign can encourage them to make another purchase.",

      recommendation:
        "Create a personalized reactivation campaign with an accessory or returning-customer offer.",

      customers: highValueCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalSpent: customer.totalSpent,
      })),

      estimatedCustomers: highValueCustomers.length,
      estimatedRevenue,

      action: {
        type: "CREATE_CAMPAIGN",
        requiresApproval: true,
      },
    });
  }

  /*
   * OPPORTUNITY 3
   * Low-stock product detection
   */

  const lowStockProducts = products.filter(
    (product) => product.stock <= 25
  );

  if (lowStockProducts.length > 0) {
    opportunities.push({
      type: "INVENTORY",
      title: "Low-stock product alert",
      priority: "MEDIUM",

      explanation:
        "Some products have limited inventory and may require restocking before a growth campaign increases demand.",

      recommendation:
        "Review inventory before launching campaigns for these products.",

      products: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
      })),

      estimatedCustomers: 0,
      estimatedRevenue: 0,

      action: {
        type: "INVENTORY_REVIEW",
        requiresApproval: false,
      },
    });
  }

  return {
    merchantId,

    summary: {
      productsAnalyzed: products.length,
      customersAnalyzed: customers.length,
      ordersAnalyzed: orders.length,
      opportunitiesFound: opportunities.length,
    },

    opportunities,

    generatedAt: new Date().toISOString(),
  };
}