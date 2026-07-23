import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import TaskCard from '../../components/TaskCard';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    const { data } = await client.get('/tasks');
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(taskId, status) {
    await client.put(`/tasks/${taskId}`, { status });
    await loadTasks();
  }

  const highPriority = tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed').length;
  const pending = tasks.filter((t) => t.status !== 'Completed').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-xl font-bold text-slate-800">My Tasks</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Assigned" value={tasks.length} />
          <StatCard label="High Priority" value={highPriority} accent="red" />
          <StatCard label="Pending" value={pending} accent="amber" />
          <StatCard label="Completed" value={completed} accent="emerald" />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks assigned to you yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assigneePhone={user?.phoneNumber}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
