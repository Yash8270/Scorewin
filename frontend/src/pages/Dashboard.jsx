import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMySubscription, createSubscription, extendSubscription } from '../services/subscriptionService';
import { getMyScores } from '../services/scoreService';
import { getMyWinnings, uploadProof } from '../services/winnerService';
import { getMyCharity } from '../services/charityService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import { FiCreditCard, FiTarget, FiAward, FiHeart, FiCalendar, FiArrowRight } from 'react-icons/fi';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [uploading, setUploading] = useState(null);

  const PLANS = [
    { id: 'monthly', label: '1 Month', price: 9.99 },
    { id: 'quarterly', label: '3 Months', price: 26.99 },
    { id: 'biannual', label: '6 Months', price: 49.99 },
    { id: 'yearly', label: '1 Year', price: 99.99 }
  ];

  const handleSubscribe = async (plan) => {
    setSubscribing(true);
    try {
      const res = await createSubscription(plan);
      setSubscription(res.data);
      toast.success(`Subscribed to ${plan} plan!`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Subscription failed'));
    } finally { setSubscribing(false); }
  };

  const handleExtend = async (plan) => {
    setSubscribing(true);
    try {
      const res = await extendSubscription(plan);
      setSubscription(res.data);
      toast.success(`Subscription extended by ${plan} plan!`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to extend subscription'));
    } finally { setSubscribing(false); }
  };

  const handleUploadProof = async (winnerId, file) => {
    if (!file) return;
    setUploading(winnerId);
    try {
      await uploadProof(winnerId, file);
      toast.success('Proof uploaded successfully!');
      // Refresh winnings
      const res = await getMyWinnings();
      setWinnings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to upload proof'));
    } finally {
      setUploading(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, scoreRes, winRes, charRes] = await Promise.allSettled([
          getMySubscription(),
          getMyScores(),
          getMyWinnings(),
          getMyCharity()
        ]);
        if (subRes.status === 'fulfilled') setSubscription(subRes.value.data);
        if (scoreRes.status === 'fulfilled') setScores(Array.isArray(scoreRes.value.data) ? scoreRes.value.data : []);
        if (winRes.status === 'fulfilled') setWinnings(Array.isArray(winRes.value.data) ? winRes.value.data : []);
        if (charRes.status === 'fulfilled' && charRes.value.data) setCharity(charRes.value.data);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const totalWinnings = winnings.reduce((sum, w) => sum + w.amount, 0);
  const isActive = subscription?.status === 'active';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name} 👋</h1>
        <p className="page-subtitle">Your ScoreWin dashboard — track scores, view winnings, and make an impact.</p>
      </div>

      {/* Status Cards */}
      <div className="dash-grid">
        {/* Subscription Card */}
        <div className="dash-card glass-card">
          <div className="dash-card-header">
            <div className={`dash-card-icon ${isActive ? 'emerald' : 'muted'}`}><FiCreditCard /></div>
            <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>{isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <h3 className="dash-card-title">Subscription</h3>
          {subscription ? (
            <>
              <p className="dash-card-value">{subscription.plan} Plan</p>
              <p className="dash-card-meta"><FiCalendar /> Expires: {new Date(subscription.end_date).toLocaleDateString()}</p>
              <div style={{marginTop: '1rem'}}>
                <p className="dash-card-meta" style={{marginBottom: '0.5rem', fontWeight: 600}}>Extend Subscription:</p>
                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                  {PLANS.map(p => (
                    <button key={p.id} className="btn btn-outline btn-sm" disabled={subscribing} onClick={() => handleExtend(p.id)}>
                      {subscribing ? '...' : `+${p.label} $${p.price}`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="dash-card-value">No Plan</p>
              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem'}}>
                {PLANS.map(p => (
                  <button key={p.id} className={`btn btn-sm ${p.id === 'yearly' ? 'btn-gold' : 'btn-primary'}`} disabled={subscribing} onClick={() => handleSubscribe(p.id)}>
                    {subscribing ? '...' : `${p.label} $${p.price}`}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scores Card */}
        <div className="dash-card glass-card">
          <div className="dash-card-header">
            <div className="dash-card-icon emerald"><FiTarget /></div>
            <span className="badge badge-info">{scores.length}/5</span>
          </div>
          <h3 className="dash-card-title">Your Scores</h3>
          <div className="dash-scores-preview">
            {scores.length > 0 ? scores.slice(0, 5).map(s => (
              <div key={s.id} className="dash-score-ball">{s.score}</div>
            )) : <p className="dash-card-meta">No scores yet</p>}
          </div>
          <Link to="/scores" className="dash-card-link">Manage Scores <FiArrowRight /></Link>
        </div>

        {/* Winnings Card */}
        <div className="dash-card glass-card">
          <div className="dash-card-header">
            <div className="dash-card-icon gold"><FiAward /></div>
            <span className="badge badge-warning">{winnings.length} wins</span>
          </div>
          <h3 className="dash-card-title">Winnings</h3>
          <p className="dash-card-value gold">${totalWinnings.toFixed(2)}</p>
          <p className="dash-card-meta">Total earned</p>
          <Link to="/draws" className="dash-card-link">View Draws <FiArrowRight /></Link>
        </div>

        {/* Charity Card */}
        <div className="dash-card glass-card">
          <div className="dash-card-header">
            <div className="dash-card-icon rose"><FiHeart /></div>
          </div>
          <h3 className="dash-card-title">Charity</h3>
          {charity ? (
            <>
              <p className="dash-card-value">{charity.charity_name}</p>
              <p className="dash-card-meta">{charity.percentage}% contribution</p>
            </>
          ) : (
            <p className="dash-card-meta">No charity selected</p>
          )}
          <Link to="/charities" className="dash-card-link">Choose Charity <FiArrowRight /></Link>
        </div>
      </div>

      {/* Recent Winnings */}
      {winnings.length > 0 && (
        <div className="dash-section animate-fade-in-up delay-200">
          <h2 className="dash-section-title">Recent Winnings</h2>
          <div className="glass-card" style={{overflow: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Draw</th>
                  <th>Match</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {winnings.slice(0, 5).map(w => (
                  <tr key={w.id}>
                    <td>#{w.draw_id}</td>
                    <td>{w.match_type}-Number</td>
                    <td className="gold">${w.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${w.status === 'paid' ? 'badge-success' : w.status === 'approved' ? 'badge-info' : w.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                        {w.status}
                      </span>
                    </td>
                    <td>
                      {w.status === 'pending' && !w.proof_url ? (
                        <div>
                          <input 
                            type="file" 
                            id={`proof-${w.id}`} 
                            style={{display: 'none'}} 
                            accept="image/*"
                            onChange={(e) => handleUploadProof(w.id, e.target.files[0])}
                          />
                          <label htmlFor={`proof-${w.id}`} className="btn btn-outline btn-sm" style={{cursor: 'pointer'}}>
                            {uploading === w.id ? 'Uploading...' : 'Upload Proof'}
                          </label>
                        </div>
                      ) : w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noreferrer" className="dash-card-link" style={{fontSize: 'var(--font-xs)'}}>View Proof</a>
                      ) : (
                        <span className="dash-card-meta">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
