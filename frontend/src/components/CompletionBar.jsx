export default function CompletionBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completion Rate</p>
        <p className="text-sm font-bold text-brand-700 dark:text-brand-400">{pct}%</p>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
