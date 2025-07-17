import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import patientRoutes from "./routes/patients";
import authRoutes from "./routes/auth";
import appointmentRoutes from "./routes/appointments";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.send("Hospital Management API");
});

app.use("/api/patients", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server listening on port ${PORT}`);
});