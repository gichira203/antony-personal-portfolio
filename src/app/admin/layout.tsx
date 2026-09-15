"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { type AuthUser, isAuthenticated, clearAuth, logout } from "@/data/adminData";
import "./admin.css";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "bi-speedometer2" },
  { label: "Projects", href: "/admin/projects", icon: "bi-folder2-open" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "bi-chat-dots" },
  { label: "Messages", href: "/admin/messages", icon: "bi-inbox" },
];

const pageLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/projects": "Manage Projects",
  "/admin/testimonials": "Manage Testimonials",
  "/admin/messages": "Messages",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // --- Auth guard ---
  useEffect(() => {
    const auth = isAuthenticated();
    if (!auth) {
      router.push("/admin/login");
    }
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const auth = isAuthenticated();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
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
            href="/admin"
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
            {auth && (
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
                placeholder="Search projects, messages…"
              />
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-user">
              <div className="admin-user-avatar">
                <Image
                  src="/images/profile-square-2.png"
                  alt="Antony"
                  width={36}
                  height={36}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
              {auth && (
                <div className="admin-user-info">
                  <span className="admin-user-name">{auth.displayName}</span>
                  <span className="admin-user-role">Admin</span>
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
