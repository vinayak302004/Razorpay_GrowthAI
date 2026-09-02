import React, { useEffect, useState } from "react";
import axios from "axios";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [health, setHealth] = useState("Checking backend...");
  const [metrics, setMetrics] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");
  useEffect(() => {
    const handleNavigateToAI = () => {
      setActivePage("AI Agent");
    };

    window.addEventListener(
      "navigate-to-ai",
      handleNavigateToAI
    );

    return () => {
      window.removeEventListener(
        "navigate-to-ai",
        handleNavigateToAI
      );
    };
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/health`)
      .then((res) => setHealth(res.data.message))
      .catch(() => setHealth("Backend is not running"));

    axios
      .get(`${API}/dashboard/metrics`)
      .then((res) => setMetrics(res.data))
      .catch((error) => console.error(error));
  }, []);

  const menuItems = [
    "Dashboard",
    "Products",
    "Customers",
    "Campaigns",
    "AI Agent",
    "Payments",
    "Audit Logs",
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>RazorGrowth AI</h1>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={activePage === item ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        {activePage === "Dashboard" && (
          <Dashboard
            health={health}
            metrics={metrics}
          />
        )}
        {activePage === "Products" && (
          <Products API={API} />
        )}
        {activePage === "Customers" && (
          <Customers API={API} />
        )}
        {activePage === "Campaigns" && (
          <Campaigns API={API} />
        )}
        {activePage === "AI Agent" && (
          <AIAgent API={API} />
        )}
        {activePage === "Payments" && (
          <Payments API={API} />
        )}
        {activePage === "Audit Logs" && (
          <AuditLogs API={API} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ health, metrics }) {
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            AI GROWTH & AGENTIC COMMERCE
          </p>

          <h2>Merchant Growth Dashboard</h2>

          <p className="muted">{health}</p>
        </div>
      </header>

      <section className="metrics">
        <Metric
          title="Revenue"
          value={
            metrics
              ? `₹${metrics.revenue.toLocaleString("en-IN")}`
              : "—"
          }
        />

        <Metric
          title="Orders"
          value={metrics?.orders ?? "—"}
        />

        <Metric
          title="Customers"
          value={metrics?.customers ?? "—"}
        />

        <Metric
          title="AI Opportunities"
          value={metrics?.opportunities ?? "—"}
        />
      </section>

      <section className="grid">
        <div className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AI INSIGHTS</p>
              <h3>Growth Opportunities</h3>
              <p>
                AI-powered recommendations based on your
                merchant data.
              </p>
            </div>
          </div>

          <div className="opportunity">
            <strong>Accessory upsell</strong>

            <span>
              Customers buying laptops are likely to purchase
              bags and mice.
            </span>

            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("navigate-to-ai")
                );
              }}
            >
              Review Opportunity →
            </button>
          </div>

          <div className="opportunity">
            <strong>Customer reactivation</strong>

            <span>
              Identify high-value customers who may be ready
              for re-engagement.
            </span>

            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("navigate-to-ai")
                );
              }}
            >
              Analyze Opportunity →
            </button>
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">SYSTEM STATUS</p>

          <h3>RazorGrowth AI is ready</h3>

          <p>
            Merchant data, revenue analytics, AI opportunity
            detection, campaigns, payments and audit logs are
            connected.
          </p>

          <div className="opportunity">
            <strong>AI → Approval → Campaign → Audit</strong>

            <span>
              AI recommendations remain controlled by human
              approval before campaign actions are executed.
            </span>
          </div>

          <div className="opportunity">
            <strong>Razorpay Test Mode</strong>

            <span>
              Payments are processed safely in sandbox mode
              with backend verification and audit logging.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

function Products({ API }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => setProducts(res.data))
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API]);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">MERCHANT CATALOG</p>
          <h2>Products</h2>
          <p className="muted">
            Products available in the merchant catalog.
          </p>
        </div>
      </header>

      <div className="card">
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{product.category}</td>

                    <td>
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>

                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Customers({ API }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/customers`)
      .then((res) => setCustomers(res.data))
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API]);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">CUSTOMER INTELLIGENCE</p>
          <h2>Customers</h2>
          <p className="muted">
            Customer information and spending behaviour.
          </p>
        </div>
      </header>

      <div className="card">
        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Spent</th>
                  <th>Last Purchase</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td>{customer.email}</td>

                    <td>
                      ₹
                      {customer.totalSpent.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      {customer.lastPurchase
                        ? new Date(
                            customer.lastPurchase
                          ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function AIAgent({ API }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm RazorGrowth AI. I can analyze your revenue, products, customers, upsell and cross-sell opportunities.",
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/ai/opportunities`
      );

      setData(response.data);
    } catch (error) {
      console.error(
        "Failed to load AI opportunities:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(message = chatInput) {
    const text = message.trim();

    if (!text || chatLoading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: text,
      },
    ]);

    setChatInput("");
    setChatLoading(true);

    try {
      const response = await axios.post(
        `${API}/ai/chat`,
        {
          message: text,
        }
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            response.data.message ||
            "I couldn't generate a response.",
          toolCalls: response.data.toolCalls || [],
        },
      ]);
    } catch (error) {
      console.error("AI chat failed:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "AI service is temporarily unavailable. Please try again later.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

function handleChatKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

  if (loading) {
    return (
      <>
        <header>
          <div>
            <p className="eyebrow">
              AI GROWTH & AGENTIC COMMERCE
            </p>

            <h2>AI Growth Agent</h2>

            <p className="muted">
              Analyzing your merchant data to discover growth
              opportunities...
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadOpportunities}
            disabled={loading}
          >
            Run Analysis
          </button>
        </header>

        <div className="card">
          <p>Running growth analysis...</p>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <header>
          <div>
            <p className="eyebrow">
              AI GROWTH & AGENTIC COMMERCE
            </p>

            <h2>AI Growth Agent</h2>

            <p className="muted">
              Unable to load growth opportunities.
            </p>
          </div>
        </header>

        <div className="card">
          <button onClick={loadOpportunities}>
            Retry Analysis
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            AI GROWTH & AGENTIC COMMERCE
          </p>
          <h2>AI Growth Agent</h2>
          <p className="muted">
            The agent analyzes products, customers and orders
            to discover actionable revenue opportunities.
          </p>
        </div>
        <button
          className="refresh-button"
          onClick={loadOpportunities}
        >
          Run Analysis
        </button>
      </header>

      <section className="metrics ai-summary-metrics">
        <Metric
          title="Growth Opportunities"
          value={data.summary.opportunitiesFound}
        />
        <Metric
          title="Products Analyzed"
          value={data.summary.productsAnalyzed}
        />
        <Metric
          title="Customers Analyzed"
          value={data.summary.customersAnalyzed}
        />
        <Metric
          title="Paid Orders Analyzed"
          value={data.summary.ordersAnalyzed}
        />
      </section>

      <section className="ai-opportunities">
        <div className="section-heading">
          <div>
            <h3>Detected Opportunities</h3>
            <p>
              The agent found{" "}
              <strong>
                {data.summary.opportunitiesFound}
              </strong>{" "}
              opportunities from the available merchant data.
            </p>
          </div>
        </div>

        {data.opportunities.map((opportunity, index) => (
          <OpportunityCard
            key={`${opportunity.type}-${index}`}
            opportunity={opportunity}
            onReview={() =>
              setSelectedOpportunity(opportunity)
            }
          />
        ))}
      </section>

      {selectedOpportunity && (
        <OpportunityModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          API={API}
        />
      )}

      <section className="card ai-chat">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AI ASSISTANT</p>
            <h3>Ask RazorGrowth AI</h3>
            <p>
              Ask questions about your merchant data,
              revenue, products, customers and growth.
            </p>
          </div>
        </div>

        <div className="ai-chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role}`}
            >
              <div className="chat-label">
                {message.role === "user"
                  ? "You"
                  : "RazorGrowth AI"}
              </div>
              <div className="chat-bubble">
                {message.content}
              </div>
              {message.toolCalls &&
                message.toolCalls.length > 0 && (
                  <div className="tool-used">
                    🔧 Data tools used:{" "}
                    {message.toolCalls
                      .map((tool) => tool.tool)
                      .join(", ")}
                  </div>
                )}
            </div>
          ))}

          {chatLoading && (
            <div className="chat-message assistant">
              <div className="chat-label">
                RazorGrowth AI
              </div>

              <div className="chat-bubble">
                Analyzing your merchant data...
              </div>
            </div>
          )}
        </div>

        <div className="chat-suggestions">
          <button
            onClick={() =>
              sendMessage(
                "Which products should I upsell?"
              )
            }
          >
            Which products should I upsell?
          </button>

          <button
            onClick={() =>
              sendMessage(
                "How much revenue have I generated and what is my average order value?"
              )
            }
          >
            Analyze my revenue
          </button>

          <button
            onClick={() =>
              sendMessage(
                "What products are commonly bought together?"
              )
            }
          >
            Find cross-sell opportunities
          </button>

          <button
            onClick={() =>
              sendMessage(
                "Show me my products and their current stock."
              )
            }
          >
            Check product stock
          </button>
        </div>

        <div className="chat-input-row">
          <textarea
            value={chatInput}
            onChange={(event) =>
              setChatInput(event.target.value)
            }
            onKeyDown={handleChatKeyDown}
            placeholder="Ask RazorGrowth AI..."
            rows={2}
            disabled={chatLoading}
          />

          <button
            onClick={() => sendMessage()}
            disabled={
              chatLoading || !chatInput.trim()
            }
          >
            {chatLoading ? "..." : "Send"}
          </button>
        </div>
      </section>
    </>
  );
}

function OpportunityCard({
  opportunity,
  onReview,
}) {
  const priorityClass =
    opportunity.priority?.toLowerCase() || "medium";

  return (
    <div className="opportunity-card">
      <div className="opportunity-top">
        <span
          className={`priority-badge ${priorityClass}`}
        >
          {opportunity.priority}
        </span>

        <span className="opportunity-type">
          {opportunity.type}
        </span>
      </div>

      <h3>{opportunity.title}</h3>

      <p className="opportunity-explanation">
        {opportunity.explanation}
      </p>

      <div className="opportunity-stats">
        <div>
          <span>Estimated customers</span>

          <strong>
            {opportunity.estimatedCustomers}
          </strong>
        </div>

        <div>
          <span>Potential revenue</span>

          <strong>
            ₹
            {opportunity.estimatedRevenue.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>
      </div>

      <div className="recommendation">
        <span>AI Recommendation</span>

        <p>{opportunity.recommendation}</p>
      </div>

      <div className="opportunity-footer">
        {opportunity.action.requiresApproval ? (
          <span className="approval-required">
            ⚠ Approval required
          </span>
        ) : (
          <span className="approval-not-required">
            ✓ No approval required
          </span>
        )}

        <button onClick={onReview}>
          Review Opportunity
        </button>
      </div>
    </div>
  );
}

function OpportunityModal({
  opportunity,
  onClose,
  API,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span
              className={`priority-badge ${
                opportunity.priority?.toLowerCase()
              }`}
            >
              {opportunity.priority}
            </span>

            <h2>{opportunity.title}</h2>
          </div>

          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <h4>Why did the AI recommend this?</h4>

          <p>
            {opportunity.explanation}
          </p>

          <h4>Recommended action</h4>

          <p>
            {opportunity.recommendation}
          </p>

          <div className="modal-stats">
            <div>
              <span>Estimated customers</span>

              <strong>
                {opportunity.estimatedCustomers}
              </strong>
            </div>

            <div>
              <span>Estimated revenue</span>

              <strong>
                ₹
                {opportunity.estimatedRevenue.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>

          {opportunity.products &&
            opportunity.products.length > 0 && (
              <div className="detail-section">
                <h4>Recommended Products</h4>

                {opportunity.products.map((product) => (
                  <div
                    className="detail-row"
                    key={product.id}
                  >
                    <span>{product.name}</span>

                    <strong>
                      ₹
                      {product.price?.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            )}

          {opportunity.customers &&
            opportunity.customers.length > 0 && (
              <div className="detail-section">
                <h4>Target Customers</h4>

                {opportunity.customers.map((customer) => (
                  <div
                    className="detail-row"
                    key={customer.id}
                  >
                    <span>
                      {customer.name}
                      <small>
                        {customer.email}
                      </small>
                    </span>

                    <strong>
                      ₹
                      {customer.totalSpent?.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            )}

          {opportunity.type === "INVENTORY" &&
            opportunity.products?.length > 0 && (
              <div className="detail-section">
                <h4>Inventory Alert</h4>

                {opportunity.products.map((product) => (
                  <div
                    className="detail-row"
                    key={product.id}
                  >
                    <span>{product.name}</span>

                    <strong>
                      {product.stock} units remaining
                    </strong>
                  </div>
                ))}
              </div>
            )}

          {opportunity.action.requiresApproval && (
            <div className="approval-box">
              <strong>
                Human approval required
              </strong>
              <p>
                The AI will not execute this action
                automatically. A merchant must approve it
                before any campaign or money-related action
                can be performed.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          {opportunity.action.requiresApproval && (
            <>
              <button
                className="reject-button"
                onClick={async () => {
                  const reason = window.prompt(
                    "Why are you rejecting this opportunity?",
                    "Not suitable at this time"
                  );
                  if (reason === null) {
                    return;
                  }
                  try {
                    const response = await axios.post(
                      `${API}/ai/opportunities/reject`,
                      {
                        opportunity,
                        reason,
                      }
                    );
                    alert(response.data.message);

                    onClose();
                  } catch (error) {
                    console.error(error);
                    alert(
                      error.response?.data?.error ||
                        "Failed to reject opportunity"
                    );
                  }
                }}
              >
                Reject
              </button>

              <button
                className="approve-button"
                onClick={async () => {
                  const confirmed = window.confirm(
                    `Approve "${opportunity.title}"?\n\nThis will create a campaign and record the action in the audit log.`
                  );
                  if (!confirmed) {
                    return;
                  }
                  try {
                    const response = await axios.post(
                      `${API}/ai/opportunities/approve`,
                      {
                        opportunity,
                      }
                    );
                    alert(response.data.message);
                    onClose();
                  } catch (error) {
                    console.error(error);
                    alert(
                      error.response?.data?.error ||
                        "Failed to approve opportunity"
                    );
                  }
                }}
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Campaigns({ API }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);

      const response = await axios.get(`${API}/campaigns`);

      setCampaigns(response.data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <header>
          <div>
            <p className="eyebrow">
              AI GROWTH & AGENTIC COMMERCE
            </p>
            <h2>Campaigns</h2>
            <p className="muted">
              Loading your campaigns...
            </p>
          </div>
          <button
            className="refresh-button"
            onClick={loadCampaigns}
            disabled={loading}
          >
            Refresh
          </button>
        </header>

        <div className="card">
          <p>Loading campaigns...</p>
        </div>
      </>
    );
  }

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "ACTIVE"
  );

  const draftCampaigns = campaigns.filter(
    (campaign) => campaign.status === "DRAFT"
  );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            AI GROWTH & AGENTIC COMMERCE
          </p>
          <h2>Campaigns</h2>
          <p className="muted">
            Manage AI-generated and merchant-created campaigns.
          </p>
        </div>
        <button
          className="refresh-button"
          onClick={loadCampaigns}
        >
          Refresh
        </button>
      </header>

      <section className="metrics">
        <Metric
          title="Total Campaigns"
          value={campaigns.length}
        />
        <Metric
          title="Active"
          value={activeCampaigns.length}
        />
        <Metric
          title="Draft"
          value={draftCampaigns.length}
        />
        <Metric
          title="AI Generated"
          value={campaigns.filter((campaign) =>
            campaign.name.toLowerCase().includes("upsell")
          ).length}
        />
      </section>

      <CampaignSection
        title="Active Campaigns"
        campaigns={activeCampaigns}
        onSelect={setSelectedCampaign}
      />
      <CampaignSection
        title="Draft Campaigns"
        campaigns={draftCampaigns}
        onSelect={setSelectedCampaign}
      />
      {campaigns.length === 0 && (
        <div className="card empty-state">
          <h3>No campaigns yet</h3>

          <p>
            AI-generated campaigns will appear here after an
            opportunity is approved.
          </p>
        </div>
      )}
      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onUpdated={loadCampaigns}
          API={API}
        />
      )}
    </>
  );
}

function CampaignSection({
  title,
  campaigns,
  onSelect,
}) {
  if (campaigns.length === 0) {
    return null;
  }
  return (
    <section className="campaign-section">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          <p>
            {campaigns.length} campaign
            {campaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="campaign-grid">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onSelect={() => onSelect(campaign)}
          />
        ))}
      </div>
    </section>
  );
}

function CampaignCard({
  campaign,
  onSelect,
}) {
  const isActive = campaign.status === "ACTIVE";

  return (
    <div className="campaign-card">
      <div className="campaign-card-top">
        <span
          className={`campaign-status ${
            isActive ? "active" : "draft"
          }`}
        >
          {campaign.status}
        </span>
        <span className="campaign-date">
          {new Date(campaign.createdAt).toLocaleDateString("en-IN")}
        </span>
      </div>
      <h3>{campaign.name}</h3>
      <div className="campaign-detail">
        <span>Target</span>
        <p>{campaign.target}</p>
      </div>
      <div className="campaign-detail">
        <span>Offer</span>
        <p>{campaign.offer}</p>
      </div>
      <div className="campaign-card-footer">
        {isActive ? (
          <span className="active-label">
            ● Campaign active
          </span>
        ) : (
          <span className="draft-label">
            ● Awaiting launch
          </span>
        )}
        <button onClick={onSelect}>
          View Campaign
        </button>
      </div>
    </div>
  );
}

function CampaignModal({
  campaign,
  onClose,
  onUpdated,
  API,
}) {
  const [launching, setLaunching] = useState(false);
  const isActive = campaign.status === "ACTIVE";
  async function launchCampaign() {
    const confirmed = window.confirm(
      `Launch "${campaign.name}"?\n\nThis will activate the campaign and record the action in the audit log.`
    );
    if (!confirmed) {
      return;
    }
    try {
      setLaunching(true);
      const response = await axios.post(
        `${API}/campaigns/${campaign.id}/launch`
      );
      alert(response.data.message);
      onClose();
      await onUpdated();
    } catch (error) {
      console.error("Campaign launch failed:", error);
      alert(
        error.response?.data?.error ||
          "Failed to launch campaign"
      );
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span
              className={`campaign-status ${
                isActive ? "active" : "draft"
              }`}
            >
              {campaign.status}
            </span>

            <h2>{campaign.name}</h2>
          </div>
          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h4>Target Audience</h4>
            <p>{campaign.target}</p>
          </div>
          <div className="detail-section">
            <h4>Offer</h4>
            <p>{campaign.offer}</p>
          </div>
          <div className="detail-section">
            <h4>Campaign Status</h4>
            <p>
              {isActive
                ? "This campaign is currently active."
                : "This campaign is prepared but has not been launched yet."}
            </p>
          </div>

          {!isActive && (
            <div className="approval-box">
              <strong>
                Human approval required
              </strong>
              <p>
                The campaign will not become active
                automatically. Confirm the launch to activate it.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          {!isActive && (
            <button
              className="approve-button"
              onClick={launchCampaign}
              disabled={launching}
            >
              {launching
                ? "Launching..."
                : "Launch Campaign"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Payments({ API }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => {
        setProducts(res.data);

        if (res.data.length > 0) {
          setSelectedProduct(res.data[0].id);
        }
      })
      .catch((error) => {
        console.error(error);
        setMessage("Failed to load products");
      });
  }, [API]);

  useEffect(() => {
    axios
      .get(`${API}/customers`)
      .then((res) => {
        setCustomers(res.data);

        if (res.data.length > 0) {
          setSelectedCustomer(res.data[0].id);
        }
      })
      .catch((error) => {
        console.error(error);
        setMessage("Failed to load customers");
      });
  }, [API]);

  async function loadRazorpay() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function createPayment() {
    if (!selectedProduct) {
      setMessage("Please select a product");
      return;
    }
    if (!selectedCustomer) {
      setMessage("Please select a customer");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const loaded = await loadRazorpay();
      if (!loaded) {
        setMessage(
          "Razorpay Checkout failed to load"
        );
        return;
      }
      const response = await axios.post(
        `${API}/payments/create-order`,
        {
          productId: selectedProduct,
          customerId: selectedCustomer,
          quantity: 1,
        }
      );
      const data = response.data;
      const product = products.find(
        (p) => p.id === selectedProduct
      );
      if (!product) {
        setMessage("Selected product not found");
        return;
      }
      const options = {
        key: data.razorpay.key,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "RazorGrowth AI",
        description: product.name,
        order_id: data.razorpay.orderId,
        handler: async function (paymentResponse) {
          try {
            setMessage(
              "Payment completed. Verifying..."
            );
            const verifyResponse = await axios.post(
              `${API}/payments/verify`,
              {
                orderId: data.order.id,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );
            if (verifyResponse.data.success) {
              setMessage(
                "Payment successful and verified!"
              );
            }
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error
            );
            setMessage(
              error.response?.data?.error ||
                "Payment verification failed"
            );
          }
        },
        prefill: {
          name: "Demo Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const razorpayCheckout =
        new window.Razorpay(options);
      razorpayCheckout.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );
          setMessage(
            `Payment failed: ${
              response.error.description ||
              "Unknown error"
            }`
          );
        }
      );
      razorpayCheckout.open();
    } catch (error) {
      console.error(
        "Payment creation error:",
        error
      );
      setMessage(
        error.response?.data?.error ||
          "Failed to create payment"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            RAZORPAY TEST MODE
          </p>
          <h2>Payments</h2>
          <p className="muted">
            Convert AI recommendations into
            Razorpay Test Mode payments.
          </p>
        </div>
      </header>

      <section className="metrics">
        <Metric
          title="Gateway"
          value="Razorpay Test Mode"
        />
        <Metric
          title="Currency"
          value="INR"
        />
        <Metric
          title="Orders"
          value="Connected"
        />
        <Metric
          title="Status"
          value="Sandbox"
        />
      </section>
      <div className="card payment-card">
        <h3>Create Test Payment</h3>
        <p>
          Select a merchant product to open
          Razorpay Test Mode Checkout.
        </p>
        <select
          value={selectedProduct}
          onChange={(e) =>
            setSelectedProduct(e.target.value)
          }
        >
          <option value="">
            Select a product
          </option>
          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name} — ₹
              {product.price.toLocaleString("en-IN")}
            </option>
          ))}
        </select>

        <select
          value={selectedCustomer}
          onChange={(e) =>
            setSelectedCustomer(e.target.value)
          }
        >
          <option value="">
            Select a customer
          </option>

          {customers.map((customer) => (
            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name} — {customer.email}
            </option>
          ))}
        </select>

        {selectedProduct && (
          <div className="payment-preview">
            {(() => {
              const product = products.find(
                (p) => p.id === selectedProduct
              );
              if (!product) {
                return null;
              }
              return (
                <>
                  <p>
                    <strong>
                      {product.name}
                    </strong>
                  </p>
                  <p>
                    {product.description}
                  </p>
                  <p>
                    Amount:{" "}
                    <strong>
                      ₹
                      {product.price.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </p>
                  <p>
                    Stock:{" "}
                    <strong>
                      {product.stock}
                    </strong>
                  </p>
                </>
              );
            })()}
          </div>
        )}
        <button
          onClick={createPayment}
          disabled={loading || !selectedProduct}
        >
          {loading
            ? "Creating Order..."
            : "Pay with Razorpay Test Mode"}
        </button>
        {message && (
          <p className="payment-message">
            {message}
          </p>
        )}
      </div>
    </>
  );
}

function AuditLogs({ API }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, [API]);

  async function loadAuditLogs() {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API}/audit-logs`);
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      setError(
        error.response?.data?.error ||
          "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  }
  function formatAction(action) {
    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }
  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  function getStatusClass(status) {
    const value = status?.toLowerCase();
    if (
      value === "success" ||
      value === "approved"
    ) {
      return "success";
    }
    if (value === "rejected") {
      return "rejected";
    }
    return "default";
  }
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            GOVERNANCE & TRANSPARENCY
          </p>
          <h2>Audit Logs</h2>
          <p className="muted">
            Complete record of AI actions, merchant
            approvals, payments and campaign changes.
          </p>
        </div>
        <button
          className="refresh-button"
          onClick={loadAuditLogs}
          disabled={loading}
        >
          Refresh
        </button>
      </header>
      <section className="metrics">
        <Metric
          title="Total Events"
          value={logs.length}
        />
        <Metric
          title="Successful"
          value={
            logs.filter(
              (log) =>
                log.status === "SUCCESS" ||
                log.status === "APPROVED"
            ).length
          }
        />
        <Metric
          title="Rejected"
          value={
            logs.filter(
              (log) => log.status === "REJECTED"
            ).length
          }
        />
        <Metric
          title="Payment Events"
          value={
            logs.filter(
              (log) =>
                log.action === "PAYMENT_VERIFIED"
            ).length
          }
        />
      </section>
      <div className="card">
        {loading ? (
          <p>Loading audit logs...</p>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load audit logs</h3>
            <p>{error}</p>
            <button onClick={loadAuditLogs}>
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h3>No audit events yet</h3>
            <p>
              AI actions, approvals, payments and
              campaign changes will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <strong>
                        {formatAction(log.action)}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`audit-status ${getStatusClass(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <AuditDetails log={log} />
                    </td>
                    <td>
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function AuditDetails({ log }) {
  let input = null;
  let output = null;
  try {
    input = log.input
      ? JSON.parse(log.input)
      : null;
  } catch {
    input = log.input;
  }
  try {
    output = log.output
      ? JSON.parse(log.output)
      : null;
  } catch {
    output = log.output;
  }
  if (log.action === "PAYMENT_VERIFIED") {
    return (
      <div className="audit-details">
        <div>
          <span>Order</span>
          <strong>
            {input?.orderId || "—"}
          </strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>
            {input?.razorpay_payment_id || "—"}
          </strong>
        </div>
        <div>
          <span>Amount</span>
          <strong>
            ₹
            {output?.amount?.toLocaleString(
              "en-IN"
            ) || "—"}
          </strong>
        </div>
      </div>
    );
  }
  if (
    log.action === "APPROVE_OPPORTUNITY"
  ) {
    return (
      <div className="audit-details">
        <div>
          <span>Input</span>
          <strong>
            {typeof input === "string"
              ? input
              : input?.title ||
                input?.type ||
                "Opportunity approved"}
          </strong>
        </div>
        {output?.campaignName && (
          <div>
            <span>Campaign</span>
            <strong>
              {output.campaignName}
            </strong>
          </div>
        )}
      </div>
    );
  }
  if (
    log.action === "REJECT_OPPORTUNITY"
  ) {
    return (
      <div className="audit-details">
        <div>
          <span>Opportunity</span>
          <strong>
            {input || "—"}
          </strong>
        </div>
        {output?.reason && (
          <div>
            <span>Reason</span>
            <strong>
              {output.reason}
            </strong>
          </div>
        )}
      </div>
    );
  }
  if (
    log.action === "CAMPAIGN_LAUNCHED"
  ) {
    return (
      <div className="audit-details">
        <div>
          <span>Campaign</span>
          <strong>
            {input?.campaignName || "—"}
          </strong>
        </div>
        <div>
          <span>New Status</span>
          <strong>
            {output?.status || "—"}
          </strong>
        </div>
      </div>
    );
  }
  return (
    <span className="audit-text">
      {typeof input === "string"
        ? input
        : "System event recorded"}
    </span>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            RAZORGROWTH AI
          </p>
          <h2>{title}</h2>
          <p className="muted">
            {description}
          </p>
        </div>
      </header>
      <div className="card coming-soon">
        <h3>Coming Next</h3>
        <p>
          This section is part of the RazorGrowth AI
          implementation and will be connected to the backend
          in the next development step.
        </p>
      </div>
    </>
  );
}

function Metric({ title, value }) {
  return (
    <div className="metric card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
export default App;