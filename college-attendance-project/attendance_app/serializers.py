# attendance_app/serializers.py
from rest_framework import serializers
from .models import User, StudentProfile, Course, AttendanceRecord
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# --- 1. Basic User Serializer ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'department']

# --- 2. Student Profile Serializer ---
class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['user', 'roll_number', 'course_of_study', 'enrolled_courses']

# --- 3. Course Serializer ---
class CourseSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.get_full_name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'course_code', 'title', 'faculty', 'faculty_name', 'total_classes']
        read_only_fields = ['total_classes']

# --- 4. Attendance Record Serializer ---
class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'course', 'student', 'date', 'status']

# --- 5. Login Serializer (simple input validation) ---
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

# --- 6. Optional: Custom Token serializer (if you later want TokenObtainPairView) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            "id": user.id,
            "username": user.username,
            "first_name": getattr(user, "first_name", ""),
            "last_name": getattr(user, "last_name", ""),
            "email": getattr(user, "email", ""),
            "role": getattr(user, "role", None),
            "department": getattr(user, "department", None)
        }
        return data
