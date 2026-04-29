import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, changeUserRole } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShield, FiUser } from 'react-icons/fi';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try { const res = await getAdminUsers(); setUsers(res.data); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await changeUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) { toast.error('Failed to update role'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Link to="/admin" className="admin-back"><FiArrowLeft /> Back to Admin</Link>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{users.length} users registered</p>
      </div>
      <div className="glass-card" style={{overflow: 'auto'}}>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Subscription</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>{u.role}</span></td>
                <td>
                  {u.has_active_subscription ? (
                    <span className="badge badge-success">{u.subscription_plan}</span>
                  ) : (
                    <span className="badge badge-error">None</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleRole(u.id, u.role)}>
                    {u.role === 'admin' ? <><FiUser /> Make User</> : <><FiShield /> Make Admin</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
