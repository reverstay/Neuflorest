# Generated for the NeuFlorest foundational schema.

from decimal import Decimal

import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Plant",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("common_name", models.CharField(max_length=120)),
                ("species", models.CharField(max_length=160)),
                ("care_requirements", models.TextField()),
                (
                    "watering_frequency_days",
                    models.PositiveSmallIntegerField(
                        default=7,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(60),
                        ],
                    ),
                ),
                (
                    "preferred_light",
                    models.CharField(
                        choices=[
                            ("low", "Low light"),
                            ("medium", "Medium indirect light"),
                            ("bright", "Bright indirect light"),
                            ("direct", "Direct sun"),
                        ],
                        default="medium",
                        max_length=20,
                    ),
                ),
                (
                    "optimal_moisture_min",
                    models.PositiveSmallIntegerField(
                        default=35,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(100),
                        ],
                    ),
                ),
                (
                    "optimal_moisture_max",
                    models.PositiveSmallIntegerField(
                        default=65,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(100),
                        ],
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["common_name"],
            },
        ),
        migrations.CreateModel(
            name="Planter",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("sku", models.CharField(max_length=64, unique=True)),
                ("name", models.CharField(max_length=140)),
                ("description", models.TextField(blank=True)),
                (
                    "material_type",
                    models.CharField(
                        choices=[
                            ("PETG_CF", "PETG-CF"),
                            ("TPU", "TPU"),
                            ("PETG", "PETG"),
                            ("PLA", "PLA"),
                            ("ASA", "ASA"),
                        ],
                        default="PETG_CF",
                        max_length=24,
                    ),
                ),
                ("slicing_profile", models.CharField(help_text="Named slicer profile used for production.", max_length=120)),
                (
                    "nozzle_diameter_mm",
                    models.DecimalField(decimal_places=2, default=Decimal("0.40"), max_digits=4),
                ),
                (
                    "layer_height_mm",
                    models.DecimalField(decimal_places=2, default=Decimal("0.20"), max_digits=4),
                ),
                (
                    "infill_percentage",
                    models.PositiveSmallIntegerField(
                        default=20,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(100),
                        ],
                    ),
                ),
                (
                    "print_time_minutes",
                    models.PositiveIntegerField(help_text="Estimated total print duration in minutes."),
                ),
                ("design_file_url", models.URLField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "compatible_plants",
                    models.ManyToManyField(blank=True, related_name="compatible_planters", to="greenery.plant"),
                ),
            ],
            options={
                "ordering": ["sku"],
            },
        ),
        migrations.CreateModel(
            name="Device",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("device_identifier", models.CharField(max_length=96, unique=True)),
                (
                    "board_type",
                    models.CharField(
                        choices=[
                            ("raspberry_pi", "Raspberry Pi"),
                            ("raspberry_pi_zero", "Raspberry Pi Zero"),
                            ("esp32", "ESP32"),
                            ("arduino_mkr", "Arduino MKR"),
                        ],
                        default="raspberry_pi",
                        max_length=40,
                    ),
                ),
                ("firmware_version", models.CharField(blank=True, max_length=40)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("provisioning", "Provisioning"),
                            ("online", "Online"),
                            ("offline", "Offline"),
                            ("maintenance", "Maintenance"),
                        ],
                        default="provisioning",
                        max_length=24,
                    ),
                ),
                ("last_seen_at", models.DateTimeField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("installed_at", models.DateTimeField(auto_now_add=True)),
                (
                    "planter",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="devices",
                        to="greenery.planter",
                    ),
                ),
            ],
            options={
                "ordering": ["device_identifier"],
            },
        ),
        migrations.CreateModel(
            name="TelemetryLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("captured_at", models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
                (
                    "moisture_level",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Soil moisture reading as a percentage.",
                        max_digits=5,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(100),
                        ],
                    ),
                ),
                (
                    "temperature_celsius",
                    models.DecimalField(decimal_places=2, max_digits=5),
                ),
                ("light_intensity_lux", models.PositiveIntegerField()),
                (
                    "battery_level_percentage",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=5,
                        null=True,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(100),
                        ],
                    ),
                ),
                ("raw_payload", models.JSONField(blank=True, default=dict)),
                (
                    "device",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="telemetry_logs",
                        to="greenery.device",
                    ),
                ),
            ],
            options={
                "ordering": ["-captured_at"],
                "indexes": [models.Index(fields=["device", "-captured_at"], name="greenery_te_device__8348ae_idx")],
            },
        ),
    ]
