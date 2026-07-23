import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import OrgFormModal from '../../components/OrgFormModal';
import EditOrgModal from '../../components/EditOrgModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function SuperAdminDashboard() {
  const { startImpersonation } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [resettingOrg, setResettingOrg] = useState(null);

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

  async function handleEditOrg(form) {
    await client.put(`/organizations/${editingOrg.id}`, form);
    await loadOrgs();
  }

  async function handleResetPassword(newPassword) {
    await client.put(`/organizations/${resettingOrg.id}/admin/password`, { newPassword });
  }

  async function toggleStatus(org) {
    const newStatus = org.status === 'Active' ? 'Suspended' : 'Active';
    await client.put(`/organizations/${org.id}/status`, { status: newStatus });
    await loadOrgs();
  }

  async function handleLoginAs(org) {
    const { data } = await client.post(`/organizations/${org.id}/login-as`);
    startImpersonation(data.token, data.user);
    navigate('/orgadmin');
  }

  const filteredOrgs = useMemo(
    () => orgs.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.adminName?.toLowerCase().includes(search.toLowerCase())),
    [orgs, search]
  );

  const totalEmployees = orgs.reduce((sum, o) => sum + o.employeeCount, 0);
  const totalTasks = orgs.reduce((sum, o) => sum + o.taskCount, 0);
  const activeOrgs = orgs.filter((o) => o.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Topbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Organizations</h1>
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

        {orgs.length > 0 && (
          <input
            type="text"
            placeholder="Search organizations or admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : orgs.length === 0 ? (
          <p className="text-sm text-slate-500">No organizations yet. Click "+ Add Organization" to onboard the first one.</p>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {org.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{org.name}</p>
                          <p className="text-xs text-slate-400">{org.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p>{org.adminName}</p>
                      <p className="text-xs text-slate-400">{org.adminPhone}</p>
                    </td>
                    <td className="px-4 py-3">{org.employeeCount}</td>
                    <td className="px-4 py-3">{org.taskCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        <button onClick={() => handleLoginAs(org)} className="text-brand-700 hover:underline">Login as Org</button>
                        <button onClick={() => setEditingOrg(org)} className="text-slate-600 hover:underline">Edit</button>
                        <button onClick={() => setResettingOrg(org)} className="text-amber-700 hover:underline">Reset Password</button>
                        <button onClick={() => toggleStatus(org)} className="text-red-700 hover:underline">
                          {org.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && <OrgFormModal onClose={() => setShowForm(false)} onSubmit={handleCreateOrg} />}
      {editingOrg && <EditOrgModal organization={editingOrg} onClose={() => setEditingOrg(null)} onSubmit={handleEditOrg} />}
      {resettingOrg && (
        <ResetPasswordModal
          title={`Reset password for ${resettingOrg.adminName}`}
          onClose={() => setResettingOrg(null)}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
}
