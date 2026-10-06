import { supabase } from './supabaseClient';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authService = {
  signupUser: async (userData) => {
    // 1. Try Supabase Auth first
    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name }
        }
      });

      if (!sbError && sbData?.user) {
        const userObj = {
          id: sbData.user.id,
          name: userData.name,
          email: sbData.user.email
        };
        const payload = {
          message: "Signup successful via Supabase!",
          user: userObj,
          token: sbData.session?.access_token || `sb-${sbData.user.id}`
        };
        localStorage.setItem("user", JSON.stringify(payload));
        return payload;
      } else if (sbError) {
        console.warn("Supabase signup note:", sbError.message);
      }
    } catch (err) {
      console.warn("Supabase signup fallback:", err);
    }

    // 2. Fallback to Express backend API
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
    // 1. Try Supabase Auth first
    try {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (!sbError && sbData?.user) {
        const userObj = {
          id: sbData.user.id,
          name: sbData.user.user_metadata?.name || credentials.email.split('@')[0],
          email: sbData.user.email
        };
        const payload = {
          message: "Login successful via Supabase!",
          token: sbData.session?.access_token || `sb-${sbData.user.id}`,
          user: userObj
        };
        localStorage.setItem("user", JSON.stringify(payload));
        return payload;
      } else if (sbError) {
        console.warn("Supabase login notice:", sbError.message);
      }
    } catch (err) {
      console.warn("Supabase login fallback:", err);
    }

    // 2. Fallback to Express backend API
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

    // Normalize response: Go with existing `user` payload, or support JWT backend format
    if (!data.user) {
      data.user = {
        id: data.id || null,
        name: data.name || "",
        email: data.email || ""
      };
    }

    // Store normalized user data in localStorage
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut:", e);
    }
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

export const { signupUser, loginUser, logout, getCurrentUser } = authService;
export default authService;