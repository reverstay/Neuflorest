from rest_framework import serializers

from .models import Device, Plant, Planter, TelemetryLog


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = [
            "id",
            "common_name",
            "species",
            "care_requirements",
            "watering_frequency_days",
            "preferred_light",
            "optimal_moisture_min",
            "optimal_moisture_max",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class PlanterSerializer(serializers.ModelSerializer):
    compatible_plants = serializers.PrimaryKeyRelatedField(
        queryset=Plant.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Planter
        fields = [
            "id",
            "sku",
            "name",
            "description",
            "material_type",
            "slicing_profile",
            "nozzle_diameter_mm",
            "layer_height_mm",
            "infill_percentage",
            "print_time_minutes",
            "design_file_url",
            "compatible_plants",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class DeviceSerializer(serializers.ModelSerializer):
    planter_sku = serializers.CharField(source="planter.sku", read_only=True)

    class Meta:
        model = Device
        fields = [
            "id",
            "planter",
            "planter_sku",
            "device_identifier",
            "board_type",
            "firmware_version",
            "status",
            "last_seen_at",
            "is_active",
            "installed_at",
        ]
        read_only_fields = ["installed_at", "planter_sku"]


class TelemetryLogSerializer(serializers.ModelSerializer):
    device_identifier = serializers.CharField(source="device.device_identifier", read_only=True)

    class Meta:
        model = TelemetryLog
        fields = [
            "id",
            "device",
            "device_identifier",
            "captured_at",
            "moisture_level",
            "temperature_celsius",
            "light_intensity_lux",
            "battery_level_percentage",
            "raw_payload",
        ]
        read_only_fields = ["device_identifier"]
