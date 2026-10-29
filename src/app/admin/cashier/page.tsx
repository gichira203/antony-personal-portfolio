"use client";

import { adminMessages } from "@/data/adminData";

export default function CashierDashboardPage() {
  const unreadCount = adminMessages.filter((m) => !m.read).length;
  const todaySales = 128500; // in cents — placeholder
  const ordersToday = 34; // placeholder

  return (
    <div>
      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <span className="bi bi-receipt"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">
              KES { (todaySales / 100).toLocaleString() }
            </div>
            <div className="admin-stat-label">Today's Sales</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <span className="bi bi-list-ul"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{ordersToday}</div>
            <div className="admin-stat-label">Orders Today</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <span className="bi bi-people-fill"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">
              {adminMessages.length}
            </div>
            <div className="admin-stat-label">Customer Messages</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <span className="bi bi-clock"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{unreadCount}</div>
            <div className="admin-stat-label">Unread Messages</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-section-header">
        <h2 className="admin-section-title">Quick Actions</h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <a
          href="/admin/cashier/sales"
          className="admin-table-wrapper"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "#fff",
              borderRadius: "10px",
              border: "1px solid rgba(15,41,67,0.08)",
            }}
          >
            <div
              className="admin-stat-icon orange"
              style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
            >
              <span className="bi bi-receipt"></span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                }}
              >
                Record Sale
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                }}
              >
                Log a new transaction
              </div>
            </div>
            <span
              className="bi bi-chevron-right"
              style={{
                marginLeft: "auto",
                color: "var(--accent-color)",
                fontSize: "1.1rem",
              }}
            />
          </div>
        </a>

        <a
          href="/admin/cashier/inventory"
          className="admin-table-wrapper"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "#fff",
              borderRadius: "10px",
              border: "1px solid rgba(15,41,67,0.08)",
            }}
          >
            <div
              className="admin-stat-icon blue"
              style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
            >
              <span className="bi bi-boxes"></span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                }}
              >
                Inventory
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                }}
              >
                View stock levels
              </div>
            </div>
            <span
              className="bi bi-chevron-right"
              style={{
                marginLeft: "auto",
                color: "var(--accent-color)",
                fontSize: "1.1rem",
              }}
            />
          </div>
        </a>

        <a
          href="/admin/cashier/orders"
          className="admin-table-wrapper"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "#fff",
              borderRadius: "10px",
              border: "1px solid rgba(15,41,67,0.08)",
            }}
          >
            <div
              className="admin-stat-icon green"
              style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
            >
              <span className="bi bi-list-ul"></span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                }}
              >
                Orders
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                }}
              >
                {ordersToday} today · pending fulfilment
              </div>
            </div>
            <span
              className="bi bi-chevron-right"
              style={{
                marginLeft: "auto",
                color: "var(--accent-color)",
                fontSize: "1.1rem",
              }}
            />
          </div>
        </a>
      </div>
    </div>
  );
}
