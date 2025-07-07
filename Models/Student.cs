using Newtonsoft.Json;

namespace TakoradiTechGradeManager.Models
{
    public class Student
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string StudentNumber { get; set; } = string.Empty;
        public string Program { get; set; } = string.Empty;
        public int CurrentLevel { get; set; } // 100, 200, 300, 400
        public int CurrentSemester { get; set; } // 1 or 2
        public List<Semester> Semesters { get; set; } = new List<Semester>();
        
        [JsonIgnore]
        public string FullName => $"{FirstName} {LastName}";
        
        [JsonIgnore]
        public double OverallGPA
        {
            get
            {
                if (!Semesters.Any()) return 0.0;
                
                double totalQualityPoints = 0;
                int totalCreditHours = 0;
                
                foreach (var semester in Semesters)
                {
                    totalQualityPoints += semester.QualityPoints;
                    totalCreditHours += semester.TotalCreditHours;
                }
                
                return totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0.0;
            }
        }
        
        [JsonIgnore]
        public string AcademicStanding
        {
            get
            {
                var gpa = OverallGPA;
                return gpa switch
                {
                    >= 3.6 => "First Class",
                    >= 3.0 => "Second Class Upper",
                    >= 2.0 => "Second Class Lower",
                    >= 1.0 => "Third Class",
                    _ => "Fail"
                };
            }
        }

        public Student()
        {
            Id = Guid.NewGuid().ToString();
        }

        public Student(string firstName, string lastName, string studentNumber, string program)
        {
            Id = Guid.NewGuid().ToString();
            FirstName = firstName;
            LastName = lastName;
            StudentNumber = studentNumber;
            Program = program;
            CurrentLevel = 100;
            CurrentSemester = 1;
        }
    }
}