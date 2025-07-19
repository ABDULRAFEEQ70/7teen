from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = "your-secret-key-here"  # In production, use a secure random key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Hospital Management System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    RECEPTIONIST = "receptionist"
    PATIENT = "patient"

class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Doctor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    specialization: str
    license_number: str
    experience_years: int
    qualification: str
    available_from: str  # HH:MM format
    available_to: str    # HH:MM format
    available_days: List[str]  # ["monday", "tuesday", etc.]
    consultation_fee: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DoctorCreate(BaseModel):
    specialization: str
    license_number: str
    experience_years: int
    qualification: str
    available_from: str
    available_to: str
    available_days: List[str]
    consultation_fee: float

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    doctor_id: str
    appointment_date: datetime
    duration_minutes: int = 30
    reason: str
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: datetime
    reason: str
    notes: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return User(**user)

# Authentication routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    user_obj = User(**user_dict)
    
    # Store user with hashed password
    user_doc = user_obj.dict()
    user_doc["hashed_password"] = hashed_password
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_obj.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj
    }

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(**user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj
    }

# Doctor routes
@api_router.post("/doctors/profile", response_model=Doctor)
async def create_doctor_profile(
    doctor_data: DoctorCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create doctor profiles"
        )
    
    # Check if doctor profile already exists
    existing_doctor = await db.doctors.find_one({"user_id": current_user.id})
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor profile already exists"
        )
    
    doctor_dict = doctor_data.dict()
    doctor_dict["user_id"] = current_user.id
    doctor_obj = Doctor(**doctor_dict)
    
    await db.doctors.insert_one(doctor_obj.dict())
    return doctor_obj

@api_router.get("/doctors", response_model=List[dict])
async def get_all_doctors():
    doctors = await db.doctors.find().to_list(1000)
    result = []
    
    for doctor in doctors:
        user = await db.users.find_one({"id": doctor["user_id"]})
        if user:
            doctor_info = {
                "id": doctor["id"],
                "name": user["name"],
                "specialization": doctor["specialization"],
                "experience_years": doctor["experience_years"],
                "qualification": doctor["qualification"],
                "available_from": doctor["available_from"],
                "available_to": doctor["available_to"],
                "available_days": doctor["available_days"],
                "consultation_fee": doctor["consultation_fee"]
            }
            result.append(doctor_info)
    
    return result

@api_router.get("/doctors/me", response_model=Doctor)
async def get_my_doctor_profile(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access doctor profiles"
        )
    
    doctor = await db.doctors.find_one({"user_id": current_user.id})
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    
    return Doctor(**doctor)

# Appointment routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can book appointments"
        )
    
    # Check if doctor exists
    doctor = await db.doctors.find_one({"id": appointment_data.doctor_id})
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Check for conflicting appointments
    existing_appointment = await db.appointments.find_one({
        "doctor_id": appointment_data.doctor_id,
        "appointment_date": appointment_data.appointment_date,
        "status": {"$ne": AppointmentStatus.CANCELLED}
    })
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot is already booked"
        )
    
    appointment_dict = appointment_data.dict()
    appointment_dict["patient_id"] = current_user.id
    appointment_obj = Appointment(**appointment_dict)
    
    await db.appointments.insert_one(appointment_obj.dict())
    return appointment_obj

@api_router.get("/appointments/my", response_model=List[dict])
async def get_my_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.PATIENT:
        appointments = await db.appointments.find({"patient_id": current_user.id}).to_list(1000)
    elif current_user.role == UserRole.DOCTOR:
        doctor = await db.doctors.find_one({"user_id": current_user.id})
        if not doctor:
            return []
        appointments = await db.appointments.find({"doctor_id": doctor["id"]}).to_list(1000)
    else:
        appointments = await db.appointments.find().to_list(1000)
    
    result = []
    for appointment in appointments:
        # Get patient info
        patient = await db.users.find_one({"id": appointment["patient_id"]})
        # Get doctor info
        doctor = await db.doctors.find_one({"id": appointment["doctor_id"]})
        doctor_user = await db.users.find_one({"id": doctor["user_id"]}) if doctor else None
        
        appointment_info = {
            "id": appointment["id"],
            "appointment_date": appointment["appointment_date"],
            "reason": appointment["reason"],
            "status": appointment["status"],
            "notes": appointment.get("notes"),
            "patient_name": patient["name"] if patient else "Unknown",
            "doctor_name": doctor_user["name"] if doctor_user else "Unknown",
            "doctor_specialization": doctor["specialization"] if doctor else "Unknown"
        }
        result.append(appointment_info)
    
    return result

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    stats = {}
    
    if current_user.role == UserRole.ADMIN:
        total_patients = await db.users.count_documents({"role": UserRole.PATIENT})
        total_doctors = await db.users.count_documents({"role": UserRole.DOCTOR})
        total_appointments = await db.appointments.count_documents({})
        today_appointments = await db.appointments.count_documents({
            "appointment_date": {
                "$gte": datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
                "$lt": datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
            }
        })
        
        stats = {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "today_appointments": today_appointments
        }
    elif current_user.role == UserRole.DOCTOR:
        doctor = await db.doctors.find_one({"user_id": current_user.id})
        if doctor:
            my_appointments = await db.appointments.count_documents({"doctor_id": doctor["id"]})
            today_appointments = await db.appointments.count_documents({
                "doctor_id": doctor["id"],
                "appointment_date": {
                    "$gte": datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
                    "$lt": datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
                }
            })
            stats = {
                "my_appointments": my_appointments,
                "today_appointments": today_appointments
            }
    elif current_user.role == UserRole.PATIENT:
        my_appointments = await db.appointments.count_documents({"patient_id": current_user.id})
        upcoming_appointments = await db.appointments.count_documents({
            "patient_id": current_user.id,
            "appointment_date": {"$gte": datetime.now()},
            "status": AppointmentStatus.SCHEDULED
        })
        stats = {
            "my_appointments": my_appointments,
            "upcoming_appointments": upcoming_appointments
        }
    
    return stats

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()