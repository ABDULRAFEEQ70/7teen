# 🎓 Takoradi Technical University Grade Manager - Simple Setup

## 📋 Single File Version - Easy to Run!

I've consolidated the entire application into **ONE FILE** that you can easily run on your local machine.

---

## 🚀 **QUICK START (3 Steps)**

### **Step 1: Install .NET 6.0**
Download and install .NET 6.0 SDK from: https://dotnet.microsoft.com/download

**Quick Installation:**
- **Windows**: Download installer from Microsoft
- **macOS**: `brew install dotnet` (if you have Homebrew)
- **Linux**: Follow instructions at https://docs.microsoft.com/en-us/dotnet/core/install/linux

### **Step 2: Download the Files**
You need only these 2 files:
- `TakoradiTechUniversityGradeManager.cs` (the main application)
- `SingleFile.csproj` (project configuration)

### **Step 3: Run the Application**
Open terminal/command prompt in the folder with the files and run:

```bash
dotnet run
```

**That's it! The application will start running.**

---

## 🎯 **What You'll See**

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             TAKORADI TECHNICAL UNIVERSITY                    ║
║                STUDENT GRADE MANAGER                         ║
║                                                              ║
║              📚 Academic Excellence Portal 📚                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🔐 Student Authentication
─────────────────────────
1. 📝 Register New Student
2. 🔑 Login Existing Student
3. 📋 View All Students (Admin)
4. ❌ Exit

Select an option (1-4):
```

---

## ✅ **Complete Features in ONE FILE**

### 🎓 **Academic Management**
- Student registration and login
- Add semesters (Level 100-400, Semester 1-2)
- Add courses with credit hours
- Enter and update grade percentages
- Automatic GPA calculation (4.0 scale)

### 📊 **Grade Analysis**
- View academic summary
- Detailed semester grades
- Grade distribution statistics
- Performance trends over time
- Top and bottom performing courses

### 🎯 **Smart Guidance**
- Personalized improvement suggestions
- GPA-based recommendations
- Course-specific advice
- Academic standing classification

### 💾 **Data Storage**
- Automatic saving to JSON file
- Persistent data across sessions
- Multi-student support

---

## 📚 **How to Use the Application**

### **1. First Time Setup**
- Run the application
- Select "1. Register New Student"
- Enter your details:
  - First Name
  - Last Name  
  - Student Number (e.g., TTU/2024/CS/001)
  - Program (e.g., Computer Science)

### **2. Add Your Academic Records**
- Login with your student number
- Select "3. Add New Semester"
- Enter Level (100, 200, 300, or 400)
- Enter Semester Number (1 or 2)
- Enter Academic Year (e.g., 2023/2024)

### **3. Add Courses**
- Select "4. Add Course to Semester"
- Choose the semester
- Enter course details:
  - Course Code (e.g., CS101)
  - Course Name (e.g., Introduction to Programming)
  - Credit Hours (e.g., 3)
  - Grade Percentage (optional)

### **4. View Your Progress**
- "1. View Academic Summary" - Overall GPA and standing
- "2. View Semester Grades" - Detailed course breakdown
- "6. View Improvement Suggestions" - Personalized advice
- "7. Grade Analysis & Statistics" - Comprehensive analysis

---

## 🎯 **Sample Usage Flow**

```
1. Register: John Doe, TTU/2024/CS/001, Computer Science
2. Add Semester: Level 100, Semester 1, 2024/2025
3. Add Courses:
   - CS101: Introduction to Computing (3 credits) - 85%
   - MTH101: Mathematics I (3 credits) - 78%
   - ENG101: Technical English (2 credits) - 82%
4. View Results: Overall GPA 3.67 (First Class)
5. Get Suggestions: "Outstanding! Maintain this excellent standard"
```

---

## 🔧 **Troubleshooting**

### **"dotnet: command not found"**
- Install .NET 6.0 SDK from Microsoft's website
- Restart your terminal after installation

### **"Couldn't find a project to run"**
- Make sure both files are in the same folder
- The file must be named exactly `TakoradiTechUniversityGradeManager.cs`

### **"Package restore failed"**
- Run: `dotnet restore` first
- Then: `dotnet run`

---

## 📂 **File Structure**
```
Your Folder/
├── TakoradiTechUniversityGradeManager.cs  (Main application - 1,200+ lines)
├── SingleFile.csproj                      (Project configuration)
└── students_data.json                     (Created automatically when you add students)
```

---

## 🎉 **Ready to Use!**

This single-file version contains **ALL** the features from the complete application:
- ✅ 1,200+ lines of production-ready C# code
- ✅ Complete grade management system
- ✅ GPA calculation with 4.0 scale
- ✅ Academic guidance and suggestions
- ✅ Data persistence and multi-student support
- ✅ Professional user interface

**Everything you need for managing your academic records at Takoradi Technical University!**

---

**🎓 Academic Excellence Made Simple! 🎓**