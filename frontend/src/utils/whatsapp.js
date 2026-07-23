export function shareTaskOnWhatsApp(task, phoneNumber) {
  const lines = [
    `*New Task Assigned*`,
    `Task: ${task.title}`,
    task.description ? `Details: ${task.description}` : null,
    `Priority: ${task.priority}`,
    task.due_date ? `Due Date: ${new Date(task.due_date).toLocaleDateString()}` : null,
    `— via Taskify`,
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join('\n'));
  const digits = (phoneNumber || '').replace(/\D/g, '');
  const url = digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
