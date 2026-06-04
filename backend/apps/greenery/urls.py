from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DeviceViewSet, PlantViewSet, PlanterViewSet, TelemetryLogViewSet, health_check


router = DefaultRouter()
router.register(r"plants", PlantViewSet, basename="plant")
router.register(r"planters", PlanterViewSet, basename="planter")
router.register(r"devices", DeviceViewSet, basename="device")
router.register(r"telemetry", TelemetryLogViewSet, basename="telemetry")

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("", include(router.urls)),
]
