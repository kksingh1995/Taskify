import { useState } from 'react';
import Modal from './Modal';
import LogoUploadField from './LogoUploadField';

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function EditOrgModal({ organization, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: organization.name, type: organization.type || 'Business', logoUrl: organization.logo_url || '' });
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
    <Modal title="Edit Organization" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className={inputClass} placeholder="Organization name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value)}>
          <option>School</option>
          <option>College</option>
          <option>Business</option>
          <option>Other</option>
        </select>
        <LogoUploadField value={form.logoUrl} onChange={(v) => update('logoUrl', v)} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 text-sm transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
}
