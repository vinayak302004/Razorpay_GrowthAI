# Architecture

```text
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │ Merchant + Customer │
                 └──────────┬──────────┘
                            │ REST
                            ▼
                 ┌─────────────────────┐
                 │   Express Backend   │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       ┌───────────┐  ┌────────────┐  ┌──────────────┐
       │ AI Agent  │  │  Prisma DB │  │  Razorpay    │
       │ + Tools   │  │  SQLite    │  │  Test Mode   │
       └─────┬─────┘  └────────────┘  └──────────────┘
             │
             ▼
      Search Products
      Customer History
      Revenue Analytics
      Recommendations
      Campaigns
      Payment Proposal
             │
             ▼
       Approval / Risk Gate
             │
             ▼
          Audit Log
```

Financial actions should be proposed by the agent and validated/gated before execution.
