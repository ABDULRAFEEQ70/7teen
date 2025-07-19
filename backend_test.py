#!/usr/bin/env python3
"""
Hospital Management System Backend API Testing
Tests all core functionality including authentication, doctor management, appointments, and dashboard stats.
"""

import requests
import json
from datetime import datetime, timedelta
import time

# Backend URL from frontend .env
BASE_URL = "https://1d260e38-7bbf-4e0e-866d-9ae8ce235658.preview.emergentagent.com/api"

class HospitalAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tokens = {}  # Store tokens for different users
        self.users = {}   # Store user data
        self.doctors = {} # Store doctor data
        self.appointments = [] # Store appointment data
        
    def log(self, message, level="INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_user_registration(self):
        """Test user registration with different roles"""
        self.log("=== Testing User Registration ===")
        
        test_users = [
            {
                "email": "admin@cityhospital.com",
                "password": "AdminPass123!",
                "name": "Dr. Sarah Johnson",
                "role": "admin",
                "phone": "+1-555-0101",
                "address": "123 Medical Center Dr, Healthcare City",
                "date_of_birth": "1980-05-15T00:00:00",
                "emergency_contact": "+1-555-9999 (Spouse: Robert Johnson)"
            },
            {
                "email": "cardio.smith@cityhospital.com", 
                "password": "DocPass123!",
                "name": "Dr. Michael Smith",
                "role": "doctor",
                "phone": "+1-555-0102",
                "address": "456 Cardiology Wing, Healthcare City"
            },
            {
                "email": "neuro.davis@cityhospital.com",
                "password": "DocPass123!",
                "name": "Dr. Emily Davis",
                "role": "doctor", 
                "phone": "+1-555-0103",
                "address": "789 Neurology Dept, Healthcare City"
            },
            {
                "email": "nurse.wilson@cityhospital.com",
                "password": "NursePass123!",
                "name": "Jennifer Wilson",
                "role": "nurse",
                "phone": "+1-555-0104"
            },
            {
                "email": "reception@cityhospital.com",
                "password": "RecepPass123!",
                "name": "Maria Garcia",
                "role": "receptionist",
                "phone": "+1-555-0105"
            },
            {
                "email": "john.patient@email.com",
                "password": "PatientPass123!",
                "name": "John Anderson",
                "role": "patient",
                "phone": "+1-555-0201",
                "address": "321 Oak Street, Patient City"
            },
            {
                "email": "mary.patient@email.com",
                "password": "PatientPass123!",
                "name": "Mary Thompson",
                "role": "patient",
                "phone": "+1-555-0202",
                "address": "654 Pine Avenue, Patient City"
            }
        ]
        
        success_count = 0
        for user_data in test_users:
            try:
                response = requests.post(f"{self.base_url}/auth/register", json=user_data)
                if response.status_code == 200:
                    result = response.json()
                    self.tokens[user_data["email"]] = result["access_token"]
                    self.users[user_data["email"]] = result["user"]
                    self.log(f"✅ Registered {user_data['role']}: {user_data['name']}")
                    success_count += 1
                else:
                    self.log(f"❌ Failed to register {user_data['name']}: {response.text}", "ERROR")
            except Exception as e:
                self.log(f"❌ Exception registering {user_data['name']}: {str(e)}", "ERROR")
        
        self.log(f"Registration Summary: {success_count}/{len(test_users)} users registered successfully")
        return success_count == len(test_users)
    
    def test_user_login(self):
        """Test login functionality"""
        self.log("=== Testing User Login ===")
        
        # Test valid login
        login_data = {
            "email": "admin@cityhospital.com",
            "password": "AdminPass123!"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                result = response.json()
                self.log("✅ Valid login successful")
                # Update token
                self.tokens[login_data["email"]] = result["access_token"]
            else:
                self.log(f"❌ Valid login failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception during valid login: {str(e)}", "ERROR")
            return False
        
        # Test invalid login
        invalid_login = {
            "email": "admin@cityhospital.com",
            "password": "WrongPassword"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/login", json=invalid_login)
            if response.status_code == 401:
                self.log("✅ Invalid login correctly rejected")
            else:
                self.log(f"❌ Invalid login should return 401, got {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception during invalid login test: {str(e)}", "ERROR")
            return False
        
        return True
    
    def test_jwt_token_validation(self):
        """Test JWT token validation"""
        self.log("=== Testing JWT Token Validation ===")
        
        # Test with valid token
        admin_token = self.tokens.get("admin@cityhospital.com")
        if not admin_token:
            self.log("❌ No admin token available for testing", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        try:
            response = requests.get(f"{self.base_url}/dashboard/stats", headers=headers)
            if response.status_code == 200:
                self.log("✅ Valid token accepted")
            else:
                self.log(f"❌ Valid token rejected: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception testing valid token: {str(e)}", "ERROR")
            return False
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        
        try:
            response = requests.get(f"{self.base_url}/dashboard/stats", headers=invalid_headers)
            if response.status_code == 401:
                self.log("✅ Invalid token correctly rejected")
            else:
                self.log(f"❌ Invalid token should return 401, got {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception testing invalid token: {str(e)}", "ERROR")
            return False
        
        # Test without token
        try:
            response = requests.get(f"{self.base_url}/dashboard/stats")
            if response.status_code == 403:
                self.log("✅ Missing token correctly rejected")
            else:
                self.log(f"❌ Missing token should return 403, got {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception testing missing token: {str(e)}", "ERROR")
            return False
        
        return True
    
    def test_doctor_profile_management(self):
        """Test doctor profile creation and retrieval"""
        self.log("=== Testing Doctor Profile Management ===")
        
        # Test doctor profile creation
        doctor_profiles = [
            {
                "email": "cardio.smith@cityhospital.com",
                "profile": {
                    "specialization": "Cardiology",
                    "license_number": "MD-CARD-2019-001",
                    "experience_years": 8,
                    "qualification": "MD Cardiology, MBBS",
                    "available_from": "09:00",
                    "available_to": "17:00",
                    "available_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
                    "consultation_fee": 250.0
                }
            },
            {
                "email": "neuro.davis@cityhospital.com",
                "profile": {
                    "specialization": "Neurology",
                    "license_number": "MD-NEURO-2020-002",
                    "experience_years": 6,
                    "qualification": "MD Neurology, MBBS",
                    "available_from": "10:00",
                    "available_to": "18:00",
                    "available_days": ["monday", "wednesday", "friday", "saturday"],
                    "consultation_fee": 300.0
                }
            }
        ]
        
        success_count = 0
        for doctor_data in doctor_profiles:
            email = doctor_data["email"]
            profile = doctor_data["profile"]
            token = self.tokens.get(email)
            
            if not token:
                self.log(f"❌ No token for doctor {email}", "ERROR")
                continue
            
            headers = {"Authorization": f"Bearer {token}"}
            
            try:
                response = requests.post(f"{self.base_url}/doctors/profile", json=profile, headers=headers)
                if response.status_code == 200:
                    result = response.json()
                    self.doctors[email] = result
                    self.log(f"✅ Created profile for Dr. {profile['specialization']}")
                    success_count += 1
                else:
                    self.log(f"❌ Failed to create profile for {email}: {response.text}", "ERROR")
            except Exception as e:
                self.log(f"❌ Exception creating profile for {email}: {str(e)}", "ERROR")
        
        # Test role-based access control - patient trying to create doctor profile
        patient_token = self.tokens.get("john.patient@email.com")
        if patient_token:
            headers = {"Authorization": f"Bearer {patient_token}"}
            try:
                response = requests.post(f"{self.base_url}/doctors/profile", json=doctor_profiles[0]["profile"], headers=headers)
                if response.status_code == 403:
                    self.log("✅ Patient correctly denied doctor profile creation")
                else:
                    self.log(f"❌ Patient should be denied, got {response.status_code}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception testing patient access: {str(e)}", "ERROR")
                return False
        
        # Test getting all doctors
        try:
            response = requests.get(f"{self.base_url}/doctors")
            if response.status_code == 200:
                doctors_list = response.json()
                self.log(f"✅ Retrieved {len(doctors_list)} doctors from public list")
            else:
                self.log(f"❌ Failed to get doctors list: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception getting doctors list: {str(e)}", "ERROR")
            return False
        
        # Test doctor getting their own profile
        doctor_email = "cardio.smith@cityhospital.com"
        doctor_token = self.tokens.get(doctor_email)
        if doctor_token:
            headers = {"Authorization": f"Bearer {doctor_token}"}
            try:
                response = requests.get(f"{self.base_url}/doctors/me", headers=headers)
                if response.status_code == 200:
                    self.log("✅ Doctor retrieved own profile successfully")
                else:
                    self.log(f"❌ Doctor failed to get own profile: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting doctor profile: {str(e)}", "ERROR")
                return False
        
        return success_count == len(doctor_profiles)
    
    def test_appointment_booking_system(self):
        """Test appointment booking and conflict checking"""
        self.log("=== Testing Appointment Booking System ===")
        
        # Get doctor IDs first
        try:
            response = requests.get(f"{self.base_url}/doctors")
            if response.status_code != 200:
                self.log("❌ Cannot get doctors list for appointment testing", "ERROR")
                return False
            doctors_list = response.json()
            if len(doctors_list) < 2:
                self.log("❌ Need at least 2 doctors for appointment testing", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception getting doctors for appointments: {str(e)}", "ERROR")
            return False
        
        cardio_doctor = next((d for d in doctors_list if d["specialization"] == "Cardiology"), None)
        neuro_doctor = next((d for d in doctors_list if d["specialization"] == "Neurology"), None)
        
        if not cardio_doctor or not neuro_doctor:
            self.log("❌ Cannot find required doctors for testing", "ERROR")
            return False
        
        # Test appointment booking
        patient_token = self.tokens.get("john.patient@email.com")
        if not patient_token:
            self.log("❌ No patient token for appointment testing", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {patient_token}"}
        
        # Book first appointment
        appointment_time = datetime.now() + timedelta(days=3, hours=2)
        appointment_data = {
            "doctor_id": cardio_doctor["id"],
            "appointment_date": appointment_time.isoformat(),
            "reason": "Chest pain and irregular heartbeat",
            "notes": "Patient reports symptoms for past 2 weeks"
        }
        
        try:
            response = requests.post(f"{self.base_url}/appointments", json=appointment_data, headers=headers)
            if response.status_code == 200:
                appointment1 = response.json()
                self.appointments.append(appointment1)
                self.log("✅ First appointment booked successfully")
            else:
                self.log(f"❌ Failed to book first appointment: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception booking first appointment: {str(e)}", "ERROR")
            return False
        
        # Test conflict checking - try to book same time slot
        conflict_data = {
            "doctor_id": cardio_doctor["id"],
            "appointment_date": appointment_time.isoformat(),
            "reason": "Follow-up consultation",
            "notes": "Different patient, same time"
        }
        
        # Use different patient
        patient2_token = self.tokens.get("mary.patient@email.com")
        if patient2_token:
            headers2 = {"Authorization": f"Bearer {patient2_token}"}
            try:
                response = requests.post(f"{self.base_url}/appointments", json=conflict_data, headers=headers2)
                if response.status_code == 400:
                    self.log("✅ Appointment conflict correctly detected")
                else:
                    self.log(f"❌ Conflict should return 400, got {response.status_code}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception testing appointment conflict: {str(e)}", "ERROR")
                return False
        
        # Book appointment with different doctor (should succeed)
        different_time = appointment_time + timedelta(hours=1)
        appointment_data2 = {
            "doctor_id": neuro_doctor["id"],
            "appointment_date": different_time.isoformat(),
            "reason": "Headaches and memory issues",
            "notes": "Symptoms started 3 months ago"
        }
        
        try:
            response = requests.post(f"{self.base_url}/appointments", json=appointment_data2, headers=headers)
            if response.status_code == 200:
                appointment2 = response.json()
                self.appointments.append(appointment2)
                self.log("✅ Second appointment with different doctor booked successfully")
            else:
                self.log(f"❌ Failed to book second appointment: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception booking second appointment: {str(e)}", "ERROR")
            return False
        
        # Test role-based access - doctor trying to book appointment
        doctor_token = self.tokens.get("cardio.smith@cityhospital.com")
        if doctor_token:
            headers_doc = {"Authorization": f"Bearer {doctor_token}"}
            try:
                response = requests.post(f"{self.base_url}/appointments", json=appointment_data, headers=headers_doc)
                if response.status_code == 403:
                    self.log("✅ Doctor correctly denied appointment booking")
                else:
                    self.log(f"❌ Doctor should be denied, got {response.status_code}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception testing doctor appointment access: {str(e)}", "ERROR")
                return False
        
        return True
    
    def test_appointment_viewing(self):
        """Test role-based appointment viewing"""
        self.log("=== Testing Appointment Viewing ===")
        
        # Test patient viewing their appointments
        patient_token = self.tokens.get("john.patient@email.com")
        if patient_token:
            headers = {"Authorization": f"Bearer {patient_token}"}
            try:
                response = requests.get(f"{self.base_url}/appointments/my", headers=headers)
                if response.status_code == 200:
                    patient_appointments = response.json()
                    self.log(f"✅ Patient retrieved {len(patient_appointments)} appointments")
                else:
                    self.log(f"❌ Patient failed to get appointments: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting patient appointments: {str(e)}", "ERROR")
                return False
        
        # Test doctor viewing their appointments
        doctor_token = self.tokens.get("cardio.smith@cityhospital.com")
        if doctor_token:
            headers = {"Authorization": f"Bearer {doctor_token}"}
            try:
                response = requests.get(f"{self.base_url}/appointments/my", headers=headers)
                if response.status_code == 200:
                    doctor_appointments = response.json()
                    self.log(f"✅ Doctor retrieved {len(doctor_appointments)} appointments")
                else:
                    self.log(f"❌ Doctor failed to get appointments: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting doctor appointments: {str(e)}", "ERROR")
                return False
        
        # Test admin viewing all appointments
        admin_token = self.tokens.get("admin@cityhospital.com")
        if admin_token:
            headers = {"Authorization": f"Bearer {admin_token}"}
            try:
                response = requests.get(f"{self.base_url}/appointments/my", headers=headers)
                if response.status_code == 200:
                    admin_appointments = response.json()
                    self.log(f"✅ Admin retrieved {len(admin_appointments)} appointments")
                else:
                    self.log(f"❌ Admin failed to get appointments: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting admin appointments: {str(e)}", "ERROR")
                return False
        
        return True
    
    def test_dashboard_statistics(self):
        """Test role-specific dashboard statistics"""
        self.log("=== Testing Dashboard Statistics ===")
        
        # Test admin dashboard stats
        admin_token = self.tokens.get("admin@cityhospital.com")
        if admin_token:
            headers = {"Authorization": f"Bearer {admin_token}"}
            try:
                response = requests.get(f"{self.base_url}/dashboard/stats", headers=headers)
                if response.status_code == 200:
                    admin_stats = response.json()
                    expected_keys = ["total_patients", "total_doctors", "total_appointments", "today_appointments"]
                    if all(key in admin_stats for key in expected_keys):
                        self.log(f"✅ Admin stats: {admin_stats}")
                    else:
                        self.log(f"❌ Admin stats missing keys: {admin_stats}", "ERROR")
                        return False
                else:
                    self.log(f"❌ Admin failed to get stats: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting admin stats: {str(e)}", "ERROR")
                return False
        
        # Test doctor dashboard stats
        doctor_token = self.tokens.get("cardio.smith@cityhospital.com")
        if doctor_token:
            headers = {"Authorization": f"Bearer {doctor_token}"}
            try:
                response = requests.get(f"{self.base_url}/dashboard/stats", headers=headers)
                if response.status_code == 200:
                    doctor_stats = response.json()
                    expected_keys = ["my_appointments", "today_appointments"]
                    if all(key in doctor_stats for key in expected_keys):
                        self.log(f"✅ Doctor stats: {doctor_stats}")
                    else:
                        self.log(f"❌ Doctor stats missing keys: {doctor_stats}", "ERROR")
                        return False
                else:
                    self.log(f"❌ Doctor failed to get stats: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting doctor stats: {str(e)}", "ERROR")
                return False
        
        # Test patient dashboard stats
        patient_token = self.tokens.get("john.patient@email.com")
        if patient_token:
            headers = {"Authorization": f"Bearer {patient_token}"}
            try:
                response = requests.get(f"{self.base_url}/dashboard/stats", headers=headers)
                if response.status_code == 200:
                    patient_stats = response.json()
                    expected_keys = ["my_appointments", "upcoming_appointments"]
                    if all(key in patient_stats for key in expected_keys):
                        self.log(f"✅ Patient stats: {patient_stats}")
                    else:
                        self.log(f"❌ Patient stats missing keys: {patient_stats}", "ERROR")
                        return False
                else:
                    self.log(f"❌ Patient failed to get stats: {response.text}", "ERROR")
                    return False
            except Exception as e:
                self.log(f"❌ Exception getting patient stats: {str(e)}", "ERROR")
                return False
        
        return True
    
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🏥 Starting Hospital Management System Backend Tests")
        self.log(f"Testing against: {self.base_url}")
        
        test_results = {}
        
        # Run tests in order
        test_results["registration"] = self.test_user_registration()
        test_results["login"] = self.test_user_login()
        test_results["jwt_validation"] = self.test_jwt_token_validation()
        test_results["doctor_profiles"] = self.test_doctor_profile_management()
        test_results["appointment_booking"] = self.test_appointment_booking_system()
        test_results["appointment_viewing"] = self.test_appointment_viewing()
        test_results["dashboard_stats"] = self.test_dashboard_statistics()
        
        # Summary
        self.log("\n" + "="*60)
        self.log("🏥 HOSPITAL MANAGEMENT SYSTEM TEST SUMMARY")
        self.log("="*60)
        
        passed = 0
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name.replace('_', ' ').title()}: {status}")
            if result:
                passed += 1
        
        self.log(f"\nOverall Result: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All backend tests PASSED! Hospital Management System is working correctly.")
        else:
            self.log("⚠️  Some tests FAILED. Please check the logs above for details.")
        
        return test_results

if __name__ == "__main__":
    tester = HospitalAPITester()
    results = tester.run_all_tests()