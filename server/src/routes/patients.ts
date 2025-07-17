import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";
import { parsePagination } from "../utils/pagination";
import { body, validationResult } from "express-validator";

const router = Router();

// Apply authentication to all routes in this router
router.use(authenticate);

// Create a new patient
router.post(
  "/",
  authorize(["admin", "receptionist"]),
  [
    body("firstName").isLength({ min: 2 }),
    body("lastName").isLength({ min: 2 }),
    body("dateOfBirth").isISO8601().toDate(),
    body("gender").isIn(["Male", "Female", "Other"]),
    body("phone").notEmpty(),
    body("email").optional().isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
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
router.get("/", async (req, res) => {
  try {
    const { limit, offset, q } = parsePagination(req.query);
    const searchParam = `%${q}%`;
    const totalResult = await pool.query(
      `SELECT count(*) FROM patients WHERE ($1 = '%%' OR first_name ILIKE $1 OR last_name ILIKE $1)` ,
      [searchParam]
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    const { rows } = await pool.query(
      `SELECT * FROM patients WHERE ($1 = '%%' OR first_name ILIKE $1 OR last_name ILIKE $1)
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [searchParam, limit, offset]
    );
    res.setHeader("X-Total-Count", total.toString());
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

export default router;