using Newtonsoft.Json;

namespace TakoradiTechGradeManager.Models
{
    public class Course
    {
        public string Id { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public int CreditHours { get; set; }
        public string LetterGrade { get; set; } = string.Empty;
        public double Percentage { get; set; }
        
        [JsonIgnore]
        public double GradePoint
        {
            get
            {
                return LetterGrade.ToUpper() switch
                {
                    "A" => 4.0,
                    "B+" => 3.5,
                    "B" => 3.0,
                    "C+" => 2.5,
                    "C" => 2.0,
                    "D+" => 1.5,
                    "D" => 1.0,
                    "F" => 0.0,
                    _ => 0.0
                };
            }
        }
        
        [JsonIgnore]
        public string GradeDescription
        {
            get
            {
                return LetterGrade.ToUpper() switch
                {
                    "A" => "Excellent",
                    "B+" => "Very Good",
                    "B" => "Good",
                    "C+" => "Credit Plus",
                    "C" => "Credit",
                    "D+" => "Pass Plus",
                    "D" => "Pass",
                    "F" => "Fail",
                    _ => "Unknown"
                };
            }
        }

        public Course()
        {
            Id = Guid.NewGuid().ToString();
        }

        public Course(string courseCode, string courseName, int creditHours)
        {
            Id = Guid.NewGuid().ToString();
            CourseCode = courseCode;
            CourseName = courseName;
            CreditHours = creditHours;
        }

        public void SetGrade(double percentage)
        {
            Percentage = percentage;
            LetterGrade = GetLetterGrade(percentage);
        }

        private static string GetLetterGrade(double percentage)
        {
            return percentage switch
            {
                >= 80 => "A",
                >= 75 => "B+",
                >= 70 => "B",
                >= 65 => "C+",
                >= 60 => "C",
                >= 55 => "D+",
                >= 50 => "D",
                _ => "F"
            };
        }
    }
}