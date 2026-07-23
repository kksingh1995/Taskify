import { useState } from 'react';
import Modal from './Modal';

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function TaskFormModal({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: employees[0]?.id || '' });
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
    <Modal title="Create Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className={inputClass} placeholder="Task name" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        <textarea className={inputClass} placeholder="Description (optional)" rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <select className={inputClass} value={form.priority} onChange={(e) => update('priority', e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input className={inputClass} type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} required />
        </div>

        <select className={inputClass} value={form.assignedTo} onChange={(e) => update('assignedTo', e.target.value)} required>
          <option value="" disabled>Assign to employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2 text-sm transition disabled:opacity-60">
          {saving ? 'Creating...' : 'Create & Assign Task'}
        </button>
      </form>
    </Modal>
  );
}
