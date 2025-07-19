from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from enum import Enum
import base64
import json

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
app = FastAPI(title="Advanced Hospital Management System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    RECEPTIONIST = "receptionist"
    PATIENT = "patient"
    LAB_TECHNICIAN = "lab_technician"
    PHARMACIST = "pharmacist"

class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    IN_PROGRESS = "in_progress"

class InventoryCategory(str, Enum):
    MEDICATION = "medication"
    EQUIPMENT = "equipment"
    SUPPLIES = "supplies"
    LAB_SUPPLIES = "lab_supplies"

class BillStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class LabTestStatus(str, Enum):
    ORDERED = "ordered"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class NotificationType(str, Enum):
    APPOINTMENT_REMINDER = "appointment_reminder"
    APPOINTMENT_CANCELLED = "appointment_cancelled"
    LAB_RESULT_READY = "lab_result_ready"
    BILL_DUE = "bill_due"
    LOW_STOCK = "low_stock"
    EMERGENCY = "emergency"

class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

# Enhanced Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    emergency_contact: Optional[str] = None
    avatar: Optional[str] = None  # Base64 image
    department: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    emergency_contact: Optional[str] = None
    department: Optional[str] = None

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
    rating: float = 0.0
    total_reviews: int = 0
    bio: Optional[str] = None
    certifications: List[str] = []
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
    bio: Optional[str] = None
    certifications: List[str] = []

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    doctor_id: str
    appointment_date: datetime
    duration_minutes: int = 30
    reason: str
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    notes: Optional[str] = None
    priority: Priority = Priority.NORMAL
    telemedicine: bool = False
    meeting_link: Optional[str] = None
    attachments: List[Dict[str, Any]] = []  # Medical documents
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: datetime
    reason: str
    notes: Optional[str] = None
    priority: Priority = Priority.NORMAL
    telemedicine: bool = False

class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    meeting_link: Optional[str] = None

class MedicalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    doctor_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    symptoms: List[str]
    treatment: str
    prescriptions: List[Dict[str, Any]]  # [{"medication": "name", "dosage": "info", "frequency": "info"}]
    vital_signs: Optional[Dict[str, Any]] = None  # {"blood_pressure": "120/80", "temperature": "98.6", etc.}
    lab_results: Optional[List[Dict[str, Any]]] = None
    attachments: List[Dict[str, Any]] = []  # Medical images, reports
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MedicalRecordCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    diagnosis: str
    symptoms: List[str]
    treatment: str
    prescriptions: List[Dict[str, Any]]
    vital_signs: Optional[Dict[str, Any]] = None
    lab_results: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None

class LabTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    doctor_id: str
    test_name: str
    test_category: str
    description: Optional[str] = None
    status: LabTestStatus = LabTestStatus.ORDERED
    sample_collected_at: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None
    results_file: Optional[str] = None  # Base64 encoded file
    technician_id: Optional[str] = None
    priority: Priority = Priority.NORMAL
    notes: Optional[str] = None
    reference_ranges: Optional[Dict[str, str]] = None
    ordered_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class LabTestCreate(BaseModel):
    patient_id: str
    test_name: str
    test_category: str
    description: Optional[str] = None
    priority: Priority = Priority.NORMAL
    notes: Optional[str] = None
    reference_ranges: Optional[Dict[str, str]] = None

class LabTestUpdate(BaseModel):
    status: Optional[LabTestStatus] = None
    sample_collected_at: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None
    results_file: Optional[str] = None
    notes: Optional[str] = None

class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: InventoryCategory
    quantity: int
    unit: str  # "pieces", "bottles", "boxes", etc.
    minimum_threshold: int
    supplier: Optional[str] = None
    cost_per_unit: float
    expiry_date: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    barcode: Optional[str] = None
    batch_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InventoryItemCreate(BaseModel):
    name: str
    category: InventoryCategory
    quantity: int
    unit: str
    minimum_threshold: int
    supplier: Optional[str] = None
    cost_per_unit: float
    expiry_date: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    barcode: Optional[str] = None
    batch_number: Optional[str] = None

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None

class Bill(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    appointment_id: Optional[str] = None
    items: List[Dict[str, Any]]  # [{"description": "Consultation", "amount": 250.0}]
    subtotal: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    status: BillStatus = BillStatus.PENDING
    due_date: datetime
    paid_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BillCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    items: List[Dict[str, Any]]
    tax_rate: float = 0.1  # 10% tax by default
    discount_amount: float = 0.0

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: NotificationType
    priority: Priority = Priority.NORMAL
    read: bool = False
    data: Optional[Dict[str, Any]] = None  # Additional data for the notification
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: NotificationType
    priority: Priority = Priority.NORMAL
    data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None

class SearchQuery(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = {}
    sort_by: Optional[str] = None
    sort_order: str = "desc"  # "asc" or "desc"

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

async def create_notification(notification_data: NotificationCreate):
    """Helper function to create notifications"""
    notification = Notification(**notification_data.dict())
    await db.notifications.insert_one(notification.dict())
    return notification

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
    
    # Create welcome notification
    await create_notification(NotificationCreate(
        user_id=user_obj.id,
        title="Welcome to Hospital Management System",
        message=f"Welcome {user_obj.name}! Your account has been created successfully.",
        type=NotificationType.APPOINTMENT_REMINDER,
        priority=Priority.NORMAL
    ))
    
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
    
    # Update last login
    await db.users.update_one(
        {"email": user_credentials.email},
        {"$set": {"last_login": datetime.utcnow()}}
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

# File Upload endpoint
@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Read file content and convert to base64
    content = await file.read()
    base64_content = base64.b64encode(content).decode('utf-8')
    
    file_data = {
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "content": base64_content,
        "uploaded_by": current_user.id,
        "uploaded_at": datetime.utcnow()
    }
    
    await db.files.insert_one(file_data)
    
    return {
        "file_id": file_data["id"],
        "filename": file_data["filename"],
        "size": file_data["size"],
        "content_type": file_data["content_type"]
    }

# Search endpoint
@api_router.post("/search")
async def search(
    search_query: SearchQuery,
    current_user: User = Depends(get_current_user)
):
    results = {}
    query = search_query.query.lower()
    
    # Search patients (for authorized roles)
    if current_user.role in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST]:
        patients = await db.users.find({
            "role": "patient",
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}},
                {"phone": {"$regex": query, "$options": "i"}}
            ]
        }).to_list(50)
        results["patients"] = [{"id": p["id"], "name": p["name"], "email": p["email"], "phone": p.get("phone")} for p in patients]
    
    # Search doctors
    doctors = await db.users.find({
        "role": "doctor",
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"department": {"$regex": query, "$options": "i"}}
        ]
    }).to_list(50)
    results["doctors"] = [{"id": d["id"], "name": d["name"], "department": d.get("department")} for d in doctors]
    
    # Search appointments (role-based)
    if current_user.role == UserRole.PATIENT:
        appointments = await db.appointments.find({
            "patient_id": current_user.id,
            "$or": [
                {"reason": {"$regex": query, "$options": "i"}},
                {"notes": {"$regex": query, "$options": "i"}}
            ]
        }).to_list(50)
    else:
        appointments = await db.appointments.find({
            "$or": [
                {"reason": {"$regex": query, "$options": "i"}},
                {"notes": {"$regex": query, "$options": "i"}}
            ]
        }).to_list(50)
    
    results["appointments"] = appointments
    
    # Search inventory (for authorized roles)
    if current_user.role in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHARMACIST]:
        inventory = await db.inventory.find({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"supplier": {"$regex": query, "$options": "i"}}
            ]
        }).to_list(50)
        results["inventory"] = inventory
    
    return results

# Enhanced Doctor routes
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
async def get_all_doctors(
    specialization: Optional[str] = Query(None),
    available_today: Optional[bool] = Query(None)
):
    filter_query = {}
    
    doctors = await db.doctors.find(filter_query).to_list(1000)
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
                "consultation_fee": doctor["consultation_fee"],
                "rating": doctor.get("rating", 0.0),
                "total_reviews": doctor.get("total_reviews", 0),
                "bio": doctor.get("bio"),
                "certifications": doctor.get("certifications", [])
            }
            
            # Filter by specialization if provided
            if specialization and specialization.lower() not in doctor_info["specialization"].lower():
                continue
            
            # Filter by availability if requested
            if available_today:
                today = datetime.now().strftime("%A").lower()
                if today not in [day.lower() for day in doctor["available_days"]]:
                    continue
            
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

# Enhanced Appointment routes
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
    
    # Generate telemedicine link if requested
    if appointment_data.telemedicine:
        appointment_dict["meeting_link"] = f"https://meet.hospital.com/room/{str(uuid.uuid4())}"
    
    appointment_obj = Appointment(**appointment_dict)
    
    await db.appointments.insert_one(appointment_obj.dict())
    
    # Create notification for doctor
    doctor_user = await db.users.find_one({"id": doctor["user_id"]})
    if doctor_user:
        await create_notification(NotificationCreate(
            user_id=doctor_user["id"],
            title="New Appointment Booked",
            message=f"New appointment booked by {current_user.name} for {appointment_data.appointment_date.strftime('%Y-%m-%d %H:%M')}",
            type=NotificationType.APPOINTMENT_REMINDER,
            priority=appointment_data.priority,
            data={"appointment_id": appointment_obj.id}
        ))
    
    return appointment_obj

@api_router.get("/appointments/my", response_model=List[dict])
async def get_my_appointments(
    status: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user)
):
    filter_query = {}
    
    if current_user.role == UserRole.PATIENT:
        filter_query["patient_id"] = current_user.id
    elif current_user.role == UserRole.DOCTOR:
        doctor = await db.doctors.find_one({"user_id": current_user.id})
        if not doctor:
            return []
        filter_query["doctor_id"] = doctor["id"]
    
    # Apply filters
    if status:
        filter_query["status"] = status
    
    if start_date and end_date:
        filter_query["appointment_date"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    appointments = await db.appointments.find(filter_query).to_list(1000)
    
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
            "priority": appointment.get("priority", "normal"),
            "notes": appointment.get("notes"),
            "telemedicine": appointment.get("telemedicine", False),
            "meeting_link": appointment.get("meeting_link"),
            "patient_name": patient["name"] if patient else "Unknown",
            "patient_id": appointment["patient_id"],
            "doctor_name": doctor_user["name"] if doctor_user else "Unknown",
            "doctor_specialization": doctor["specialization"] if doctor else "Unknown",
            "created_at": appointment["created_at"]
        }
        result.append(appointment_info)
    
    # Sort by appointment date
    result.sort(key=lambda x: x["appointment_date"], reverse=True)
    return result

@api_router.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    current_user: User = Depends(get_current_user)
):
    # Check if appointment exists
    appointment = await db.appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check if user has permission to update
    if current_user.role == UserRole.PATIENT and appointment["patient_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own appointments"
        )
    elif current_user.role == UserRole.DOCTOR:
        doctor = await db.doctors.find_one({"user_id": current_user.id})
        if not doctor or appointment["doctor_id"] != doctor["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own appointments"
            )
    elif current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Update appointment
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    if update_dict:
        await db.appointments.update_one({"id": appointment_id}, {"$set": update_dict})
    
    updated_appointment = await db.appointments.find_one({"id": appointment_id})
    return Appointment(**updated_appointment)

# Medical Records routes
@api_router.post("/medical-records", response_model=MedicalRecord)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.DOCTOR, UserRole.NURSE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and nurses can create medical records"
        )
    
    record_dict = record_data.dict()
    record_dict["doctor_id"] = current_user.id
    record_obj = MedicalRecord(**record_dict)
    
    await db.medical_records.insert_one(record_obj.dict())
    
    # Create notification for patient
    await create_notification(NotificationCreate(
        user_id=record_data.patient_id,
        title="New Medical Record Added",
        message=f"A new medical record has been added to your profile by Dr. {current_user.name}",
        type=NotificationType.LAB_RESULT_READY,
        priority=Priority.NORMAL,
        data={"record_id": record_obj.id}
    ))
    
    return record_obj

@api_router.get("/medical-records/patient/{patient_id}", response_model=List[MedicalRecord])
async def get_patient_medical_records(
    patient_id: str,
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if current_user.role == UserRole.PATIENT and current_user.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own medical records"
        )
    elif current_user.role not in [UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN, UserRole.PATIENT]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    records = await db.medical_records.find({"patient_id": patient_id}).sort("created_at", -1).to_list(1000)
    return [MedicalRecord(**record) for record in records]

# Lab Tests routes
@api_router.post("/lab-tests", response_model=LabTest)
async def create_lab_test(
    test_data: LabTestCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.DOCTOR, UserRole.NURSE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and nurses can order lab tests"
        )
    
    test_dict = test_data.dict()
    test_dict["doctor_id"] = current_user.id
    test_obj = LabTest(**test_dict)
    
    await db.lab_tests.insert_one(test_obj.dict())
    
    # Create notification for patient
    await create_notification(NotificationCreate(
        user_id=test_data.patient_id,
        title="Lab Test Ordered",
        message=f"A new lab test ({test_data.test_name}) has been ordered for you",
        type=NotificationType.LAB_RESULT_READY,
        priority=test_data.priority,
        data={"test_id": test_obj.id}
    ))
    
    return test_obj

@api_router.get("/lab-tests", response_model=List[dict])
async def get_lab_tests(
    patient_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    filter_query = {}
    
    if current_user.role == UserRole.PATIENT:
        filter_query["patient_id"] = current_user.id
    elif patient_id and current_user.role in [UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECHNICIAN, UserRole.ADMIN]:
        filter_query["patient_id"] = patient_id
    
    if status:
        filter_query["status"] = status
    
    tests = await db.lab_tests.find(filter_query).sort("ordered_at", -1).to_list(1000)
    
    result = []
    for test in tests:
        # Get patient and doctor info
        patient = await db.users.find_one({"id": test["patient_id"]})
        doctor = await db.users.find_one({"id": test["doctor_id"]})
        
        test_info = {
            **test,
            "patient_name": patient["name"] if patient else "Unknown",
            "doctor_name": doctor["name"] if doctor else "Unknown"
        }
        result.append(test_info)
    
    return result

@api_router.put("/lab-tests/{test_id}", response_model=LabTest)
async def update_lab_test(
    test_id: str,
    update_data: LabTestUpdate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.LAB_TECHNICIAN, UserRole.DOCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only lab technicians, doctors, and admins can update lab tests"
        )
    
    test = await db.lab_tests.find_one({"id": test_id})
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab test not found"
        )
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    # Set completion time if status is completed
    if update_data.status == LabTestStatus.COMPLETED:
        update_dict["completed_at"] = datetime.utcnow()
        update_dict["technician_id"] = current_user.id
        
        # Create notification for patient
        await create_notification(NotificationCreate(
            user_id=test["patient_id"],
            title="Lab Results Ready",
            message=f"Your lab test results for {test['test_name']} are now available",
            type=NotificationType.LAB_RESULT_READY,
            priority=Priority.HIGH,
            data={"test_id": test_id}
        ))
    
    if update_dict:
        await db.lab_tests.update_one({"id": test_id}, {"$set": update_dict})
    
    updated_test = await db.lab_tests.find_one({"id": test_id})
    return LabTest(**updated_test)

# Enhanced Inventory routes
@api_router.post("/inventory", response_model=InventoryItem)
async def create_inventory_item(
    item_data: InventoryItemCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.NURSE, UserRole.PHARMACIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins, nurses, and pharmacists can manage inventory"
        )
    
    item_obj = InventoryItem(**item_data.dict())
    await db.inventory.insert_one(item_obj.dict())
    return item_obj

@api_router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory(
    category: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    expiring_soon: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PHARMACIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view inventory"
        )
    
    filter_query = {}
    
    if category:
        filter_query["category"] = category
    
    if low_stock:
        filter_query["$expr"] = {"$lte": ["$quantity", "$minimum_threshold"]}
    
    if expiring_soon:
        # Items expiring in next 30 days
        thirty_days_from_now = datetime.utcnow() + timedelta(days=30)
        filter_query["expiry_date"] = {
            "$lte": thirty_days_from_now,
            "$gte": datetime.utcnow()
        }
    
    items = await db.inventory.find(filter_query).sort("name", 1).to_list(1000)
    return [InventoryItem(**item) for item in items]

@api_router.put("/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(
    item_id: str,
    update_data: InventoryUpdate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.NURSE, UserRole.PHARMACIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins, nurses, and pharmacists can update inventory"
        )
    
    # Check if item exists
    item = await db.inventory.find_one({"id": item_id})
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Update item
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    if update_dict:
        await db.inventory.update_one({"id": item_id}, {"$set": update_dict})
    
    updated_item = await db.inventory.find_one({"id": item_id})
    
    # Check if item is now low stock and create notification
    if updated_item["quantity"] <= updated_item["minimum_threshold"]:
        # Create notification for admins
        admins = await db.users.find({"role": "admin"}).to_list(100)
        for admin in admins:
            await create_notification(NotificationCreate(
                user_id=admin["id"],
                title="Low Stock Alert",
                message=f"{updated_item['name']} is running low (Current: {updated_item['quantity']}, Min: {updated_item['minimum_threshold']})",
                type=NotificationType.LOW_STOCK,
                priority=Priority.HIGH,
                data={"item_id": item_id}
            ))
    
    return InventoryItem(**updated_item)

@api_router.get("/inventory/low-stock", response_model=List[InventoryItem])
async def get_low_stock_items(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.NURSE, UserRole.PHARMACIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Find items where quantity <= minimum_threshold
    items = await db.inventory.find({
        "$expr": {"$lte": ["$quantity", "$minimum_threshold"]}
    }).to_list(1000)
    
    return [InventoryItem(**item) for item in items]

# Enhanced Billing routes
@api_router.post("/bills", response_model=Bill)
async def create_bill(
    bill_data: BillCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and receptionists can create bills"
        )
    
    # Calculate amounts
    subtotal = sum(item.get("amount", 0) for item in bill_data.items)
    tax_amount = subtotal * bill_data.tax_rate
    total_amount = subtotal + tax_amount - bill_data.discount_amount
    
    # Set due date (30 days from now)
    due_date = datetime.utcnow() + timedelta(days=30)
    
    bill_dict = bill_data.dict()
    del bill_dict["tax_rate"]  # Remove tax_rate as it's not in the model
    
    bill_obj = Bill(
        **bill_dict,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        due_date=due_date
    )
    
    await db.bills.insert_one(bill_obj.dict())
    
    # Create notification for patient
    await create_notification(NotificationCreate(
        user_id=bill_data.patient_id,
        title="New Bill Generated",
        message=f"A new bill for ${total_amount:.2f} has been generated for your account",
        type=NotificationType.BILL_DUE,
        priority=Priority.NORMAL,
        data={"bill_id": bill_obj.id}
    ))
    
    return bill_obj

@api_router.get("/bills/patient/{patient_id}", response_model=List[Bill])
async def get_patient_bills(
    patient_id: str,
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if current_user.role == UserRole.PATIENT and current_user.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own bills"
        )
    elif current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    filter_query = {"patient_id": patient_id}
    if status:
        filter_query["status"] = status
    
    bills = await db.bills.find(filter_query).sort("created_at", -1).to_list(1000)
    return [Bill(**bill) for bill in bills]

@api_router.put("/bills/{bill_id}/pay")
async def pay_bill(
    bill_id: str,
    payment_method: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and receptionists can process payments"
        )
    
    # Check if bill exists
    bill = await db.bills.find_one({"id": bill_id})
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )
    
    # Update bill status
    await db.bills.update_one(
        {"id": bill_id},
        {
            "$set": {
                "status": BillStatus.PAID,
                "paid_date": datetime.utcnow(),
                "payment_method": payment_method
            }
        }
    )
    
    # Create notification for patient
    await create_notification(NotificationCreate(
        user_id=bill["patient_id"],
        title="Payment Received",
        message=f"Payment of ${bill['total_amount']:.2f} has been received via {payment_method}",
        type=NotificationType.BILL_DUE,
        priority=Priority.NORMAL,
        data={"bill_id": bill_id}
    ))
    
    return {"message": "Payment processed successfully"}

# Notifications routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(
    unread_only: Optional[bool] = Query(False),
    current_user: User = Depends(get_current_user)
):
    filter_query = {"user_id": current_user.id}
    
    if unread_only:
        filter_query["read"] = False
    
    # Also filter out expired notifications
    filter_query["$or"] = [
        {"expires_at": {"$gte": datetime.utcnow()}},
        {"expires_at": None}
    ]
    
    notifications = await db.notifications.find(filter_query).sort("created_at", -1).limit(100).to_list(100)
    return [Notification(**notification) for notification in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    # Check if notification belongs to user
    notification = await db.notifications.find_one({
        "id": notification_id,
        "user_id": current_user.id
    })
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"read": True}}
    )
    
    return {"message": "Notification marked as read"}

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
        
        # Additional admin stats
        total_revenue = 0
        bills = await db.bills.find({"status": BillStatus.PAID}).to_list(1000)
        total_revenue = sum(bill["total_amount"] for bill in bills)
        
        pending_bills = await db.bills.count_documents({"status": BillStatus.PENDING})
        low_stock_items = await db.inventory.count_documents({
            "$expr": {"$lte": ["$quantity", "$minimum_threshold"]}
        })
        
        # Lab tests stats
        pending_lab_tests = await db.lab_tests.count_documents({"status": LabTestStatus.ORDERED})
        completed_lab_tests = await db.lab_tests.count_documents({"status": LabTestStatus.COMPLETED})
        
        stats = {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "today_appointments": today_appointments,
            "total_revenue": total_revenue,
            "pending_bills": pending_bills,
            "low_stock_items": low_stock_items,
            "pending_lab_tests": pending_lab_tests,
            "completed_lab_tests": completed_lab_tests
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
            my_patients = len(set([
                app["patient_id"] for app in await db.appointments.find({"doctor_id": doctor["id"]}).to_list(1000)
            ]))
            
            my_lab_tests = await db.lab_tests.count_documents({"doctor_id": current_user.id})
            
            stats = {
                "my_appointments": my_appointments,
                "today_appointments": today_appointments,
                "my_patients": my_patients,
                "my_lab_tests": my_lab_tests
            }
    elif current_user.role == UserRole.PATIENT:
        my_appointments = await db.appointments.count_documents({"patient_id": current_user.id})
        upcoming_appointments = await db.appointments.count_documents({
            "patient_id": current_user.id,
            "appointment_date": {"$gte": datetime.now()},
            "status": AppointmentStatus.SCHEDULED
        })
        my_bills = await db.bills.count_documents({"patient_id": current_user.id})
        pending_bills = await db.bills.count_documents({
            "patient_id": current_user.id,
            "status": BillStatus.PENDING
        })
        
        my_lab_tests = await db.lab_tests.count_documents({"patient_id": current_user.id})
        pending_lab_tests = await db.lab_tests.count_documents({
            "patient_id": current_user.id,
            "status": {"$in": [LabTestStatus.ORDERED, LabTestStatus.IN_PROGRESS]}
        })
        
        stats = {
            "my_appointments": my_appointments,
            "upcoming_appointments": upcoming_appointments,
            "my_bills": my_bills,
            "pending_bills": pending_bills,
            "my_lab_tests": my_lab_tests,
            "pending_lab_tests": pending_lab_tests
        }
    elif current_user.role == UserRole.LAB_TECHNICIAN:
        pending_tests = await db.lab_tests.count_documents({"status": LabTestStatus.ORDERED})
        in_progress_tests = await db.lab_tests.count_documents({"status": LabTestStatus.IN_PROGRESS})
        completed_today = await db.lab_tests.count_documents({
            "status": LabTestStatus.COMPLETED,
            "completed_at": {
                "$gte": datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
                "$lt": datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
            }
        })
        
        stats = {
            "pending_tests": pending_tests,
            "in_progress_tests": in_progress_tests,
            "completed_today": completed_today
        }
    
    return stats

# Analytics endpoint
@api_router.get("/analytics")
async def get_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.DOCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and doctors can access analytics"
        )
    
    # Default to last 30 days if no dates provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Appointments analytics
    appointments_by_day = await db.appointments.aggregate([
        {
            "$match": {
                "appointment_date": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$appointment_date"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]).to_list(100)
    
    # Revenue analytics (admin only)
    revenue_data = []
    if current_user.role == UserRole.ADMIN:
        revenue_by_day = await db.bills.aggregate([
            {
                "$match": {
                    "status": BillStatus.PAID,
                    "paid_date": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$paid_date"}},
                    "total": {"$sum": "$total_amount"}
                }
            },
            {"$sort": {"_id": 1}}
        ]).to_list(100)
        revenue_data = revenue_by_day
    
    # Lab tests analytics
    lab_tests_by_status = await db.lab_tests.aggregate([
        {
            "$match": {
                "ordered_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]).to_list(100)
    
    return {
        "appointments_by_day": appointments_by_day,
        "revenue_by_day": revenue_data,
        "lab_tests_by_status": lab_tests_by_status,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }

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