const STYLES = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const DOT = {
  High: 'bg-red-500',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-500',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STYLES[priority] || STYLES.Medium}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[priority] || DOT.Medium}`} />
      {priority}
    </span>
  );
}
