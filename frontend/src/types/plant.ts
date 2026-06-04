export type PlantStatusKind = "healthy" | "attention" | "critical";

export type PlantStatus = {
  id: number;
  name: string;
  emoji: string;
  moisture: number;
  temp: number;
  status: PlantStatusKind;
  last: string;
  deviceIdentifier?: string;
  isLive?: boolean;
};
