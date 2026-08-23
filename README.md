# RazorGrowth AI

AI Revenue Growth & Agentic Commerce Platform for Razorpay AI Buildathon — Track 1.

## Goal
Help merchants discover revenue opportunities, create controlled campaigns, recommend products, and convert recommendations into Razorpay Test Mode payments.

## Architecture
React/Vite frontend → Express API → AI Agent/Tools → SQLite/Prisma → Razorpay Test Mode

## Planned Features
- Merchant analytics dashboard
- Product and customer catalog
- AI revenue-growth agent
- Upsell and cross-sell recommendations
- Agent-readable product catalog
- Campaign generation with merchant approval
- Razorpay Test Mode checkout
- Payment verification and webhook handling
- Explainable, bounded financial actions
- Audit logs and graceful failure handling

## Project Structure
- `client/` — React frontend
- `server/` — Express backend
- `docs/` — architecture, demo notes and screenshots

## Setup
See `docs/SETUP.md`.

## Security
Never commit `.env`, Razorpay secrets, or API keys.
