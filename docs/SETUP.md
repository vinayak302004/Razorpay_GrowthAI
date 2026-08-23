# RazorGrowth AI — Setup Guide

## 1. Requirements
- Node.js 20+
- npm
- Git
- VS Code
- Razorpay account with Test Mode enabled
- An LLM API key for the AI agent

## 2. Install
From the project root:

```bash
npm install
npm run install-all
```

## 3. Backend environment
Copy `server/.env.example` to `server/.env` and fill in the values.

Do not commit `server/.env`.

## 4. Database
After the Prisma schema is added:

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
```

## 5. Run
From the root:

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## 6. Razorpay
Use Test Mode credentials only during development.

The secret key must stay on the server. Never put it in React code or GitHub.

## 7. Build order
1. Foundation and API health check
2. Prisma database + seed data
3. Merchant dashboard
4. Product/customer pages
5. AI agent and tools
6. Upsell/cross-sell engine
7. Razorpay order + checkout
8. Approval gates + audit logs
9. Failure handling
10. Deployment, README and 5-minute demo
