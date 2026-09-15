"use client";

import Link from "next/link";
import { adminProjects, adminTestimonials, adminMessages, fetchProjects } from "@/data/adminData";

export default function DashboardPage() {
  const projectCount = adminProjects.length;
  const activeProjects = adminProjects.filter((p) => p.published).length;
  const testimonialCount = adminTestimonials.length;
  const unreadCount = adminMessages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <span className="bi bi-folder2-open"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{projectCount}</div>
            <div className="admin-stat-label">Total Projects</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <span className="bi bi-check-circle"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{activeProjects}</div>
            <div className="admin-stat-label">Published</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <span className="bi bi-chat-dots"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{testimonialCount}</div>
            <div className="admin-stat-label">Testimonials</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <span className="bi bi-inbox"></span>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{unreadCount}</div>
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
            {adminProjects.slice(-5).reverse().map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="project-title">{project.title}</div>
                </td>
                <td>
                  <span className="project-category">{project.category}</span>
                </td>
                <td>
                  <div className="project-tech">{project.technologies.slice(0, 3).join(", ")}</div>
                </td>
                <td>
                  <span className={`admin-badge ${project.published ? "published" : "draft"}`}>
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
            {adminProjects.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty" style={{ padding: "2rem" }}>
                    <span className="bi bi-folder2-open"></span>
                    <p>No projects yet. Add your first one!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
        <Link href="/admin/testimonials" className="admin-table-wrapper" style={{ display: "block", textDecoration: "none" }}>
          <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="admin-stat-icon green" style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}>
              <span className="bi bi-chat-dots"></span>
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--heading-color)" }}>Manage Testimonials</div>
              <div style={{ fontSize: "0.82rem", color: "color-mix(in srgb, var(--default-color), transparent 40%)" }}>
                {adminTestimonials.filter(t => t.published).length} published
              </div>
            </div>
            <span className="bi bi-chevron-right" style={{ marginLeft: "auto", color: "var(--accent-color)", fontSize: "1.1rem" }}></span>
          </div>
        </Link>

        <Link href="/admin/messages" className="admin-table-wrapper" style={{ display: "block", textDecoration: "none" }}>
          <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="admin-stat-icon purple" style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}>
              <span className="bi bi-inbox"></span>
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--heading-color)" }}>Messages</div>
              <div style={{ fontSize: "0.82rem", color: "color-mix(in srgb, var(--default-color), transparent 40%)" }}>
                {adminMessages.length} total · {unreadCount} unread
              </div>
            </div>
            <span className="bi bi-chevron-right" style={{ marginLeft: "auto", color: "var(--accent-color)", fontSize: "1.1rem" }}></span>
          </div>
        </Link>
      </div>
    </div>
  );
}
