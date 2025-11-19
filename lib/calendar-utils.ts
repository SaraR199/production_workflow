import { Task, Project, CalendarEvent, TaskStatus, TaskPriority } from '@/types';
import { addDays, parseISO } from 'date-fns';

/**
 * Convert tasks to calendar events for react-big-calendar
 */
export function tasksToCalendarEvents(tasks: Task[]): CalendarEvent[] {
  return tasks
    .filter((task) => task.deadline || task.startDate)
    .map((task) => {
      const start = task.startDate
        ? parseISO(task.startDate)
        : task.deadline
        ? addDays(parseISO(task.deadline), -7) // Default to week before deadline
        : new Date();

      const end = task.deadline ? parseISO(task.deadline) : addDays(start, 1);

      return {
        id: task.id,
        title: task.title,
        start,
        end,
        resource: task,
        allDay: true,
      };
    });
}

/**
 * Get color class based on task status
 */
export function getStatusColor(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    not_started: 'bg-gray-400',
    brainstorming: 'bg-purple-400',
    outlining: 'bg-indigo-400',
    first_draft: 'bg-blue-400',
    self_edit: 'bg-cyan-400',
    beta_readers: 'bg-teal-400',
    revision: 'bg-green-400',
    copy_edit: 'bg-lime-400',
    proofreading: 'bg-yellow-400',
    final: 'bg-orange-400',
    published: 'bg-emerald-500',
    blocked: 'bg-red-500',
  };

  return colorMap[status] || 'bg-gray-400';
}

/**
 * Get color class based on task priority
 */
export function getPriorityColor(priority: TaskPriority): string {
  const colorMap: Record<TaskPriority, string> = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  return colorMap[priority] || 'bg-gray-500';
}

/**
 * Get hex color for calendar event styling
 */
export function getEventColor(task: Task): string {
  // Color by status
  const statusColorMap: Record<TaskStatus, string> = {
    not_started: '#9CA3AF',
    brainstorming: '#A78BFA',
    outlining: '#818CF8',
    first_draft: '#60A5FA',
    self_edit: '#22D3EE',
    beta_readers: '#2DD4BF',
    revision: '#4ADE80',
    copy_edit: '#A3E635',
    proofreading: '#FDE047',
    final: '#FB923C',
    published: '#10B981',
    blocked: '#EF4444',
  };

  return statusColorMap[task.status] || '#9CA3AF';
}

/**
 * Get lighter background color for event
 */
export function getEventBackgroundColor(task: Task): string {
  const baseColor = getEventColor(task);
  // Add transparency to the color
  return baseColor + '40'; // 25% opacity
}

/**
 * Style object for calendar events
 */
export function getEventStyle(event: CalendarEvent) {
  const task = event.resource;
  const baseColor = getEventColor(task);

  return {
    style: {
      backgroundColor: baseColor,
      borderColor: baseColor,
      color: '#ffffff',
      borderRadius: '4px',
      border: 'none',
      fontSize: '0.875rem',
      padding: '2px 6px',
    },
  };
}

/**
 * Filter tasks for calendar view
 */
export function filterTasksForCalendar(
  tasks: Task[],
  filters: {
    projectId?: string | null;
    status?: TaskStatus[];
    priority?: TaskPriority[];
  }
): Task[] {
  return tasks.filter((task) => {
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false;
    }

    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    return true;
  });
}

/**
 * Get project color for consistent visualization
 */
export function getProjectColor(project: Project, allProjects: Project[]): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];

  const index = allProjects.findIndex((p) => p.id === project.id);
  return colors[index % colors.length];
}
