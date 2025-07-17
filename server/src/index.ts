import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import patientRoutes from "./routes/patients";
import authRoutes from "./routes/auth";
import appointmentRoutes from "./routes/appointments";
import staffRoutes from "./routes/staff";
import recordRoutes from "./routes/records";
import billingRoutes from "./routes/billing";

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
app.use("/api/staff", staffRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/billing", billingRoutes);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server listening on port ${PORT}`);
});