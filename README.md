# Hospital Management System – Patient Registration Module

This repository contains a minimal yet production-ready starter for a hospital management system. It currently implements **Patient Registration** as the first core module.

## Project Structure

```
client/   → React 18 + TypeScript front-end (Vite)
server/   → Node.js + Express back-end (TypeScript)
```

## Prerequisites

• Node.js ≥ 18.x  
• pnpm / npm / yarn  
• Docker (optional, for Postgres)  
• Postgres ≥ 14 (local or Docker-ised)

## Database Setup

1. Create a database named `hospital` (or change `DATABASE_URL` accordingly).
2. Run the SQL below to create the required table:

```sql
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  first_name  VARCHAR(80) NOT NULL,
  last_name   VARCHAR(80) NOT NULL,
  date_of_birth DATE      NOT NULL,
  gender      VARCHAR(10) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  email       VARCHAR(120),
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name VARCHAR(120) NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  staff_id INT NOT NULL REFERENCES staff(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

3. Copy `server/.env.example` to `server/.env` and edit `DATABASE_URL` if needed.

## Installing Dependencies

```
# From project root
cd server && npm install
cd ../client && npm install
```

## Running in Development

### Back-end

```
cd server
npm run dev
```

The API will be available at `http://localhost:4000`.

### Front-end

Open a new terminal tab:

```
cd client
npm run dev
```

The app will open at `http://localhost:3000` and proxy calls to the back-end.

## Next Steps

• Input validation & better error handling  
• Pagination / search for patient list  
• Authentication middleware (JWT)  
• Docker Compose for one-command startup  
• Additional modules (appointments, billing, etc.)

---
*Built with ❤️ by Cursor & ChatGPT.*