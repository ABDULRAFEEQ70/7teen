# Hospital Management System

A comprehensive, responsive web application for managing hospital operations including patient management, doctor scheduling, appointment booking, medical records, inventory management, and billing.

## 🏥 Features

### Core Functionality
- **User Authentication & Authorization** - Role-based access control for different user types
- **Dashboard** - Real-time overview of hospital operations
- **Patient Management** - Complete patient profiles with medical history
- **Doctor Management** - Doctor profiles, specializations, and schedules
- **Appointment Booking** - Online appointment scheduling with availability checking
- **Medical Records** - Digital medical record management with secure access
- **Inventory Management** - Track medical supplies, equipment, and medications
- **Billing System** - Generate bills, process payments, and manage insurance claims
- **Real-time Notifications** - WebSocket-based real-time updates

### User Roles
- **Admin** - Full system access and management
- **Doctor** - Patient records, appointments, medical records
- **Nurse** - Patient care, inventory management, medical records
- **Receptionist** - Appointment scheduling, patient registration, billing
- **Patient** - View own records, book appointments, view bills

### Technical Features
- **Responsive Design** - Mobile-first, works on all devices
- **Real-time Updates** - Socket.IO for live notifications
- **Secure Authentication** - JWT-based authentication with role management
- **Modern UI** - Beautiful interface built with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **API Documentation** - RESTful API with comprehensive endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hospital-management-system.git
   cd hospital-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hospital_management
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community

   # On Ubuntu/Debian
   sudo systemctl start mongod

   # On Windows
   net start MongoDB
   ```

5. **Seed the database** (Optional but recommended for demo)
   ```bash
   cd server
   npm run seed
   ```
   
   This will create sample data including demo users with the following credentials:
   - **Admin**: admin@hospital.com / admin123
   - **Doctor**: sarah.johnson@hospital.com / doctor123
   - **Nurse**: jennifer.williams@hospital.com / nurse123
   - **Receptionist**: lisa.brown@hospital.com / reception123
   - **Patient**: alice.miller@email.com / patient123

6. **Start the application**
   ```bash
   # From the root directory, start both server and client
   npm run dev
   ```
   
   Or start them separately:
   ```bash
   # Terminal 1 - Start the server
   cd server && npm run dev
   
   # Terminal 2 - Start the client
   cd client && npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Nodemailer** - Email notifications
- **Multer** - File uploads

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time updates

## 📁 Project Structure

```
hospital-management-system/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # UI components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── patients/      # Patient management
│   │   │   ├── doctors/       # Doctor management
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── medical-records/ # Medical records
│   │   │   ├── inventory/     # Inventory management
│   │   │   └── billing/       # Billing system
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions and API
│   │   └── App.tsx            # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── server/                    # Node.js backend
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   ├── seedData.js            # Database seeding script
│   ├── .env                   # Environment variables
│   └── index.js               # Server entry point
├── package.json               # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/:id/appointments` - Get patient appointments
- `GET /api/patients/:id/medical-records` - Get patient medical records

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/doctor/:doctorId/availability` - Check doctor availability

### Medical Records
- `GET /api/medical-records` - Get medical records
- `POST /api/medical-records` - Create medical record
- `PUT /api/medical-records/:id` - Update medical record

### Inventory
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Billing
- `GET /api/billing` - Get bills
- `POST /api/billing` - Create bill
- `PUT /api/billing/:id` - Update bill
- `POST /api/billing/:id/payment` - Add payment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Authorization** - Granular permission system
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Cross-origin request protection
- **Rate Limiting** - API rate limiting (can be implemented)
- **Data Sanitization** - Prevent NoSQL injection attacks

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** - Full-featured experience
- **Tablet** - Optimized layout for medium screens
- **Mobile** - Touch-friendly interface for smartphones

## 🚀 Deployment

### Environment Setup
1. Set up a MongoDB instance (MongoDB Atlas recommended for production)
2. Configure environment variables for production
3. Set up email service (Gmail, SendGrid, etc.)

### Frontend Deployment (Netlify/Vercel)
```bash
cd client
npm run build
# Deploy the build folder
```

### Backend Deployment (Heroku/Railway/DigitalOcean)
```bash
cd server
# Set environment variables
# Deploy using your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you discover any bugs, please create an issue [here](https://github.com/yourusername/hospital-management-system/issues) with:
- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📧 Support

For support, email support@hospitalmanagement.com or join our Slack channel.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)

---

Made with ❤️ for better healthcare management