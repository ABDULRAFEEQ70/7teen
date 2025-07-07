using Newtonsoft.Json;
using TakoradiTechGradeManager.Models;

namespace TakoradiTechGradeManager.Services
{
    public class GradeManager
    {
        private readonly string _dataFilePath;
        private List<Student> _students;

        public GradeManager(string dataFilePath = "students_data.json")
        {
            _dataFilePath = dataFilePath;
            _students = LoadStudents();
        }

        public List<Student> GetAllStudents()
        {
            return _students;
        }

        public Student? GetStudentByNumber(string studentNumber)
        {
            return _students.FirstOrDefault(s => s.StudentNumber.Equals(studentNumber, StringComparison.OrdinalIgnoreCase));
        }

        public void AddStudent(Student student)
        {
            if (_students.Any(s => s.StudentNumber.Equals(student.StudentNumber, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("A student with this number already exists.");
            }
            
            _students.Add(student);
            SaveStudents();
        }

        public void UpdateStudent(Student student)
        {
            var existingStudent = _students.FirstOrDefault(s => s.Id == student.Id);
            if (existingStudent != null)
            {
                var index = _students.IndexOf(existingStudent);
                _students[index] = student;
                SaveStudents();
            }
        }

        public void AddSemester(string studentNumber, Semester semester)
        {
            var student = GetStudentByNumber(studentNumber);
            if (student == null)
            {
                throw new InvalidOperationException("Student not found.");
            }

            // Check if semester already exists
            var existingSemester = student.Semesters.FirstOrDefault(s => 
                s.Level == semester.Level && s.SemesterNumber == semester.SemesterNumber);
            
            if (existingSemester != null)
            {
                throw new InvalidOperationException("This semester already exists for the student.");
            }

            student.Semesters.Add(semester);
            UpdateStudent(student);
        }

        public void AddCourse(string studentNumber, int level, int semesterNumber, Course course)
        {
            var student = GetStudentByNumber(studentNumber);
            if (student == null)
            {
                throw new InvalidOperationException("Student not found.");
            }

            var semester = student.Semesters.FirstOrDefault(s => 
                s.Level == level && s.SemesterNumber == semesterNumber);
            
            if (semester == null)
            {
                throw new InvalidOperationException("Semester not found. Please add the semester first.");
            }

            // Check if course already exists in this semester
            if (semester.Courses.Any(c => c.CourseCode.Equals(course.CourseCode, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("This course already exists in the semester.");
            }

            semester.Courses.Add(course);
            UpdateStudent(student);
        }

        public void UpdateCourseGrade(string studentNumber, int level, int semesterNumber, string courseCode, double percentage)
        {
            var student = GetStudentByNumber(studentNumber);
            if (student == null)
            {
                throw new InvalidOperationException("Student not found.");
            }

            var semester = student.Semesters.FirstOrDefault(s => 
                s.Level == level && s.SemesterNumber == semesterNumber);
            
            if (semester == null)
            {
                throw new InvalidOperationException("Semester not found.");
            }

            var course = semester.Courses.FirstOrDefault(c => 
                c.CourseCode.Equals(courseCode, StringComparison.OrdinalIgnoreCase));
            
            if (course == null)
            {
                throw new InvalidOperationException("Course not found.");
            }

            course.SetGrade(percentage);
            UpdateStudent(student);
        }

        public List<string> GetImprovementSuggestions(Student student)
        {
            var suggestions = new List<string>();
            var currentGPA = student.OverallGPA;

            // General suggestions based on GPA
            if (currentGPA < 1.0)
            {
                suggestions.Add("⚠️  CRITICAL: Your GPA is below 1.0. You need immediate academic intervention.");
                suggestions.Add("📚 Consider retaking failed courses to improve your standing.");
                suggestions.Add("👥 Seek academic counseling and tutoring support immediately.");
                suggestions.Add("⏰ Develop a strict study schedule with at least 6-8 hours daily.");
            }
            else if (currentGPA < 2.0)
            {
                suggestions.Add("📈 Your GPA needs significant improvement to reach Second Class Lower (2.0+).");
                suggestions.Add("🎯 Focus on courses with higher credit hours for maximum impact.");
                suggestions.Add("📖 Improve study techniques - consider active learning methods.");
                suggestions.Add("👨‍🏫 Attend all lectures and participate in class discussions.");
            }
            else if (currentGPA < 3.0)
            {
                suggestions.Add("🎯 You're close to Second Class Upper! Focus on consistency.");
                suggestions.Add("📊 Identify your weakest subjects and allocate more study time to them.");
                suggestions.Add("👥 Form study groups with high-performing classmates.");
                suggestions.Add("📝 Review past exam papers and practice regularly.");
            }
            else if (currentGPA < 3.6)
            {
                suggestions.Add("🏆 Excellent work! You're on track for Second Class Upper.");
                suggestions.Add("🎯 Push for First Class by targeting A grades in remaining courses.");
                suggestions.Add("📚 Consider advanced study techniques and research projects.");
                suggestions.Add("🤝 Help classmates while reinforcing your own knowledge.");
            }
            else
            {
                suggestions.Add("🌟 Outstanding! You're achieving First Class honors.");
                suggestions.Add("🎓 Maintain this excellent standard through graduation.");
                suggestions.Add("🔬 Consider research opportunities and academic competitions.");
                suggestions.Add("💼 Start building your professional network and CV.");
            }

            // Course-specific suggestions
            var recentSemester = student.Semesters.OrderByDescending(s => s.Level)
                .ThenByDescending(s => s.SemesterNumber).FirstOrDefault();
            
            if (recentSemester != null)
            {
                var failingCourses = recentSemester.Courses.Where(c => c.LetterGrade == "F").ToList();
                var lowGrades = recentSemester.Courses.Where(c => c.GradePoint < 2.0 && c.LetterGrade != "F").ToList();

                if (failingCourses.Any())
                {
                    suggestions.Add($"🚨 You have {failingCourses.Count} failing course(s) in your recent semester.");
                    suggestions.Add("📋 Priority: Focus on retaking or supplementary exams for failed courses.");
                }

                if (lowGrades.Any())
                {
                    suggestions.Add($"⚡ {lowGrades.Count} course(s) have grades below C. These need attention.");
                    suggestions.Add("🎯 Target these specific courses for grade improvement:");
                    foreach (var course in lowGrades.Take(3))
                    {
                        suggestions.Add($"   • {course.CourseCode}: {course.CourseName} (Current: {course.LetterGrade})");
                    }
                }
            }

            // Level-specific advice
            if (student.CurrentLevel == 100)
            {
                suggestions.Add("🎓 Foundation Year: Build strong study habits early.");
                suggestions.Add("📚 Focus on understanding fundamental concepts thoroughly.");
            }
            else if (student.CurrentLevel == 400)
            {
                suggestions.Add("🏁 Final Year: Every grade counts towards your final classification.");
                suggestions.Add("🎯 Consider project work and dissertations as grade boosters.");
            }

            return suggestions;
        }

        private List<Student> LoadStudents()
        {
            try
            {
                if (File.Exists(_dataFilePath))
                {
                    var json = File.ReadAllText(_dataFilePath);
                    return JsonConvert.DeserializeObject<List<Student>>(json) ?? new List<Student>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading student data: {ex.Message}");
            }
            
            return new List<Student>();
        }

        private void SaveStudents()
        {
            try
            {
                var json = JsonConvert.SerializeObject(_students, Formatting.Indented);
                File.WriteAllText(_dataFilePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving student data: {ex.Message}");
            }
        }
    }
}