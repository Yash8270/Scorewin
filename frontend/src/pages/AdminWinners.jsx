import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllWinners, verifyWinner } from '../services/winnerService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import { FiArrowLeft, FiCheck, FiX, FiDollarSign, FiImage } from 'react-icons/fi';
import './Admin.css';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    try { const res = await getAllWinners(); setWinners(res.data); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchWinners(); }, []);



  const handleVerify = async (id, status) => {
    try {
      await verifyWinner(id, status);
      toast.success(`Winner ${status}`);
      fetchWinners();
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Link to="/admin" className="admin-back"><FiArrowLeft /> Back to Admin</Link>
      <div className="page-header">
        <h1 className="page-title">Winner Verification</h1>
        <p className="page-subtitle">{winners.filter(w => w.status === 'pending').length} pending verification</p>
      </div>



      <div className="glass-card" style={{overflow: 'auto'}}>
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Draw</th><th>Match</th><th>Amount</th><th>Proof</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {winners.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>No winners yet.</td></tr>
            )}
            {winners.map(w => (
              <tr key={w.id}>
                <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{w.user_name || `User #${w.user_id}`}</td>
                <td>{w.draw_month || `#${w.draw_id}`}</td>
                <td><span className="badge badge-info">{w.match_type}-Match</span></td>
                <td className="gold">${w.amount.toFixed(2)}</td>
                <td>
                  {w.proof_url ? (
                    <a href={w.proof_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><FiImage /> View</a>
                  ) : '—'}
                </td>
                <td>
                  <span className={`badge badge-${w.status === 'paid' ? 'success' : w.status === 'approved' ? 'info' : w.status === 'rejected' ? 'error' : 'warning'}`}>
                    {w.status}
                  </span>
                </td>
                <td>
                  <div className="admin-table-actions">
                    {w.status === 'pending' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleVerify(w.id, 'approved')}><FiCheck /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleVerify(w.id, 'rejected')}><FiX /></button>
                      </>
                    )}
                    {w.status === 'approved' && (
                      <button className="btn btn-gold btn-sm" onClick={() => handleVerify(w.id, 'paid')}><FiDollarSign /> Mark Paid</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
