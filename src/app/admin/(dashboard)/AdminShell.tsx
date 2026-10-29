"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { AuthUser } from "@/data/adminData";
import "../admin.css";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "bi-speedometer2" },
  { label: "Projects", href: "/admin/projects", icon: "bi-folder2-open" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "bi-chat-dots" },
  { label: "Site Content", href: "/admin/content", icon: "bi-layout-text-window" },
  { label: "Messages", href: "/admin/messages", icon: "bi-inbox" },
  { label: "Settings", href: "/admin/settings", icon: "bi-gear" },
];

const pageLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/projects": "Manage Projects",
  "/admin/testimonials": "Manage Testimonials",
  "/admin/content": "Edit Site Content",
  "/admin/messages": "Messages",
  "/admin/settings": "Account Settings",
};

export default function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-count", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled) setUnread(Number(data.count) || 0);
      } catch {
        /* keep the previous badge count */
      }
    };

    void loadUnread();
    const interval = window.setInterval(loadUnread, 15000);
    const onFocus = () => void loadUnread();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* the cookie is cleared server-side; continue to the login page */
    }
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-wrapper">
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

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
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
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
                {item.href === "/admin/messages" && unread > 0 && (
                  <span className="admin-nav-badge">{unread}</span>
                )}
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
          </div>
        </div>
      </aside>

      <div className="admin-main">
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
          </div>
          <div className="admin-header-right">
            <div className="admin-user">
              <div className="admin-user-avatar">
                <Image
                  src="/images/profile-square-2.png"
                  alt={user.displayName}
                  width={36}
                  height={36}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user.displayName}</span>
                <span className="admin-user-role">
                  {user.role === "cashier" ? "Cashier" : "Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
