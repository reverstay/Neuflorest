from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import serializers

from .models import EmailVerificationOTP
from .services import create_or_update_google_user, normalize_email, verify_email_otp


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_email_verified = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "is_email_verified"]

    def get_full_name(self, user) -> str:
        full_name = user.get_full_name().strip()
        return full_name or user.email


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class SignUpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value: str) -> str:
        email = normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if len(email) > 150:
            raise serializers.ValidationError("Email is too long for the current account username policy.")
        return email

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        user = User(
            username=email,
            email=email,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            is_active=False,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(regex=r"^\d{6}$", max_length=6)

    def validate(self, attrs):
        user = verify_email_otp(attrs["email"], attrs["code"])
        if user is None:
            raise serializers.ValidationError("Invalid, expired, or exhausted verification code.")

        attrs["user"] = user
        return attrs


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        email = normalize_email(value)
        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            raise serializers.ValidationError("No pending account found for this email.")
        if user.is_active:
            raise serializers.ValidationError("This account is already verified.")

        latest_otp = (
            EmailVerificationOTP.objects.filter(email=email, consumed_at__isnull=True)
            .order_by("-created_at")
            .first()
        )
        if latest_otp is not None:
            cooldown_until = latest_otp.created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
            if timezone.now() < cooldown_until:
                raise serializers.ValidationError("Please wait before requesting another verification code.")

        self.context["user"] = user
        return email


class EmailPasswordLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = normalize_email(attrs["email"])
        user = User.objects.filter(email__iexact=email).first()

        if user is not None and not user.is_active:
            raise serializers.ValidationError("Email verification is required before login.")

        authenticated_user = authenticate(username=email, password=attrs["password"])
        if authenticated_user is None:
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = authenticated_user
        return attrs


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(write_only=True)

    def validate(self, attrs):
        client_id = settings.GOOGLE_OAUTH_CLIENT_ID
        if not client_id:
            raise serializers.ValidationError("Google OAuth client id is not configured.")

        try:
            payload = id_token.verify_oauth2_token(
                attrs["credential"],
                google_requests.Request(),
                client_id,
            )
        except ValueError as exc:
            raise serializers.ValidationError("Invalid Google credential.") from exc

        if not payload.get("email_verified"):
            raise serializers.ValidationError("Google account email is not verified.")

        email = payload.get("email")
        if not email:
            raise serializers.ValidationError("Google credential did not include an email address.")

        attrs["user"] = create_or_update_google_user(
            email=email,
            first_name=payload.get("given_name", ""),
            last_name=payload.get("family_name", ""),
        )
        return attrs
