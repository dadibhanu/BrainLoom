import { useEffect, useState } from "react";
import { storage } from "../lib/storage";

export default function Profile() {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(storage.get("profileName", ""));
  }, []);

  function clear() {
    storage.remove("profileName");
    setName("");
  }

  return (
    <section style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, margin: 0 }}>Profile</h2>

      {!name ? (
        <p style={{ opacity: 0.8 }}>
          No name set. Go to{" "}
          <a href="/login" style={{ textDecoration: "underline" }}>
            Login
          </a>{" "}
          to add one.
        </p>
      ) : (
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.35)",
            padding: 16,
            borderRadius: 16,
          }}
        >
          <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>Display name</p>
          <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{name}</p>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              onClick={clear}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
