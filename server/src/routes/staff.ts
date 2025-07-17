import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// List staff
router.get("/", authorize(["admin"]), async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM staff ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Create staff
router.post("/", authorize(["admin"]), async (req, res) => {
  const { firstName, lastName, role, phone, email } = req.body;
  if (!firstName || !lastName || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO staff (first_name, last_name, role, phone, email)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstName, lastName, role, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create staff" });
  }
});

export default router;