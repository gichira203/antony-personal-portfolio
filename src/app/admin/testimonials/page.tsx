"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  adminTestimonials,
  type AdminTestimonial,
  fetchTestimonials,
  saveTestimonials,
} from "@/data/adminData";

const STORAGE_KEY = "admin_testimonials_data";

function loadFromStorage(): AdminTestimonial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return adminTestimonials;
}

function saveToStorage(data: AdminTestimonial[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  saveTestimonials(data).catch(() => {
    /* backend unavailable — data stays in localStorage */
  });
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

interface TestimonialFormValues {
  quote: string;
  author: string;
  role: string;
  image: string;
  highlightTitle: string;
  published: boolean;
}

function emptyForm(): TestimonialFormValues {
  return {
    quote: "",
    author: "",
    role: "",
    image: "/images/person-m-7.webp",
    highlightTitle: "",
    published: true,
  };
}

export default function TestimonialsPage() {
  // Initial state must be identical on server and client to avoid
  // hydration mismatches. localStorage is empty during SSR, so
  // loadFromStorage() would return adminTestimonials on the server but
  // whatever was previously saved on the client — including data URL
  // images from past uploads that Next.js Image renders differently.
  const [testimonialList, setTestimonialList] = useState<AdminTestimonial[]>(
    adminTestimonials
  );
  const [form, setForm] = useState<TestimonialFormValues>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Refresh from backend on mount.
  useEffect(() => {
    fetchTestimonials()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch {
            /* ignore */
          }
          setTestimonialList(remote);
        }
      })
      .catch(() => {
        /* backend unavailable — keep localStorage/in-memory data */
      });
  }, []);

  // Persist to backend + localStorage on every change.
  useEffect(() => {
    saveToStorage(testimonialList);
  }, [testimonialList]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (editing && editingId) {
        setTestimonialList((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? {
                  ...t,
                  quote: form.quote,
                  author: form.author,
                  role: form.role,
                  image: form.image,
                  highlightTitle: form.highlightTitle,
                  published: form.published,
                }
              : t
          )
        );
      } else {
        const newT: AdminTestimonial = {
          id: crypto.randomUUID(),
          ...form,
        };
        setTestimonialList((prev) => [...prev, newT]);
      }
      toast(editing ? "Testimonial updated" : "Testimonial added");
      setShowModal(false);
      setEditing(false);
      setEditingId(null);
      setForm(emptyForm());
      setSaving(false);
    }, 300);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setTestimonialList((prev) => prev.filter((t) => t.id !== deleteConfirm));
    toast("Testimonial deleted");
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Testimonials</h2>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setForm(emptyForm());
            setEditing(false);
            setShowModal(true);
          }}
        >
          <span className="bi bi-plus"></span>
          Add Testimonial
        </button>
      </div>

      <div
        className="admin-testimonials-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {testimonialList.map((item) => (
          <div
            key={item.id}
            className="admin-message-card"
            style={{ cursor: "default" }}
          >
            <div style={{ display: "flex", gap: "1rem" }}>
              {item.image && (
                <div
                  style={{
                    position: "relative",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.author}
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--accent-color)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.role}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--heading-color)",
                    fontSize: "1rem",
                    marginTop: "0.15rem",
                  }}
                >
                  {item.author}
                </div>
              </div>
              <span
                className={`admin-badge ${
                  item.published ? "published" : "draft"
                }`}
              >
                {item.published ? "Published" : "Draft"}
              </span>
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--heading-color)",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              {item.highlightTitle}
            </div>

            <p
              style={{
                fontSize: "0.92rem",
                color: "color-mix(in srgb, var(--default-color), transparent 30%)",
                lineHeight: "1.7",
                fontStyle: "italic",
                margin: 0,
              }}
            >
              &ldquo;{item.quote}&rdquo;
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "1rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(15,41,67,0.06)",
              }}
            >
              <button
                className="admin-btn admin-btn-outline admin-btn-sm"
                onClick={() => {
                  setForm({
                    quote: item.quote,
                    author: item.author,
                    role: item.role,
                    image: item.image,
                    highlightTitle: item.highlightTitle,
                    published: item.published,
                  });
                  setEditing(true);
                  setEditingId(item.id);
                  setShowModal(true);
                }}
              >
                <span className="bi bi-pencil"></span>
                Edit
              </button>
              <button
                className="admin-btn admin-btn-danger admin-btn-sm"
                onClick={() => setDeleteConfirm(item.id)}
              >
                <span className="bi bi-trash"></span>
              </button>
            </div>
          </div>
        ))}
        {testimonialList.length === 0 && (
          <div className="admin-empty" style={{ gridColumn: "1 / -1" }}>
            <span className="bi bi-chat-dots"></span>
            <h3>No testimonials yet</h3>
            <p>Add testimonials from clients and visitors.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setShowModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editing ? "Edit Testimonial" : "Add Testimonial"}
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
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Quote *</label>
                <textarea
                  className="admin-form-textarea"
                  value={form.quote}
                  onChange={(e) =>
                    setForm({ ...form, quote: e.target.value })
                  }
                  placeholder="What did they say about your work?"
                  required
                  disabled={saving}
                  rows={4}
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
                  <label className="admin-form-label">Author Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={form.author}
                    onChange={(e) =>
                      setForm({ ...form, author: e.target.value })
                    }
                    placeholder="e.g. John Kamau"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Role / Title</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    placeholder="e.g. Business Owner"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Highlight Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={form.highlightTitle}
                  onChange={(e) =>
                    setForm({ ...form, highlightTitle: e.target.value })
                  }
                  placeholder="e.g. Clear communication"
                  disabled={saving}
                />
              </div>
              <div
                className="admin-form-group full-width"
                style={{ marginBottom: "1rem" }}
              >
                <label className="admin-form-label">
                  Reviewer Photo — Upload
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Preview */}
                  {form.image && (
                    <div
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px solid rgba(46,204,113,0.3)",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={form.image}
                        alt="Reviewer"
                        fill
                        sizes="100vw"
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
                          width: "22px",
                          height: "22px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, image: "" });
                        }}
                      >
                        <span className="bi bi-x"></span>
                      </button>
                    </div>
                  )}
                  {/* Upload button */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.75rem 1rem",
                        border: "2px dashed var(--accent-color)",
                        borderRadius: "10px",
                        background: "rgba(232,117,50,0.04)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "0.9rem",
                        color: "var(--default-color)",
                        fontFamily: "inherit",
                      }}
                      onClick={() =>
                        document.getElementById("testimonial-image-input")?.click()
                      }
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLLabelElement).style.background =
                          "rgba(232,117,50,0.08)";
                        (e.currentTarget as HTMLLabelElement).style.borderColor =
                          "var(--accent-color)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLLabelElement).style.background =
                          "rgba(232,117,50,0.04)";
                        (e.currentTarget as HTMLLabelElement).style.borderColor =
                          "var(--accent-color)";
                      }}
                    >
                      <span
                        className="bi bi-camera-fill"
                        style={{ fontSize: "1.3rem", color: "var(--accent-color)" }}
                      />
                      <span style={{ fontWeight: 500 }}>
                        {form.image ? "Change photo" : "Upload reviewer photo"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "color-mix(in srgb, var(--default-color), transparent 45%)",
                          marginLeft: "auto",
                        }}
                      >
                        PNG, JPG, WEBP
                      </span>
                      <input
                        id="testimonial-image-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () =>
                              setForm({ ...form, image: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="admin-form-group full-width"
                style={{ marginBottom: "0" }}
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
              <h2 className="admin-modal-title">Delete Testimonial</h2>
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
                Are you sure you want to delete this testimonial?
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
