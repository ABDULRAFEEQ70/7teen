from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
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
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = "pharmacy-saas-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours for SaaS

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="PharmaCloud SaaS", description="Advanced Pharmacy Management Software as a Service", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"  # SaaS admin
    PHARMACY_OWNER = "pharmacy_owner"
    PHARMACY_MANAGER = "pharmacy_manager"
    PHARMACIST = "pharmacist"
    PHARMACY_TECHNICIAN = "pharmacy_technician"
    CASHIER = "cashier"
    CUSTOMER = "customer"

class SubscriptionPlan(str, Enum):
    STARTER = "starter"  # $29/month - 1 store, basic features
    PROFESSIONAL = "professional"  # $79/month - 3 stores, advanced features
    ENTERPRISE = "enterprise"  # $199/month - unlimited stores, all features

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"

class MedicineCategory(str, Enum):
    PRESCRIPTION = "prescription"
    OVER_COUNTER = "over_counter"
    CONTROLLED = "controlled"
    ANTIBIOTIC = "antibiotic"
    VACCINE = "vaccine"
    SUPPLEMENT = "supplement"

class PrescriptionStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    INSURANCE = "insurance"
    DIGITAL_WALLET = "digital_wallet"

class NotificationType(str, Enum):
    LOW_STOCK = "low_stock"
    EXPIRY_ALERT = "expiry_alert"
    PRESCRIPTION_READY = "prescription_ready"
    PAYMENT_DUE = "payment_due"
    SYSTEM_UPDATE = "system_update"

# Multi-tenant Models
class Tenant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subdomain: str
    subscription_plan: SubscriptionPlan
    subscription_status: SubscriptionStatus = SubscriptionStatus.TRIALING
    subscription_expires_at: datetime
    max_stores: int
    features_enabled: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class TenantCreate(BaseModel):
    name: str
    subdomain: str
    subscription_plan: SubscriptionPlan = SubscriptionPlan.STARTER

# User Management
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: Optional[str] = None  # None for super_admin
    email: EmailStr
    name: str
    role: UserRole
    phone: Optional[str] = None
    license_number: Optional[str] = None  # For pharmacists
    store_ids: List[str] = []  # Stores they have access to
    permissions: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    license_number: Optional[str] = None
    store_ids: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    subdomain: Optional[str] = None

# Store Management
class Store(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    license_number: str
    address: str
    phone: str
    email: str
    operating_hours: Dict[str, str] = {}  # {"monday": "9:00-18:00", ...}
    tax_rate: float = 0.08
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StoreCreate(BaseModel):
    name: str
    license_number: str
    address: str
    phone: str
    email: str
    operating_hours: Dict[str, str] = {}
    tax_rate: float = 0.08

# Medicine/Inventory Management
class Medicine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    store_id: str
    name: str
    brand_name: Optional[str] = None
    generic_name: str
    ndc_number: str  # National Drug Code
    category: MedicineCategory
    dosage_form: str  # tablet, capsule, syrup, etc.
    strength: str  # 500mg, 10ml, etc.
    manufacturer: str
    supplier_id: Optional[str] = None
    barcode: Optional[str] = None
    prescription_required: bool = True
    controlled_substance: bool = False
    dea_schedule: Optional[str] = None  # For controlled substances
    unit_cost: float
    selling_price: float
    quantity_in_stock: int
    min_stock_level: int
    max_stock_level: int
    expiry_date: datetime
    batch_number: str
    storage_conditions: Optional[str] = None
    side_effects: List[str] = []
    contraindications: List[str] = []
    interactions: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MedicineCreate(BaseModel):
    name: str
    brand_name: Optional[str] = None
    generic_name: str
    ndc_number: str
    category: MedicineCategory
    dosage_form: str
    strength: str
    manufacturer: str
    barcode: Optional[str] = None
    prescription_required: bool = True
    controlled_substance: bool = False
    dea_schedule: Optional[str] = None
    unit_cost: float
    selling_price: float
    quantity_in_stock: int
    min_stock_level: int
    max_stock_level: int
    expiry_date: datetime
    batch_number: str
    storage_conditions: Optional[str] = None
    side_effects: List[str] = []
    contraindications: List[str] = []
    interactions: List[str] = []

# Customer Management
class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: str
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    insurance_info: Optional[Dict[str, str]] = None
    allergies: List[str] = []
    medical_conditions: List[str] = []
    emergency_contact: Optional[Dict[str, str]] = None
    loyalty_points: int = 0
    total_spent: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: str
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    insurance_info: Optional[Dict[str, str]] = None
    allergies: List[str] = []
    medical_conditions: List[str] = []
    emergency_contact: Optional[Dict[str, str]] = None

# Prescription Management
class Prescription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    store_id: str
    customer_id: str
    doctor_name: str
    doctor_phone: Optional[str] = None
    doctor_license: Optional[str] = None
    prescription_number: str
    date_prescribed: datetime
    medications: List[Dict[str, Any]]  # List of prescribed medicines
    status: PrescriptionStatus = PrescriptionStatus.PENDING
    refills_allowed: int = 0
    refills_used: int = 0
    days_supply: int
    counseling_notes: Optional[str] = None
    pharmacist_id: Optional[str] = None
    filled_at: Optional[datetime] = None
    pickup_instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrescriptionCreate(BaseModel):
    customer_id: str
    doctor_name: str
    doctor_phone: Optional[str] = None
    doctor_license: Optional[str] = None
    date_prescribed: datetime
    medications: List[Dict[str, Any]]
    refills_allowed: int = 0
    days_supply: int
    counseling_notes: Optional[str] = None
    pickup_instructions: Optional[str] = None

# Sales/Orders Management
class Sale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    store_id: str
    customer_id: Optional[str] = None
    prescription_id: Optional[str] = None
    cashier_id: str
    items: List[Dict[str, Any]]  # List of sold items
    subtotal: float
    tax_amount: float
    discount_amount: float = 0.0
    insurance_coverage: float = 0.0
    total_amount: float
    amount_paid: float
    change_given: float = 0.0
    payment_method: PaymentMethod
    payment_reference: Optional[str] = None
    loyalty_points_earned: int = 0
    loyalty_points_used: int = 0
    receipt_number: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SaleCreate(BaseModel):
    customer_id: Optional[str] = None
    prescription_id: Optional[str] = None
    items: List[Dict[str, Any]]
    discount_amount: float = 0.0
    insurance_coverage: float = 0.0
    amount_paid: float
    payment_method: PaymentMethod
    payment_reference: Optional[str] = None
    loyalty_points_used: int = 0

# Supplier Management
class Supplier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    payment_terms: str
    discount_percentage: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    payment_terms: str
    discount_percentage: float = 0.0

# Purchase Order Management
class PurchaseOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    store_id: str
    supplier_id: str
    order_number: str
    items: List[Dict[str, Any]]
    subtotal: float
    tax_amount: float
    total_amount: float
    status: str = "pending"
    ordered_by: str
    expected_delivery: Optional[datetime] = None
    received_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    items: List[Dict[str, Any]]
    expected_delivery: Optional[datetime] = None

# Notifications
class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Token Model
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
    tenant: Optional[Tenant] = None

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
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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

async def get_current_tenant(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.SUPER_ADMIN:
        return None
    
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not associated with any tenant"
        )
    
    tenant = await db.tenants.find_one({"id": current_user.tenant_id})
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return Tenant(**tenant)

def check_subscription_limits(tenant: Tenant, feature: str = None):
    """Check if tenant has access to specific features based on subscription"""
    if tenant.subscription_status != SubscriptionStatus.ACTIVE:
        if tenant.subscription_status != SubscriptionStatus.TRIALING:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Subscription is not active"
            )
    
    if feature and feature not in tenant.features_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Feature '{feature}' not available in current subscription plan"
        )

# Authentication Routes
@api_router.post("/auth/register-tenant", response_model=Token)
async def register_tenant(tenant_data: TenantCreate):
    """Register a new pharmacy tenant"""
    # Check if subdomain is available
    existing_tenant = await db.tenants.find_one({"subdomain": tenant_data.subdomain})
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subdomain already taken"
        )
    
    # Set subscription features based on plan
    features_map = {
        SubscriptionPlan.STARTER: ["basic_inventory", "basic_sales", "single_store"],
        SubscriptionPlan.PROFESSIONAL: ["advanced_inventory", "multi_store", "reporting", "integrations"],
        SubscriptionPlan.ENTERPRISE: ["all_features", "unlimited_stores", "api_access", "white_label"]
    }
    
    max_stores_map = {
        SubscriptionPlan.STARTER: 1,
        SubscriptionPlan.PROFESSIONAL: 3,
        SubscriptionPlan.ENTERPRISE: 999
    }
    
    # Create tenant
    tenant_dict = tenant_data.dict()
    tenant_dict["subscription_expires_at"] = datetime.utcnow() + timedelta(days=14)  # 14-day trial
    tenant_dict["max_stores"] = max_stores_map[tenant_data.subscription_plan]
    tenant_dict["features_enabled"] = features_map[tenant_data.subscription_plan]
    
    tenant_obj = Tenant(**tenant_dict)
    await db.tenants.insert_one(tenant_obj.dict())
    
    return {
        "message": "Tenant registered successfully",
        "tenant_id": tenant_obj.id,
        "trial_expires_at": tenant_obj.subscription_expires_at
    }

@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate, current_user: User = Depends(get_current_user)):
    """Register a new user within a tenant"""
    # Only pharmacy owners and super admins can register new users
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.PHARMACY_OWNER, UserRole.PHARMACY_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to register new users"
        )
    
    # Check if email already exists
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
    
    # Set tenant_id for non-super-admin users
    if current_user.role != UserRole.SUPER_ADMIN:
        user_dict["tenant_id"] = current_user.tenant_id
    
    user_obj = User(**user_dict)
    
    # Store user with hashed password
    user_doc = user_obj.dict()
    user_doc["hashed_password"] = hashed_password
    await db.users.insert_one(user_doc)
    
    return {"message": "User registered successfully", "user_id": user_obj.id}

@api_router.post("/auth/login", response_model=Token)
async def login_user(credentials: UserLogin):
    """Login user with optional tenant subdomain"""
    query = {"email": credentials.email}
    
    # If subdomain provided, find tenant and filter by tenant_id
    if credentials.subdomain:
        tenant = await db.tenants.find_one({"subdomain": credentials.subdomain})
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
        query["tenant_id"] = tenant["id"]
    
    user = await db.users.find_one(query)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(**user)
    tenant_obj = None
    
    if user.get("tenant_id"):
        tenant = await db.tenants.find_one({"id": user["tenant_id"]})
        if tenant:
            tenant_obj = Tenant(**tenant)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj,
        "tenant": tenant_obj
    }

# Store Management Routes
@api_router.post("/stores", response_model=Store)
async def create_store(
    store_data: StoreCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Create a new store"""
    check_subscription_limits(tenant)
    
    if current_user.role not in [UserRole.PHARMACY_OWNER, UserRole.PHARMACY_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check store limit
    existing_stores = await db.stores.count_documents({"tenant_id": tenant.id, "is_active": True})
    if existing_stores >= tenant.max_stores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Store limit reached. Current plan allows {tenant.max_stores} stores."
        )
    
    store_dict = store_data.dict()
    store_dict["tenant_id"] = tenant.id
    store_obj = Store(**store_dict)
    
    await db.stores.insert_one(store_obj.dict())
    return store_obj

@api_router.get("/stores", response_model=List[Store])
async def get_stores(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get all stores for tenant"""
    query = {"tenant_id": tenant.id, "is_active": True}
    
    # If user has limited store access, filter by store_ids
    if current_user.store_ids:
        query["id"] = {"$in": current_user.store_ids}
    
    stores = await db.stores.find(query).to_list(100)
    return [Store(**store) for store in stores]

# Medicine/Inventory Routes
@api_router.post("/medicines", response_model=Medicine)
async def create_medicine(
    medicine_data: MedicineCreate,
    store_id: str,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Add new medicine to inventory"""
    check_subscription_limits(tenant, "basic_inventory")
    
    if current_user.role not in [UserRole.PHARMACIST, UserRole.PHARMACY_MANAGER, UserRole.PHARMACY_OWNER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Verify store access
    if current_user.store_ids and store_id not in current_user.store_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this store"
        )
    
    medicine_dict = medicine_data.dict()
    medicine_dict["tenant_id"] = tenant.id
    medicine_dict["store_id"] = store_id
    medicine_obj = Medicine(**medicine_dict)
    
    await db.medicines.insert_one(medicine_obj.dict())
    
    # Check for low stock and create notification
    if medicine_obj.quantity_in_stock <= medicine_obj.min_stock_level:
        notification = Notification(
            tenant_id=tenant.id,
            user_id=current_user.id,
            type=NotificationType.LOW_STOCK,
            title="Low Stock Alert",
            message=f"{medicine_obj.name} is running low in stock",
            data={"medicine_id": medicine_obj.id, "current_stock": medicine_obj.quantity_in_stock}
        )
        await db.notifications.insert_one(notification.dict())
    
    return medicine_obj

@api_router.get("/medicines", response_model=List[Medicine])
async def get_medicines(
    store_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    expiring_soon: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get medicines with filtering options"""
    query = {"tenant_id": tenant.id}
    
    if store_id:
        query["store_id"] = store_id
    elif current_user.store_ids:
        query["store_id"] = {"$in": current_user.store_ids}
    
    if category:
        query["category"] = category
    
    if low_stock:
        query["$expr"] = {"$lte": ["$quantity_in_stock", "$min_stock_level"]}
    
    if expiring_soon:
        thirty_days_ahead = datetime.utcnow() + timedelta(days=30)
        query["expiry_date"] = {"$lte": thirty_days_ahead}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"generic_name": {"$regex": search, "$options": "i"}},
            {"brand_name": {"$regex": search, "$options": "i"}},
            {"ndc_number": {"$regex": search, "$options": "i"}}
        ]
    
    medicines = await db.medicines.find(query).to_list(1000)
    return [Medicine(**med) for med in medicines]

# Customer Management Routes
@api_router.post("/customers", response_model=Customer)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Create new customer"""
    customer_dict = customer_data.dict()
    customer_dict["tenant_id"] = tenant.id
    customer_obj = Customer(**customer_dict)
    
    await db.customers.insert_one(customer_obj.dict())
    return customer_obj

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get customers with search"""
    query = {"tenant_id": tenant.id, "is_active": True}
    
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    customers = await db.customers.find(query).to_list(1000)
    return [Customer(**customer) for customer in customers]

# Prescription Management Routes
@api_router.post("/prescriptions", response_model=Prescription)
async def create_prescription(
    prescription_data: PrescriptionCreate,
    store_id: str,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Create new prescription"""
    if current_user.role not in [UserRole.PHARMACIST, UserRole.PHARMACY_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only pharmacists can create prescriptions"
        )
    
    prescription_dict = prescription_data.dict()
    prescription_dict["tenant_id"] = tenant.id
    prescription_dict["store_id"] = store_id
    prescription_dict["prescription_number"] = f"RX-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
    
    prescription_obj = Prescription(**prescription_dict)
    await db.prescriptions.insert_one(prescription_obj.dict())
    
    return prescription_obj

@api_router.get("/prescriptions", response_model=List[dict])
async def get_prescriptions(
    status: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    store_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get prescriptions with filtering"""
    query = {"tenant_id": tenant.id}
    
    if status:
        query["status"] = status
    if customer_id:
        query["customer_id"] = customer_id
    if store_id:
        query["store_id"] = store_id
    elif current_user.store_ids:
        query["store_id"] = {"$in": current_user.store_ids}
    
    prescriptions = await db.prescriptions.find(query).sort("created_at", -1).to_list(1000)
    
    # Enrich with customer info
    result = []
    for prescription in prescriptions:
        customer = await db.customers.find_one({"id": prescription["customer_id"]})
        prescription_info = {
            **prescription,
            "customer_name": f"{customer['first_name']} {customer['last_name']}" if customer else "Unknown"
        }
        result.append(prescription_info)
    
    return result

# Sales/POS Routes
@api_router.post("/sales", response_model=Sale)
async def create_sale(
    sale_data: SaleCreate,
    store_id: str,
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Process a sale/transaction"""
    if current_user.role not in [UserRole.CASHIER, UserRole.PHARMACIST, UserRole.PHARMACY_TECHNICIAN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to process sales"
        )
    
    # Calculate totals
    subtotal = sum(item["price"] * item["quantity"] for item in sale_data.items)
    tax_amount = subtotal * 0.08  # Use store tax rate
    total_amount = subtotal + tax_amount - sale_data.discount_amount - sale_data.insurance_coverage
    change_given = max(0, sale_data.amount_paid - total_amount)
    
    # Calculate loyalty points (1 point per dollar spent)
    loyalty_points_earned = int(total_amount) - sale_data.loyalty_points_used
    
    sale_dict = sale_data.dict()
    sale_dict.update({
        "tenant_id": tenant.id,
        "store_id": store_id,
        "cashier_id": current_user.id,
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "change_given": change_given,
        "loyalty_points_earned": loyalty_points_earned,
        "receipt_number": f"RCP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
    })
    
    sale_obj = Sale(**sale_dict)
    await db.sales.insert_one(sale_obj.dict())
    
    # Update medicine inventory
    for item in sale_data.items:
        await db.medicines.update_one(
            {"id": item["medicine_id"]},
            {"$inc": {"quantity_in_stock": -item["quantity"]}}
        )
    
    # Update customer loyalty points and spending
    if sale_data.customer_id:
        await db.customers.update_one(
            {"id": sale_data.customer_id},
            {
                "$inc": {
                    "loyalty_points": loyalty_points_earned - sale_data.loyalty_points_used,
                    "total_spent": total_amount
                }
            }
        )
    
    return sale_obj

# Dashboard/Analytics Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get dashboard statistics"""
    stats = {}
    
    # Common filters
    tenant_filter = {"tenant_id": tenant.id}
    store_filter = tenant_filter.copy()
    if current_user.store_ids:
        store_filter["store_id"] = {"$in": current_user.store_ids}
    
    # Today's date range
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
    
    if current_user.role in [UserRole.PHARMACY_OWNER, UserRole.PHARMACY_MANAGER, UserRole.SUPER_ADMIN]:
        # Total customers
        total_customers = await db.customers.count_documents({**tenant_filter, "is_active": True})
        
        # Today's sales
        today_sales = await db.sales.find({
            **store_filter,
            "created_at": {"$gte": today_start, "$lte": today_end}
        }).to_list(1000)
        
        today_revenue = sum(sale["total_amount"] for sale in today_sales)
        
        # Pending prescriptions
        pending_prescriptions = await db.prescriptions.count_documents({
            **store_filter,
            "status": PrescriptionStatus.PENDING
        })
        
        # Low stock items
        pipeline = [
            {"$match": store_filter},
            {"$match": {"$expr": {"$lte": ["$quantity_in_stock", "$min_stock_level"]}}},
            {"$count": "low_stock_count"}
        ]
        low_stock_result = await db.medicines.aggregate(pipeline).to_list(1)
        low_stock_count = low_stock_result[0]["low_stock_count"] if low_stock_result else 0
        
        # Expiring soon (30 days)
        thirty_days_ahead = datetime.utcnow() + timedelta(days=30)
        expiring_soon = await db.medicines.count_documents({
            **store_filter,
            "expiry_date": {"$lte": thirty_days_ahead}
        })
        
        stats = {
            "total_customers": total_customers,
            "today_sales_count": len(today_sales),
            "today_revenue": today_revenue,
            "pending_prescriptions": pending_prescriptions,
            "low_stock_items": low_stock_count,
            "expiring_medicines": expiring_soon,
            "subscription_plan": tenant.subscription_plan,
            "subscription_status": tenant.subscription_status,
            "stores_count": await db.stores.count_documents({**tenant_filter, "is_active": True})
        }
    
    else:  # For other roles like cashier, technician
        # Today's sales by this user
        today_my_sales = await db.sales.count_documents({
            **store_filter,
            "cashier_id": current_user.id,
            "created_at": {"$gte": today_start, "$lte": today_end}
        })
        
        stats = {
            "my_sales_today": today_my_sales,
            "pending_prescriptions": await db.prescriptions.count_documents({
                **store_filter,
                "status": PrescriptionStatus.PENDING
            })
        }
    
    return stats

# Notifications
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get user notifications"""
    query = {"tenant_id": tenant.id, "user_id": current_user.id}
    
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(query).sort("created_at", -1).limit(50).to_list(50)
    return [Notification(**notif) for notif in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# Analytics Routes
@api_router.get("/analytics/sales")
async def get_sales_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    store_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant)
):
    """Get sales analytics"""
    check_subscription_limits(tenant, "reporting")
    
    start_date = datetime.now() - timedelta(days=days)
    
    query = {
        "tenant_id": tenant.id,
        "created_at": {"$gte": start_date}
    }
    
    if store_id:
        query["store_id"] = store_id
    elif current_user.store_ids:
        query["store_id"] = {"$in": current_user.store_ids}
    
    # Sales by day
    pipeline = [
        {"$match": query},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "total_sales": {"$sum": "$total_amount"},
                "transaction_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    sales_by_day = await db.sales.aggregate(pipeline).to_list(100)
    
    # Top selling medicines
    pipeline = [
        {"$match": query},
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.medicine_name",
                "total_quantity": {"$sum": "$items.quantity"},
                "total_revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
            }
        },
        {"$sort": {"total_quantity": -1}},
        {"$limit": 10}
    ]
    
    top_medicines = await db.sales.aggregate(pipeline).to_list(10)
    
    return {
        "sales_by_day": sales_by_day,
        "top_medicines": top_medicines,
        "period_days": days
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

@app.on_event("startup")
async def startup_event():
    """Initialize database with indexes and default data"""
    # Create indexes for better performance
    await db.users.create_index("email")
    await db.tenants.create_index("subdomain")
    await db.medicines.create_index([("tenant_id", 1), ("store_id", 1)])
    await db.sales.create_index([("tenant_id", 1), ("created_at", -1)])
    await db.customers.create_index([("tenant_id", 1), ("phone", 1)])
    
    logger.info("PharmaCloud SaaS started successfully!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()