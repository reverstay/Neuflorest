import type { PlantStatus } from "../types/plant";

export const PLANT_STATUS: PlantStatus[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    emoji: "🌿",
    moisture: 72,
    temp: 22,
    status: "healthy",
    last: "2min atrás",
  },
  {
    id: 2,
    name: "Cacto San Pedro",
    emoji: "🌵",
    moisture: 18,
    temp: 26,
    status: "attention",
    last: "5min atrás",
  },
  {
    id: 3,
    name: "Samambaia Real",
    emoji: "🌱",
    moisture: 85,
    temp: 20,
    status: "healthy",
    last: "1min atrás",
  },
];
