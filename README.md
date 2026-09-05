# RazorGrowth AI

AI-powered Revenue Growth & Agentic Commerce Platform built for the **Razorpay AI Buildathon — Track 1**.

RazorGrowth AI helps merchants identify revenue-growth opportunities, generate controlled campaigns, recommend relevant products, and convert approved recommendations into **Razorpay Test Mode payments** — while maintaining human approval, bounded actions, and an auditable trail.

---

## 🚀 Overview

RazorGrowth AI combines merchant analytics, deterministic growth analysis, AI-powered recommendations, campaign governance, and Razorpay Test Mode payments into a single platform.

The system analyzes:

- Merchant revenue
- Products and inventory
- Customer purchasing behavior
- Paid orders
- Upsell opportunities
- Cross-sell opportunities
- Customer reactivation opportunities

AI recommendations are **not allowed to directly execute financial actions**.

Instead, the platform follows a controlled workflow:

```text
Merchant Data
     ↓
Growth Analysis
     ↓
AI Recommendation
     ↓
Human Approval
     ↓
Draft Campaign
     ↓
Human Launch
     ↓
Razorpay Test Mode Payment
     ↓
Payment Verification
     ↓
Audit Log