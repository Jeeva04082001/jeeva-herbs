from django.contrib import admin

from .models import (
    CustomerProfile,
    Address,
    OTPVerification,
    LoginSession,
)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "phone",
        "is_phone_verified",
        "created_at",
    )
    list_filter = (
        "is_phone_verified",
        "created_at",
    )
    search_fields = (
        "user__username",
        "user__email",
        "phone",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "phone",
        "city",
        "state",
        "pincode",
        "address_type",
        "is_default",
    )
    list_filter = (
        "address_type",
        "is_default",
        "state",
    )
    search_fields = (
        "user__username",
        "user__email",
        "full_name",
        "phone",
        "city",
        "pincode",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "identifier",
        "purpose",
        "is_verified",
        "attempts",
        "expires_at",
        "created_at",
    )
    list_filter = (
        "purpose",
        "is_verified",
        "created_at",
    )
    search_fields = (
        "identifier",
        "user__username",
        "user__email",
    )
    readonly_fields = (
        "created_at",
    )


@admin.register(LoginSession)
class LoginSessionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "device_name",
        "ip_address",
        "expires_at",
        "is_revoked",
        "created_at",
        "last_used_at",
    )
    list_filter = (
        "is_revoked",
        "created_at",
    )
    search_fields = (
        "user__username",
        "user__email",
        "device_name",
        "ip_address",
    )
    readonly_fields = (
        "created_at",
    )
    
    
    
    
    
    
    