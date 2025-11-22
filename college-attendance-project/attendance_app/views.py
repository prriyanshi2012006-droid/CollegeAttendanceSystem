# attendance_app/views.py
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Q
from django.contrib.auth import authenticate
from django.db import IntegrityError

from .permissions import IsStudent, IsFaculty, IsAdmin   # <--- Custom Permissions
from .models import User, StudentProfile, Course, AttendanceRecord
from .serializers import (
    LoginSerializer, UserSerializer, StudentProfileSerializer,
    CourseSerializer, AttendanceRecordSerializer
)

# ----------------------------------------------------
# Login View (returns access token + refresh + user detail)
# ----------------------------------------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials or user not found.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        # Append student profile details into login response
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


# ----------------------------------------------------
# Student Dashboard View (Detailed Attendance Summary)
# ----------------------------------------------------
class StudentDashboardView(generics.RetrieveAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_object(self):
        profile = StudentProfile.objects.filter(user=self.request.user).first()
        if not profile:
            raise NotFound("Student profile not found.")
        return profile

    def retrieve(self, request, *args, **kwargs):
        student_profile = self.get_object()
        profile_data = self.get_serializer(student_profile).data

        detailed_attendance = student_profile.enrolled_courses.annotate(
            total_records=Count('daily_attendance',
                                filter=Q(daily_attendance__student=student_profile)),
            attended_classes=Count('daily_attendance',
                                   filter=Q(daily_attendance__student=student_profile,
                                            daily_attendance__status='P')),
        ).values(
            'id', 'title', 'course_code', 'total_classes',
            'faculty__first_name', 'faculty__last_name',
            'total_records', 'attended_classes'
        )

        formatted_details = []
        overall_attended = 0
        overall_total = 0

        for record in detailed_attendance:
            total_attended = record['attended_classes']
            total_held = record['total_records']
            overall_attended += total_attended
            overall_total += total_held

            formatted_details.append({
                'course_id': record['id'],
                'subject': record['title'],
                'faculty': f"{record['faculty__first_name']} {record['faculty__last_name']}",
                'total_classes_held': total_held,
                'attended_classes': total_attended,
            })

        response_data = profile_data
        response_data['overall'] = {
            'attendedClasses': overall_attended,
            'totalClasses': overall_total,
        }
        response_data['detailedAttendance'] = formatted_details
        return Response(response_data)


# ----------------------------------------------------
# Faculty Class List View
# ----------------------------------------------------
class FacultyClassListView(generics.ListAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsFaculty]

    def get_queryset(self):
        assigned_courses = Course.objects.filter(faculty=self.request.user)
        student_ids = StudentProfile.enrolled_courses.through.objects.filter(
            course__in=assigned_courses
        ).values_list('studentprofile_id', flat=True).distinct()

        return StudentProfile.objects.filter(pk__in=student_ids).select_related('user')


# ----------------------------------------------------
# Mark Attendance View (Faculty Only)
# ----------------------------------------------------
class MarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsFaculty]

    def post(self, request):
        attendance_data = request.data
        if not isinstance(attendance_data, list):
            return Response({"detail": "Invalid format. Expected list."},
                            status=status.HTTP_400_BAD_REQUEST)

        successful_saves = 0
        errors = []

        for record in attendance_data:
            record['course'] = record.get('course_id')
            record['student'] = record.get('student_id')
            serializer = AttendanceRecordSerializer(data=record)

            if serializer.is_valid():
                try:
                    course_id = serializer.validated_data['course'].id
                    if not Course.objects.filter(id=course_id, faculty=request.user).exists():
                        errors.append(f"Unauthorized to mark attendance for Course {course_id}")
                        continue

                    AttendanceRecord.objects.update_or_create(
                        course=serializer.validated_data['course'],
                        student=serializer.validated_data['student'],
                        date=serializer.validated_data['date'],
                        defaults={'status': serializer.validated_data['status']}
                    )
                    successful_saves += 1
                except IntegrityError as e:
                    errors.append(f"DB error: {e}")
                except Exception as e:
                    errors.append(f"Unexpected: {e}")
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({
                "message": f"Processed {successful_saves} records. Errors: {len(errors)}",
                "errors": errors,
            }, status=status.HTTP_207_MULTI_STATUS)

        return Response({"message": f"Successfully marked attendance for {successful_saves} students."},
                        status=status.HTTP_201_CREATED)


# ----------------------------------------------------
# Course ViewSet (Admin Only)
# ----------------------------------------------------
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().select_related('faculty')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


# ----------------------------------------------------
# Faculty Management (Admin Only)
# ----------------------------------------------------
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='faculty')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def perform_create(self, serializer):
        serializer.save(role='faculty')
