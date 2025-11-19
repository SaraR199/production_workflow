'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Task, Project, CalendarEvent } from '@/types';
import { tasksToCalendarEvents, getEventStyle } from '@/lib/calendar-utils';
import TaskModal from './TaskModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  selectedProject: string | null;
}

export default function CalendarView({ tasks, projects, selectedProject }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks by selected project
  const filteredTasks = useMemo(() => {
    return selectedProject ? tasks.filter((t) => t.projectId === selectedProject) : tasks;
  }, [tasks, selectedProject]);

  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasksToCalendarEvents(filteredTasks);
  }, [filteredTasks]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTask(event.resource);
  }, []);

  // Handle slot selection (for creating new tasks in the future)
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    // Future enhancement: Create new task at selected date
    console.log('Selected slot:', slotInfo);
  }, []);

  // Custom event styling
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return getEventStyle(event);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calendar View</h2>
        <div className="text-sm text-gray-600">
          {selectedProject
            ? `Showing: ${projects.find((p) => p.id === selectedProject)?.title || 'Unknown'}`
            : 'Showing: All Projects'}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No tasks with deadlines</div>
          <div className="text-gray-500 text-sm">
            Add deadlines to your tasks to see them on the calendar
          </div>
        </div>
      ) : (
        <div className="calendar-container" style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            popup
            tooltipAccessor={(event: CalendarEvent) => {
              const task = event.resource;
              return `${task.title}\nStatus: ${task.status.replace(/_/g, ' ')}\nPriority: ${task.priority}`;
            }}
          />
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projects={projects}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { status: 'not_started', label: 'Not Started', color: '#9CA3AF' },
            { status: 'brainstorming', label: 'Brainstorming', color: '#A78BFA' },
            { status: 'outlining', label: 'Outlining', color: '#818CF8' },
            { status: 'first_draft', label: 'First Draft', color: '#60A5FA' },
            { status: 'revision', label: 'Revision', color: '#4ADE80' },
            { status: 'published', label: 'Published', color: '#10B981' },
          ].map(({ status, label, color }) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
        }

        .rbc-today {
          background-color: #EFF6FF;
        }

        .rbc-off-range-bg {
          background-color: #F9FAFB;
        }

        .rbc-event {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .rbc-event:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }

        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #D1D5DB;
          background-color: white;
          padding: 6px 12px;
          font-size: 0.875rem;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .rbc-toolbar button:hover {
          background-color: #F3F4F6;
          border-color: #9CA3AF;
        }

        .rbc-toolbar button.rbc-active {
          background-color: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }

        .rbc-toolbar button.rbc-active:hover {
          background-color: #2563EB;
          border-color: #2563EB;
        }

        .rbc-month-view,
        .rbc-time-view {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-agenda-view {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
        }

        .rbc-agenda-table {
          border: none;
        }

        .rbc-header + .rbc-header {
          border-left: 1px solid #E5E7EB;
        }

        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #E5E7EB;
        }

        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #E5E7EB;
        }
      `}</style>
    </div>
  );
}
