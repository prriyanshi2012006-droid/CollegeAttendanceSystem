# attendance_app/views.py
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken # We will assume JWT is used for auth

from django.contrib.auth import authenticate
from django.db import IntegrityError

from .models import User, StudentProfile, Course, AttendanceRecord
from .serializers import (
    LoginSerializer, UserSerializer, StudentProfileSerializer, 
    CourseSerializer, AttendanceRecordSerializer
)

# -----------------------------------------------------------
# 1. AUTHENTICATION (Login, Logout)
# -----------------------------------------------------------

class LoginView(APIView):
    permission_classes = [AllowAny] # Allow access without authentication

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            
            # Add specific profile data based on role
            if user.role == 'student':
                try:
                    profile = StudentProfile.objects.get(user=user)
                    user_data['roll_number'] = profile.roll_number
                    user_data['course_of_study'] = profile.course_of_study
                except StudentProfile.DoesNotExist:
                    # Handle case where student exists but profile is missing
                    pass
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user_data,
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'detail': 'Invalid credentials or user not found.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

# NOTE: Logout is typically handled by the frontend discarding the JWT token.
# We don't need a specific backend view for a simple token-based logout.

# -----------------------------------------------------------
# 2. ROLE-SPECIFIC ENDPOINTS
# -----------------------------------------------------------

# Student Dashboard Data
class StudentDashboardView(generics.RetrieveAPIView):
    """
    Endpoint for students to retrieve their profile and attendance data.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated] # Only logged-in users can access

    def get_object(self):
        # Ensure the logged-in user is a student
        if self.request.user.role != 'student':
            raise status.HTTP_403_FORBIDDEN("Access denied. Not a student.")

        # Return the StudentProfile object for the current user
        return StudentProfile.objects.get(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        data = serializer.data
        
        # --- Add Mocked Attendance Report Data (Needs real calculations in Phase 3 refinement) ---
        # For simplicity in this phase, we return the student data and rely on frontend mock logic
        # OR: In a future step, you'd add logic to calculate attendance percentage per course here
        
        return Response(data)

# Faculty Dashboard Data (Class list for marking attendance)
class FacultyClassListView(generics.ListAPIView):
    """
    Endpoint for faculty to get the list of students in their assigned courses.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure the logged-in user is a faculty
        if self.request.user.role != 'faculty':
            return StudentProfile.objects.none()

        # Find all courses assigned to this faculty member
        assigned_courses = Course.objects.filter(faculty=self.request.user)
        
        # Get all students enrolled in those assigned courses
        # We need a distinct list of students across all assigned courses
        student_ids = StudentProfile.enrolled_courses.through.objects.filter(
            course__in=assigned_courses
        ).values_list('studentprofile_id', flat=True).distinct()
        
        return StudentProfile.objects.filter(pk__in=student_ids).select_related('user')

# Mark Attendance Endpoint
class MarkAttendanceView(APIView):
    """
    Endpoint for faculty to submit daily attendance records.
    Expects a list of attendance objects [{course_id, student_id, date, status}]
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'faculty':
            return Response({"detail": "Permission denied. Only faculty can mark attendance."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        attendance_data = request.data
        
        # Validate if the data is a list of records
        if not isinstance(attendance_data, list):
            return Response({"detail": "Invalid data format. Expected a list of records."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        successful_saves = 0
        errors = []
        
        for record in attendance_data:
            # We assume the frontend sends the course ID and student ID
            record['course'] = record.get('course_id')
            record['student'] = record.get('student_id')
            record['date'] = record.get('date')
            record['status'] = record.get('status')
            
            serializer = AttendanceRecordSerializer(data=record)
            
            if serializer.is_valid():
                try:
                    # Check if the faculty teaching this course is the one marking attendance (security check)
                    course_id = serializer.validated_data['course'].id
                    if not Course.objects.filter(id=course_id, faculty=request.user).exists():
                        errors.append(f"Faculty not authorized to mark attendance for Course ID {course_id}")
                        continue

                    # Attempt to create or update the attendance record (unique_together constraint)
                    AttendanceRecord.objects.update_or_create(
                        course=serializer.validated_data['course'],
                        student=serializer.validated_data['student'],
                        date=serializer.validated_data['date'],
                        defaults={'status': serializer.validated_data['status']}
                    )
                    successful_saves += 1
                except IntegrityError as e:
                    errors.append(f"Database error saving record: {e}")
                except Exception as e:
                    errors.append(f"Unexpected error saving record: {e}")
            else:
                errors.append(f"Validation failed for record: {serializer.errors}")

        if errors:
            return Response({
                "message": f"Successfully processed {successful_saves} records. Errors encountered: {len(errors)}",
                "errors": errors
            }, status=status.HTTP_207_MULTI_STATUS) # Use 207 for partial success/errors
        else:
            return Response({
                "message": f"Successfully marked attendance for {successful_saves} students.",
            }, status=status.HTTP_201_CREATED)

# -----------------------------------------------------------
# 3. ADMIN MANAGEMENT (Faculty/Course Management)
# -----------------------------------------------------------

# Use a ViewSet for standard CRUD operations on Courses (Admin only)
class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Admin to manage Course records (CRUD).
    """
    queryset = Course.objects.all().select_related('faculty')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    # Custom check to enforce Admin role for all actions
    def check_permissions(self, request):
        if request.user.role != 'admin':
            self.permission_denied(request, message="Only Admins can manage courses.")
        return super().check_permissions(request)

# Use a ViewSet for Faculty Management (Admin only)
class FacultyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Admin to manage Faculty accounts (User role=faculty).
    """
    queryset = User.objects.filter(role='faculty')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    # Custom check to enforce Admin role for all actions
    def check_permissions(self, request):
        if request.user.role != 'admin':
            self.permission_denied(request, message="Only Admins can manage faculty.")
        return super().check_permissions(request)

    def perform_create(self, serializer):
        # Automatically set the role to 'faculty' when creating
        serializer.save(role='faculty')