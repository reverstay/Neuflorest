from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Device, Plant, Planter, TelemetryLog
from .serializers import DeviceSerializer, PlantSerializer, PlanterSerializer, TelemetryLogSerializer


@api_view(["GET"])
def health_check(_request: Request) -> Response:
    return Response({"status": "ok", "service": "neuflorest-api"})


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all()
    serializer_class = PlantSerializer


class PlanterViewSet(viewsets.ModelViewSet):
    queryset = Planter.objects.prefetch_related("compatible_plants")
    serializer_class = PlanterSerializer


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.select_related("planter")
    serializer_class = DeviceSerializer


class TelemetryLogViewSet(viewsets.ModelViewSet):
    serializer_class = TelemetryLogSerializer

    def get_queryset(self):
        queryset = TelemetryLog.objects.select_related("device", "device__planter")
        device_identifier = self.request.query_params.get("device_identifier")
        device_id = self.request.query_params.get("device_id")

        if device_identifier:
            queryset = queryset.filter(device__device_identifier=device_identifier)
        if device_id:
            queryset = queryset.filter(device_id=device_id)

        return queryset

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request: Request) -> Response:
        latest_log = self.get_queryset().first()
        if latest_log is None:
            return Response(
                {"detail": "No telemetry logs found for the current filters."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(latest_log)
        return Response(serializer.data)
