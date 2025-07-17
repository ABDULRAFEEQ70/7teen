import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// Create invoice
router.post("/", authorize(["admin", "accountant"]), async (req, res) => {
  const { patientId, amount, dueDate, status } = req.body;
  if (!patientId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO invoices (patient_id, amount, due_date, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, amount, dueDate, status || "pending"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// List invoices
router.get("/", authorize(["admin", "accountant"]), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, p.first_name, p.last_name FROM invoices i
       JOIN patients p ON p.id = i.patient_id
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Pay invoice
router.post("/:id/pay", authorize(["admin", "accountant"]), async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE invoices SET status='paid', paid_at=now(), payment_method=$1 WHERE id=$2 RETURNING *`,
      [paymentMethod || 'cash', id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to pay invoice" });
  }
});

export default router;