import { useEffect, useMemo, useState } from "react";

import { ApiError, fetchLatestTelemetryLog, type TelemetryLog } from "../api";
import { PlantStatusCard } from "../components/plant/PlantStatusCard";
import { useAuth } from "../contexts/auth/AuthProvider";
import { useLang } from "../contexts/language/LangProvider";
import { PLANT_STATUS } from "../data/plantStatus";
import { TRANSLATIONS } from "../i18n/translations";
import type { PlantStatus, PlantStatusKind } from "../types/plant";

type TelemetryState =
  | { status: "loading" }
  | { status: "ready"; telemetry: TelemetryLog }
  | { status: "empty" }
  | { status: "error" };

function classifyMoisture(moisture: number): PlantStatusKind {
  if (moisture < 12 || moisture > 92) {
    return "critical";
  }

  if (moisture < 30 || moisture > 85) {
    return "attention";
  }

  return "healthy";
}

function formatReadingTime(capturedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(capturedAt));
}

function telemetryToPlantStatus(telemetry: TelemetryLog): PlantStatus {
  const moisture = Number.parseFloat(telemetry.moisture_level);
  const temperature = Number.parseFloat(telemetry.temperature_celsius);

  return {
    id: 1000 + telemetry.id,
    name: "NeuFlorest Live Pot",
    emoji: "🌿",
    moisture: Number.isFinite(moisture) ? Math.round(moisture) : 0,
    temp: Number.isFinite(temperature) ? Math.round(temperature) : 0,
    status: classifyMoisture(Number.isFinite(moisture) ? moisture : 0),
    last: formatReadingTime(telemetry.captured_at),
    deviceIdentifier: telemetry.device_identifier,
    isLive: true,
  };
}

export function DashboardPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const t = TRANSLATIONS[lang].dashboard;
  const [telemetryState, setTelemetryState] = useState<TelemetryState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    fetchLatestTelemetryLog()
      .then((telemetry) => {
        if (isMounted) {
          setTelemetryState({ status: "ready", telemetry });
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setTelemetryState({ status: "empty" });
          return;
        }

        setTelemetryState({ status: "error" });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const plants = useMemo(() => {
    if (telemetryState.status !== "ready") {
      return PLANT_STATUS;
    }

    return [telemetryToPlantStatus(telemetryState.telemetry), ...PLANT_STATUS];
  }, [telemetryState]);

  const telemetryMessage =
    telemetryState.status === "loading"
      ? t.telemetryLoading
      : telemetryState.status === "ready"
        ? t.liveTelemetry
        : telemetryState.status === "empty"
          ? t.telemetryFallback
          : t.telemetryUnavailable;

  return (
    <div className="page">
      <div className="container">
        <div className="dash-header">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">
            {t.sub}
            {user ? ` - ${user.name}` : ""}
          </p>
          <p
            className={`dashboard-telemetry-note ${
              telemetryState.status === "ready" ? "is-live" : ""
            }`}
          >
            {telemetryMessage}
          </p>
        </div>
        <div className="dash-grid">
          {plants.map((plant) => (
            <PlantStatusCard key={plant.id} plant={plant} labels={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
