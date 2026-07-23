import { useEffect, useMemo, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import CompletionBar from '../../components/CompletionBar';
import TaskCard from '../../components/TaskCard';
import TaskFilters from '../../components/TaskFilters';
import EmployeeFormModal from '../../components/EmployeeFormModal';
import TaskFormModal from '../../components/TaskFormModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';
import client from '../../api/client';

export default function OrgAdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [resettingEmployee, setResettingEmployee] = useState(null);
  const [tab, setTab] = useState('tasks');

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadData() {
    const [employeesRes, tasksRes] = await Promise.all([
      client.get('/users/employees'),
      client.get('/tasks'),
    ]);
    setEmployees(employeesRes.data);
    setTasks(tasksRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateEmployee(form) {
    await client.post('/users/employees', form);
    await loadData();
  }

  async function handleCreateTask(form) {
    await client.post('/tasks', form);
    await loadData();
  }

  async function handleStatusChange(taskId, status) {
    await client.put(`/tasks/${taskId}`, { status });
    await loadData();
  }

  async function handleResetEmployeePassword(newPassword) {
    await client.put(`/users/employees/${resettingEmployee.id}/password`, { newPassword });
  }

  const phoneByEmployeeId = Object.fromEntries(employees.map((e) => [e.id, e.phone_number]));
  const highPriority = tasks.filter((t) => t.priority === 'High').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const pending = tasks.filter((t) => t.status !== 'Completed').length;

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (!priorityFilter || t.priority === priorityFilter) &&
          (!statusFilter || t.status === statusFilter) &&
          (t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedToName?.toLowerCase().includes(search.toLowerCase()))
      ),
    [tasks, search, priorityFilter, statusFilter]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Topbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={tasks.length} />
          <StatCard label="High Priority" value={highPriority} accent="red" />
          <StatCard label="Pending" value={pending} accent="amber" />
          <StatCard label="Completed" value={completed} accent="emerald" />
        </div>

        <CompletionBar completed={completed} total={tasks.length} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('tasks')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'tasks' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              Tasks
            </button>
            <button
              onClick={() => setTab('employees')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === 'employees' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              Employees
            </button>
          </div>

          {tab === 'tasks' ? (
            <button
              onClick={() => setShowTaskForm(true)}
              disabled={employees.length === 0}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
              title={employees.length === 0 ? 'Add an employee first' : ''}
            >
              + Create Task
            </button>
          ) : (
            <button
              onClick={() => setShowEmployeeForm(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + Add Employee
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : tab === 'tasks' ? (
          tasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks yet. Click "+ Create Task" to assign one.</p>
          ) : (
            <>
              <TaskFilters
                search={search}
                onSearch={setSearch}
                priority={priorityFilter}
                onPriority={setPriorityFilter}
                status={statusFilter}
                onStatus={setStatusFilter}
              />
              {filteredTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks match your filters.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showAssignee
                      assigneePhone={phoneByEmployeeId[task.assigned_to]}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </>
          )
        ) : employees.length === 0 ? (
          <p className="text-sm text-slate-500">No employees yet. Click "+ Add Employee" to add your first team member.</p>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-500">{emp.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{emp.phone_number}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setResettingEmployee(emp)} className="text-xs font-medium text-amber-700 hover:underline">
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showEmployeeForm && <EmployeeFormModal onClose={() => setShowEmployeeForm(false)} onSubmit={handleCreateEmployee} />}
      {showTaskForm && <TaskFormModal employees={employees} onClose={() => setShowTaskForm(false)} onSubmit={handleCreateTask} />}
      {resettingEmployee && (
        <ResetPasswordModal
          title={`Reset password for ${resettingEmployee.name}`}
          onClose={() => setResettingEmployee(null)}
          onSubmit={handleResetEmployeePassword}
        />
      )}
    </div>
  );
}
