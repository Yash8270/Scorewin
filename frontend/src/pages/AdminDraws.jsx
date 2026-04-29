import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDraws, runDraw, simulateDraw, publishDraw } from '../services/drawService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlay, FiEye, FiSend } from 'react-icons/fi';
import './Admin.css';

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawType, setDrawType] = useState('random');
  const [running, setRunning] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const fetchDraws = async () => {
    try { const res = await getDraws(); setDraws(res.data); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDraws(); }, []);

  const handleRun = async () => {
    setRunning(true);
    try {
      await runDraw(drawType);
      toast.success('Draw executed!');
      fetchDraws();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); } finally { setRunning(false); }
  };

  const handleSimulate = async () => {
    try {
      const res = await simulateDraw(drawType);
      setSimResult(res.data);
    } catch (err) { toast.error('Simulation failed'); }
  };

  const handlePublish = async (id) => {
    try {
      await publishDraw(id);
      toast.success('Draw published!');
      fetchDraws();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Link to="/admin" className="admin-back"><FiArrowLeft /> Back to Admin</Link>
      <div className="page-header">
        <h1 className="page-title">Draw Management</h1>
        <p className="page-subtitle">Run draws, simulate, and publish results</p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{padding: 'var(--space-6)', marginBottom: 'var(--space-6)'}}>
        <div style={{display: 'flex', gap: 'var(--space-4)', alignItems: 'end', flexWrap: 'wrap'}}>
          <div className="input-group" style={{flex: 1, minWidth: 200}}>
            <label className="input-label">Draw Type</label>
            <select className="input-field" value={drawType} onChange={e => setDrawType(e.target.value)}>
              <option value="random">Random</option>
              <option value="algorithm">Algorithm-Based</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleRun} disabled={running}><FiPlay /> {running ? 'Running...' : 'Run Draw'}</button>
          <button className="btn btn-outline" onClick={handleSimulate}><FiEye /> Simulate</button>
        </div>
      </div>

      {/* Draws Table */}
      <div className="glass-card" style={{overflow: 'auto'}}>
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Month</th><th>Numbers</th><th>Type</th><th>Prize Pool</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {draws.map(d => (
              <tr key={d.id}>
                <td>#{d.id}</td>
                <td style={{fontWeight: 600}}>{d.month}</td>
                <td>
                  <div style={{display: 'flex', gap: 4}}>
                    {JSON.parse(d.numbers).map((n, i) => (
                      <span key={i} className="dash-score-ball" style={{width: 32, height: 32, fontSize: '0.75rem'}}>{n}</span>
                    ))}
                  </div>
                </td>
                <td><span className={`badge badge-${d.draw_type === 'random' ? 'info' : 'warning'}`}>{d.draw_type}</span></td>
                <td className="gold">${d.prize_pool.toFixed(2)}</td>
                <td><span className={`badge badge-${d.status === 'published' ? 'success' : 'warning'}`}>{d.status}</span></td>
                <td>
                  {d.status === 'simulated' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handlePublish(d.id)}><FiSend /> Publish</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simulation Modal */}
      <Modal isOpen={!!simResult} onClose={() => setSimResult(null)} title="Draw Simulation Preview">
        {simResult && (
          <div className="draw-detail">
            <div className="draw-numbers" style={{justifyContent: 'center'}}>
              {simResult.numbers.map((n, i) => (
                <div key={i} className="draw-number-ball large">{n}</div>
              ))}
            </div>
            <div className="draw-detail-stats">
              <div><span className="detail-label">Prize Pool</span><span className="detail-value gold">${simResult.prize_pool.toFixed(2)}</span></div>
              <div><span className="detail-label">Type</span><span className="detail-value">{simResult.draw_type}</span></div>
              <div><span className="detail-label">Potential Winners</span><span className="detail-value">{simResult.potential_winners.length}</span></div>
            </div>
            {simResult.potential_winners.length > 0 && (
              <div className="draw-winners-list">
                <h4>Potential Winners</h4>
                {simResult.potential_winners.map((w, i) => (
                  <div key={i} className="draw-winner-item">
                    <span>User #{w.user_id}</span>
                    <span className="badge badge-success">{w.match_type}-Match</span>
                    <span className="badge badge-info">Scores: {w.scores.join(', ')}</span>
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
