
from django.contrib import admin
from django.urls import path
from django.contrib import admin
from django.urls import path, include
from django.urls import path, include
from django.views.generic.base import RedirectView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.generic.base import RedirectView # <-- Import this
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('attendance_app.urls')),
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
