import { useState } from 'react';
import Modal from './Modal';

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function ResetPasswordModal({ title, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(newPassword);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Modal title={title} onClose={onClose}>
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
          Password reset successfully. New password: <span className="font-mono font-semibold">{newPassword}</span>
        </p>
        <button onClick={onClose} className="w-full mt-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 text-sm transition">
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={inputClass}
          type="text"
          placeholder="New password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 text-sm transition disabled:opacity-60">
          {saving ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </Modal>
  );
}
