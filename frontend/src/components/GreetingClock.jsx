import { useEffect, useState } from 'react';

function getGreeting(hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function GreetingClock({ name }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  const firstName = name?.split(' ')[0];

  return (
    <div className="text-right leading-tight">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {getGreeting(now.getHours())}{firstName ? `, ${firstName}` : ''}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{date} · {time}</p>
    </div>
  );
}
