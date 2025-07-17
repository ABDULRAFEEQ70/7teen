import { Router } from "express";
import pool from "../db";

const router = Router();

// Create a new patient
router.post("/", async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    email,
    address,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [firstName, lastName, dateOfBirth, gender, phone, email, address]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// List patients
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM patients ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

export default router;