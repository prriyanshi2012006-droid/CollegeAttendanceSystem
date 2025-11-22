# attendance_app/permissions.py
from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    """Allows access only to users with role='student'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

class IsFaculty(BasePermission):
    """Allows access only to users with role='faculty'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'faculty'

class IsAdmin(BasePermission):
    """Allows access only to users with role='admin'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOfProfile(BasePermission):
    """Allows read/write access only to the owner of the StudentProfile."""
    def has_object_permission(self, request, view, obj):
        # For read permissions (GET, HEAD, OPTIONS), always allow access to the owner.
        if request.method in ('GET',):
            return obj.user == request.user

        # Write permissions are only allowed to the owner of the profile.
        return obj.user == request.user