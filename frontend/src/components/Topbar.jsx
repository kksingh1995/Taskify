import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import GreetingClock from './GreetingClock';
import ImpersonationBanner from './ImpersonationBanner';

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  employee: 'Employee',
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <>
      <ImpersonationBanner />
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          {user?.organizationLogo ? (
            <>
              <img src={user.organizationLogo} alt={user.organizationName} className="h-8 w-8 rounded-lg object-cover shrink-0" />
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.organizationName}</p>
                <p className="text-[11px] text-slate-400">Powered by Taskify</p>
              </div>
            </>
          ) : (
            <img src="/logo.svg" alt="Taskify" className="h-9" />
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:block">
            <GreetingClock name={user?.name} />
          </div>

          {canInstall && (
            <button
              onClick={promptInstall}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
              title="Install Taskify as an app"
            >
              ⬇ Install App
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[user?.role]}</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-700 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
