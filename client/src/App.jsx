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

/* =========================
   DASHBOARD
========================= */

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
          <h3>AI Growth Opportunities</h3>

          <div className="opportunity">
            <strong>Accessory upsell</strong>

            <span>
              Customers buying laptops are likely to purchase
              bags and mice.
            </span>

            <button>Review Opportunity</button>
          </div>

          <div className="opportunity">
            <strong>Customer reactivation</strong>

            <span>
              Identify customers inactive for more than 90 days.
            </span>

            <button>Analyze</button>
          </div>
        </div>

        <div className="card">
          <h3>Project Status</h3>

          <p>
            Database, merchant data, products, customers,
            orders and revenue metrics are connected.
          </p>

          <p>
            Next we are building the AI growth agent,
            approval gates, campaigns, payments and audit logs.
          </p>
        </div>
      </section>
    </>
  );
}

/* =========================
   PRODUCTS
========================= */

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

/* =========================
   CUSTOMERS
========================= */

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


/* =========================
   AI GROWTH AGENT
========================= */

function AIAgent({ API }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState(null);

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
              Analyzing merchant data...
            </p>
          </div>
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
          ↻ Run Analysis
        </button>
      </header>

      {/* Agent summary */}

      <section className="metrics">
        <Metric
          title="Opportunities"
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
          title="Orders Analyzed"
          value={data.summary.ordersAnalyzed}
        />
      </section>

      {/* Opportunities */}

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

      {/* Review modal */}

      {selectedOpportunity && (
        <OpportunityModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          API={API}
        />
      )}
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

          {/* Products */}

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

          {/* Customers */}

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

          {/* Inventory */}

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
                ⚠ Human approval required
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

/* =========================
   CAMPAIGNS
========================= */

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
              Loading campaigns...
            </p>
          </div>
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
          ↻ Refresh
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
                ⚠ Human approval required
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


/* =========================
   PAYMENTS
========================= */

/* =========================
   PAYMENTS
========================= */

function Payments({ API }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
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

      /* Create order in backend */
      const response = await axios.post(
        `${API}/payments/create-order`,
        {
          productId: selectedProduct,
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

      /* Razorpay Checkout */
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

            /* Verify payment on backend */
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
                "✅ Payment successful and verified!"
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
            `❌ Payment failed: ${
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

/*********************************
   AUDIT LOGS
**********************************/

function AuditLogs({ API }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLogs();
  }, [API]);

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/audit-logs`
      );

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
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function parseJSON(value) {
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            RAZORGROWTH AI
          </p>

          <h2>Audit Logs</h2>

          <p className="muted">
            Every AI action, approval, payment and
            campaign change is recorded here.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadLogs}
        >
          ↻ Refresh
        </button>
      </header>

      <section className="metrics">
        <Metric
          title="Total Events"
          value={logs.length}
        />

        <Metric
          title="Payments"
          value={
            logs.filter(
              (log) =>
                log.action === "PAYMENT_VERIFIED"
            ).length
          }
        />

        <Metric
          title="AI Approvals"
          value={
            logs.filter(
              (log) =>
                log.action ===
                "APPROVE_OPPORTUNITY"
            ).length
          }
        />

        <Metric
          title="Campaign Launches"
          value={
            logs.filter(
              (log) =>
                log.action ===
                "CAMPAIGN_LAUNCHED"
            ).length
          }
        />
      </section>

      {loading ? (
        <div className="card">
          <p>Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p>{error}</p>

          <button onClick={loadLogs}>
            Retry
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="card empty-state">
          <h3>No audit events yet</h3>

          <p>
            AI actions, approvals, payments and
            campaign changes will appear here.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => {
                  const input = parseJSON(log.input);
                  const output = parseJSON(log.output);

                  return (
                    <tr key={log.id}>
                      <td>
                        {formatDate(log.createdAt)}
                      </td>

                      <td>
                        <strong>
                          {formatAction(log.action)}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {log.status}
                        </strong>
                      </td>

                      <td>
                        {log.action ===
                          "PAYMENT_VERIFIED" && (
                          <span>
                            Payment verified
                            {input?.razorpay_payment_id
                              ? ` • ${input.razorpay_payment_id}`
                              : ""}
                          </span>
                        )}

                        {log.action ===
                          "APPROVE_OPPORTUNITY" && (
                          <span>
                            {output?.campaignName
                              ? `Campaign created: ${output.campaignName}`
                              : "AI opportunity approved"}
                          </span>
                        )}

                        {log.action ===
                          "REJECT_OPPORTUNITY" && (
                          <span>
                            {output?.reason ||
                              "AI opportunity rejected"}
                          </span>
                        )}

                        {log.action ===
                          "CAMPAIGN_LAUNCHED" && (
                          <span>
                            {input?.campaignName ||
                              "Campaign launched"}
                          </span>
                        )}

                        {![
                          "PAYMENT_VERIFIED",
                          "APPROVE_OPPORTUNITY",
                          "REJECT_OPPORTUNITY",
                          "CAMPAIGN_LAUNCHED",
                        ].includes(log.action) && (
                          <span>
                            Event recorded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}


/* =========================
   PLACEHOLDER PAGES
========================= */

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

/* =========================
   METRIC CARD
========================= */

function Metric({ title, value }) {
  return (
    <div className="metric card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;