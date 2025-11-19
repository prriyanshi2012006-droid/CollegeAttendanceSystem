# attendance_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, StudentDashboardView, FacultyClassListView, 
    MarkAttendanceView, CourseViewSet, FacultyViewSet
)

# Create a router instance for viewsets (Admin management endpoints)
router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'faculty', FacultyViewSet)

urlpatterns = [
    # 1. Authentication Endpoint
    path('auth/login/', LoginView.as_view(), name='api-login'),
    
    # 2. Student Endpoints (Detail retrieval for logged-in user)
    # The URL will be /api/student/dashboard/
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    
    # 3. Faculty Endpoints
    # The URL will be /api/faculty/students-for-class/ (to get list of students for marking)
    path('faculty/students-for-class/', FacultyClassListView.as_view(), name='faculty-class-list'),
    
    # The URL will be /api/faculty/mark-attendance/
    path('faculty/mark-attendance/', MarkAttendanceView.as_view(), name='mark-attendance'),
    
    # 4. Admin Management Endpoints (using router for courses/faculty/ etc.)
    # URLs will be /api/courses/, /api/faculty/, etc.
    path('', include(router.urls)),
]