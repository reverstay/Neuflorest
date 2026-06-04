from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import (
    EmailPasswordLoginSerializer,
    GoogleLoginSerializer,
    ResendOTPSerializer,
    SignUpSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from .services import create_email_verification_otp, issue_tokens_for_user, send_email_verification_otp


def auth_response(user) -> Response:
    tokens = issue_tokens_for_user(user)
    return Response(
        {
            **tokens,
            "user": UserSerializer(user).data,
        }
    )


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        delivery = create_email_verification_otp(user)
        send_email_verification_otp(delivery)

        return Response(
            {
                "detail": "Account created. Check your email for the verification code.",
                "email": user.email,
                "otp_expires_in_seconds": settings.OTP_EXPIRATION_MINUTES * 60,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return auth_response(serializer.validated_data["user"])


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.context["user"]
        delivery = create_email_verification_otp(user)
        send_email_verification_otp(delivery)

        return Response(
            {
                "detail": "A new verification code was sent.",
                "email": user.email,
                "otp_expires_in_seconds": settings.OTP_EXPIRATION_MINUTES * 60,
            }
        )


class EmailPasswordLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailPasswordLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return auth_response(serializer.validated_data["user"])


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return auth_response(serializer.validated_data["user"])


__all__ = [
    "EmailPasswordLoginView",
    "GoogleLoginView",
    "ResendOTPView",
    "SignUpView",
    "TokenRefreshView",
    "VerifyOTPView",
]
