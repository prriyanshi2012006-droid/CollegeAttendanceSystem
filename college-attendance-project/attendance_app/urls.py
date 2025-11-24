from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, StudentDashboardView, FacultyClassListView, MarkAttendanceView, CourseViewSet, FacultyViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'faculty', FacultyViewSet)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='api-login'),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('faculty/students-for-class/', FacultyClassListView.as_view(), name='faculty-class-list'),
    path('faculty/mark-attendance/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('', include(router.urls)),
]
