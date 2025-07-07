# Takoradi Technical University Grade Manager - Demo Output

## Application Startup

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

Select an option (1-4): 1
```

## Student Registration Demo

```
📝 Register New Student
─────────────────────
First Name: Kwame
Last Name: Asante
Student Number: TTU/2023/CS/001
Program/Course of Study: Computer Science

✅ Student registered successfully!
You can now login with your student number.
```

## Main Dashboard Demo

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             TAKORADI TECHNICAL UNIVERSITY                    ║
║                STUDENT GRADE MANAGER                         ║
║                                                              ║
║              📚 Academic Excellence Portal 📚                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

👋 Welcome, Kwame Asante!
📚 Program: Computer Science
🎓 Current: Level 200, Semester 1
📊 Overall GPA: 3.25 (Second Class Upper)
─────────────────────────────────────────────────────────────

1. 📊 View Academic Summary
2. 📈 View Semester Grades
3. ➕ Add New Semester
4. 📚 Add Course to Semester
5. ✏️  Update Course Grade
6. 🎯 View Improvement Suggestions
7. 📋 Grade Analysis & Statistics
8. ⚙️  Update Student Info
9. 🔓 Logout

Select an option (1-9): 1
```

## Academic Summary Demo

```
📊 Academic Summary
─────────────────
Student: Kwame Asante
Student Number: TTU/2023/CS/001
Program: Computer Science
Current Level: 200
Current Semester: 1

Overall GPA: 3.25
Academic Standing: Second Class Upper

Semester Summary:
Semester             Courses  Credits  GPA   
─────────────────────────────────────────────
Level 100 Semester 1   6        18      3.17
Level 100 Semester 2   6        18      3.33
Level 200 Semester 1   5        15      3.20

Press any key to continue...
```

## Semester Grades Detail Demo

```
📈 Level 100 Semester 1 Details
Academic Year: 2023/2024
──────────────────────────────────────────────────────────────

Course Code  Course Name               Credits  Grade  Points  Percentage
────────────────────────────────────────────────────────────────────────
CS101        Introduction to Computing    3        B      3.0     72.0%
MTH101       Mathematics I               3        B+     3.5     78.0%
ENG101       Technical English           2        A      4.0     85.0%
PHY101       Physics I                   3        C+     2.5     67.0%
ICT101       Computer Applications       2        B      3.0     71.0%
GNS101       General Studies             3        B      3.0     73.0%

─────────────────────────────────────────────────────────────────────────
Total Credit Hours: 18
Semester GPA: 3.17
Quality Points: 57.0

Press any key to continue...
```

## Adding New Course Demo

```
📚 Add Course to Semester
───────────────────────
Select a semester:
1. Level 100 Semester 1 (2023/2024)
2. Level 100 Semester 2 (2023/2024)
3. Level 200 Semester 1 (2024/2025)

Enter semester number: 3

Course Code: CS201
Course Name: Data Structures and Algorithms
Credit Hours: 3
Enter Grade Percentage (optional, press Enter to skip): 82

✅ Course added successfully!
```

## Improvement Suggestions Demo

```
🎯 Academic Improvement Suggestions
──────────────────────────────────
• 🏆 Excellent work! You're on track for Second Class Upper.

• 🎯 Push for First Class by targeting A grades in remaining courses.

• 📚 Consider advanced study techniques and research projects.

• 🤝 Help classmates while reinforcing your own knowledge.

• ⚡ 1 course(s) have grades below C. These need attention.

• 🎯 Target these specific courses for grade improvement:
   • PHY101: Physics I (Current: C+)

• 📋 Priority: Focus on understanding fundamental physics concepts.

• 📖 Consider forming study groups for challenging subjects.

• 👨‍🏫 Attend all lectures and participate actively in class discussions.

Press any key to continue...
```

## Grade Analysis Demo

```
📋 Grade Analysis & Statistics
─────────────────────────────
Total Courses Registered: 19
Courses with Grades: 19
Total Credit Hours: 57

Grade Distribution:
  A: 4 courses (21.1%)
  B+: 3 courses (15.8%)
  B: 7 courses (36.8%)
  C+: 3 courses (15.8%)
  C: 2 courses (10.5%)

Semester GPA Progression:
  Level 100 Semester 1: 3.17
  Level 100 Semester 2: 3.33
  Level 200 Semester 1: 3.20

Top Performing Courses:
  ENG101: A (85.0%)
  MTH102: A (88.0%)
  CS102: A (84.0%)

Courses Needing Attention:
  PHY101: C+ (67.0%)
  CHM101: C (62.0%)
  MTH201: C+ (68.0%)

Press any key to continue...
```

## Administrative View Demo

```
📋 All Registered Students
─────────────────────────
Student No.  Name                     Program              GPA    Standing            
─────────────────────────────────────────────────────────────────────────────────────
TTU/2023/CS/001  Kwame Asante        Computer Science     3.25   Second Class Upper  
TTU/2023/EE/002  Ama Boateng         Electrical Eng.      3.67   First Class        
TTU/2023/ME/003  Kojo Mensah         Mechanical Eng.      2.89   Second Class Lower  
TTU/2023/CE/004  Akosua Owusu        Civil Engineering    3.45   Second Class Upper  
TTU/2023/BA/005  Yaw Oppong          Business Admin.      2.95   Second Class Lower  

Press any key to continue...
```

## Sample JSON Data Storage

The application stores all data in `students_data.json`:

```json
[
  {
    "Id": "550e8400-e29b-41d4-a716-446655440000",
    "FirstName": "Kwame",
    "LastName": "Asante",
    "StudentNumber": "TTU/2023/CS/001",
    "Program": "Computer Science",
    "CurrentLevel": 200,
    "CurrentSemester": 1,
    "Semesters": [
      {
        "Id": "550e8400-e29b-41d4-a716-446655440001",
        "Level": 100,
        "SemesterNumber": 1,
        "AcademicYear": "2023/2024",
        "Courses": [
          {
            "Id": "550e8400-e29b-41d4-a716-446655440002",
            "CourseCode": "CS101",
            "CourseName": "Introduction to Computing",
            "CreditHours": 3,
            "LetterGrade": "B",
            "Percentage": 72.0
          },
          {
            "Id": "550e8400-e29b-41d4-a716-446655440003",
            "CourseCode": "MTH101",
            "CourseName": "Mathematics I",
            "CreditHours": 3,
            "LetterGrade": "B+",
            "Percentage": 78.0
          }
        ]
      }
    ]
  }
]
```

## Key Features Demonstrated

### ✅ **Complete Academic Management**
- Student registration and authentication
- Semester and course management
- Grade entry and updates
- GPA calculations (semester and cumulative)

### ✅ **Advanced Analytics**
- Grade distribution analysis
- Performance trend tracking
- Top/bottom performing courses identification
- Academic standing classification

### ✅ **Intelligent Guidance System**
- Personalized improvement suggestions
- GPA-based recommendations
- Course-specific advice
- Level-appropriate guidance

### ✅ **Data Management**
- JSON-based data persistence
- Automatic data backup
- Error handling and validation
- Multi-student support

### ✅ **User-Friendly Interface**
- Intuitive menu system
- Color-coded displays
- Clear navigation
- Comprehensive help system

## How to Run the Application

1. **Install .NET 6.0 SDK**
2. **Navigate to project directory**
3. **Run commands:**
   ```bash
   dotnet restore
   dotnet build
   dotnet run
   ```

## Technical Specifications

- **Framework**: .NET 6.0
- **Language**: C# 10
- **Dependencies**: Newtonsoft.Json
- **Data Storage**: JSON files
- **Platform**: Cross-platform (Windows, Linux, macOS)

---

**🎓 Ready for immediate use by Takoradi Technical University students!**