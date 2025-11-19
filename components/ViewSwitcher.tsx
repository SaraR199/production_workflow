'use client';

import { ViewMode } from '@/types';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'dashboard', label: 'Dashboard', icon: '📊' },
    { mode: 'list', label: 'List', icon: '📝' },
    { mode: 'calendar', label: 'Calendar', icon: '📅' },
    { mode: 'gantt', label: 'Gantt', icon: '📈' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-1 inline-flex gap-1">
      {views.map((view) => (
        <button
          key={view.mode}
          onClick={() => onViewChange(view.mode)}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-all
            ${
              currentView === view.mode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <span className="mr-2">{view.icon}</span>
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}
