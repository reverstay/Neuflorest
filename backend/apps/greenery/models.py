from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Plant(models.Model):
    class LightLevel(models.TextChoices):
        LOW = "low", "Low light"
        MEDIUM = "medium", "Medium indirect light"
        BRIGHT = "bright", "Bright indirect light"
        DIRECT = "direct", "Direct sun"

    common_name = models.CharField(max_length=120)
    species = models.CharField(max_length=160)
    care_requirements = models.TextField()
    watering_frequency_days = models.PositiveSmallIntegerField(
        default=7,
        validators=[MinValueValidator(1), MaxValueValidator(60)],
    )
    preferred_light = models.CharField(
        max_length=20,
        choices=LightLevel.choices,
        default=LightLevel.MEDIUM,
    )
    optimal_moisture_min = models.PositiveSmallIntegerField(
        default=35,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    optimal_moisture_max = models.PositiveSmallIntegerField(
        default=65,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["common_name"]

    def __str__(self) -> str:
        return f"{self.common_name} ({self.species})"


class Planter(models.Model):
    class MaterialType(models.TextChoices):
        PETG_CF = "PETG_CF", "PETG-CF"
        TPU = "TPU", "TPU"
        PETG = "PETG", "PETG"
        PLA = "PLA", "PLA"
        ASA = "ASA", "ASA"

    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    material_type = models.CharField(
        max_length=24,
        choices=MaterialType.choices,
        default=MaterialType.PETG_CF,
    )
    slicing_profile = models.CharField(
        max_length=120,
        help_text="Named slicer profile used for production.",
    )
    nozzle_diameter_mm = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.40"))
    layer_height_mm = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.20"))
    infill_percentage = models.PositiveSmallIntegerField(
        default=20,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    print_time_minutes = models.PositiveIntegerField(
        help_text="Estimated total print duration in minutes.",
    )
    design_file_url = models.URLField(blank=True)
    compatible_plants = models.ManyToManyField(
        Plant,
        related_name="compatible_planters",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sku"]

    def __str__(self) -> str:
        return f"{self.sku} - {self.name}"


class Device(models.Model):
    class BoardType(models.TextChoices):
        RASPBERRY_PI = "raspberry_pi", "Raspberry Pi"
        RASPBERRY_PI_ZERO = "raspberry_pi_zero", "Raspberry Pi Zero"
        ESP32 = "esp32", "ESP32"
        ARDUINO_MKR = "arduino_mkr", "Arduino MKR"

    class Status(models.TextChoices):
        PROVISIONING = "provisioning", "Provisioning"
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        MAINTENANCE = "maintenance", "Maintenance"

    planter = models.ForeignKey(Planter, on_delete=models.CASCADE, related_name="devices")
    device_identifier = models.CharField(max_length=96, unique=True)
    board_type = models.CharField(
        max_length=40,
        choices=BoardType.choices,
        default=BoardType.RASPBERRY_PI,
    )
    firmware_version = models.CharField(max_length=40, blank=True)
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.PROVISIONING,
    )
    last_seen_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    installed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["device_identifier"]

    def __str__(self) -> str:
        return self.device_identifier


class TelemetryLog(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="telemetry_logs")
    captured_at = models.DateTimeField(default=timezone.now, db_index=True)
    moisture_level = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Soil moisture reading as a percentage.",
    )
    temperature_celsius = models.DecimalField(max_digits=5, decimal_places=2)
    light_intensity_lux = models.PositiveIntegerField()
    battery_level_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    raw_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-captured_at"]
        indexes = [
            models.Index(fields=["device", "-captured_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.device.device_identifier} @ {self.captured_at.isoformat()}"
