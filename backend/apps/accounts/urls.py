from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import EmailPasswordLoginView, GoogleLoginView, ResendOTPView, SignUpView, VerifyOTPView


urlpatterns = [
    path("signup/", SignUpView.as_view(), name="auth-signup"),
    path("verify-otp/", VerifyOTPView.as_view(), name="auth-verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="auth-resend-otp"),
    path("login/", EmailPasswordLoginView.as_view(), name="auth-login"),
    path("google/", GoogleLoginView.as_view(), name="auth-google"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
]
