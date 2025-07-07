using TakoradiTechGradeManager.Models;
using TakoradiTechGradeManager.Services;

namespace TakoradiTechGradeManager
{
    class Program
    {
        private static readonly GradeManager gradeManager = new();
        private static Student? currentStudent;

        static void Main(string[] args)
        {
            Console.Clear();
            DisplayWelcomeHeader();
            
            while (true)
            {
                try
                {
                    if (currentStudent == null)
                    {
                        ShowLoginMenu();
                    }
                    else
                    {
                        ShowMainMenu();
                    }
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"\n❌ Error: {ex.Message}");
                    Console.ResetColor();
                    Console.WriteLine("\nPress any key to continue...");
                    Console.ReadKey();
                }
            }
        }

        private static void DisplayWelcomeHeader()
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("╔══════════════════════════════════════════════════════════════╗");
            Console.WriteLine("║                                                              ║");
            Console.WriteLine("║             TAKORADI TECHNICAL UNIVERSITY                    ║");
            Console.WriteLine("║                STUDENT GRADE MANAGER                         ║");
            Console.WriteLine("║                                                              ║");
            Console.WriteLine("║              📚 Academic Excellence Portal 📚                ║");
            Console.WriteLine("║                                                              ║");
            Console.WriteLine("╚══════════════════════════════════════════════════════════════╝");
            Console.ResetColor();
            Console.WriteLine();
        }

        private static void ShowLoginMenu()
        {
            Console.Clear();
            DisplayWelcomeHeader();
            
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("🔐 Student Authentication");
            Console.WriteLine("─────────────────────────");
            Console.ResetColor();
            
            Console.WriteLine("1. 📝 Register New Student");
            Console.WriteLine("2. 🔑 Login Existing Student");
            Console.WriteLine("3. 📋 View All Students (Admin)");
            Console.WriteLine("4. ❌ Exit");
            Console.WriteLine();
            
            Console.Write("Select an option (1-4): ");
            var choice = Console.ReadLine();
            
            switch (choice)
            {
                case "1":
                    RegisterNewStudent();
                    break;
                case "2":
                    LoginStudent();
                    break;
                case "3":
                    ViewAllStudents();
                    break;
                case "4":
                    Environment.Exit(0);
                    break;
                default:
                    Console.WriteLine("\n❌ Invalid option. Please try again.");
                    Console.ReadKey();
                    break;
            }
        }

        private static void ShowMainMenu()
        {
            Console.Clear();
            DisplayWelcomeHeader();
            
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"👋 Welcome, {currentStudent!.FullName}!");
            Console.WriteLine($"📚 Program: {currentStudent.Program}");
            Console.WriteLine($"🎓 Current: Level {currentStudent.CurrentLevel}, Semester {currentStudent.CurrentSemester}");
            Console.WriteLine($"📊 Overall GPA: {currentStudent.OverallGPA:F2} ({currentStudent.AcademicStanding})");
            Console.WriteLine("─────────────────────────────────────────────────────────────");
            Console.ResetColor();
            
            Console.WriteLine("1. 📊 View Academic Summary");
            Console.WriteLine("2. 📈 View Semester Grades");
            Console.WriteLine("3. ➕ Add New Semester");
            Console.WriteLine("4. 📚 Add Course to Semester");
            Console.WriteLine("5. ✏️  Update Course Grade");
            Console.WriteLine("6. 🎯 View Improvement Suggestions");
            Console.WriteLine("7. 📋 Grade Analysis & Statistics");
            Console.WriteLine("8. ⚙️  Update Student Info");
            Console.WriteLine("9. 🔓 Logout");
            Console.WriteLine();
            
            Console.Write("Select an option (1-9): ");
            var choice = Console.ReadLine();
            
            switch (choice)
            {
                case "1":
                    ViewAcademicSummary();
                    break;
                case "2":
                    ViewSemesterGrades();
                    break;
                case "3":
                    AddNewSemester();
                    break;
                case "4":
                    AddCourseToSemester();
                    break;
                case "5":
                    UpdateCourseGrade();
                    break;
                case "6":
                    ViewImprovementSuggestions();
                    break;
                case "7":
                    ViewGradeAnalysis();
                    break;
                case "8":
                    UpdateStudentInfo();
                    break;
                case "9":
                    currentStudent = null;
                    break;
                default:
                    Console.WriteLine("\n❌ Invalid option. Please try again.");
                    Console.ReadKey();
                    break;
            }
        }

        private static void RegisterNewStudent()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("📝 Register New Student");
            Console.WriteLine("─────────────────────");
            Console.ResetColor();
            
            Console.Write("First Name: ");
            var firstName = Console.ReadLine() ?? "";
            
            Console.Write("Last Name: ");
            var lastName = Console.ReadLine() ?? "";
            
            Console.Write("Student Number: ");
            var studentNumber = Console.ReadLine() ?? "";
            
            Console.Write("Program/Course of Study: ");
            var program = Console.ReadLine() ?? "";
            
            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName) || 
                string.IsNullOrWhiteSpace(studentNumber) || string.IsNullOrWhiteSpace(program))
            {
                Console.WriteLine("\n❌ All fields are required.");
                Console.ReadKey();
                return;
            }
            
            var student = new Student(firstName, lastName, studentNumber, program);
            gradeManager.AddStudent(student);
            
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n✅ Student registered successfully!");
            Console.ResetColor();
            Console.WriteLine("You can now login with your student number.");
            Console.ReadKey();
        }

        private static void LoginStudent()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("🔑 Student Login");
            Console.WriteLine("──────────────");
            Console.ResetColor();
            
            Console.Write("Enter your Student Number: ");
            var studentNumber = Console.ReadLine() ?? "";
            
            var student = gradeManager.GetStudentByNumber(studentNumber);
            if (student != null)
            {
                currentStudent = student;
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"\n✅ Welcome back, {student.FullName}!");
                Console.ResetColor();
                Console.ReadKey();
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n❌ Student not found. Please check your student number or register first.");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        private static void ViewAllStudents()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("📋 All Registered Students");
            Console.WriteLine("─────────────────────────");
            Console.ResetColor();
            
            var students = gradeManager.GetAllStudents();
            if (!students.Any())
            {
                Console.WriteLine("No students registered yet.");
            }
            else
            {
                Console.WriteLine($"{"Student No.",-12} {"Name",-25} {"Program",-20} {"GPA",-6} {"Standing",-20}");
                Console.WriteLine(new string('─', 85));
                
                foreach (var student in students.OrderBy(s => s.StudentNumber))
                {
                    Console.WriteLine($"{student.StudentNumber,-12} {student.FullName,-25} {student.Program,-20} {student.OverallGPA,-6:F2} {student.AcademicStanding,-20}");
                }
            }
            
            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
        }

        private static void ViewAcademicSummary()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("📊 Academic Summary");
            Console.WriteLine("─────────────────");
            Console.ResetColor();
            
            Console.WriteLine($"Student: {currentStudent!.FullName}");
            Console.WriteLine($"Student Number: {currentStudent.StudentNumber}");
            Console.WriteLine($"Program: {currentStudent.Program}");
            Console.WriteLine($"Current Level: {currentStudent.CurrentLevel}");
            Console.WriteLine($"Current Semester: {currentStudent.CurrentSemester}");
            Console.WriteLine();
            
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Overall GPA: {currentStudent.OverallGPA:F2}");
            Console.WriteLine($"Academic Standing: {currentStudent.AcademicStanding}");
            Console.ResetColor();
            Console.WriteLine();
            
            if (currentStudent.Semesters.Any())
            {
                Console.WriteLine("Semester Summary:");
                Console.WriteLine($"{"Semester",-20} {"Courses",-8} {"Credits",-8} {"GPA",-6}");
                Console.WriteLine(new string('─', 45));
                
                foreach (var semester in currentStudent.Semesters.OrderBy(s => s.Level).ThenBy(s => s.SemesterNumber))
                {
                    Console.WriteLine($"{semester.SemesterName,-20} {semester.Courses.Count,-8} {semester.TotalCreditHours,-8} {semester.GPA,-6:F2}");
                }
            }
            else
            {
                Console.WriteLine("No academic records found. Add semesters and courses to see your progress.");
            }
            
            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
        }

        private static void ViewSemesterGrades()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("📈 Semester Grades");
            Console.WriteLine("────────────────");
            Console.ResetColor();
            
            if (!currentStudent!.Semesters.Any())
            {
                Console.WriteLine("No semesters found. Add a semester first.");
                Console.ReadKey();
                return;
            }
            
            // List all semesters
            Console.WriteLine("Select a semester to view:");
            for (int i = 0; i < currentStudent.Semesters.Count; i++)
            {
                var semester = currentStudent.Semesters[i];
                Console.WriteLine($"{i + 1}. {semester.SemesterName} ({semester.AcademicYear}) - GPA: {semester.GPA:F2}");
            }
            
            Console.Write("\nEnter semester number: ");
            if (int.TryParse(Console.ReadLine(), out int semesterIndex) && 
                semesterIndex > 0 && semesterIndex <= currentStudent.Semesters.Count)
            {
                var selectedSemester = currentStudent.Semesters[semesterIndex - 1];
                DisplaySemesterDetails(selectedSemester);
            }
            else
            {
                Console.WriteLine("Invalid semester number.");
            }
            
            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
        }

        private static void DisplaySemesterDetails(Semester semester)
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"📈 {semester.SemesterName} Details");
            Console.WriteLine($"Academic Year: {semester.AcademicYear}");
            Console.WriteLine(new string('─', 50));
            Console.ResetColor();
            
            if (!semester.Courses.Any())
            {
                Console.WriteLine("No courses found in this semester.");
                return;
            }
            
            Console.WriteLine($"{"Course Code",-12} {"Course Name",-25} {"Credits",-8} {"Grade",-6} {"Points",-7} {"Percentage",-10}");
            Console.WriteLine(new string('─', 75));
            
            foreach (var course in semester.Courses.OrderBy(c => c.CourseCode))
            {
                Console.WriteLine($"{course.CourseCode,-12} {course.CourseName,-25} {course.CreditHours,-8} {course.LetterGrade,-6} {course.GradePoint,-7:F1} {course.Percentage,-10:F1}%");
            }
            
            Console.WriteLine(new string('─', 75));
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Total Credit Hours: {semester.TotalCreditHours}");
            Console.WriteLine($"Semester GPA: {semester.GPA:F2}");
            Console.WriteLine($"Quality Points: {semester.QualityPoints:F2}");
            Console.ResetColor();
        }

        private static void AddNewSemester()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("➕ Add New Semester");
            Console.WriteLine("──────────────────");
            Console.ResetColor();
            
            Console.Write("Enter Level (100, 200, 300, 400): ");
            if (!int.TryParse(Console.ReadLine(), out int level) || (level != 100 && level != 200 && level != 300 && level != 400))
            {
                Console.WriteLine("Invalid level. Must be 100, 200, 300, or 400.");
                Console.ReadKey();
                return;
            }
            
            Console.Write("Enter Semester Number (1 or 2): ");
            if (!int.TryParse(Console.ReadLine(), out int semesterNumber) || (semesterNumber != 1 && semesterNumber != 2))
            {
                Console.WriteLine("Invalid semester number. Must be 1 or 2.");
                Console.ReadKey();
                return;
            }
            
            Console.Write("Enter Academic Year (e.g., 2023/2024): ");
            var academicYear = Console.ReadLine() ?? "";
            
            if (string.IsNullOrWhiteSpace(academicYear))
            {
                Console.WriteLine("Academic year is required.");
                Console.ReadKey();
                return;
            }
            
            var semester = new Semester(level, semesterNumber, academicYear);
            gradeManager.AddSemester(currentStudent!.StudentNumber, semester);
            
            // Update current student reference
            currentStudent = gradeManager.GetStudentByNumber(currentStudent.StudentNumber);
            
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n✅ Semester added successfully!");
            Console.ResetColor();
            Console.ReadKey();
        }

        private static void AddCourseToSemester()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("📚 Add Course to Semester");
            Console.WriteLine("───────────────────────");
            Console.ResetColor();
            
            if (!currentStudent!.Semesters.Any())
            {
                Console.WriteLine("No semesters found. Add a semester first.");
                Console.ReadKey();
                return;
            }
            
            // Select semester
            Console.WriteLine("Select a semester:");
            for (int i = 0; i < currentStudent.Semesters.Count; i++)
            {
                var semester = currentStudent.Semesters[i];
                Console.WriteLine($"{i + 1}. {semester.SemesterName} ({semester.AcademicYear})");
            }
            
            Console.Write("\nEnter semester number: ");
            if (!int.TryParse(Console.ReadLine(), out int semesterIndex) || 
                semesterIndex < 1 || semesterIndex > currentStudent.Semesters.Count)
            {
                Console.WriteLine("Invalid semester number.");
                Console.ReadKey();
                return;
            }
            
            var selectedSemester = currentStudent.Semesters[semesterIndex - 1];
            
            // Get course details
            Console.Write("Course Code: ");
            var courseCode = Console.ReadLine() ?? "";
            
            Console.Write("Course Name: ");
            var courseName = Console.ReadLine() ?? "";
            
            Console.Write("Credit Hours: ");
            if (!int.TryParse(Console.ReadLine(), out int creditHours) || creditHours < 1)
            {
                Console.WriteLine("Invalid credit hours.");
                Console.ReadKey();
                return;
            }
            
            Console.Write("Enter Grade Percentage (optional, press Enter to skip): ");
            var percentageInput = Console.ReadLine();
            
            var course = new Course(courseCode, courseName, creditHours);
            
            if (!string.IsNullOrWhiteSpace(percentageInput) && double.TryParse(percentageInput, out double percentage))
            {
                course.SetGrade(percentage);
            }
            
            gradeManager.AddCourse(currentStudent.StudentNumber, selectedSemester.Level, selectedSemester.SemesterNumber, course);
            
            // Update current student reference
            currentStudent = gradeManager.GetStudentByNumber(currentStudent.StudentNumber);
            
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n✅ Course added successfully!");
            Console.ResetColor();
            Console.ReadKey();
        }

        private static void UpdateCourseGrade()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("✏️  Update Course Grade");
            Console.WriteLine("─────────────────────");
            Console.ResetColor();
            
            if (!currentStudent!.Semesters.Any())
            {
                Console.WriteLine("No semesters found.");
                Console.ReadKey();
                return;
            }
            
            // Select semester
            Console.WriteLine("Select a semester:");
            for (int i = 0; i < currentStudent.Semesters.Count; i++)
            {
                var semester = currentStudent.Semesters[i];
                Console.WriteLine($"{i + 1}. {semester.SemesterName} ({semester.AcademicYear})");
            }
            
            Console.Write("\nEnter semester number: ");
            if (!int.TryParse(Console.ReadLine(), out int semesterIndex) || 
                semesterIndex < 1 || semesterIndex > currentStudent.Semesters.Count)
            {
                Console.WriteLine("Invalid semester number.");
                Console.ReadKey();
                return;
            }
            
            var selectedSemester = currentStudent.Semesters[semesterIndex - 1];
            
            if (!selectedSemester.Courses.Any())
            {
                Console.WriteLine("No courses found in this semester.");
                Console.ReadKey();
                return;
            }
            
            // Select course
            Console.WriteLine("\nSelect a course:");
            for (int i = 0; i < selectedSemester.Courses.Count; i++)
            {
                var course = selectedSemester.Courses[i];
                Console.WriteLine($"{i + 1}. {course.CourseCode} - {course.CourseName} (Current: {course.LetterGrade}, {course.Percentage:F1}%)");
            }
            
            Console.Write("\nEnter course number: ");
            if (!int.TryParse(Console.ReadLine(), out int courseIndex) || 
                courseIndex < 1 || courseIndex > selectedSemester.Courses.Count)
            {
                Console.WriteLine("Invalid course number.");
                Console.ReadKey();
                return;
            }
            
            var selectedCourse = selectedSemester.Courses[courseIndex - 1];
            
            Console.Write($"Enter new percentage for {selectedCourse.CourseCode}: ");
            if (double.TryParse(Console.ReadLine(), out double percentage) && percentage >= 0 && percentage <= 100)
            {
                gradeManager.UpdateCourseGrade(currentStudent.StudentNumber, selectedSemester.Level, 
                    selectedSemester.SemesterNumber, selectedCourse.CourseCode, percentage);
                
                // Update current student reference
                currentStudent = gradeManager.GetStudentByNumber(currentStudent.StudentNumber);
                
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n✅ Grade updated successfully!");
                Console.ResetColor();
            }
            else
            {
                Console.WriteLine("Invalid percentage. Must be between 0 and 100.");
            }
            
            Console.ReadKey();
        }

        private static void ViewImprovementSuggestions()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("🎯 Academic Improvement Suggestions");
            Console.WriteLine("──────────────────────────────────");
            Console.ResetColor();
            
            var suggestions = gradeManager.GetImprovementSuggestions(currentStudent!);
            
            if (!suggestions.Any())
            {
                Console.WriteLine("No specific suggestions available. Add some academic records first.");
            }
            else
            {
                foreach (var suggestion in suggestions)
                {
                    Console.WriteLine($"• {suggestion}");
                    Console.WriteLine();
                }
            }
            
            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
        }

        private static void ViewGradeAnalysis()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("📋 Grade Analysis & Statistics");
            Console.WriteLine("─────────────────────────────");
            Console.ResetColor();
            
            if (!currentStudent!.Semesters.Any())
            {
                Console.WriteLine("No academic data available for analysis.");
                Console.ReadKey();
                return;
            }
            
            var allCourses = currentStudent.Semesters.SelectMany(s => s.Courses).ToList();
            var totalCourses = allCourses.Count;
            var completedCourses = allCourses.Where(c => !string.IsNullOrEmpty(c.LetterGrade)).ToList();
            
            Console.WriteLine($"Total Courses Registered: {totalCourses}");
            Console.WriteLine($"Courses with Grades: {completedCourses.Count}");
            Console.WriteLine($"Total Credit Hours: {allCourses.Sum(c => c.CreditHours)}");
            Console.WriteLine();
            
            if (completedCourses.Any())
            {
                // Grade distribution
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("Grade Distribution:");
                Console.ResetColor();
                
                var gradeGroups = completedCourses.GroupBy(c => c.LetterGrade).OrderByDescending(g => g.Key);
                foreach (var group in gradeGroups)
                {
                    var percentage = (double)group.Count() / completedCourses.Count * 100;
                    Console.WriteLine($"  {group.Key}: {group.Count()} courses ({percentage:F1}%)");
                }
                
                Console.WriteLine();
                
                // Semester progression
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("Semester GPA Progression:");
                Console.ResetColor();
                
                foreach (var semester in currentStudent.Semesters.OrderBy(s => s.Level).ThenBy(s => s.SemesterNumber))
                {
                    if (semester.Courses.Any())
                    {
                        Console.WriteLine($"  {semester.SemesterName}: {semester.GPA:F2}");
                    }
                }
                
                // Best and worst performing courses
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Top Performing Courses:");
                Console.ResetColor();
                
                var topCourses = completedCourses.Where(c => c.GradePoint > 0)
                    .OrderByDescending(c => c.GradePoint).Take(3);
                foreach (var course in topCourses)
                {
                    Console.WriteLine($"  {course.CourseCode}: {course.LetterGrade} ({course.Percentage:F1}%)");
                }
                
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Courses Needing Attention:");
                Console.ResetColor();
                
                var lowCourses = completedCourses.Where(c => c.GradePoint < 2.0)
                    .OrderBy(c => c.GradePoint).Take(3);
                foreach (var course in lowCourses)
                {
                    Console.WriteLine($"  {course.CourseCode}: {course.LetterGrade} ({course.Percentage:F1}%)");
                }
            }
            
            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
        }

        private static void UpdateStudentInfo()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("⚙️  Update Student Information");
            Console.WriteLine("────────────────────────────");
            Console.ResetColor();
            
            Console.WriteLine($"Current Information:");
            Console.WriteLine($"Name: {currentStudent!.FullName}");
            Console.WriteLine($"Student Number: {currentStudent.StudentNumber}");
            Console.WriteLine($"Program: {currentStudent.Program}");
            Console.WriteLine($"Current Level: {currentStudent.CurrentLevel}");
            Console.WriteLine($"Current Semester: {currentStudent.CurrentSemester}");
            Console.WriteLine();
            
            Console.WriteLine("What would you like to update?");
            Console.WriteLine("1. Current Level");
            Console.WriteLine("2. Current Semester");
            Console.WriteLine("3. Program");
            Console.WriteLine("4. Cancel");
            
            Console.Write("\nSelect option: ");
            var choice = Console.ReadLine();
            
            switch (choice)
            {
                case "1":
                    Console.Write("Enter new level (100, 200, 300, 400): ");
                    if (int.TryParse(Console.ReadLine(), out int level) && 
                        (level == 100 || level == 200 || level == 300 || level == 400))
                    {
                        currentStudent.CurrentLevel = level;
                        gradeManager.UpdateStudent(currentStudent);
                        Console.WriteLine("✅ Level updated successfully!");
                    }
                    else
                    {
                        Console.WriteLine("❌ Invalid level.");
                    }
                    break;
                    
                case "2":
                    Console.Write("Enter new semester (1 or 2): ");
                    if (int.TryParse(Console.ReadLine(), out int semester) && (semester == 1 || semester == 2))
                    {
                        currentStudent.CurrentSemester = semester;
                        gradeManager.UpdateStudent(currentStudent);
                        Console.WriteLine("✅ Semester updated successfully!");
                    }
                    else
                    {
                        Console.WriteLine("❌ Invalid semester.");
                    }
                    break;
                    
                case "3":
                    Console.Write("Enter new program: ");
                    var program = Console.ReadLine();
                    if (!string.IsNullOrWhiteSpace(program))
                    {
                        currentStudent.Program = program;
                        gradeManager.UpdateStudent(currentStudent);
                        Console.WriteLine("✅ Program updated successfully!");
                    }
                    else
                    {
                        Console.WriteLine("❌ Program cannot be empty.");
                    }
                    break;
                    
                case "4":
                    return;
                    
                default:
                    Console.WriteLine("❌ Invalid option.");
                    break;
            }
            
            Console.ReadKey();
        }
    }
}