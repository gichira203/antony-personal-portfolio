"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  adminProjects,
  type AdminProject,
  fetchProjects,
  saveProjects,
} from "@/data/adminData";

const STORAGE_KEY = "admin_projects_data";

function loadFromStorageSync(): AdminProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return adminProjects;
}

function toast(message: string, type: "success" | "error" = "success") {
  const existing = document.querySelector(".admin-toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = `admin-toast ${type}`;
  el.innerHTML = `<span class="bi bi-${type === "success" ? "check-circle" : "x-circle"}"></span> ${message}`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

interface ProjectFormValues {
  title: string;
  category: string;
  description: string;
  technologies: string;
  images: string[];
  github: string;
  demo: string;
  published: boolean;
}

function emptyForm(): ProjectFormValues {
  return {
    title: "",
    category: "",
    description: "",
    technologies: "",
    images: [],
    github: "",
    demo: "",
    published: true,
  };
}

function ProjectsPageInner() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectList, setProjectList] = useState<AdminProject[]>(loadFromStorageSync);
  const [form, setForm] = useState<ProjectFormValues>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Refresh from backend when the view mounts.
  useEffect(() => {
    fetchProjects()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch {
            /* ignore */
          }
          setProjectList(remote);
        }
      })
      .catch(() => {
        /* backend unavailable — keep localStorage/in-memory data */
      });
  }, []);

  // Persist to backend + localStorage on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectList));
    } catch {
      /* ignore */
    }
    saveProjects(projectList).catch(() => {
      /* backend unavailable — data is already in localStorage */
    });
  }, [projectList]);

  const addImage = (src: string) => {
    if (form.images.length >= 6) {
      toast("Maximum 6 images allowed", "error");
      return;
    }
    setForm({ ...form, images: [...form.images, src] });
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addImage(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const techs = form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (editing && editingId) {
        setProjectList((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  title: form.title,
                  category: form.category,
                  description: form.description,
                  technologies: techs,
                  images:
                    form.images.length > 0
                      ? form.images
                      : p.images.length > 0
                        ? p.images
                        : ["/images/portfolio-1.webp"],
                  github: form.github,
                  demo: form.demo || undefined,
                  published: form.published,
                }
              : p
          )
        );
      } else {
        const newProject: AdminProject = {
          id: crypto.randomUUID(),
          title: form.title,
          category: form.category,
          description: form.description,
          technologies: techs,
          images: form.images.length > 0 ? form.images : ["/images/portfolio-1.webp"],
          github: form.github,
          demo: form.demo || undefined,
          published: form.published,
        };
        setProjectList((prev) => [...prev, newProject]);
      }
      toast(editing ? "Project updated" : "Project added");
      setShowModal(false);
      setEditing(false);
      setEditingId(null);
      setForm(emptyForm());
      setSaving(false);
    }, 300);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setProjectList((prev) => prev.filter((p) => p.id !== deleteConfirm));
    toast("Project deleted");
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">All Projects</h2>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setForm(emptyForm());
            setEditing(false);
            setShowModal(true);
          }}
        >
          <span className="bi bi-plus"></span>
          Add Project
        </button>
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
            {projectList.map((project) => (
              <tr key={project.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {project.images.length > 0 && (
                      <div
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={project.images[0]}
                          alt={project.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <span className="project-title">{project.title}</span>
                  </div>
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
                  <button
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={() => {
                      setForm({
                        title: project.title,
                        category: project.category,
                        description: project.description,
                        technologies: project.technologies.join(", "),
                        images: [...project.images],
                        github: project.github,
                        demo: project.demo || "",
                        published: project.published,
                      });
                      setEditing(true);
                      setEditingId(project.id);
                      setShowModal(true);
                    }}
                  >
                    <span className="bi bi-pencil"></span>
                  </button>
                  <button
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => setDeleteConfirm(project.id)}
                  >
                    <span className="bi bi-trash"></span>
                  </button>
                </td>
              </tr>
            ))}
            {projectList.length === 0 && (
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

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setShowModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editing ? "Edit Project" : "Add New Project"}
              </h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <span className="bi bi-x"></span>
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSave}>
              {/* Multiple images */}
              <div
                className="admin-form-group full-width"
                style={{ marginBottom: "1rem" }}
              >
                <label className="admin-form-label">Project Images</label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    marginTop: "0.5rem",
                  }}
                >
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px solid rgba(46,204,113,0.3)",
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Image ${idx + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(231,76,60,0.9)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => removeImage(idx)}
                      >
                        <span className="bi bi-x"></span>
                      </button>
                    </div>
                  ))}
                  <label
                    className="admin-image-picker"
                    style={{
                      width: "80px",
                      height: "80px",
                      padding: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px dashed rgba(15,41,67,0.25)",
                      background: "rgba(15,41,67,0.03)",
                      borderRadius: "8px",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span
                      className="bi bi-plus"
                      style={{ fontSize: "1.4rem", color: "var(--accent-color)" }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: "none" }}
                      onChange={handleImageFile}
                      multiple={false}
                    />
                  </label>
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                    marginTop: "0.3rem",
                  }}
                >
                  Click <span className="bi bi-plus"></span> to add more (max 6). First image
                  is the cover.
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="admin-form-group">
                  <label className="admin-form-label">Project Title *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="E-Commerce Dashboard"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Web Application"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginTop: "1rem" }}>
                <label className="admin-form-label">Description *</label>
                <textarea
                  className="admin-form-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe this project..."
                  required
                  disabled={saving}
                  rows={3}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="admin-form-group">
                  <label className="admin-form-label">Technologies</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={form.technologies}
                    onChange={(e) =>
                      setForm({ ...form, technologies: e.target.value })
                    }
                    placeholder="React, Next.js, Django"
                    disabled={saving}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">GitHub URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    value={form.github}
                    onChange={(e) =>
                      setForm({ ...form, github: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Demo URL — optional */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Demo URL{" "}
                  <span
                    style={{
                      color: "rgba(15,41,67,0.3)",
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="url"
                    className="admin-form-input"
                    value={form.demo}
                    onChange={(e) =>
                      setForm({ ...form, demo: e.target.value })
                    }
                    placeholder="https://…"
                    disabled={saving}
                    style={{ flex: 1 }}
                  />
                  {form.demo && form.demo !== "#" && (
                    <a
                      href={form.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--accent-color)",
                        fontSize: "1.2rem",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Open demo"
                    >
                      <span className="bi bi-box-arrow-up-right"></span>
                    </a>
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(15,41,67,0.06)",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--heading-color)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm({ ...form, published: e.target.checked })
                    }
                    disabled={saving}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "var(--accent-color)",
                    }}
                  />
                  Published (visible on site)
                </label>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="bi bi-spinner bi-spin" />
                  ) : editing ? (
                    <>
                      <span className="bi bi-check" /> Update
                    </>
                  ) : (
                    <>
                      <span className="bi bi-plus" /> Add
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "400px" }}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Project</h2>
              <button
                className="admin-modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                <span className="bi bi-x"></span>
              </button>
            </div>
            <div className="admin-modal-body">
              <p
                style={{
                  color: "var(--default-color)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Are you sure you want to delete this project? This cannot be
                undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleDelete}
              >
                <span className="bi bi-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "2rem",
            color: "var(--accent-color)",
          }}
        >
          <p style={{ fontSize: "1.1rem" }}>Loading projects...</p>
        </div>
      }
    >
      <ProjectsPageInner />
    </Suspense>
  );
}
