from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import *

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        min_length=2,
        trim_whitespace=True,
    )

    email = serializers.EmailField()

    phone = serializers.CharField(
        max_length=15,
        min_length=10,
        trim_whitespace=True,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=128,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=128,
    )

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        # Keep only digits.
        digits = "".join(character for character in value if character.isdigit())

        # Accept +91XXXXXXXXXX or 10-digit Indian number.
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]

        if len(digits) != 10:
            raise serializers.ValidationError(
                "Enter a valid 10-digit phone number."
            )

        if not digits.startswith(("6", "7", "8", "9")):
            raise serializers.ValidationError(
                "Enter a valid Indian mobile number."
            )

        if CustomerProfile.objects.filter(phone=digits).exists():
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )

        return digits

    def validate(self, attrs):
        password = attrs["password"]
        confirm_password = attrs["confirm_password"]

        if password != confirm_password:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        name = validated_data["name"]
        email = validated_data["email"]
        phone = validated_data["phone"]
        password = validated_data["password"]

        first_name, *last_name_parts = name.split()
        last_name = " ".join(last_name_parts)

        # username is kept internally because Django's built-in
        # User model requires it.
        username = email

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        CustomerProfile.objects.create(
            user=user,
            phone=phone,
        )

        return user
    
    
    
   
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "full_name",
            "phone",
            "address_line1",
            "address_line2",
            "landmark",
            "city",
            "state",
            "pincode",
            "address_type",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_phone(self, value):
        digits = "".join(character for character in value if character.isdigit())

        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]

        if len(digits) != 10:
            raise serializers.ValidationError(
                "Enter a valid 10-digit phone number."
            )

        if not digits.startswith(("6", "7", "8", "9")):
            raise serializers.ValidationError(
                "Enter a valid Indian mobile number."
            )

        return digits
    
    
 
class CustomerProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = CustomerProfile
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "is_phone_verified",
            "profile_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "name",
            "email",
            "is_phone_verified",
            "created_at",
            "updated_at",
        ]

    def get_name(self, obj):
        return obj.user.get_full_name()
    
    
       
    
    
    
    
    
    
    
    
    
    
    
    
    