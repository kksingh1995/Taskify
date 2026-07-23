import { useState } from 'react';
import Modal from './Modal';

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function OrgFormModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', type: 'Business', adminName: '', adminEmail: '', adminPassword: '', adminPhone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Organization" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className={inputClass} placeholder="Organization name (e.g. ABC School)" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value)}>
          <option>School</option>
          <option>College</option>
          <option>Business</option>
          <option>Other</option>
        </select>
        <hr className="border-slate-100" />
        <p className="text-xs font-semibold text-slate-500 uppercase">Organization Admin</p>
        <input className={inputClass} placeholder="Admin full name" value={form.adminName} onChange={(e) => update('adminName', e.target.value)} required />
        <input className={inputClass} type="email" placeholder="Admin email" value={form.adminEmail} onChange={(e) => update('adminEmail', e.target.value)} required />
        <input className={inputClass} placeholder="Admin phone (with country code, e.g. 91...)" value={form.adminPhone} onChange={(e) => update('adminPhone', e.target.value)} />
        <input className={inputClass} type="password" placeholder="Admin password" value={form.adminPassword} onChange={(e) => update('adminPassword', e.target.value)} required />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 text-sm transition disabled:opacity-60">
          {saving ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
    </Modal>
  );
}
