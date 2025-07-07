using Newtonsoft.Json;

namespace TakoradiTechGradeManager.Models
{
    public class Semester
    {
        public string Id { get; set; } = string.Empty;
        public int Level { get; set; } // 100, 200, 300, 400
        public int SemesterNumber { get; set; } // 1 or 2
        public string AcademicYear { get; set; } = string.Empty; // e.g., "2023/2024"
        public List<Course> Courses { get; set; } = new List<Course>();
        
        [JsonIgnore]
        public double GPA
        {
            get
            {
                if (!Courses.Any()) return 0.0;
                
                double totalQualityPoints = QualityPoints;
                int totalCreditHours = TotalCreditHours;
                
                return totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0.0;
            }
        }
        
        [JsonIgnore]
        public double QualityPoints
        {
            get
            {
                return Courses.Sum(c => c.CreditHours * c.GradePoint);
            }
        }
        
        [JsonIgnore]
        public int TotalCreditHours
        {
            get
            {
                return Courses.Sum(c => c.CreditHours);
            }
        }
        
        [JsonIgnore]
        public string SemesterName => $"Level {Level} Semester {SemesterNumber}";

        public Semester()
        {
            Id = Guid.NewGuid().ToString();
        }

        public Semester(int level, int semesterNumber, string academicYear)
        {
            Id = Guid.NewGuid().ToString();
            Level = level;
            SemesterNumber = semesterNumber;
            AcademicYear = academicYear;
        }
    }
}