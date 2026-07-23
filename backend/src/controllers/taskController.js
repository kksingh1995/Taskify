import { getPool, sql } from '../config/db.js';

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

  const pool = await getPool();

  const assignee = await pool
    .request()
    .input('id', sql.Int, assignedTo)
    .input('orgId', sql.Int, req.user.organizationId)
    .query("SELECT id FROM Users WHERE id = @id AND organization_id = @orgId AND role = 'employee'");
  if (!assignee.recordset.length) {
    return res.status(400).json({ message: 'assignedTo must be an employee in your organization' });
  }

  const result = await pool
    .request()
    .input('title', sql.NVarChar, title)
    .input('description', sql.NVarChar, description || null)
    .input('priority', sql.NVarChar, priority || 'Medium')
    .input('dueDate', sql.Date, dueDate || null)
    .input('orgId', sql.Int, req.user.organizationId)
    .input('assignedTo', sql.Int, assignedTo)
    .input('createdBy', sql.Int, req.user.id)
    .query(
      `INSERT INTO Tasks (title, description, priority, due_date, organization_id, assigned_to, created_by)
       OUTPUT INSERTED.*
       VALUES (@title, @description, @priority, @dueDate, @orgId, @assignedTo, @createdBy)`
    );

  res.status(201).json({ task: result.recordset[0] });
}

// Org Admin: all tasks in their organization. Employee: only tasks assigned to them.
export async function listTasks(req, res) {
  const pool = await getPool();

  if (req.user.role === 'employee') {
    const result = await pool
      .request()
      .input('userId', sql.Int, req.user.id)
      .query(
        `SELECT t.*, u.name AS assignedToName
         FROM Tasks t
         JOIN Users u ON u.id = t.assigned_to
         WHERE t.assigned_to = @userId
         ORDER BY t.due_date ASC`
      );
    return res.json(result.recordset);
  }

  const result = await pool
    .request()
    .input('orgId', sql.Int, req.user.organizationId)
    .query(
      `SELECT t.*, u.name AS assignedToName
       FROM Tasks t
       JOIN Users u ON u.id = t.assigned_to
       WHERE t.organization_id = @orgId
       ORDER BY t.due_date ASC`
    );
  res.json(result.recordset);
}

// Employee can update status of their own task. Org Admin can update any field of a task in their org.
export async function updateTask(req, res) {
  const pool = await getPool();
  const taskId = req.params.id;

  const existing = await pool.request().input('id', sql.Int, taskId).query('SELECT * FROM Tasks WHERE id = @id');
  const task = existing.recordset[0];
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (req.user.role === 'employee') {
    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${STATUSES.join(', ')}` });
    }
    await pool.request().input('id', sql.Int, taskId).input('status', sql.NVarChar, status)
      .query('UPDATE Tasks SET status = @status WHERE id = @id');
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

  await pool
    .request()
    .input('id', sql.Int, taskId)
    .input('title', sql.NVarChar, title ?? task.title)
    .input('description', sql.NVarChar, description ?? task.description)
    .input('priority', sql.NVarChar, priority ?? task.priority)
    .input('dueDate', sql.Date, dueDate ?? task.due_date)
    .input('status', sql.NVarChar, status ?? task.status)
    .input('assignedTo', sql.Int, assignedTo ?? task.assigned_to)
    .query(
      `UPDATE Tasks SET title = @title, description = @description, priority = @priority,
       due_date = @dueDate, status = @status, assigned_to = @assignedTo WHERE id = @id`
    );

  res.json({ message: 'Task updated' });
}
