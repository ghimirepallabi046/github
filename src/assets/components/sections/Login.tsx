
import { useState } from "react";
import type { FormEvent } from "react";

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email] = useState("ghimirepallabi046@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error(
          "Backend returned HTML instead of JSON. Check server.js and restart Backend."
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid Email or Password");
      }

      setPassword("");
      onLogin();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to Backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f1f5f9"
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "350px",
        padding: "35px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", color: "#263b68" }}>
          📚 School Library
        </h1>

        <h3 style={{ textAlign: "center" }}>Admin Login</h3>

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          readOnly
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0 20px",
            boxSizing: "border-box",
            background: "#e2e8f0",
            border: "1px solid #cbd5e1",
            borderRadius: "6px"
          }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0 15px",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px"
          }}
        />

        {error && (
          <p style={{ color: "red", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
