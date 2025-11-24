from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction

from .models import User, StudentProfile, Course, AttendanceRecord
from .serializers import (
    LoginSerializer, UserSerializer, StudentProfileSerializer,
    CourseSerializer, AttendanceRecordSerializer
)


# ------------------------------
# 1. LOGIN VIEW
# ------------------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials or user not found.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        # Add student-specific info
        if user.role == 'student':
            try:
                profile = StudentProfile.objects.get(user=user)
                user_data['roll_number'] = profile.roll_number
                user_data['course_of_study'] = profile.course_of_study
            except StudentProfile.DoesNotExist:
                pass

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data
        }, status=status.HTTP_200_OK)


# ------------------------------
# 2. STUDENT DASHBOARD VIEW
# ------------------------------
class StudentDashboardView(generics.RetrieveAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if self.request.user.role != 'student':
            raise PermissionDenied("Access denied. Not a student.")
        try:
            return StudentProfile.objects.get(user=self.request.user)
        except StudentProfile.DoesNotExist:
            raise NotFound("Student profile not found for the authenticated user.")


# ------------------------------
# 3. FACULTY CLASS LIST VIEW
# ------------------------------
class FacultyClassListView(generics.ListAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'faculty':
            return StudentProfile.objects.none()
        # Get courses assigned to this faculty
        assigned_courses = Course.objects.filter(faculty=self.request.user)
        # Get student IDs enrolled in these courses
        student_ids = StudentProfile.enrolled_courses.through.objects.filter(
            course__in=assigned_courses
        ).values_list('studentprofile_id', flat=True).distinct()
        return StudentProfile.objects.filter(pk__in=student_ids).select_related('user')


# ------------------------------
# 4. MARK ATTENDANCE VIEW
# ------------------------------
class MarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'faculty':
            return Response({"detail": "Permission denied. Only faculty can mark attendance."},
                            status=status.HTTP_403_FORBIDDEN)

        attendance_data = request.data
        if not isinstance(attendance_data, list):
            return Response({"detail": "Invalid data format. Expected a list of records."},
                            status=status.HTTP_400_BAD_REQUEST)

        successful_saves = 0
        errors = []

        for record in attendance_data:
            course_id = record.get('course_id') or record.get('course')
            student_id = record.get('student_id') or record.get('student')
            record_date = record.get('date')
            status_value = record.get('status')

            # Validation
            if not course_id or not student_id or not record_date:
                errors.append(f"Missing fields in record: {record}")
                continue
            if str(status_value).upper() not in ('P', 'A'):
                errors.append(f"Invalid status '{status_value}'. Use 'P' or 'A'.")
                continue
            status_value = str(status_value).upper()

            try:
                course_obj = Course.objects.get(pk=course_id)
            except Course.DoesNotExist:
                errors.append(f"Course not found for id={course_id}")
                continue

            if course_obj.faculty != request.user:
                errors.append(f"Faculty not authorized to mark attendance for course ID {course_id}")
                continue

            try:
                student_profile = StudentProfile.objects.get(pk=student_id)
            except StudentProfile.DoesNotExist:
                try:
                    student_profile = StudentProfile.objects.get(user__id=student_id)
                except StudentProfile.DoesNotExist:
                    errors.append(f"StudentProfile not found for id={student_id}")
                    continue

            try:
                with transaction.atomic():
                    AttendanceRecord.objects.update_or_create(
                        course=course_obj,
                        student=student_profile,
                        date=record_date,
                        defaults={'status': status_value}
                    )
                successful_saves += 1
            except IntegrityError as e:
                errors.append(f"DB error for course={course_id}, student={student_profile.pk}, date={record_date}: {e}")
            except Exception as e:
                errors.append(f"Unexpected error for course={course_id}, student={student_profile.pk}, date={record_date}: {e}")

        return Response({
            "message": f"Successfully processed {successful_saves} records. Errors: {len(errors)}",
            "errors": errors
        }, status=status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED)


# ------------------------------
# 5. COURSE VIEWSET (ADMIN ONLY)
# ------------------------------
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().select_related('faculty')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        if request.user.role != 'admin':
            self.permission_denied(request, message="Only Admins can manage courses.")
        return super().check_permissions(request)


# ------------------------------
# 6. FACULTY VIEWSET (ADMIN ONLY)
# ------------------------------
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='faculty')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        if request.user.role != 'admin':
            self.permission_denied(request, message="Only Admins can manage faculty.")
        return super().check_permissions(request)

    def perform_create(self, serializer):
        serializer.save(role='faculty')


# ------------------------------
# 7. OPTIONAL: FACULTY PROFILE VIEW
# ------------------------------
class FacultyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'faculty':
            raise PermissionDenied("Not a faculty member")
        data = UserSerializer(request.user).data
        return Response(data)
