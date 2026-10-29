"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  AdminMessage,
  AdminProject,
  AdminTestimonial,
} from "@/data/adminData";

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void Promise.all([
      getJson<AdminProject[]>("/api/projects?all=1"),
      getJson<AdminTestimonial[]>("/api/testimonials?all=1"),
      getJson<AdminMessage[]>("/api/messages"),
    ]).then(([projectData, testimonialData, messageData]) => {
      if (!active) return;
      setProjects(Array.isArray(projectData) ? projectData : []);
      setTestimonials(Array.isArray(testimonialData) ? testimonialData : []);
      setMessages(Array.isArray(messageData) ? messageData : []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const projectCount = projects.length;
  const activeProjects = projects.filter((p) => p.published).length;
  const testimonialCount = testimonials.length;
  const unreadCount = messages.filter((m) => !m.read).length;
  const recentProjects = projects.slice(-5).reverse();

  return (
    <div>
      <div
        className="admin-table-wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.9rem",
          flexWrap: "wrap",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          borderLeft: "4px solid var(--accent-color)",
        }}
      >
        <div
          className="admin-stat-icon green"
          style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
        >
          <span className="bi bi-broadcast" />
        </div>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--heading-color)",
            }}
          >
            Your portfolio is live
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: "color-mix(in srgb, var(--default-color), transparent 40%)",
            }}
          >
            Projects and testimonials you add or edit here appear on the public
            site within seconds — no redeploy needed.
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn-primary"
        >
          <span className="bi bi-box-arrow-up-right" />
          View Live Profile
        </a>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <span className="bi bi-folder2-open"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">
              {loading ? "…" : projectCount}
            </div>
            <div className="admin-stat-label">Total Projects</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <span className="bi bi-check-circle"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">
              {loading ? "…" : activeProjects}
            </div>
            <div className="admin-stat-label">Published</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <span className="bi bi-chat-dots"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">
              {loading ? "…" : testimonialCount}
            </div>
            <div className="admin-stat-label">Testimonials</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <span className="bi bi-inbox"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">
              {loading ? "…" : unreadCount}
            </div>
            <div className="admin-stat-label">Unread Messages</div>
          </div>
        </div>
      </div>

      <div className="admin-section-header">
        <h2 className="admin-section-title">Recent Projects</h2>
        <Link href="/admin/projects" className="admin-btn admin-btn-primary">
          <span className="bi bi-plus"></span>
          Add Project
        </Link>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Category</th>
              <th>Technologies</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="project-title">{project.title}</div>
                </td>
                <td>
                  <span className="project-category">{project.category}</span>
                </td>
                <td>
                  <div className="project-tech">
                    {project.technologies.slice(0, 3).join(", ")}
                  </div>
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      project.published ? "published" : "draft"
                    }`}
                  >
                    {project.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/admin/projects?edit=${project.id}`}
                    className="admin-btn admin-btn-outline admin-btn-sm"
                  >
                    <span className="bi bi-pencil"></span>
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && recentProjects.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty" style={{ padding: "2rem" }}>
                    <span className="bi bi-folder2-open"></span>
                    <p>No projects yet. Add your first one!</p>
                  </div>
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5}>
                  <div
                    className="admin-empty"
                    style={{ padding: "2rem", opacity: 0.6 }}
                  >
                    <p>Loading projects…</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        <Link
          href="/admin/testimonials"
          className="admin-table-wrapper"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              className="admin-stat-icon green"
              style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
            >
              <span className="bi bi-chat-dots"></span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                }}
              >
                Manage Testimonials
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color:
                    "color-mix(in srgb, var(--default-color), transparent 40%)",
                }}
              >
                {testimonials.filter((t) => t.published).length} published
              </div>
            </div>
            <span
              className="bi bi-chevron-right"
              style={{
                marginLeft: "auto",
                color: "var(--accent-color)",
                fontSize: "1.1rem",
              }}
            ></span>
          </div>
        </Link>

        <Link
          href="/admin/messages"
          className="admin-table-wrapper"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              className="admin-stat-icon purple"
              style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
            >
              <span className="bi bi-inbox"></span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                }}
              >
                Messages
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color:
                    "color-mix(in srgb, var(--default-color), transparent 40%)",
                }}
              >
                {messages.length} total · {unreadCount} unread
              </div>
            </div>
            <span
              className="bi bi-chevron-right"
              style={{
                marginLeft: "auto",
                color: "var(--accent-color)",
                fontSize: "1.1rem",
              }}
            ></span>
          </div>
        </Link>
      </div>
    </div>
  );
}
