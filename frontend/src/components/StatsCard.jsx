import './StatsCard.css';

export default function StatsCard({ icon, label, value, trend, color = 'emerald' }) {
  return (
    <div className={`stats-card glass-card stats-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-info">
        <p className="stats-label">{label}</p>
        <h3 className="stats-value">{value}</h3>
        {trend && <p className={`stats-trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '+' : ''}{trend}%</p>}
      </div>
    </div>
  );
}
