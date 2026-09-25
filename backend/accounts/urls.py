from django.urls import path

from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("admin/register/",AdminRegisterView.as_view(),name="admin_register"),
    
    
    # path("login/", TokenObtainPairView.as_view(), name="login"),
    path("login/", CookieTokenObtainPairView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    # path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/refresh/",CookieTokenRefreshView.as_view(),name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    
    path("addresses/",AddressListCreateView.as_view(),name="address_list_create"),
    path("addresses/<int:address_id>/",AddressDetailView.as_view(),name="address_detail"),
    path("profile/",ProfileView.as_view(),name="profile"),
]