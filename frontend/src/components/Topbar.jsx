import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  employee: 'Employee',
};

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
      <img src="/logo.svg" alt="Taskify" className="h-9" />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABEL[user?.role]}</p>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-50 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
