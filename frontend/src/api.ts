const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type TelemetryLog = {
  id: number;
  device: number;
  device_identifier: string;
  captured_at: string;
  moisture_level: string;
  temperature_celsius: string;
  light_intensity_lux: number;
  battery_level_percentage: string | null;
  raw_payload: Record<string, unknown>;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(`API request failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchLatestTelemetryLog(deviceIdentifier?: string): Promise<TelemetryLog> {
  const searchParams = new URLSearchParams();

  if (deviceIdentifier) {
    searchParams.set("device_identifier", deviceIdentifier);
  }

  const queryString = searchParams.toString();
  return apiRequest<TelemetryLog>(`/telemetry/latest/${queryString ? `?${queryString}` : ""}`);
}
