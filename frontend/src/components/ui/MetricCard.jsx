import Pill from "./Pill";

export default function MetricCard({ label, value, delta, helper, tone = "neutral" }) {
  return (
    <article className="metric-card panel">
      <p className="metric-label">{label}</p>
      <div className="metric-main-row">
        <strong className="metric-value">{value}</strong>
        <Pill tone={tone}>{delta}</Pill>
      </div>
      <p className="metric-helper">{helper}</p>
    </article>
  );
}
