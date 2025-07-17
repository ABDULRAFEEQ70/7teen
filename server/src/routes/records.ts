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

export default router;