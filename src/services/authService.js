const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const authService = {
  signupUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    
    let data = {};
    const text = await res.text();
    if (text) {
        try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
    }
    
    if (!res.ok) throw new Error(data.message || "Signup failed");
    return data;
  },

  loginUser: async (credentials) => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });

    let data = {};
    const text = await res.text();
    if (text) {
        try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
    }

    if (!res.ok) throw new Error(data.message || "Login failed");
    
    // Store user data in localStorage (typically { user, token })
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

export const { signupUser, loginUser, logout, getCurrentUser } = authService;
export default authService;