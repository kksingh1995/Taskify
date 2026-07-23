import { useState } from 'react';
import Modal from './Modal';

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function EmployeeFormModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
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
    <Modal title="Add Employee" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className={inputClass} placeholder="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <input className={inputClass} type="tel" placeholder="Mobile number (login ID + WhatsApp)" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
        <input className={inputClass} type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <input className={inputClass} type="password" placeholder="Password" value={form.password} onChange={(e) => update('password', e.target.value)} required />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 text-sm transition disabled:opacity-60">
          {saving ? 'Creating...' : 'Add Employee'}
        </button>
      </form>
    </Modal>
  );
}
