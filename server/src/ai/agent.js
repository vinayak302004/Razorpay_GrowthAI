import OpenAI from "openai";

import {
  searchProducts,
  getCustomerHistory,
  analyzeRevenue,
  findUpsell,
  findCrossSell,
} from "../services/agentTools.js";

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
});

const tools = [
  {
    type: "function",
    name: "search_products",
    description:
      "Search products belonging to the merchant. Use this when the user asks about available products, prices, stock, or a specific product.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        merchantId: {
          type: "string",
          description: "The merchant ID.",
        },
        query: {
          type: "string",
          description: "Product name or search query. Use an empty string for all products.",
        },
      },
      required: ["merchantId", "query"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "get_customer_history",
    description:
      "Get a customer's purchase history, total spending, and last purchase.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        merchantId: {
          type: "string",
          description: "The merchant ID.",
        },
        customerId: {
          type: "string",
          description: "The customer ID.",
        },
      },
      required: ["merchantId", "customerId"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "analyze_revenue",
    description:
      "Analyze merchant revenue, paid orders, total orders, and average order value.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        merchantId: {
          type: "string",
          description: "The merchant ID.",
        },
      },
      required: ["merchantId"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "find_upsell",
    description:
      "Find products with the strongest purchase volume that may be useful for upselling.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        merchantId: {
          type: "string",
          description: "The merchant ID.",
        },
      },
      required: ["merchantId"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "find_cross_sell",
    description:
      "Find products that customers frequently purchase together.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        merchantId: {
          type: "string",
          description: "The merchant ID.",
        },
      },
      required: ["merchantId"],
      additionalProperties: false,
    },
  },
];

const toolFunctions = {
  search_products: searchProducts,
  get_customer_history: getCustomerHistory,
  analyze_revenue: analyzeRevenue,
  find_upsell: findUpsell,
  find_cross_sell: findCrossSell,
};

export async function runGrowthAgent({
  message,
  merchantId,
}) {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  const instructions = `
You are RazorGrowth AI, an AI revenue-growth assistant for merchants.

Your job is to analyze merchant data and provide useful, grounded business insights.

IMPORTANT RULES:
- Use the available tools whenever the user's question requires merchant data.
- Never invent products, customers, revenue numbers, orders, or recommendations.
- Base factual answers on tool results.
- Explain your reasoning clearly but concisely.
- Prices and revenue values are stored in INR paise. Convert them to INR when presenting money.
- You can recommend campaigns or actions, but you must NOT directly execute financial transactions or launch campaigns.
- Human approval is required before side effects.
- If the available data is insufficient, say so honestly.

The current merchant ID is:
${merchantId}
`;

  let input = [
    {
      role: "user",
      content: message,
    },
  ];

  const toolCalls = [];

  for (let step = 0; step < 5; step++) {
    const response = await openai.responses.create({
      model: process.env.LLM_MODEL,
      instructions,
      input,
      tools,
    });

    const functionCalls = response.output.filter(
      (item) => item.type === "function_call"
    );

    if (functionCalls.length === 0) {
      return {
        message: response.output_text,
        toolCalls,
      };
    }

    input = [...input, ...response.output];

    for (const call of functionCalls) {
      const toolFunction = toolFunctions[call.name];

      if (!toolFunction) {
        throw new Error(`Unknown tool: ${call.name}`);
      }

      const args = JSON.parse(call.arguments);

      const result = await toolFunction(args);

      toolCalls.push({
        tool: call.name,
        arguments: args,
      });

      input.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }
  }

  throw new Error("Agent exceeded maximum tool-calling steps");
}