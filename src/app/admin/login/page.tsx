"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, type AuthUser } from "@/data/adminData";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      if (user) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_auth", JSON.stringify(user));
        }
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f4f6fb 0%, #e8edf5 100%)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(15,41,67,0.12)",
          border: "1px solid rgba(15,41,67,0.06)",
          padding: "2.5rem 2rem",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            marginBottom: "1.75rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--heading-font)",
              fontStyle: "italic",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "var(--accent-color)",
              letterSpacing: "0.02em",
            }}
          >
            antoh
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent-color)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "0.5rem",
            }}
          >
            Admin Portal
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--heading-color)",
              fontFamily: "var(--heading-font)",
            }}
          >
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="antony"
                autoComplete="username"
                required
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  border: "1px solid rgba(15,41,67,0.15)",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  color: "var(--default-color)",
                  background: "#fff",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  fontFamily: "inherit",
                  outline: "none",
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "var(--accent-color)";
                  (e.target as HTMLInputElement).style.boxShadow =
                    "0 0 0 3px rgba(232,117,50,0.12)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "rgba(15,41,67,0.15)";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password with show/hide toggle */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--heading-color)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem 2.5rem 0.7rem 1rem",
                    border: "1px solid rgba(15,41,67,0.15)",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    color: "var(--default-color)",
                    background: "#fff",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = "var(--accent-color)";
                    (e.target as HTMLInputElement).style.boxShadow =
                      "0 0 0 3px rgba(232,117,50,0.12)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = "rgba(15,41,67,0.15)";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }}
                />
                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "color-mix(in srgb, var(--default-color), transparent 40%)",
                    padding: "0.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s",
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--default-color)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "color-mix(in srgb, var(--default-color), transparent 40%)";
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="bi">
                    {showPassword ? "bi-eye-slash" : "bi-eye"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "0.65rem 0.9rem",
                  background: "rgba(231,76,60,0.1)",
                  borderRadius: "8px",
                  color: "#e74c3c",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span className="bi bi-x-circle" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              style={{
                width: "100%",
                padding: "0.75rem",
                background:
                  username.trim() && password.trim()
                    ? "var(--accent-color)"
                    : "rgba(15,41,67,0.12)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: username.trim() && password.trim() ? "pointer" : "not-allowed",
                transition: "background 0.2s",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="bi bi-circle-fill"
                    style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "0.7rem",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <span className="bi bi-box-arrow-in-right" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "color-mix(in srgb, var(--default-color), transparent 45%)",
          }}
        >
          Designed for Antony&apos;s portfolio admin
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
