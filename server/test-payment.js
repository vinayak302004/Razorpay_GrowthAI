import "dotenv/config";
import { razorpay } from "./src/services/razorpay.js";

const order = await razorpay.orders.create({
  amount: 65999 * 100,
  currency: "INR",
  receipt: `test_${Date.now()}`,
});

console.log("========== RAZORPAY TEST ORDER ==========");
console.log(order);

process.exit(0);