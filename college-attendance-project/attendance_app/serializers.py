# attendance_app/serializers.py
from rest_framework import serializers
from .models import User, StudentProfile, Course, AttendanceRecord

# --- 1. Basic User Serializer (For internal linking) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'department']

# --- 2. Student Profile Serializer (For detailed student data) ---
class StudentProfileSerializer(serializers.ModelSerializer):
    # Use the basic UserSerializer to embed the related User data
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['user', 'roll_number', 'course_of_study', 'enrolled_courses']
        # We exclude 'enrolled_courses' for now, simplifying the student dashboard data

# --- 3. Course Serializer (For faculty and admin management) ---
class CourseSerializer(serializers.ModelSerializer):
    # Display the faculty name instead of just their ID
    faculty_name = serializers.CharField(source='faculty.get_full_name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'course_code', 'title', 'faculty', 'faculty_name', 'total_classes']
        read_only_fields = ['total_classes']

# --- 4. Attendance Record Serializer (For marking attendance POST request) ---
class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'course', 'student', 'date', 'status']
        # Note: 'course' and 'student' will be IDs sent from the frontend

# --- 5. Login Serializer (For handling login request) ---
class LoginSerializer(serializers.Serializer):
    """
    Serializer for handling the login request data (username and password).
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)