import { useState, useEffect } from 'react';
import { getMyScores, addScore, deleteScore } from '../services/scoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTarget, FiInfo } from 'react-icons/fi';
import { getErrorMessage } from '../utils/errorHelper';
import './Scores.css';

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreVal, setScoreVal] = useState('');
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchScores = async () => {
    try {
      const res = await getMyScores();
      setScores(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load scores'));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const val = parseInt(scoreVal);
    if (val < 1 || val > 45) { toast.error('Score must be between 1 and 45'); return; }
    setSubmitting(true);
    try {
      await addScore({ score: val, date: scoreDate });
      toast.success('Score added!');
      setScoreVal('');
      fetchScores();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add score'));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteScore(id);
      toast.success('Score removed');
      fetchScores();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <LoadingSpinner text="Loading scores..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Your Scores</h1>
        <p className="page-subtitle">Enter golf scores (1-45). Your latest 5 scores are your draw numbers.</p>
      </div>

      <div className="scores-layout">
        {/* Entry Form */}
        <div className="glass-card score-form-card animate-fade-in">
          <h3 className="score-form-title"><FiPlus /> Add New Score</h3>
          <form onSubmit={handleAdd} className="score-form">
            <div className="input-group">
              <label className="input-label">Score (1-45)</label>
              <input id="score-input" type="number" min="1" max="45" className="input-field" placeholder="Enter score..." value={scoreVal} onChange={e => setScoreVal(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input id="score-date" type="date" className="input-field" value={scoreDate} onChange={e => setScoreDate(e.target.value)} required />
            </div>
            <button id="score-submit" type="submit" className="btn btn-primary" disabled={submitting} style={{width: '100%'}}>
              {submitting ? 'Adding...' : 'Add Score'}
            </button>
          </form>
          <div className="score-info">
            <FiInfo />
            <p>Only the latest 5 scores are kept. Adding a 6th will remove the oldest automatically.</p>
          </div>
        </div>

        {/* Score Display */}
        <div className="scores-display animate-fade-in delay-100">
          <div className="scores-counter">
            <span className="scores-count">{scores.length}</span>
            <span className="scores-max">/5 scores</span>
          </div>

          <div className="score-balls-row">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`score-ball-large ${scores[i] ? 'filled' : 'empty'}`}>
                {scores[i] ? scores[i].score : '?'}
              </div>
            ))}
          </div>

          <div className="scores-list">
            {scores.map((s, idx) => (
              <div key={s.id} className="score-item glass-card" style={{animationDelay: `${idx * 80}ms`}}>
                <div className="score-item-left">
                  <div className="score-item-ball">{s.score}</div>
                  <div>
                    <p className="score-item-date">{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="score-item-num">Score #{scores.length - idx}</p>
                  </div>
                </div>
                <button className="score-delete-btn" onClick={() => handleDelete(s.id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            ))}
            {scores.length === 0 && (
              <div className="scores-empty">
                <FiTarget size={48} />
                <p>No scores yet. Add your first score above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
