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

# ⚙️ Setup & Run Locally

Follow the steps below to set up and run **RazorGrowth AI** from a fresh clone.

The project consists of two applications:

* `client/` → React + Vite frontend
* `server/` → Express.js backend + Prisma + SQLite

You need **two terminal windows** to run the frontend and backend simultaneously.

---

## 📋 Prerequisites

Before starting, install:

* Node.js 18+
* npm
* Git

Verify the installations:

```bash
node --version
npm --version
git --version
```

If these commands return version numbers, you are ready to continue.

---

## 1️⃣ Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/vinayak302004/Razorpay_GrowthAI.git
```

Enter the project directory:

```bash
cd Razorpay_GrowthAI
```

The project should contain:

```text
Razorpay_GrowthAI/
├── client/
├── server/
├── .gitignore
└── README.md
```

---

## 2️⃣ Install Frontend Dependencies

Open **Terminal 1**.

Navigate to the frontend:

```bash
cd client
```

Install all frontend dependencies:

```bash
npm install
```

This installs the packages required by the React + Vite application.

---

## 3️⃣ Install Backend Dependencies

Open **Terminal 2**.

From the project root, navigate to the backend:

```bash
cd server
```

Install all backend dependencies:

```bash
npm install
```

This installs the Express.js, Prisma, Razorpay, AI integration, and other backend dependencies.

---

## 4️⃣ Configure Environment Variables

The backend requires environment variables for the database, Razorpay Test Mode, and AI integration.

Inside the `server/` directory, create a new file named:

```text
.env
```

Your structure should look like:

```text
server/
├── src/
├── prisma/
├── package.json
└── .env
```

Add the following environment variables:

```env
PORT=5000

DATABASE_URL="file:./dev.db"

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

LLM_API_KEY=your_llm_api_key
LLM_MODEL=your_llm_model

CLIENT_URL=http://localhost:5173
```

---

## 5️⃣ Set Up the Database

Make sure you are inside:

```text
Razorpay_GrowthAI/server
```

### Generate the Prisma Client

```bash
npx prisma generate
```

### Create and Apply the Database Migration

```bash
npx prisma migrate dev
```

### Seed the Database

```bash
node prisma/seed.js
```

The seed script creates sample merchant data that allows the application to be demonstrated immediately.

The local database uses:

```text
SQLite
```

with **Prisma** as the ORM.

---

## 6️⃣ Start the Backend

Still inside:

```text
Razorpay_GrowthAI/server
```

run:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

You should see the Express server running in the terminal.

### Verify the Backend

Open the following URL in your browser:

```text
http://localhost:5000/api/health
```

The health endpoint should return a successful response.

If this works, the backend is running correctly.

---

## 7️⃣ Start the Frontend

Open **Terminal 1** again.

Make sure you are inside:

```text
Razorpay_GrowthAI/client
```

Run:

```bash
npm run dev
```

Vite will start the frontend development server.

The application will normally be available at:

```text
http://localhost:5173
```

Open the URL in your browser:

```text
http://localhost:5173
```

---

# ✅ Complete Setup Summary

For someone setting up the project from scratch, the process is:

```text
Clone Repository
       ↓
Install Frontend Dependencies
       ↓
Install Backend Dependencies
       ↓
Create server/.env
       ↓
Configure API Credentials
       ↓
Generate Prisma Client
       ↓
Run Database Migration
       ↓
Seed Demo Data
       ↓
Start Backend
       ↓
Start Frontend
       ↓
Open Application
```

---

# 🚀 Quick Setup Commands

After cloning the repository, use the following commands.

## Terminal 1 — Frontend

```bash
cd Razorpay_GrowthAI/client
npm install
npm run dev
```

## Terminal 2 — Backend

```bash
cd Razorpay_GrowthAI/server
npm install
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

> ⚠️ **Before starting the backend**, make sure `server/.env` has been created and all required API credentials have been configured.

---

## 🧪 Development URLs

| Service              | URL                                |
| -------------------- | ---------------------------------- |
| Frontend             | `http://localhost:5173`            |
| Backend              | `http://localhost:5000`            |
| Backend Health Check | `http://localhost:5000/api/health` |

---

## 🔐 Security Notes

* Never commit the `.env` file.
* Never expose your Razorpay secret key publicly.
* Use **Razorpay Test Mode** credentials during local development.
* Keep your LLM API key private.
* Do not upload API keys or secrets to GitHub.
