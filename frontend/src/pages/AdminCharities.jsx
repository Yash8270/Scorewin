import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCharities, createCharity, updateCharity, deleteCharity } from '../services/charityService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Admin.css';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '' });

  const fetchCharities = async () => {
    try { const res = await getCharities(); setCharities(res.data); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', image_url: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCharity(editing.id, form);
        toast.success('Charity updated');
      } else {
        await createCharity(form);
        toast.success('Charity added');
      }
      setShowModal(false);
      fetchCharities();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity?')) return;
    try { await deleteCharity(id); toast.success('Deleted'); fetchCharities(); } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <Link to="/admin" className="admin-back"><FiArrowLeft /> Back to Admin</Link>
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <div>
          <h1 className="page-title">Charity Management</h1>
          <p className="page-subtitle">{charities.length} charities</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Charity</button>
      </div>

      <div className="glass-card" style={{overflow: 'auto'}}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Description</th><th>Image</th><th>Actions</th></tr></thead>
          <tbody>
            {charities.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{c.name}</td>
                <td style={{maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{c.description}</td>
                <td>{c.image_url ? '✓' : '—'}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}><FiEdit2 /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Charity' : 'Add Charity'}>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-4)'}}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Image URL</label>
            <input className="input-field" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>{editing ? 'Update' : 'Add'} Charity</button>
        </form>
      </Modal>
    </div>
  );
}
