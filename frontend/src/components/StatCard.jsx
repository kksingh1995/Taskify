export default function StatCard({ label, value, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-700 bg-brand-50',
    red: 'text-red-700 bg-red-50',
    amber: 'text-amber-700 bg-amber-50',
    emerald: 'text-emerald-700 bg-emerald-50',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 inline-block text-2xl font-bold px-2 py-0.5 rounded-lg ${accents[accent]}`}>{value}</p>
    </div>
  );
}
