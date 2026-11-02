from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import *
from django.conf import settings

# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from store.models import Customer

class RegisterView(APIView):
    """
    Customer registration endpoint.

    POST /api/auth/register/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        Customer.objects.update_or_create(
            user=user,
            defaults={
                "full_name": user.get_full_name() or user.username,
                "phone": user.customer_profile.phone,
                "email": user.email or "",
                "customer_type": "registered",
            },
        )

        return Response(
            {
                "success": True,
                "message": "Account created successfully.",
                "user": {
                    "id": user.id,
                    "name": user.get_full_name(),
                    "email": user.email,
                    "phone": user.customer_profile.phone,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "success": True,
                "user": {
                    "id": user.id,
                    "name": user.get_full_name(),
                    "email": user.email,
                    "phone": (
                        user.customer_profile.phone
                        if hasattr(user, "customer_profile")
                        else None
                    ),
                    "is_staff": user.is_staff,
                },
            }
        )




class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)

        return Response(
            {
                "success": True,
                "addresses": serializer.data,
            }
        )

    def post(self, request):
        serializer = AddressSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if serializer.validated_data.get("is_default", False):
            Address.objects.filter(
                user=request.user,
                is_default=True,
            ).update(is_default=False)

        address = serializer.save(user=request.user)

        return Response(
            {
                "success": True,
                "message": "Address added successfully.",
                "address": AddressSerializer(address).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, address_id):
        return Address.objects.filter(
            id=address_id,
            user=request.user,
        ).first()

    def get(self, request, address_id):
        address = self.get_object(request, address_id)

        if not address:
            return Response(
                {
                    "success": False,
                    "message": "Address not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "success": True,
                "address": AddressSerializer(address).data,
            }
        )

    def put(self, request, address_id):
        address = self.get_object(request, address_id)

        if not address:
            return Response(
                {
                    "success": False,
                    "message": "Address not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AddressSerializer(
            address,
            data=request.data,
        )

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if serializer.validated_data.get("is_default", False):
            Address.objects.filter(
                user=request.user,
                is_default=True,
            ).exclude(
                pk=address.pk
            ).update(is_default=False)

        address = serializer.save()

        address = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Address updated successfully.",
                "address": AddressSerializer(address).data,
            }
        )

    def delete(self, request, address_id):
        address = self.get_object(request, address_id)

        if not address:
            return Response(
                {
                    "success": False,
                    "message": "Address not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        address.delete()

        return Response(
            {
                "success": True,
                "message": "Address deleted successfully.",
            }
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = CustomerProfile.objects.get_or_create(user=request.user)

        return Response(
            {
                "success": True,
                "profile": CustomerProfileSerializer(profile).data,
            }
        )

    def put(self, request):
        profile, created = CustomerProfile.objects.get_or_create(user=request.user)

        serializer = CustomerProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = serializer.save()

        # Update Django user's name
        name = request.data.get("name")

        if name:
            name = name.strip()

            parts = name.split()
            request.user.first_name = parts[0]
            request.user.last_name = " ".join(parts[1:])
            request.user.save(update_fields=["first_name", "last_name"])

        return Response(
            {
                "success": True,
                "message": "Profile updated successfully.",
                "profile": CustomerProfileSerializer(profile).data,
            }
        )


class AdminRegisterView(APIView):
    """
    Admin registration endpoint.

    POST /api/auth/admin/register/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip().lower()
        phone = request.data.get("phone", "").strip()
        password = request.data.get("password", "")
        confirm_password = request.data.get("confirm_password", "")

        # Required fields
        if not name or not email or not phone or not password:
            return Response(
                {"success": False, "message": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Password confirmation
        if password != confirm_password:
            return Response(
                {"success": False, "message": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check existing user
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"success": False, "message": "User with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create admin
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
            is_staff=True,
            is_active=True,
        )

        return Response(
            {
                "success": True,
                "message": "Admin created successfully.",
                "user": {
                    "id": user.id,
                    "name": user.get_full_name(),
                    "email": user.email,
                    "is_staff": user.is_staff,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")

            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=False,  # True in production HTTPS
                samesite="Lax",
                max_age=60 * 60,
                path="/",
            )

            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,  # True in production HTTPS
                samesite="Lax",
                max_age=60 * 60 * 24 * 7,
                path="/",
            )

            # Do NOT send JWT tokens to React/Postman response body
            response.data = {
                "success": True,
                "message": "Login successful.",
            }

        return response


class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh_token})

        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]

        response = Response(
            {"success": True, "message": "Token refreshed successfully."}
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60,
            path="/",
        )

        # If refresh token rotation is enabled,
        # SimpleJWT may return a new refresh token.
        new_refresh_token = serializer.validated_data.get("refresh")

        if new_refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=new_refresh_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=60 * 60 * 24 * 7,
                path="/",
            )

        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"success": True, "message": "Logged out successfully."})

        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")

        return response
