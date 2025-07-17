import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Register user (for demo purpose)
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "username, password, role required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role`,
      [username, hashed, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "username exists" });
    }
    console.error(error);
    res.status(500).json({ error: "registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, password_hash, role FROM users WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "login failed" });
  }
});

export default router;