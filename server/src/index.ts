import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import patientRoutes from "./routes/patients";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.send("Hospital Management API");
});

app.use("/api/patients", patientRoutes);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server listening on port ${PORT}`);
});