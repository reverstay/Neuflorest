const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type AuthUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_email_verified: boolean;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export type SignUpPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

export type SignUpResponse = {
  detail: string;
  email: string;
  otp_expires_in_seconds: number;
};

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
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
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

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(`API request failed with status ${response.status}`, response.status, payload);
  }

  return payload as T;
}

export async function fetchLatestTelemetryLog(deviceIdentifier?: string): Promise<TelemetryLog> {
  const searchParams = new URLSearchParams();

  if (deviceIdentifier) {
    searchParams.set("device_identifier", deviceIdentifier);
  }

  const queryString = searchParams.toString();
  return apiRequest<TelemetryLog>(`/telemetry/latest/${queryString ? `?${queryString}` : ""}`);
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  return apiRequest<SignUpResponse>("/auth/signup/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(email: string, code: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resendOtp(email: string): Promise<SignUpResponse> {
  return apiRequest<SignUpResponse>("/auth/resend-otp/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}
