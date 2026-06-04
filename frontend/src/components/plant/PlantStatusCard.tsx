import { STATUS_LABEL_KEYS, type TranslationDictionary } from "../../i18n/translations";
import type { PlantStatus } from "../../types/plant";

type PlantStatusCardProps = {
  plant: PlantStatus;
  labels: TranslationDictionary["dashboard"];
};

const STATUS_MARK: Record<PlantStatus["status"], string> = {
  healthy: "●",
  attention: "◐",
  critical: "○",
};

export function PlantStatusCard({ plant, labels }: PlantStatusCardProps) {
  const statusLabel = labels[STATUS_LABEL_KEYS[plant.status]];

  return (
    <article className={`plant-card ${plant.isLive ? "plant-card-live" : ""}`}>
      <div className="plant-card-header">
        <span className="plant-emoji">{plant.emoji}</span>
        <div>
          <div className="plant-name">{plant.name}</div>
          <div className="plant-last">
            {labels.lastRead}: {plant.last}
          </div>
          {plant.deviceIdentifier && (
            <div className="plant-device">
              {labels.liveDevice}: {plant.deviceIdentifier}
            </div>
          )}
        </div>
      </div>
      <span className={`status-badge status-${plant.status}`}>
        {STATUS_MARK[plant.status]} {statusLabel}
      </span>
      <div className="plant-metrics">
        <div className="metric">
          <div className="metric-label">{labels.moisture}</div>
          <div className="metric-value">
            {plant.moisture}
            <span className="metric-unit">%</span>
          </div>
          <div className="moisture-bar">
            <div className="moisture-fill" style={{ width: `${plant.moisture}%` }} />
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">{labels.temp}</div>
          <div className="metric-value">
            {plant.temp}
            <span className="metric-unit">°C</span>
          </div>
        </div>
      </div>
      <button className="btn-irrigate" type="button">
        {labels.irrigate}
      </button>
    </article>
  );
}
