import { useState, useEffect } from 'react';
import { getCharities, getMyCharity, setMyCharity, updateMyCharity } from '../services/charityService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiHeart, FiCheck } from 'react-icons/fi';
import { getErrorMessage } from '../utils/errorHelper';
import './Charities.css';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [myCharity, setMyCharityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(10);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cRes, myRes] = await Promise.allSettled([getCharities(), getMyCharity()]);
        if (cRes.status === 'fulfilled') setCharities(cRes.value.data);
        if (myRes.status === 'fulfilled' && myRes.value.data) {
          setMyCharityData(myRes.value.data);
          setPercentage(myRes.value.data.percentage);
        }
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSelect = async (charityId) => {
    try {
      if (myCharity) {
        await updateMyCharity({ charity_id: charityId, percentage });
      } else {
        await setMyCharity({ charity_id: charityId, percentage });
      }
      toast.success('Charity selection updated!');
      const res = await getMyCharity();
      if (res.data) {
        setMyCharityData(res.data);
        setPercentage(res.data.percentage);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update'));
    }
  };

  const handlePercentageUpdate = async () => {
    if (percentage < 10) { toast.error('Minimum contribution is 10%'); return; }
    if (percentage > 100) { toast.error('Maximum contribution is 100%'); return; }
    try {
      await updateMyCharity({ charity_id: myCharity.charity_id, percentage: Number(percentage) });
      const res = await getMyCharity();
      if (res.data) {
        setMyCharityData(res.data);
        setPercentage(res.data.percentage);
      }
      toast.success(`Contribution updated to ${res.data?.percentage || percentage}%`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update'));
    }
  };

  if (loading) return <LoadingSpinner text="Loading charities..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Choose Your Charity</h1>
        <p className="page-subtitle">A minimum of 10% of your subscription supports the charity you choose. You can increase your contribution anytime.</p>
      </div>

      <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--info-color)', color: 'var(--info-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
        <FiCheck /> You are contributing at least 10% of your subscription to charity
      </div>

      {myCharity && (
        <div className="my-charity-card glass-card animate-fade-in">
          <div className="my-charity-header">
            <FiHeart className="my-charity-icon" />
            <div>
              <h3>Your Current Charity</h3>
              <p className="my-charity-name">{myCharity.charity_name}</p>
            </div>
          </div>
          <div className="my-charity-pct">
            <label className="input-label">Contribution %</label>
            <div className="pct-control">
              <input type="range" min="10" max="100" step="1" value={percentage} onChange={e => setPercentage(Number(e.target.value))} className="pct-slider" />
              <input type="number" min="10" max="100" value={percentage} onChange={e => setPercentage(Number(e.target.value))} className="pct-input" />
              <span className="pct-value">{percentage}%</span>
              <button className="btn btn-primary btn-sm" onClick={handlePercentageUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      <div className="charities-grid">
        {charities.map(c => (
          <div key={c.id} className={`charity-card glass-card ${myCharity?.charity_id === c.id ? 'selected' : ''}`}>
            <div className="charity-image" style={{backgroundImage: c.image_url ? `url(${c.image_url})` : 'none'}}>
              {!c.image_url && <FiHeart size={32} />}
              {myCharity?.charity_id === c.id && <div className="charity-selected-badge"><FiCheck /> Selected</div>}
            </div>
            <div className="charity-info">
              <h3 className="charity-name">{c.name}</h3>
              <p className="charity-desc">{c.description}</p>
              <button className={`btn ${myCharity?.charity_id === c.id ? 'btn-outline' : 'btn-primary'}`} onClick={() => handleSelect(c.id)} style={{width: '100%'}}>
                {myCharity?.charity_id === c.id ? 'Currently Selected' : 'Select This Charity'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
