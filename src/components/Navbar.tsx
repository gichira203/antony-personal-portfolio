"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navItems, socialLinks } from "@/data/siteContent";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header id="header" className="header">
      <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        <Link href="#home" className="logo d-flex align-items-center me-auto me-xl-0" onClick={() => setMobileOpen(false)}>
          <div className="brand-logo-wrap" aria-label="antoh logo">
            <Image src="/images/logo.jpg" alt="antoh logo" width={44} height={44} className="brand-logo" priority />
          </div>
          <h1 className="sitename brand-name">antoh</h1>
        </Link>

        <nav id="navmenu" className={`navmenu ${mobileOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={item.href === "#home" ? "active" : ""}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className="mobile-nav-toggle" aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
            <span className={`bi bi-${mobileOpen ? "x" : "list"}`} aria-hidden="true" />
          </button>
        </nav>

        <div className="header-social-links">
          {socialLinks.slice(0, 4).map((link) => (
            <a key={link.label} href={link.href} aria-label={link.label} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
              <span className={`bi bi-${link.icon}`} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
