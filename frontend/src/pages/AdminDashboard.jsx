import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getAnalytics } from '../services/adminService';
import StatsCard from '../components/StatsCard';
import { FiUsers, FiDollarSign, FiHeart, FiAward, FiTarget, FiSettings, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAnalytics();
        setStats(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const isSubPage = location.pathname !== '/admin';

  if (isSubPage) return <Outlet />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage users, draws, charities, and view analytics</p>
      </div>

      {/* Analytics Cards */}
      {stats && (
        <div className="grid-4 admin-stats animate-fade-in">
          <StatsCard icon={<FiUsers />} label="Total Users" value={stats.total_users} color="emerald" />
          <StatsCard icon={<FiCheckCircle />} label="Active Subs" value={stats.active_subscriptions} color="emerald" />
          <StatsCard icon={<FiDollarSign />} label="Prize Pool" value={`$${stats.prize_pool.toFixed(2)}`} color="gold" />
          <StatsCard icon={<FiHeart />} label="Charity Total" value={`$${stats.total_charity_contributions}`} color="emerald" />
          <StatsCard icon={<FiBarChart2 />} label="Total Revenue" value={`$${stats.total_revenue.toFixed(2)}`} color="gold" />
          <StatsCard icon={<FiTarget />} label="Total Draws" value={stats.total_draws} color="emerald" />
          <StatsCard icon={<FiAward />} label="Total Winners" value={stats.total_winners} color="gold" />
          <StatsCard icon={<FiDollarSign />} label="Prize Paid" value={`$${stats.total_prize_paid.toFixed(2)}`} color="emerald" />
        </div>
      )}

      {/* Quick Links */}
      <div className="admin-links animate-fade-in-up delay-200">
        <h2 className="dash-section-title" style={{marginTop: 'var(--space-10)', marginBottom: 'var(--space-6)'}}>Management</h2>
        <div className="grid-4">
          <Link to="/admin/users" className="admin-link-card glass-card">
            <FiUsers className="admin-link-icon" />
            <h3>Users</h3>
            <p>Manage user accounts and roles</p>
          </Link>
          <Link to="/admin/draws" className="admin-link-card glass-card">
            <FiTarget className="admin-link-icon" />
            <h3>Draws</h3>
            <p>Run, simulate, and publish draws</p>
          </Link>
          <Link to="/admin/charities" className="admin-link-card glass-card">
            <FiHeart className="admin-link-icon" />
            <h3>Charities</h3>
            <p>Add and manage charities</p>
          </Link>
          <Link to="/admin/winners" className="admin-link-card glass-card">
            <FiAward className="admin-link-icon" />
            <h3>Winners</h3>
            <p>Verify winners and manage payouts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
