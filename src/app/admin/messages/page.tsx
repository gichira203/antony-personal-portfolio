"use client";

import { useState, useRef, useEffect } from "react";
import {
  adminMessages,
  type AdminMessage,
  fetchMessages,
  saveMessages,
} from "@/data/adminData";

const STORAGE_KEY = "admin_messages_data";

function loadFromStorage(): AdminMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return adminMessages;
}

function saveToStorage(data: AdminMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
  saveMessages(data).catch(() => {
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

function formatChatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getChatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Single shared countdown timer visible in the chat header. Each chat
 * conversation that is selected gets its own label — but the timer tick is
 * driven by ONE interval so we don't end up with multiple timers running.
 */
let sharedTimer: ReturnType<typeof setInterval> | null = null;
let sharedTimerLabel: HTMLElement | null = null;

const elementTimers = new WeakMap<HTMLElement, ReturnType<typeof setInterval>>();

function renderCountdown(el: HTMLElement, targetDate: Date) {
  const existing = elementTimers.get(el);
  if (existing) clearInterval(existing);
  const timer = setInterval(() => {
    const diff = Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    el.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, 1000);
  elementTimers.set(el, timer);
}

export default function MessagesPage() {
  const [msgList, setMsgList] = useState<AdminMessage[]>(loadFromStorage);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Refresh from backend on mount.
  useEffect(() => {
    fetchMessages()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch {
            /* ignore */
          }
          setMsgList(remote);
        }
      })
      .catch(() => {
        /* backend unavailable — keep localStorage/in-memory data */
      });
  }, []);

  // Persist to backend + localStorage on every change.
  useEffect(() => {
    saveToStorage(msgList);
  }, [msgList]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedId, msgList, replyText]);

  const selected = msgList.find((m) => m.id === selectedId);

  const handleSendReply = () => {
    if (!replyText.trim() || !selected) return;
    const now = new Date();
    const reply: AdminMessage = {
      id: crypto.randomUUID(),
      name: "Antony Muthii",
      email: "antony@example.com",
      phone: "+254 726 815 333",
      subject: `Re: ${selected.subject}`,
      body: replyText.trim(),
      time: now.toISOString(),
      read: true,
      isOutbound: true,
    };
    setMsgList((prev) => [...prev, reply]);
    setReplyText("");
    toast("Reply sent");
    saveToStorage([...msgList, reply]);
  };

  const handleEmailReply = () => {
    if (!selected) return;
    window.open(
      `mailto:${selected.email}?subject=Re: ${encodeURIComponent(
        selected.subject
      )}&body=${encodeURIComponent(replyText.trim() || "")}`
    );
    toast("Opening email client…");
  };

  const isChatSelection = selected && !selected.isOutbound;

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Messages</h2>
        <span
          style={{
            fontSize: "0.85rem",
            color: "color-mix(in srgb, var(--default-color), transparent 40%)",
          }}
        >
          {msgList.filter((m) => !m.read).length} unread
        </span>
      </div>

      {/* WhatsApp-style: contact list (left) + chat area (right) */}
      <div
        className="admin-messages-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "1rem",
          alignItems: "start",
          flexShrink: 0,
        }}
      >
        {/* ===== Contact list (left sidebar) ===== */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(15,41,67,0.06)",
            overflowY: "auto",
            maxHeight: "calc(100vh - 68px - 3rem)",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid rgba(15,41,67,0.06)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent-color)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Conversations
          </div>
          {msgList.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                fontSize: "0.9rem",
              }}
            >
              <span
                className="bi bi-inbox"
                style={{
                  fontSize: "1.8rem",
                  color: "var(--accent-color)",
                  opacity: 0.3,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              />
              No messages yet
            </div>
          ) : (
            msgList.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid rgba(15,41,67,0.05)",
                  cursor: "pointer",
                  background:
                    selectedId === msg.id ? "rgba(232,117,50,0.06)" : "#fff",
                  borderLeft:
                    selectedId === msg.id
                      ? "3px solid var(--accent-color)"
                      : "3px solid transparent",
                  transition: "background 0.15s",
                }}
                onClick={() => setSelectedId(msg.id)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                  }}
                >
                  {/* Contact avatar */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--heading-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: "var(--heading-color)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {msg.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "color-mix(in srgb, var(--default-color), transparent 45%)",
                          flexShrink: 0,
                          marginLeft: "0.5rem",
                        }}
                      >
                        {formatChatTime(msg.time)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--default-color)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginTop: "0.1rem",
                      }}
                    >
                      {msg.subject}
                    </div>
                    {msg.phone && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--accent-color)",
                          marginTop: "0.15rem",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        <span className="bi bi-telephone" style={{ fontSize: "0.65rem" }} />
                        {msg.phone}
                      </div>
                    )}
                  </div>
                  {!msg.read && (
                    <span
                      className="bi bi-circle"
                      style={{
                        fontSize: "0.45rem",
                        color: "var(--accent-color)",
                        flexShrink: 0,
                        marginTop: "0.15rem",
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ===== Chat area (right) ===== */}
        <div
          className="admin-chat-area"
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(15,41,67,0.06)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 68px - 3rem)",
            minHeight: "400px",
          }}
        >
          {isChatSelection ? (
            <>
              {/* Chat header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "var(--heading-color)",
                  color: "#fff",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      {selected.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.65)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {selected.read ? (
                        <>
                          <span
                            className="bi bi-circle-fill"
                            style={{
                              fontSize: "0.35rem",
                              color: "#8bc34a",
                            }}
                          />
                          Read
                        </>
                      ) : (
                        <>
                          <span
                            className="bi bi-circle"
                            style={{
                              fontSize: "0.35rem",
                              color: "#fff",
                            }}
                          />
                          Unread
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "#fff",
                      borderRadius: "6px",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                    onClick={() => {
                      setMsgList((prev) =>
                        prev.map((m) =>
                          m.id === selected.id ? { ...m, read: true } : m
                        )
                      );
                      toast("Marked as read");
                    }}
                  >
                    <span className="bi bi-check-circle"></span> Read
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "#fff",
                      borderRadius: "6px",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                    onClick={() => {
                      setMsgList((prev) =>
                        prev.filter((m) => m.id !== selected.id)
                      );
                      setSelectedId(null);
                      setReplyText("");
                      toast("Conversation closed");
                    }}
                  >
                    <span className="bi bi-x"></span> Close
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1rem",
                  background: "#e9edef",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {/* Date separator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    margin: "0.5rem 0",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(0,0,0,0.12)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "rgba(0,0,0,0.45)",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                      padding: "0 0.3rem",
                    }}
                  >
                    {getChatDateLabel(selected.time)}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(0,0,0,0.12)",
                    }}
                  />
                </div>

                {/* Original message (incoming/wallpaper-green) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "0.55rem 0.85rem",
                      borderRadius: "12px",
                      background: "#fff",
                      borderBottomLeftRadius: "4px",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      wordWrap: "break-word",
                      color: "var(--default-color)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--accent-color)",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {selected.name}
                    </div>
                    {selected.body}
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "rgba(0,0,0,0.35)",
                        textAlign: "left",
                        marginTop: "0.3rem",
                      }}
                    >
                      {formatChatTime(selected.time)}
                    </div>
                  </div>
                </div>

                {/* Replies from Antony (outgoing/dark) */}
                {msgList
                  .filter(
                    (m) =>
                      m.isOutbound &&
                      m.subject?.startsWith("Re:") &&
                      m.name === "Antony Muthii"
                  )
                  .map((reply) => (
                    <div
                      key={reply.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "72%",
                          padding: "0.55rem 0.85rem",
                          borderRadius: "12px",
                          background: "var(--heading-color)",
                          borderBottomRightRadius: "4px",
                          color: "#fff",
                          fontSize: "0.9rem",
                          lineHeight: "1.5",
                          wordWrap: "break-word",
                        }}
                      >
                        {reply.body}
                        <div
                          style={{
                            fontSize: "0.65rem",
                            color: "rgba(255,255,255,0.55)",
                            textAlign: "right",
                            marginTop: "0.3rem",
                          }}
                        >
                          {formatChatTime(reply.time)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Reply bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.7rem 1rem",
                  borderTop: "1px solid rgba(15,41,67,0.08)",
                  background: "#fafbfd",
                }}
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Type a reply…"
                  style={{
                    flex: 1,
                    border: "1px solid rgba(15,41,67,0.15)",
                    borderRadius: "24px",
                    padding: "0.55rem 1rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    background: "#fff",
                    color: "var(--default-color)",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      "var(--accent-color)";
                    (e.target as HTMLInputElement).style.boxShadow =
                      "0 0 0 3px rgba(232,117,50,0.12)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      "rgba(15,41,67,0.15)";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  title="Send reply to chat"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: replyText.trim()
                      ? "var(--accent-color)"
                      : "rgba(15,41,67,0.15)",
                    color: "#fff",
                    border: "none",
                    cursor: replyText.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                >
                  <span className="bi bi-send" style={{ fontSize: "0.9rem" }} />
                </button>
                <button
                  onClick={handleEmailReply}
                  title="Reply via email"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(15,41,67,0.15)",
                    color: "var(--heading-color)",
                    borderRadius: "24px",
                    padding: "0.45rem 0.75rem",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--accent-color)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--accent-color)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(15,41,67,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--heading-color)";
                  }}
                >
                  <span className="bi bi-envelope"></span>
                  <span style={{ fontSize: "0.72rem" }}>Email</span>
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f4f6fb",
                color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                gap: "0.75rem",
                padding: "2rem",
              }}
            >
              <span
                className="bi bi-chat-dots"
                style={{
                  fontSize: "3rem",
                  color: "var(--accent-color)",
                  opacity: 0.25,
                }}
              />
              <span style={{ fontSize: "0.95rem" }}>Select a conversation</span>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "color-mix(in srgb, var(--default-color), transparent 55%)",
                }}
              >
                Choose a message from the list to read and reply
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
