export default function TaskFilters({ search, onSearch, priority, onPriority, status, onStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1 min-w-[160px] border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <select
        value={priority}
        onChange={(e) => onPriority(e.target.value)}
        className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Priorities</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Statuses</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
    </div>
  );
}
