import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import OrgFormModal from '../../components/OrgFormModal';
import client from '../../api/client';

export default function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadOrgs() {
    const { data } = await client.get('/organizations');
    setOrgs(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrgs();
  }, []);

  async function handleCreateOrg(form) {
    await client.post('/organizations', form);
    await loadOrgs();
  }

  async function toggleStatus(org) {
    const newStatus = org.status === 'Active' ? 'Suspended' : 'Active';
    await client.put(`/organizations/${org.id}/status`, { status: newStatus });
    await loadOrgs();
  }

  const totalEmployees = orgs.reduce((sum, o) => sum + o.employeeCount, 0);
  const totalTasks = orgs.reduce((sum, o) => sum + o.taskCount, 0);
  const activeOrgs = orgs.filter((o) => o.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Organizations</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Add Organization
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Organizations" value={orgs.length} />
          <StatCard label="Active" value={activeOrgs} accent="emerald" />
          <StatCard label="Total Employees" value={totalEmployees} />
          <StatCard label="Total Tasks" value={totalTasks} />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : orgs.length === 0 ? (
          <p className="text-sm text-slate-500">No organizations yet. Click "+ Add Organization" to onboard the first one.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{org.name}</p>
                      <p className="text-xs text-slate-400">{org.type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{org.adminName}</p>
                      <p className="text-xs text-slate-400">{org.adminEmail}</p>
                    </td>
                    <td className="px-4 py-3">{org.employeeCount}</td>
                    <td className="px-4 py-3">{org.taskCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(org)}
                        className="text-xs font-medium text-brand-700 hover:underline"
                      >
                        {org.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && <OrgFormModal onClose={() => setShowForm(false)} onSubmit={handleCreateOrg} />}
    </div>
  );
}
