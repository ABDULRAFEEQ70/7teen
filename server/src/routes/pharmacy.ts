import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// List prescriptions
router.get("/", authorize(["pharmacist", "doctor", "admin"]), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pr.*, p.first_name, p.last_name FROM prescriptions pr
       JOIN patients p ON p.id = pr.patient_id
       ORDER BY pr.created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

// Create prescription (doctor)
router.post("/", authorize(["doctor"]), async (req, res) => {
  const { patientId, drugName, dosage, instructions } = req.body;
  if (!patientId || !drugName) return res.status(400).json({ error: "Missing" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO prescriptions (patient_id, drug_name, dosage, instructions)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [patientId, drugName, dosage, instructions]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

// Dispense prescription (pharmacist)
router.post("/:id/dispense", authorize(["pharmacist"]), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE prescriptions SET status='dispensed', dispensed_at=now() WHERE id=$1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

export default router;