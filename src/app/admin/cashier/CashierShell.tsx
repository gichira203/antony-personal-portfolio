"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { AuthUser } from "@/data/adminData";
import "../admin.css";

const navItems = [
  { label: "Dashboard", href: "/admin/cashier", icon: "bi-speedometer2" },
  { label: "Sales", href: "/admin/cashier/sales", icon: "bi-receipt" },
  { label: "Inventory", href: "/admin/cashier/inventory", icon: "bi-boxes" },
  { label: "Orders", href: "/admin/cashier/orders", icon: "bi-list-ul" },
];

const pageLabels: Record<string, string> = {
  "/admin/cashier": "Dashboard",
  "/admin/cashier/sales": "Daily Sales",
  "/admin/cashier/inventory": "Inventory",
  "/admin/cashier/orders": "Orders",
};

export default function CashierShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-wrapper">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}
      >
        <div className="admin-sidebar-header">
          <Link
            href="/admin/cashier"
            className="admin-logo-wrap"
            onClick={() => setSidebarOpen(false)}
          >
            <Image
              src="/images/logo.png"
              alt="antoh logo"
              width={40}
              height={40}
              className="admin-logo"
            />
            <span className="admin-logo-text">antoh</span>
          </Link>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="bi bi-x" />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${
                  active ? "admin-nav-item-active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
                title={item.label}
              >
                <span className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.4rem 0.9rem",
              flex: 1,
            }}
          >
            <Link
              href="/"
              className="admin-back-link"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="bi bi-arrow-left" />
              <span>Back to Site</span>
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="admin-logout-btn"
                title="Sign out"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.6)",
                  borderRadius: "6px",
                  padding: "0.3rem 0.5rem",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  transition: "all 0.2s",
                }}
              >
                <span className="bi bi-box-arrow-right" /> Sign out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="admin-main">
        {/* Top header */}
        <header className="admin-header">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="bi bi-list" />
          </button>
          <div
            className="admin-header-left"
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <h1 className="admin-page-title">
              {pageLabels[pathname] || "Dashboard"}
            </h1>
            <div className="admin-search">
              <span className="bi bi-search admin-search-icon" />
              <input
                className="admin-search-input"
                type="text"
                placeholder="Search products, orders..."
              />
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-user">
              <div className="admin-user-avatar">
                <Image
                  src="/images/profile-square-2.png"
                  alt="Cashier"
                  width={36}
                  height={36}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
              {user && (
                <div className="admin-user-info">
                  <span className="admin-user-name">{user.displayName}</span>
                  <span className="admin-user-role">Cashier</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
