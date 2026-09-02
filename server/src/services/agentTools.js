import { prisma } from "../config/database.js";

export async function searchProducts({
  merchantId,
  query = "",
}) {
  const products = await prisma.product.findMany({
    where: {
      merchantId,
      name: {
        contains: query,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
  }));
}

export async function getCustomerHistory({
  merchantId,
  customerId,
}) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      merchantId,
    },
  });
  if (!customer) {
    return {
      found: false,
      message: "Customer not found",
    };
  }
  const orders = await prisma.order.findMany({
    where: {
      merchantId,
      customerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
  return {
    found: true,
    customer: {
      id: customer.id,
      name: customer.name,
      totalSpent: customer.totalSpent,
      lastPurchase: customer.lastPurchase,
    },
    orders: orders.map((order) => ({
      id: order.id,
      productId: order.productId,
      quantity: order.quantity,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
    })),
  };
}
export async function analyzeRevenue({
  merchantId,
}) {
  const orders = await prisma.order.findMany({
    where: {
      merchantId,
    },
  });
  const paidOrders = orders.filter(
    (order) => order.status === "PAID"
  );
  const revenue = paidOrders.reduce(
    (total, order) => total + order.amount,
    0
  );
  const averageOrderValue =
    paidOrders.length > 0
      ? revenue / paidOrders.length
      : 0;
  return {
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    revenue,
    averageOrderValue,
  };
}
export async function findUpsell({
  merchantId,
}) {
  const products = await prisma.product.findMany({
    where: {
      merchantId,
    },
  });
  const orders = await prisma.order.findMany({
    where: {
      merchantId,
      status: "PAID",
    },
  });
  const productPurchaseCount = {};
  for (const order of orders) {
    productPurchaseCount[order.productId] =
      (productPurchaseCount[order.productId] || 0) +
      order.quantity;
  }
  const sortedProducts = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      purchases:
        productPurchaseCount[product.id] || 0,
    }))
    .sort((a, b) => b.purchases - a.purchases);
  return sortedProducts.slice(0, 10);
}
export async function findCrossSell({
  merchantId,
}) {
  const orders = await prisma.order.findMany({
    where: {
      merchantId,
      status: "PAID",
    },
  });
  const productPairs = {};
  for (let i = 0; i < orders.length; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      const a = orders[i];
      const b = orders[j];
      if (
        a.customerId &&
        a.customerId === b.customerId &&
        a.productId !== b.productId
      ) {
        const pair = [
          a.productId,
          b.productId,
        ].sort();
        const key = pair.join("|");
        productPairs[key] =
          (productPairs[key] || 0) + 1;
      }
    }
  }
  return Object.entries(productPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pair, count]) => {
      const [productA, productB] =
        pair.split("|");
      return {
        productA,
        productB,
        purchasesTogether: count,
      };
    });
}