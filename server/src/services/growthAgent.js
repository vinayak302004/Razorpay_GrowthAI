import { prisma } from "../config/database.js";

/**
 * RazorGrowth AI
 * ----------------
 * Analyzes merchant data and generates actionable
 * revenue-growth opportunities.
 *
 * Opportunity types:
 * 1. UPSELL
 * 2. REACTIVATION
 * 3. INVENTORY
 * 4. AOV_GROWTH
 * 5. TOP_PRODUCT
 */

export async function analyzeGrowthOpportunities(merchantId) {
  // ============================================================
  // 1. FETCH MERCHANT DATA
  // ============================================================

  const [products, customers, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        merchantId,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.customer.findMany({
      where: {
        merchantId,
      },
      orderBy: {
        totalSpent: "desc",
      },
    }),

    prisma.order.findMany({
      where: {
        merchantId,
        status: "PAID",
      },
      include: {
        product: true,
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const opportunities = [];

  // ============================================================
  // 2. BASIC BUSINESS METRICS
  // ============================================================

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.amount,
    0
  );

  const totalUnitsSold = orders.reduce(
    (sum, order) => sum + order.quantity,
    0
  );

  const averageOrderValue =
    orders.length > 0
      ? Math.round(totalRevenue / orders.length)
      : 0;

  // ============================================================
  // 3. CUSTOMER SEGMENTATION
  // ============================================================

  const highValueCustomers = customers.filter(
    (customer) => customer.totalSpent >= 50000
  );

  const mediumValueCustomers = customers.filter(
    (customer) =>
      customer.totalSpent >= 20000 &&
      customer.totalSpent < 50000
  );

  const lowValueCustomers = customers.filter(
    (customer) => customer.totalSpent < 20000
  );

  // ============================================================
  // 4. PRODUCT PERFORMANCE
  // ============================================================

  const productPerformance = products.map((product) => {
    const productOrders = orders.filter(
      (order) => order.productId === product.id
    );

    const unitsSold = productOrders.reduce(
      (sum, order) => sum + order.quantity,
      0
    );

    const revenue = productOrders.reduce(
      (sum, order) => sum + order.amount,
      0
    );

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unitsSold,
      revenue,
      orders: productOrders.length,
    };
  });

  const topProducts = [...productPerformance]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ============================================================
  // 5. LAPTOP → ACCESSORY UPSELL
  // ============================================================

  const laptopProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() === "laptops"
  );

  const accessoryProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() === "accessories"
  );

  const laptopUnitsSold = laptopProducts.reduce(
    (sum, laptop) => {
      const performance = productPerformance.find(
        (item) => item.id === laptop.id
      );

      return sum + (performance?.unitsSold || 0);
    },
    0
  );

  if (
    laptopProducts.length > 0 &&
    accessoryProducts.length > 0 &&
    laptopUnitsSold > 0
  ) {
    const averageAccessoryPrice = Math.round(
      accessoryProducts.reduce(
        (sum, product) => sum + product.price,
        0
      ) / accessoryProducts.length
    );

    /*
     * Estimate around 40% of laptop buyers as potential
     * accessory customers.
     */
    const estimatedCustomers = Math.max(
      1,
      Math.round(laptopUnitsSold * 0.4)
    );

    const estimatedRevenue =
      estimatedCustomers * averageAccessoryPrice;

    opportunities.push({
      type: "UPSELL",

      title: "Laptop accessory upsell",

      priority: "HIGH",

      confidence: 0.91,

      explanation:
        "Laptop customers are strong candidates for complementary accessories such as bags, mice and keyboards.",

      evidence: {
        laptopProduct:
          laptopProducts[0].name,

        laptopUnitsSold,

        accessoryProducts:
          accessoryProducts.map(
            (product) => product.name
          ),

        averageAccessoryPrice,
      },

      recommendation:
        "Offer complementary laptop accessories immediately after a laptop purchase or through a targeted customer campaign.",

      products: accessoryProducts.map(
        (product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
        })
      ),

      estimatedCustomers,

      estimatedRevenue,

      action: {
        type: "CREATE_CAMPAIGN",
        requiresApproval: true,
      },
    });
  }

  // ============================================================
  // 6. HIGH-VALUE CUSTOMER REACTIVATION
  // ============================================================

  if (highValueCustomers.length > 0) {
    const estimatedRevenue =
      highValueCustomers.length * 999;

    const historicalValue =
      highValueCustomers.reduce(
        (sum, customer) =>
          sum + customer.totalSpent,
        0
      );

    opportunities.push({
      type: "REACTIVATION",

      title:
        "High-value customer reactivation",

      priority: "HIGH",

      confidence: 0.86,

      explanation:
        "High-value customers have already demonstrated strong spending and may respond well to personalized returning-customer offers.",

      evidence: {
        highValueCustomers:
          highValueCustomers.length,

        totalHistoricalValue:
          historicalValue,
      },

      recommendation:
        "Create a personalized reactivation campaign offering relevant products or a returning-customer incentive.",

      customers:
        highValueCustomers.map(
          (customer) => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            totalSpent:
              customer.totalSpent,
            lastPurchase:
              customer.lastPurchase,
          })
        ),

      estimatedCustomers:
        highValueCustomers.length,

      estimatedRevenue,

      action: {
        type: "CREATE_CAMPAIGN",
        requiresApproval: true,
      },
    });
  }

  // ============================================================
  // 7. LOW STOCK DETECTION
  // ============================================================

  const lowStockProducts = products.filter(
    (product) => product.stock <= 25
  );

  const criticalStockProducts =
    products.filter(
      (product) => product.stock <= 5
    );

  if (lowStockProducts.length > 0) {
    opportunities.push({
      type: "INVENTORY",

      title: "Low-stock product alert",

      priority:
        criticalStockProducts.length > 0
          ? "HIGH"
          : "MEDIUM",

      confidence: 0.97,

      explanation:
        "Some products have limited inventory and may require restocking before additional demand is generated.",

      evidence: {
        lowStockProducts:
          lowStockProducts.length,

        criticalProducts:
          criticalStockProducts.length,
      },

      recommendation:
        "Review inventory levels before launching campaigns that could increase demand for these products.",

      products:
        lowStockProducts.map(
          (product) => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
          })
        ),

      estimatedCustomers: 0,

      estimatedRevenue: 0,

      action: {
        type: "INVENTORY_REVIEW",
        requiresApproval: false,
      },
    });
  }

  // ============================================================
  // 8. AVERAGE ORDER VALUE GROWTH
  // ============================================================

  /*
   * Find the best-selling accessory that can be
   * recommended as an add-on.
   */

  const accessoryPerformance =
    productPerformance
      .filter(
        (product) =>
          product.category?.toLowerCase() ===
          "accessories"
      )
      .sort(
        (a, b) =>
          b.unitsSold - a.unitsSold
      );

  const recommendedAddOn =
    accessoryPerformance[0];

  if (
    recommendedAddOn &&
    orders.length > 0
  ) {
    const estimatedCustomers =
      Math.max(
        1,
        Math.round(orders.length * 0.25)
      );

    const estimatedRevenue =
      estimatedCustomers *
      recommendedAddOn.price;

    opportunities.push({
      type: "AOV_GROWTH",

      title:
        "Increase average order value",

      priority: "MEDIUM",

      confidence: 0.74,

      explanation:
        "Customers can potentially increase basket size through complementary accessory recommendations and product bundles.",

      evidence: {
        currentAverageOrderValue:
          averageOrderValue,

        paidOrders:
          orders.length,

        recommendedProduct:
          recommendedAddOn.name,

        recommendedProductPrice:
          recommendedAddOn.price,
      },

      recommendation:
        `Recommend ${recommendedAddOn.name} as a complementary add-on during checkout.`,

      products: [
        {
          id: recommendedAddOn.id,
          name: recommendedAddOn.name,
          price: recommendedAddOn.price,
          stock: recommendedAddOn.stock,
        },
      ],

      estimatedCustomers,

      estimatedRevenue,

      action: {
        type: "CREATE_CAMPAIGN",
        requiresApproval: true,
      },
    });
  }

  // ============================================================
  // 9. TOP PRODUCT PROMOTION
  // ============================================================

  const bestProduct =
    topProducts[0];

  if (
    bestProduct &&
    bestProduct.unitsSold > 0
  ) {
    const estimatedCustomers =
      Math.max(
        1,
        Math.round(customers.length * 0.2)
      );

    /*
     * Don't recommend aggressively promoting a product
     * if there is almost no inventory.
     */
    if (bestProduct.stock > 5) {
      opportunities.push({
        type: "TOP_PRODUCT",

        title:
          `${bestProduct.name} promotion opportunity`,

        priority: "MEDIUM",

        confidence: 0.82,

        explanation:
          "This product is currently one of the merchant's strongest performers and may benefit from targeted promotion.",

        evidence: {
          product:
            bestProduct.name,

          unitsSold:
            bestProduct.unitsSold,

          revenue:
            bestProduct.revenue,

          stock:
            bestProduct.stock,
        },

        recommendation:
          `Promote ${bestProduct.name} to relevant customers while inventory is available.`,

        products: [
          {
            id: bestProduct.id,
            name: bestProduct.name,
            price: bestProduct.price,
            stock: bestProduct.stock,
          },
        ],

        estimatedCustomers,

        estimatedRevenue:
          estimatedCustomers *
          bestProduct.price,

        action: {
          type: "CREATE_CAMPAIGN",
          requiresApproval: true,
        },
      });
    }
  }

  // ============================================================
  // 10. SORT OPPORTUNITIES BY PRIORITY
  // ============================================================

  const priorityRank = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  opportunities.sort(
    (a, b) =>
      (priorityRank[b.priority] || 0) -
      (priorityRank[a.priority] || 0)
  );

  // ============================================================
  // 11. FINAL RESPONSE
  // ============================================================

  return {
    merchantId,

    summary: {
      productsAnalyzed:
        products.length,

      customersAnalyzed:
        customers.length,

      ordersAnalyzed:
        orders.length,

      totalRevenue,

      totalUnitsSold,

      averageOrderValue,

      highValueCustomers:
        highValueCustomers.length,

      mediumValueCustomers:
        mediumValueCustomers.length,

      lowValueCustomers:
        lowValueCustomers.length,

      opportunitiesFound:
        opportunities.length,
    },

    topProducts,

    opportunities,

    generatedAt:
      new Date().toISOString(),
  };
}