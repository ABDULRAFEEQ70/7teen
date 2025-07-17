import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// Create appointment – receptionist or admin only
router.post("/", authorize(["admin", "receptionist"]), async (req, res) => {
  const { patientId, doctorName, appointmentDate, reason } = req.body;
  if (!patientId || !doctorName || !appointmentDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_name, appointment_date, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, doctorName, appointmentDate, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// List appointments
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, p.first_name, p.last_name FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       ORDER BY appointment_date DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

export default router;