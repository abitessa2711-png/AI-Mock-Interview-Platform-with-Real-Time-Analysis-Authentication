import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// ==========================
// In-memory DB
// ==========================
const users = [];

// ==========================
// TEST ROUTE (IMPORTANT)
// ==========================
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// ==========================
// SIGNUP
// ==========================
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(newUser);

  res.status(201).json({
    message: "Signup successful ✅",
    user: newUser
  });
});

// ==========================
// LOGIN
// ==========================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials ❌" });
  }

  res.status(200).json({
    message: "Login successful ✅",
    user
  });
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});