import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ImpersonationBanner() {
  const { impersonator, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!impersonator) return null;

  function handleReturn() {
    stopImpersonation();
    navigate('/superadmin');
  }

  return (
    <div className="bg-amber-400 text-amber-950 text-sm font-medium px-4 py-2 flex items-center justify-center gap-3">
      <span>👁️ Viewing as this organization's admin</span>
      <button onClick={handleReturn} className="underline font-semibold hover:no-underline">
        Return to Super Admin
      </button>
    </div>
  );
}
