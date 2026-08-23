import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing demo data
  await prisma.auditLog.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();

  // Merchant
  const merchant = await prisma.merchant.create({
    data: {
      name: "Demo Merchant",
      email: "merchant@example.com",
    },
  });

  // Products
  await prisma.product.createMany({
    data: [
      {
        merchantId: merchant.id,
        name: "Programming Laptop",
        description: "High-performance laptop for programming",
        category: "Laptops",
        price: 65999,
        stock: 24,
        tags: "laptop,programming",
      },
      {
        merchantId: merchant.id,
        name: "Laptop Bag",
        description: "Premium laptop bag",
        category: "Accessories",
        price: 1299,
        stock: 84,
        tags: "bag,laptop-accessory",
      },
      {
        merchantId: merchant.id,
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse",
        category: "Accessories",
        price: 899,
        stock: 120,
        tags: "mouse,laptop-accessory",
      },
      {
        merchantId: merchant.id,
        name: "Mechanical Keyboard",
        description: "Mechanical keyboard for developers",
        category: "Accessories",
        price: 1499,
        stock: 65,
        tags: "keyboard,developer",
      },
    ],
  });

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: "Aarav",
        email: "aarav@example.com",
        totalSpent: 78000,
      },
    }),

    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: "Isha",
        email: "isha@example.com",
        totalSpent: 54000,
      },
    }),

    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: "Rahul",
        email: "rahul@example.com",
        totalSpent: 32000,
      },
    }),

    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: "Priya",
        email: "priya@example.com",
        totalSpent: 91000,
      },
    }),

    prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: "Aditya",
        email: "aditya@example.com",
        totalSpent: 28000,
      },
    }),
  ]);

  // Orders
  const amounts = [
    65999,
    2198,
    65999,
    1499,
    65999,
    1299,
    899,
    1499,
  ];

  for (let i = 0; i < amounts.length; i++) {
    await prisma.order.create({
      data: {
        merchantId: merchant.id,
        customerId: customers[i % customers.length].id,
        amount: amounts[i],
        status: "PAID",
      },
    });
  }

  // Campaign
  await prisma.campaign.create({
    data: {
      merchantId: merchant.id,
      name: "Laptop Accessory Upsell",
      target: "Customers who purchased laptops",
      offer: "10% off laptop accessories",
      status: "ACTIVE",
    },
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        merchantId: merchant.id,
        action: "REVENUE_ANALYSIS",
        input: "Analyze recent merchant sales",
        output: "Found accessory upsell opportunity",
        status: "SUCCESS",
      },
      {
        merchantId: merchant.id,
        action: "CAMPAIGN_CREATED",
        input: "Laptop accessory campaign",
        output: "Campaign created successfully",
        status: "SUCCESS",
      },
    ],
  });

  console.log("");
  console.log("=================================");
  console.log("RazorGrowth AI database seeded!");
  console.log("Merchant: Demo Merchant");
  console.log("Products: 4");
  console.log("Customers: 5");
  console.log("Orders: 8");
  console.log("Campaigns: 1");
  console.log("Audit logs: 2");
  console.log("=================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });