import { useState, useEffect } from 'react';
import { getDraws, getDrawResults } from '../services/drawService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { FiCalendar, FiAward } from 'react-icons/fi';
import './DrawResults.css';

export default function DrawResults() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDraws();
        setDraws(res.data.filter(d => d.status === 'published'));
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const viewResults = async (draw) => {
    try {
      const res = await getDrawResults(draw.id);
      setSelectedDraw(draw);
      setResults(res.data);
    } catch {}
  };

  if (loading) return <LoadingSpinner text="Loading draws..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Draw Results</h1>
        <p className="page-subtitle">View past monthly draws and winning numbers</p>
      </div>

      <div className="draws-list">
        {draws.map(d => {
          const numbers = JSON.parse(d.numbers);
          return (
            <div key={d.id} className="draw-item glass-card animate-fade-in" onClick={() => viewResults(d)}>
              <div className="draw-item-header">
                <div className="draw-month"><FiCalendar /> {d.month}</div>
                <span className={`badge badge-${d.draw_type === 'random' ? 'info' : 'warning'}`}>{d.draw_type}</span>
              </div>
              <div className="draw-numbers">
                {numbers.map((n, i) => (
                  <div key={i} className="draw-number-ball">{n}</div>
                ))}
              </div>
              <div className="draw-meta">
                <span>Prize Pool: <strong className="gold">${d.prize_pool.toFixed(2)}</strong></span>
                <span className="draw-view-link">View Details →</span>
              </div>
            </div>
          );
        })}
        {draws.length === 0 && (
          <div className="scores-empty">
            <FiAward size={48} />
            <p>No published draws yet. Stay tuned!</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedDraw} onClose={() => { setSelectedDraw(null); setResults(null); }} title={`Draw — ${selectedDraw?.month}`}>
        {results && (
          <div className="draw-detail">
            <div className="draw-numbers" style={{justifyContent: 'center'}}>
              {JSON.parse(selectedDraw.numbers).map((n, i) => (
                <div key={i} className="draw-number-ball large">{n}</div>
              ))}
            </div>
            <div className="draw-detail-stats">
              <div><span className="detail-label">Prize Pool</span><span className="detail-value gold">${selectedDraw.prize_pool.toFixed(2)}</span></div>
              <div><span className="detail-label">Type</span><span className="detail-value">{selectedDraw.draw_type}</span></div>
              <div><span className="detail-label">Winners</span><span className="detail-value">{results.winners?.length || 0}</span></div>
            </div>
            {results.winners?.length > 0 && (
              <div className="draw-winners-list">
                <h4>Winners</h4>
                {results.winners.map(w => (
                  <div key={w.id} className="draw-winner-item">
                    <span className="badge badge-success">{w.match_type}-Match</span>
                    <span className="gold">${w.amount.toFixed(2)}</span>
                    <span className={`badge badge-${w.status === 'paid' ? 'success' : 'warning'}`}>{w.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
