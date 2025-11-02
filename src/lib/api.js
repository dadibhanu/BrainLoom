// ✅ Correct: Named export for fetchRootTopics
const BASE = import.meta.env.VITE_API_BASE || "http://31.97.202.194";

export async function fetchRootTopics(signal) {
  try {
    const res = await fetch(`${BASE}/api/topics/root`, { signal });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching topics:", err);
    throw err;
  }
}
