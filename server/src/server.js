import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import { prisma } from "./config/database.js";
import { analyzeGrowthOpportunities } from "./services/growthAgent.js";
import { razorpay } from "./services/razorpay.js";
import { runGrowthAgent } from "./ai/agent.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "RazorGrowth API is running",
  });
});

app.get("/api/dashboard/metrics", async (_req, res) => {
  try {
    const merchant = await prisma.merchant.findFirst();

    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const orders = await prisma.order.findMany({
      where: {
        merchantId: merchant.id,
      },
    });
    const paidOrders = orders.filter(
      (order) => order.status === "PAID"
    );
    const revenue = paidOrders.reduce(
      (total, order) => total + order.amount,
      0
    );
    const customerCount = await prisma.customer.count({
      where: {
        merchantId: merchant.id,
      },
    });
    const growthAnalysis =
      await analyzeGrowthOpportunities(merchant.id);
    res.json({
      revenue,
      orders: orders.length,
      customers: customerCount,
      conversion: 0,
      opportunities:
        growthAnalysis.opportunities.length,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      error: "Failed to load dashboard metrics",
    });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const merchant = await prisma.merchant.findFirst();

    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const products = await prisma.product.findMany({
      where: {
        merchantId: merchant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
    });
  }
});

app.get("/api/customers", async (_req, res) => {
  try {
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const customers = await prisma.customer.findMany({
      where: {
        merchantId: merchant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(customers);
  } catch (error) {
    console.error("Customers error:", error);
    res.status(500).json({
      error: "Failed to fetch customers",
    });
  }
});

app.post("/api/payments/create-order", async (req, res) => {
  try {
    const {
      productId,
      customerId,
      quantity = 1,
    } = req.body;
    if (!productId) {
      return res.status(400).json({
        error: "Product ID is required",
      });
    }
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        merchantId: merchant.id,
      },
    });
    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }
    if (quantity < 1) {
      return res.status(400).json({
        error: "Quantity must be at least 1",
      });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
      });
    }
    const amount = product.price * quantity;
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rg_${Date.now()}`,
      notes: {
        productId: product.id,
        productName: product.name,
        customerId: customerId || "guest",
      },
    });
    const order = await prisma.order.create({
      data: {
        merchantId: merchant.id,
        customerId: customerId || null,
        productId: product.id,
        quantity,
        razorpayOrderId: razorpayOrder.id,
        amount,
        status: "CREATED",
      },
    });
    res.json({
      success: true,
      order,
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    res.status(500).json({
      error: "Failed to create Razorpay order",
    });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        error: "Payment verification data is incomplete",
      });
    }
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        error: "Razorpay order mismatch",
      });
    }
    if (order.status === "PAID") {
      return res.json({
        success: true,
        message: "Payment was already verified.",
        order,
      });
    }
    const product = await prisma.product.findFirst({
      where: {
        id: order.productId,
        merchantId: order.merchantId,
      },
    });
    if (!product) {
      return res.status(404).json({
        error: "Product associated with this order was not found",
      });
    }
    if (product.stock < order.quantity) {
      return res.status(400).json({
        error: "Insufficient stock to complete this payment",
      });
    }
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: "PAID",
        },
      });
      const updatedProduct = await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: {
            decrement: order.quantity,
          },
        },
      });
      let updatedCustomer = null;
      if (order.customerId) {
        updatedCustomer = await tx.customer.update({
          where: {
            id: order.customerId,
          },
          data: {
            totalSpent: {
              increment: order.amount,
            },
            lastPurchase: new Date(),
          },
        });
      }
      const auditLog = await tx.auditLog.create({
        data: {
          merchantId: order.merchantId,
          action: "PAYMENT_VERIFIED",
          input: JSON.stringify({
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            productId: product.id,
            quantity: order.quantity,
          }),
          output: JSON.stringify({
            status: "PAID",
            amount: order.amount,
            product: product.name,
            stockRemaining: updatedProduct.stock,
            customerId: order.customerId,
          }),
          status: "SUCCESS",
        },
      });
      return {
        updatedOrder,
        updatedProduct,
        updatedCustomer,
        auditLog,
      };
    });

    res.json({
      success: true,
      message:
        "Payment verified successfully. Order, inventory, customer and audit log updated.",
      order: result.updatedOrder,
      product: {
        id: result.updatedProduct.id,
        name: result.updatedProduct.name,
        stockRemaining: result.updatedProduct.stock,
      },
      customer: result.updatedCustomer,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );
    res.status(500).json({
      error: "Failed to verify payment",
    });
  }
});

app.get("/api/campaigns", async (_req, res) => {
  try {
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const campaigns = await prisma.campaign.findMany({
      where: {
        merchantId: merchant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(campaigns);
  } catch (error) {
    console.error("Campaigns error:", error);
    res.status(500).json({
      error: "Failed to fetch campaigns",
    });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const result = await runGrowthAgent({
      message,
      merchantId: merchant.id,
    });
    res.json(result);
  } catch (error) {
    console.error("AI Agent Error:", error);
    res.status(500).json({
      error: "AI agent failed",
      message: error.message,
    });
  }
});

app.get("/api/ai/opportunities", async (_req, res) => {
  try {
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const result = await analyzeGrowthOpportunities(
      merchant.id
    );
    res.json(result);
  } catch (error) {
    console.error(
      "AI opportunity analysis failed:",
      error
    );
    res.status(500).json({
      error: "Failed to analyze growth opportunities",
    });
  }
});

app.post("/api/ai/opportunities/approve", async (req, res) => {
  try {
    const { opportunity } = req.body;
    if (!opportunity) {
      return res.status(400).json({
        error: "Opportunity is required",
      });
    }
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const opportunityKey =
      `${opportunity.type}|${opportunity.title}`;
    const existingApproval = await prisma.auditLog.findFirst({
      where: {
        merchantId: merchant.id,
        action: "APPROVE_OPPORTUNITY",
        input: opportunityKey,
      },
    });
    if (existingApproval) {
      return res.status(409).json({
        error: "This opportunity has already been approved.",
      });
    }
    if (opportunity.type === "INVENTORY") {
      await prisma.auditLog.create({
        data: {
          merchantId: merchant.id,
          action: "APPROVE_OPPORTUNITY",
          input: opportunityKey,
          output: JSON.stringify({
            type: "INVENTORY_REVIEW",
            title: opportunity.title,
          }),
          status: "APPROVED",
        },
      });
      return res.json({
        success: true,
        message: "Inventory review approved.",
        campaign: null,
      });
    }
    let target = "Selected merchant customers";
    let offer = opportunity.recommendation || "Personalized offer";
    if (opportunity.type === "UPSELL") {
      target =
        "Customers who purchased or are considering a laptop";
      offer =
        "Offer complementary laptop accessories including bags, mice and keyboards.";
    }
    if (opportunity.type === "REACTIVATION") {
      target =
        "High-value inactive customers";
      offer =
        "Personalized returning-customer offer on relevant products.";
    }
    if (opportunity.type === "AOV_GROWTH") {
      target =
        "Customers likely to purchase complementary products";
      offer =
        opportunity.recommendation ||
        "Recommend complementary products during checkout.";
    }
    if (opportunity.type === "TOP_PRODUCT") {
      target =
        "Customers likely to purchase this high-performing product";
      offer =
        opportunity.recommendation ||
        "Promote this high-performing product to relevant customers.";
    }
    const campaign = await prisma.campaign.create({
      data: {
        merchantId: merchant.id,
        name: opportunity.title,
        target,
        offer,
        status: "DRAFT",
      },
    });
    await prisma.auditLog.create({
      data: {
        merchantId: merchant.id,
        action: "APPROVE_OPPORTUNITY",
        input: opportunityKey,
        output: JSON.stringify({
          campaignId: campaign.id,
          campaignName: campaign.name,
          target: campaign.target,
          offer: campaign.offer,
        }),
        status: "APPROVED",
      },
    });
    res.json({
      success: true,
      message: "Opportunity approved and campaign created.",
      campaign,
    });
  } catch (error) {
    console.error("Approval error:", error);

    res.status(500).json({
      error: "Failed to approve opportunity",
    });
  }
});
app.post("/api/ai/opportunities/reject", async (req, res) => {
  try {
    const {
      opportunity,
      reason = "Rejected by merchant",
    } = req.body;
    if (!opportunity) {
      return res.status(400).json({
        error: "Opportunity is required",
      });
    }
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const opportunityKey =
      `${opportunity.type}|${opportunity.title}`;
    const auditLog = await prisma.auditLog.create({
      data: {
        merchantId: merchant.id,
        action: "REJECT_OPPORTUNITY",
        input: opportunityKey,
        output: JSON.stringify({
          reason,
          title: opportunity.title,
          type: opportunity.type,
        }),
        status: "REJECTED",
      },
    });
    res.json({
      success: true,
      message: "Opportunity rejected.",
      auditLog,
    });
  } catch (error) {
    console.error("Rejection error:", error);

    res.status(500).json({
      error: "Failed to reject opportunity",
    });
  }
});

app.get("/api/audit-logs", async (_req, res) => {
  try {
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
      });
    }
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        merchantId: merchant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(auditLogs);
  } catch (error) {
    console.error("Audit logs error:", error);
    res.status(500).json({
      error: "Failed to fetch audit logs",
    });
  }
});

app.post(
  "/api/campaigns/:id/launch",
  async (req, res) => {
    try {
      const { id } = req.params;
      const merchant = await prisma.merchant.findFirst();
      if (!merchant) {
        return res.status(404).json({
          error: "Merchant not found",
        });
      }
      const campaign = await prisma.campaign.findFirst({
        where: {
          id,
          merchantId: merchant.id,
        },
      });
      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found",
        });
      }
      if (campaign.status === "ACTIVE") {
        return res.status(409).json({
          error: "Campaign is already active.",
        });
      }
      const updatedCampaign =
        await prisma.campaign.update({
          where: {
            id: campaign.id,
          },
          data: {
            status: "ACTIVE",
          },
        });

      await prisma.auditLog.create({
        data: {
          merchantId: merchant.id,
          action: "CAMPAIGN_LAUNCHED",
          input: JSON.stringify({
            campaignId: campaign.id,
            campaignName: campaign.name,
          }),
          output: JSON.stringify({
            status: "ACTIVE",
          }),
          status: "SUCCESS",
        },
      });
      res.json({
        success: true,
        message: "Campaign launched successfully.",
        campaign: updatedCampaign,
      });
    } catch (error) {
      console.error(
        "Campaign launch error:",
        error
      );
      res.status(500).json({
        error: "Failed to launch campaign",
      });
    }
  }
);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(
    `RazorGrowth API running on http://localhost:${PORT}`
  );
});