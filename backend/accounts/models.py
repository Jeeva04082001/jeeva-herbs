from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class CustomerProfile(models.Model):
    """
    Additional customer information linked to Django's built-in User.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )

    phone = models.CharField(
        max_length=15,
        unique=True,
        blank=True,
        null=True,
    )

    is_phone_verified = models.BooleanField(default=False)

    profile_image = models.URLField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Customer_Profile"
        verbose_name = "Customer Profile"
        verbose_name_plural = "Customer Profiles"

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Address(models.Model):
    """
    Customer delivery addresses.
    A customer can have multiple addresses.
    """

    ADDRESS_TYPES = [
        ("home", "Home"),
        ("work", "Work"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
    )

    full_name = models.CharField(max_length=150)

    phone = models.CharField(max_length=15)

    address_line1 = models.CharField(max_length=255)

    address_line2 = models.CharField(
        max_length=255,
        blank=True,
    )

    landmark = models.CharField(
        max_length=150,
        blank=True,
    )

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100)

    pincode = models.CharField(max_length=10)

    address_type = models.CharField(
        max_length=20,
        choices=ADDRESS_TYPES,
        default="home",
    )

    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Address"
        verbose_name = "Address"
        verbose_name_plural = "Addresses"
        ordering = ["-is_default", "-created_at"]

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(
                user=self.user,
                is_default=True,
            ).exclude(pk=self.pk).update(
                is_default=False
            )

        super().save(*args, **kwargs)
    
    
    def __str__(self):
        return f"{self.full_name} - {self.city}"


class OTPVerification(models.Model):
    """
    OTP verification for phone/email authentication.
    """

    PURPOSES = [
        ("phone_signup", "Phone Signup"),
        ("phone_login", "Phone Login"),
        ("email_verification", "Email Verification"),
        ("password_reset", "Password Reset"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="otp_verifications",
        null=True,
        blank=True,
    )

    identifier = models.CharField(
        max_length=150,
        db_index=True,
    )

    otp = models.CharField(max_length=6)

    purpose = models.CharField(
        max_length=30,
        choices=PURPOSES,
    )

    expires_at = models.DateTimeField()

    is_verified = models.BooleanField(default=False)

    attempts = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "OTP_Verification"
        verbose_name = "OTP Verification"
        verbose_name_plural = "OTP Verifications"
        ordering = ["-created_at"]

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"{self.identifier} - {self.purpose}"


class LoginSession(models.Model):
    """
    Stores application login sessions.
    Used later for logout/revocation and session management.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="login_sessions",
    )

    session_id = models.CharField(
        max_length=255,
        unique=True,
    )

    refresh_token_jti = models.CharField(
        max_length=255,
        unique=True,
    )

    device_name = models.CharField(
        max_length=150,
        blank=True,
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    expires_at = models.DateTimeField()

    is_revoked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "Login_Session"
        verbose_name = "Login Session"
        verbose_name_plural = "Login Sessions"
        ordering = ["-created_at"]

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"{self.user.username} - {self.device_name or 'Unknown Device'}"