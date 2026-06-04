import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationOTP


User = get_user_model()


@dataclass(frozen=True)
class OTPDelivery:
    otp: EmailVerificationOTP
    raw_code: str


def normalize_email(email: str) -> str:
    return email.strip().lower()


def generate_numeric_otp(length: int = 6) -> str:
    upper_bound = 10**length
    return f"{secrets.randbelow(upper_bound):0{length}d}"


def create_email_verification_otp(user, purpose: str = EmailVerificationOTP.Purpose.EMAIL_VERIFICATION) -> OTPDelivery:
    raw_code = generate_numeric_otp()
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRATION_MINUTES)

    otp = EmailVerificationOTP.objects.create(
        user=user,
        email=normalize_email(user.email),
        purpose=purpose,
        code_hash=make_password(raw_code),
        expires_at=expires_at,
        max_attempts=settings.OTP_MAX_ATTEMPTS,
    )

    return OTPDelivery(otp=otp, raw_code=raw_code)


def send_email_verification_otp(delivery: OTPDelivery) -> None:
    minutes = settings.OTP_EXPIRATION_MINUTES
    subject = "Your neuflower verification code"
    message = (
        f"Your neuflower verification code is {delivery.raw_code}.\n\n"
        f"This code expires in {minutes} minutes. If you did not create an account, ignore this email."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[delivery.otp.email],
        fail_silently=False,
    )


def issue_tokens_for_user(user) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@transaction.atomic
def verify_email_otp(email: str, raw_code: str):
    normalized_email = normalize_email(email)
    otp = (
        EmailVerificationOTP.objects.select_for_update()
        .filter(
            email=normalized_email,
            purpose=EmailVerificationOTP.Purpose.EMAIL_VERIFICATION,
            consumed_at__isnull=True,
        )
        .order_by("-created_at")
        .first()
    )

    if otp is None or not otp.can_attempt:
        return None

    otp.attempts += 1
    otp.save(update_fields=["attempts"])

    if not check_password(raw_code, otp.code_hash):
        return None

    otp.consume()
    user = otp.user
    user.is_active = True
    user.save(update_fields=["is_active"])
    return user


def create_or_update_google_user(email: str, first_name: str = "", last_name: str = ""):
    normalized_email = normalize_email(email)
    user = User.objects.filter(email__iexact=normalized_email).first()

    if user is None:
        user = User(username=normalized_email, email=normalized_email, first_name=first_name, last_name=last_name)
        user.set_unusable_password()
    else:
        user.email = normalized_email
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

    user.is_active = True
    user.save()
    return user
