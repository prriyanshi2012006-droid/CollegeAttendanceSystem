from django.db import models
from django.contrib.auth.models import AbstractUser


# 1. Custom User Model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    department = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# 2. Course Model
class Course(models.Model):
    course_code = models.CharField(max_length=10, unique=True)
    title = models.CharField(max_length=255)
    
    faculty = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'role': 'faculty'}
    )
    
    total_classes = models.IntegerField(default=0)

    def __str__(self):
        return self.title


# 3. Student Profile
class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        limit_choices_to={'role': 'student'}
    )
    
    roll_number = models.CharField(max_length=20, unique=True)
    course_of_study = models.CharField(max_length=100)

    enrolled_courses = models.ManyToManyField(
        Course,
        related_name='enrolled_students'
    )

    def __str__(self):
        return f"{self.roll_number} - {self.user.username}"


# 4. Attendance
class AttendanceRecord(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='daily_attendance'
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='student_attendance'
    )
    
    date = models.DateField()

    STATUS_CHOICES = (
        ('P', 'Present'),
        ('A', 'Absent'),
    )
    status = models.CharField(
        max_length=1,
        choices=STATUS_CHOICES,
        default='A'
    )

    class Meta:
        unique_together = ('course', 'student', 'date')

    def __str__(self):
        return f"{self.student.user.username} - {self.course.title} on {self.date}"
