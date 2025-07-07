# Takoradi Technical University Grade Manager

## 📚 Academic Excellence Portal

A comprehensive C# console application designed specifically for students at Takoradi Technical University to manage their academic records, calculate GPA scores, and receive personalized guidance for academic improvement.

## 🎯 Features

### Core Functionality
- **Student Registration & Authentication**: Secure student login system using student numbers
- **Academic Record Management**: Track grades from Level 100 Semester 1 to Level 400 Semester 2
- **GPA Calculation**: Automatic calculation of semester and cumulative GPA using 4.0 scale
- **Grade Analysis**: Comprehensive statistics and performance tracking
- **Improvement Suggestions**: Personalized academic guidance based on current performance

### Academic Management
- **Multi-Level Support**: Complete coverage from Level 100 to Level 400
- **Semester Organization**: Organize courses by academic year and semester
- **Course Management**: Add courses with credit hours and grades
- **Grade Updates**: Update course grades as results become available
- **Academic Standing**: Automatic classification (First Class, Second Class Upper, etc.)

### Reporting & Analytics
- **Academic Summary**: Overview of all academic achievements
- **Semester Reports**: Detailed breakdown of individual semester performance
- **Grade Distribution**: Visual representation of grade patterns
- **Performance Trends**: Track academic progress over time
- **Improvement Areas**: Identify courses and areas needing attention

## 🏗️ Technical Architecture

### Project Structure
```
TakoradiTechGradeManager/
├── Models/
│   ├── Student.cs          # Student data model
│   ├── Semester.cs         # Semester data model
│   └── Course.cs           # Course data model
├── Services/
│   └── GradeManager.cs     # Business logic and data management
├── Program.cs              # Main application entry point
├── TakoradiTechGradeManager.csproj
└── README.md
```

### Technology Stack
- **Framework**: .NET 6.0
- **Language**: C# 10
- **Data Persistence**: JSON file storage
- **Dependencies**: Newtonsoft.Json for serialization

## 🚀 Getting Started

### Prerequisites
- .NET 6.0 SDK or later
- Visual Studio 2022, VS Code, or any C# compatible IDE
- Terminal/Command Prompt access

### Installation & Running

1. **Clone or Download** the project to your local machine

2. **Navigate to Project Directory**
   ```bash
   cd TakoradiTechGradeManager
   ```

3. **Restore Dependencies**
   ```bash
   dotnet restore
   ```

4. **Build the Application**
   ```bash
   dotnet build
   ```

5. **Run the Application**
   ```bash
   dotnet run
   ```

## 📖 User Guide

### First Time Setup

1. **Launch the Application**
   - Run the application using `dotnet run`
   - You'll see the Takoradi Technical University welcome screen

2. **Register as New Student**
   - Select option "1. Register New Student"
   - Enter your personal details:
     - First Name
     - Last Name
     - Student Number
     - Program/Course of Study

3. **Login with Student Number**
   - Use option "2. Login Existing Student"
   - Enter your student number to access your account

### Managing Academic Records

#### Adding Semesters
1. From the main menu, select "3. Add New Semester"
2. Enter:
   - Level (100, 200, 300, or 400)
   - Semester Number (1 or 2)
   - Academic Year (e.g., "2023/2024")

#### Adding Courses
1. Select "4. Add Course to Semester"
2. Choose the target semester
3. Enter course details:
   - Course Code (e.g., "CS101")
   - Course Name (e.g., "Introduction to Programming")
   - Credit Hours (e.g., 3)
   - Grade Percentage (optional)

#### Updating Grades
1. Select "5. Update Course Grade"
2. Choose semester and course
3. Enter the new grade percentage (0-100)
4. The system automatically converts to letter grade and GPA points

### Viewing Academic Information

#### Academic Summary
- Overview of all semesters and overall GPA
- Current academic standing
- Total courses and credit hours

#### Semester Grades
- Detailed view of individual semester performance
- Course-by-course breakdown
- Semester GPA and quality points

#### Grade Analysis
- Grade distribution statistics
- Performance trends over time
- Best and worst performing courses
- Academic progress tracking

#### Improvement Suggestions
- Personalized recommendations based on current GPA
- Specific course improvement targets
- Study strategies and academic advice
- Level-specific guidance

## 📊 Grading System

### Grade Scale
| Percentage | Letter Grade | Grade Points | Description |
|------------|--------------|--------------|-------------|
| 80-100%    | A            | 4.0          | Excellent   |
| 75-79%     | B+           | 3.5          | Very Good   |
| 70-74%     | B            | 3.0          | Good        |
| 65-69%     | C+           | 2.5          | Credit Plus |
| 60-64%     | C            | 2.0          | Credit      |
| 55-59%     | D+           | 1.5          | Pass Plus   |
| 50-54%     | D            | 1.0          | Pass        |
| 0-49%      | F            | 0.0          | Fail        |

### Academic Standing
| GPA Range  | Classification        |
|------------|-----------------------|
| 3.6 - 4.0  | First Class          |
| 3.0 - 3.59 | Second Class Upper   |
| 2.0 - 2.99 | Second Class Lower   |
| 1.0 - 1.99 | Third Class          |
| 0.0 - 0.99 | Fail                 |

## 💾 Data Storage

The application stores all student data in a JSON file (`students_data.json`) in the application directory. This file is automatically created and updated as you use the application.

### Data Backup
- Regularly backup your `students_data.json` file
- The file contains all your academic records
- You can transfer this file to preserve data when moving the application

## 🔧 Advanced Features

### Administrative Functions
- View all registered students (option 3 from login screen)
- Compare student performance across the university
- Export academic records (data stored in JSON format)

### Customization Options
- Update student information (level, semester, program)
- Modify course details and grades
- Add historical academic records
- Track multiple academic programs

## 🎓 Academic Benefits

### For Students
- **Track Progress**: Monitor academic performance over time
- **Calculate GPA**: Instant GPA calculations for academic planning
- **Identify Weaknesses**: Find courses needing improvement
- **Plan Studies**: Make informed decisions about course loads
- **Goal Setting**: Work towards specific academic targets

### For Academic Planning
- **Graduation Planning**: Track progress towards degree requirements
- **Course Selection**: Make informed choices based on past performance
- **Academic Intervention**: Early identification of academic difficulties
- **Performance Optimization**: Strategies for improving overall GPA

## 🛠️ Troubleshooting

### Common Issues

**"Student not found" error**
- Verify student number is correct
- Ensure student is registered in the system

**"Semester already exists" error**
- Check if the semester was previously added
- Use different academic year if needed

**Data not saving**
- Ensure application has write permissions
- Check available disk space
- Verify JSON file isn't corrupted

### Data Recovery
If data is lost or corrupted:
1. Check for backup `students_data.json` files
2. Re-register student if necessary
3. Re-enter academic records from official transcripts

## 📞 Support

For technical support or questions about the Grade Manager:
- Review this documentation
- Check the troubleshooting section
- Verify system requirements are met

## 🔄 Future Enhancements

Potential future features:
- Web-based interface
- Multi-user database support
- Export to Excel/PDF
- Grade prediction algorithms
- Academic calendar integration
- Mobile application version

## 📝 License

This application is developed for educational purposes for Takoradi Technical University students. All rights reserved.

---

**🎓 Takoradi Technical University - Academic Excellence Portal**
*Empowering students to achieve academic success through effective grade management and personalized guidance.*