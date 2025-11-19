# attendance_app/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile, Course, AttendanceRecord

# Customize the display of the User model in the Admin panel
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role', 'department')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'department', 'phone_number')}),
    )

# Register all models
admin.site.register(User, CustomUserAdmin)
admin.site.register(StudentProfile)
admin.site.register(Course)
admin.site.register(AttendanceRecord)