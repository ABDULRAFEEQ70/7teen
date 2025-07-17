import { Router } from "express";
import pool from "../db";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// List inventory
router.get("/", authorize(["admin", "pharmacist"]), async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM inventory ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

// Add item
router.post("/", authorize(["admin", "pharmacist"]), async (req, res) => {
  const { name, quantity, unit, threshold } = req.body;
  if (!name || quantity == null) return res.status(400).json({ error: "Missing" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO inventory (name, quantity, unit, threshold)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, quantity, unit, threshold]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

// Update quantity
router.put("/:id", authorize(["admin", "pharmacist"]), async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE inventory SET quantity=$1 WHERE id=$2 RETURNING *`,
      [quantity, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

export default router;