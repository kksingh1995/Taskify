export default function StatCard({ label, value, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-700 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/40',
    red: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30',
    amber: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
    emerald: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 inline-block text-2xl font-bold px-2 py-0.5 rounded-lg ${accents[accent]}`}>{value}</p>
    </div>
  );
}
