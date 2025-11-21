# attendance_app/views.py
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.db import IntegrityError

from .models import User, StudentProfile, Course, AttendanceRecord
from .serializers import (
    LoginSerializer, UserSerializer, StudentProfileSerializer, 
    CourseSerializer, AttendanceRecordSerializer
)

# -------------------------
# Login View (returns tokens + user)
# -------------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials or user not found.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        # Add student profile info if student
        if getattr(user, 'role', None) == 'student':
            try:
                profile = StudentProfile.objects.get(user=user)
                user_data['roll_number'] = profile.roll_number
                user_data['course_of_study'] = profile.course_of_study
            except StudentProfile.DoesNotExist:
                pass

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data,
        }, status=status.HTTP_200_OK)

# -------------------------
# Student Dashboard View
# -------------------------
class StudentDashboardView(generics.RetrieveAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if getattr(self.request.user, 'role', None) != 'student':
            raise PermissionDenied("Access denied. Not a student.")
        try:
            return StudentProfile.objects.get(user=self.request.user)
        except StudentProfile.DoesNotExist:
            raise NotFound("Student profile not found for the authenticated user.")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

# -------------------------
# Faculty / Attendance / Admin endpoints (unchanged logic)
# -------------------------
class FacultyClassListView(generics.ListAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) != 'faculty':
            return StudentProfile.objects.none()
        assigned_courses = Course.objects.filter(faculty=self.request.user)
        student_ids = StudentProfile.enrolled_courses.through.objects.filter(
            course__in=assigned_courses
        ).values_list('studentprofile_id', flat=True).distinct()
        return StudentProfile.objects.filter(pk__in=student_ids).select_related('user')

class MarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'role', None) != 'faculty':
            return Response({"detail": "Permission denied. Only faculty can mark attendance."}, status=status.HTTP_403_FORBIDDEN)

        attendance_data = request.data
        if not isinstance(attendance_data, list):
            return Response({"detail": "Invalid data format. Expected a list of records."}, status=status.HTTP_400_BAD_REQUEST)

        successful_saves = 0
        errors = []

        for record in attendance_data:
            record['course'] = record.get('course_id')
            record['student'] = record.get('student_id')
            record['date'] = record.get('date')
            record['status'] = record.get('status')

            serializer = AttendanceRecordSerializer(data=record)
            if serializer.is_valid():
                try:
                    course_id = serializer.validated_data['course'].id
                    if not Course.objects.filter(id=course_id, faculty=request.user).exists():
                        errors.append(f"Faculty not authorized to mark attendance for Course ID {course_id}")
                        continue

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
            }, status=status.HTTP_207_MULTI_STATUS)
        return Response({"message": f"Successfully marked attendance for {successful_saves} students."}, status=status.HTTP_201_CREATED)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().select_related('faculty')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            self.permission_denied(request, message="Only Admins can manage courses.")
        return super().check_permissions(request)

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='faculty')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            self.permission_denied(request, message="Only Admins can manage faculty.")
        return super().check_permissions(request)

    def perform_create(self, serializer):
        serializer.save(role='faculty')
