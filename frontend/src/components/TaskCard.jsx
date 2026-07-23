import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { shareTaskOnWhatsApp } from '../utils/whatsapp';

const BORDER_BY_PRIORITY = {
  High: 'border-l-red-500',
  Medium: 'border-l-amber-500',
  Low: 'border-l-emerald-500',
};

export default function TaskCard({ task, showAssignee, assigneePhone, onStatusChange }) {
  const overdue = task.due_date && new Date(task.due_date) < new Date().setHours(0, 0, 0, 0) && task.status !== 'Completed';

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${BORDER_BY_PRIORITY[task.priority] || BORDER_BY_PRIORITY.Medium} rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && <p className="text-sm text-slate-500 dark:text-slate-400">{task.description}</p>}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {showAssignee && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">👤 {task.assignedToName}</span>}
        {task.due_date && (
          <span className={`px-2 py-1 rounded-full ${overdue ? 'bg-red-100 text-red-700 font-semibold dark:bg-red-900/40 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800'}`}>
            📅 {new Date(task.due_date).toLocaleDateString()} {overdue && '(Overdue)'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        {onStatusChange ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 dark:text-slate-100"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        ) : (
          <StatusBadge status={task.status} />
        )}

        <button
          onClick={() => shareTaskOnWhatsApp(task, assigneePhone)}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition"
          title="Share on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.06h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.84-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.4c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.42 5.83c0 4.55-3.71 8.25-8.27 8.25Zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31s-.88.86-.88 2.1.9 2.44 1.02 2.6c.13.17 1.78 2.72 4.32 3.81.6.26 1.08.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </div>
  );
}
