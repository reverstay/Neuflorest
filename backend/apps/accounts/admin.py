from django.contrib import admin

from .models import EmailVerificationOTP


@admin.register(EmailVerificationOTP)
class EmailVerificationOTPAdmin(admin.ModelAdmin):
    list_display = ("email", "purpose", "expires_at", "consumed_at", "attempts", "created_at")
    search_fields = ("email", "user__username")
    list_filter = ("purpose", "consumed_at", "created_at")
    readonly_fields = ("code_hash", "created_at", "sent_at")
