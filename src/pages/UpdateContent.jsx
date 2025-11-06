import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { getAuth } from "../lib/auth";

export default function UpdateContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = location.pathname.replace(/^\/topic\//, "").replace(/\/update-content$/, "");
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState(null);
  const [form, setForm] = useState({
    type: "heading",
    level: 1,
    text: "",
    metadata: { tags: [], estimated_read_time: "" },
  });

  useEffect(() => {
    const userAuth = getAuth();
    setAuth(userAuth);
  }, []);

  // Fetch topic + block content
  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`http://31.97.202.194/api/topics/slug/${slug}/`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        if (data.blocks && data.blocks.length > 0) {
          const b = data.blocks[0]; // take first block
          setBlock(b);
          setForm({
            type: b.components?.[0]?.type || "heading",
            level: b.components?.[0]?.level || 1,
            text: b.components?.[0]?.text || "",
            metadata: b.metadata || { tags: [], estimated_read_time: "" },
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [slug]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMetaChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [name]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!block?.id) return alert("No block found to update.");

    const payload = {
      components: [
        { type: form.type, level: Number(form.level), text: form.text },
      ],
      metadata: form.metadata,
    };

    try {
      const res = await fetch(`http://31.97.202.194/api/content-blocks/${block.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      const data = await res.json();

      alert("✅ Content block updated successfully!");
      console.log("Response:", data);
      navigate(`/topic/${slug}`);
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    }
  }

  if (loading) return <Centered>Loading content...</Centered>;
  if (error) return <Centered>⚠️ {error}</Centered>;

  return (
    <Wrapper>
      <Card>
        <h2>✏️ Update Content Block</h2>
        <form onSubmit={handleSubmit}>
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="heading">Heading</option>
            <option value="paragraph">Paragraph</option>
            <option value="example">Example</option>
            <option value="note">Note</option>
            <option value="code">Code</option>
            <option value="image">Image</option>
          </select>

          {form.type === "heading" && (
            <>
              <label>Heading Level</label>
              <input
                type="number"
                name="level"
                value={form.level}
                onChange={handleChange}
                min="1"
                max="6"
              />
            </>
          )}

          <label>Text</label>
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            rows="5"
          />

          <label>Tags (comma-separated)</label>
          <input
            name="tags"
            value={form.metadata.tags.join(", ")}
            onChange={(e) =>
              handleMetaChange({
                target: { name: "tags", value: e.target.value.split(",").map(t => t.trim()) },
              })
            }
          />

          <label>Estimated Read Time</label>
          <input
            name="estimated_read_time"
            value={form.metadata.estimated_read_time}
            onChange={handleMetaChange}
          />

          <Buttons>
            <button type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit">Update</button>
          </Buttons>
        </form>
      </Card>
    </Wrapper>
  );
}

/* ---------------- Styled Components ---------------- */
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 60px 20px;
  background: ${({ theme }) =>
    theme.name === "dark" ? "#0a1323" : "#f7faff"};
`;

const Card = styled.div`
  background: ${({ theme }) => (theme.name === "dark" ? "#121c2f" : "#fff")};
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);

  h2 {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-top: 12px;
    font-weight: 600;
  }

  input, select, textarea {
    width: 100%;
    margin-top: 6px;
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 8px;
    background: ${({ theme }) => (theme.name === "dark" ? "#0f172a" : "#f9fafb")};
    color: ${({ theme }) => theme.text};
  }

  textarea {
    resize: vertical;
  }
`;

const Buttons = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }

  button[type="submit"] {
    background: #2563eb;
    color: #fff;
  }

  button[type="button"] {
    background: #e5e7eb;
  }
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;















<div className="
"></div>