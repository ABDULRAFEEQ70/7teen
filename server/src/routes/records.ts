import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// Create record – doctor or nurse
router.post("/", authorize(["doctor", "nurse", "admin"]), async (req, res) => {
  const { patientId, staffId, description } = req.body;
  if (!patientId || !staffId || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO medical_records (patient_id, staff_id, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [patientId, staffId, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// List records for a patient
router.get("/patient/:id", authorize(["doctor", "nurse", "admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT r.*, s.first_name AS staff_first_name, s.last_name AS staff_last_name
       FROM medical_records r
       JOIN staff s ON s.id = r.staff_id
       WHERE r.patient_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

router.get("/", authorize(["doctor", "nurse", "admin"]), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
              s.first_name AS staff_first_name, s.last_name AS staff_last_name
       FROM medical_records r
       JOIN patients p ON p.id = r.patient_id
       JOIN staff s ON s.id = r.staff_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// Get single record
router.get("/:id", authorize(["doctor", "nurse", "admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM medical_records WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

// Update record
router.put("/:id", authorize(["doctor", "admin"]), async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE medical_records SET description=$1 WHERE id=$2 RETURNING *`,
      [description, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

// Delete record
router.delete("/:id", authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM medical_records WHERE id=$1`,
      [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

export default router;