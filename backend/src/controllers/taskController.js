import { query } from '../config/db.js';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

// Org Admin only: create + assign a task within their organization
export async function createTask(req, res) {
  const { title, description, priority, dueDate, assignedTo } = req.body;
  if (!title || !assignedTo) {
    return res.status(400).json({ message: 'title and assignedTo are required' });
  }
  if (priority && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ message: `priority must be one of ${PRIORITIES.join(', ')}` });
  }

  const assignee = await query(
    "SELECT id FROM users WHERE id = $1 AND organization_id = $2 AND role = 'employee'",
    [assignedTo, req.user.organizationId]
  );
  if (!assignee.length) {
    return res.status(400).json({ message: 'assignedTo must be an employee in your organization' });
  }

  const tasks = await query(
    `INSERT INTO tasks (title, description, priority, due_date, organization_id, assigned_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, description || null, priority || 'Medium', dueDate || null, req.user.organizationId, assignedTo, req.user.id]
  );

  res.status(201).json({ task: tasks[0] });
}

// Org Admin: all tasks in their organization. Employee: only tasks assigned to them.
export async function listTasks(req, res) {
  if (req.user.role === 'employee') {
    const tasks = await query(
      `SELECT t.*, u.name AS "assignedToName"
       FROM tasks t
       JOIN users u ON u.id = t.assigned_to
       WHERE t.assigned_to = $1
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );
    return res.json(tasks);
  }

  const tasks = await query(
    `SELECT t.*, u.name AS "assignedToName"
     FROM tasks t
     JOIN users u ON u.id = t.assigned_to
     WHERE t.organization_id = $1
     ORDER BY t.due_date ASC`,
    [req.user.organizationId]
  );
  res.json(tasks);
}

// Employee can update status of their own task. Org Admin can update any field of a task in their org.
export async function updateTask(req, res) {
  const taskId = req.params.id;
  const existing = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
  const task = existing[0];
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (req.user.role === 'employee') {
    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${STATUSES.join(', ')}` });
    }
    await query('UPDATE tasks SET status = $1 WHERE id = $2', [status, taskId]);
    return res.json({ message: 'Task status updated' });
  }

  // org_admin
  if (task.organization_id !== req.user.organizationId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { title, description, priority, dueDate, status, assignedTo } = req.body;
  if (priority && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ message: `priority must be one of ${PRIORITIES.join(', ')}` });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${STATUSES.join(', ')}` });
  }

  await query(
    `UPDATE tasks SET title = $1, description = $2, priority = $3,
     due_date = $4, status = $5, assigned_to = $6 WHERE id = $7`,
    [
      title ?? task.title,
      description ?? task.description,
      priority ?? task.priority,
      dueDate ?? task.due_date,
      status ?? task.status,
      assignedTo ?? task.assigned_to,
      taskId,
    ]
  );

  res.json({ message: 'Task updated' });
}
