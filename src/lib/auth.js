// src/lib/auth.js

export async function loginUser(email, password, role = "admin") {
  const res = await fetch("http://31.97.202.194/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, as: role }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data?.message || "Login failed");

  const authData = {
    token: data?.token,
    user: data?.user || { email, role },
    role,
  };

  localStorage.setItem("auth", JSON.stringify(authData));
  return authData;
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth"));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("auth");
}
