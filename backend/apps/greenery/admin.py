from django.contrib import admin

from .models import Device, Plant, Planter, TelemetryLog


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("common_name", "species", "preferred_light", "watering_frequency_days")
    search_fields = ("common_name", "species")
    list_filter = ("preferred_light",)


@admin.register(Planter)
class PlanterAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "material_type", "slicing_profile", "print_time_minutes")
    search_fields = ("sku", "name", "slicing_profile")
    list_filter = ("material_type",)
    filter_horizontal = ("compatible_plants",)


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("device_identifier", "planter", "board_type", "status", "last_seen_at")
    search_fields = ("device_identifier", "firmware_version")
    list_filter = ("board_type", "status", "is_active")


@admin.register(TelemetryLog)
class TelemetryLogAdmin(admin.ModelAdmin):
    list_display = (
        "device",
        "captured_at",
        "moisture_level",
        "temperature_celsius",
        "light_intensity_lux",
    )
    search_fields = ("device__device_identifier",)
    list_filter = ("captured_at",)
    date_hierarchy = "captured_at"
