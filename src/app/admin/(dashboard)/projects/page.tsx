"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { AdminProject } from "@/data/adminData";
import { broadcastContentUpdate, uploadImage } from "@/lib/clientUpload";

const MAX_IMAGES = 6;

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

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function fetchAllProjects(): Promise<AdminProject[]> {
  const items = await apiJson<AdminProject[]>("/api/projects?all=1");
  return Array.isArray(items) ? items : [];
}

function projectToForm(project: AdminProject): ProjectFormValues {
  return {
    title: project.title,
    category: project.category,
    description: project.description,
    technologies: project.technologies.join(", "),
    images: [...project.images],
    github: project.github,
    demo: project.demo || "",
    published: project.published,
  };
}

function ProjectsPageInner() {
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const handledEditRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectList, setProjectList] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<ProjectFormValues>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const loadProjects = useCallback(async () => {
    try {
      setProjectList(await fetchAllProjects());
      setLoadError("");
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load projects from the database."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const items = await fetchAllProjects();
        if (cancelled) return;
        setProjectList(items);
        setLoadError("");

        // Deep link from the dashboard: /admin/projects?edit=<id>
        if (editParam && handledEditRef.current !== editParam) {
          const project = items.find((p) => p.id === editParam);
          if (project) {
            handledEditRef.current = editParam;
            setForm(projectToForm(project));
            setEditing(true);
            setEditingId(project.id);
            setShowModal(true);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Could not load projects from the database."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editParam]);

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      toast(`Maximum ${MAX_IMAGES} images allowed`, "error");
      return;
    }

    const selected = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        if (!file.type.startsWith("image/")) {
          toast(`${file.name} is not an image`, "error");
          continue;
        }
        uploaded.push(await uploadImage(file));
      }
      if (uploaded.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploaded].slice(0, MAX_IMAGES),
        }));
        toast(
          `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`
        );
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      technologies: form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      images:
        form.images.length > 0 ? form.images : ["/images/portfolio-1.webp"],
      github: form.github,
      demo: form.demo || undefined,
      published: form.published,
    };

    try {
      if (editing && editingId) {
        const updated = await apiJson<AdminProject>(`/api/projects/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setProjectList((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
        toast("Project updated — live on your site");
      } else {
        const created = await apiJson<AdminProject>("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setProjectList((prev) => [...prev, created]);
        toast("Project added — live on your site");
      }

      broadcastContentUpdate();
      setPreviewKey((key) => key + 1);
      closeModal();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save project", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await apiJson<void>(`/api/projects/${deleteConfirm}`, { method: "DELETE" });
      setProjectList((prev) => prev.filter((p) => p.id !== deleteConfirm));
      broadcastContentUpdate();
      setPreviewKey((key) => key + 1);
      toast("Project deleted");
      setDeleteConfirm(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete project", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">All Projects</h2>
          <p
            style={{
              margin: "0.15rem 0 0",
              fontSize: "0.8rem",
              color: "color-mix(in srgb, var(--default-color), transparent 45%)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#2ecc71",
                boxShadow: "0 0 0 3px rgba(46, 204, 113, 0.2)",
              }}
            />
            Changes go live on the public site immediately.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setPreviewOpen((value) => !value)}
            title="Preview the public portfolio page"
          >
            <span className="bi bi-phone" />
            {previewOpen ? "Hide Preview" : "Live Preview"}
          </button>
          <a
            href="/#portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline"
          >
            <span className="bi bi-box-arrow-up-right" />
            Open Site
          </a>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setForm(emptyForm());
              setEditing(false);
              setEditingId(null);
              setShowModal(true);
            }}
          >
            <span className="bi bi-plus" />
            Add Project
          </button>
        </div>
      </div>

      {previewOpen && (
        <div
          className="admin-table-wrapper"
          style={{ marginBottom: "1.5rem", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              padding: "0.65rem 1rem",
              borderBottom: "1px solid rgba(15,41,67,0.08)",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--heading-color)",
            }}
          >
            <span>
              <span className="bi bi-broadcast" style={{ marginRight: "0.4rem" }} />
              Live preview — public portfolio
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => setPreviewKey((key) => key + 1)}
            >
              <span className="bi bi-arrow-clockwise" /> Refresh
            </button>
          </div>
          <iframe
            key={previewKey}
            src="/#portfolio"
            title="Live portfolio preview"
            style={{
              display: "block",
              width: "100%",
              height: "580px",
              border: "none",
              background: "#fff",
            }}
          />
        </div>
      )}

      {loadError && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            background: "rgba(231,76,60,0.08)",
            color: "#c0392b",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span className="bi bi-exclamation-triangle" />
          {loadError}
          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => {
              setLoading(true);
              void loadProjects();
            }}
          >
            Retry
          </button>
        </div>
      )}

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
            {loading &&
              Array.from({ length: 3 }, (_, index) => (
                <tr key={`loading-${index}`}>
                  <td colSpan={5}>
                    <div
                      style={{
                        height: "18px",
                        borderRadius: "6px",
                        background:
                          "linear-gradient(90deg, rgba(15,41,67,0.05), rgba(15,41,67,0.12), rgba(15,41,67,0.05))",
                      }}
                    />
                  </td>
                </tr>
              ))}

            {!loading &&
              projectList.map((project) => (
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
                        handledEditRef.current = project.id;
                        setShowModal(true);
                      }}
                      aria-label={`Edit ${project.title}`}
                    >
                      <span className="bi bi-pencil"></span>
                    </button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => setDeleteConfirm(project.id)}
                      aria-label={`Delete ${project.title}`}
                    >
                      <span className="bi bi-trash"></span>
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && !loadError && projectList.length === 0 && (
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
          onClick={() => !saving && closeModal()}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editing ? "Edit Project" : "Add New Project"}
              </h2>
              <button
                className="admin-modal-close"
                onClick={closeModal}
                disabled={saving || uploading}
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
                      key={`${img}-${idx}`}
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
                      {idx === 0 && (
                        <span
                          style={{
                            position: "absolute",
                            left: "3px",
                            bottom: "3px",
                            padding: "0.05rem 0.35rem",
                            borderRadius: "999px",
                            background: "rgba(15,41,67,0.75)",
                            color: "#fff",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                          }}
                        >
                          Cover
                        </span>
                      )}
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
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        <span className="bi bi-x"></span>
                      </button>
                    </div>
                  ))}

                  {uploading && (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        border: "2px dashed rgba(46,204,113,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-color)",
                        fontSize: "0.75rem",
                        gap: "0.25rem",
                      }}
                    >
                      <span className="bi bi-arrow-repeat" /> Uploading
                    </div>
                  )}

                  {form.images.length < MAX_IMAGES && !uploading && (
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
                        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          void handleImageFiles(e.target.files);
                          e.target.value = "";
                        }}
                        multiple
                        disabled={saving || uploading}
                      />
                    </label>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                    marginTop: "0.3rem",
                  }}
                >
                  Click <span className="bi bi-plus"></span> to upload (max{" "}
                  {MAX_IMAGES}). The first image is the cover. Images are stored
                  in your database and appear on the live site instantly.
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
                  {form.demo && (
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
                  Published (visible on the live site)
                </label>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={closeModal}
                  disabled={saving || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <>
                      <span className="bi bi-arrow-repeat" /> Saving…
                    </>
                  ) : editing ? (
                    <>
                      <span className="bi bi-check" /> Update &amp; Publish
                    </>
                  ) : (
                    <>
                      <span className="bi bi-plus" /> Add &amp; Publish
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
                onClick={() => !deleting && setDeleteConfirm(null)}
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
                Are you sure you want to delete this project? It will disappear
                from your live site immediately. This cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                <span className="bi bi-trash" />
                {deleting ? " Deleting…" : " Delete"}
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
