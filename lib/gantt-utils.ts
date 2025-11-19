import { Task, Project, GanttTask, TaskStatus } from '@/types';
import { addDays, parseISO, differenceInDays } from 'date-fns';

/**
 * Convert tasks to gantt tasks for gantt-task-react
 */
export function tasksToGanttTasks(tasks: Task[], projects: Project[]): GanttTask[] {
  const ganttTasks: GanttTask[] = [];

  // Add project rows as parent tasks
  const tasksWithDates = tasks.filter((t) => t.deadline || t.startDate);

  // Group tasks by project
  const projectMap = new Map<string, Task[]>();
  tasksWithDates.forEach((task) => {
    if (!projectMap.has(task.projectId)) {
      projectMap.set(task.projectId, []);
    }
    projectMap.get(task.projectId)!.push(task);
  });

  // Create gantt tasks for each project and its tasks
  projectMap.forEach((projectTasks, projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Calculate project date range from tasks
    const taskDates = projectTasks
      .map((t) => ({
        start: t.startDate ? parseISO(t.startDate) : t.deadline ? addDays(parseISO(t.deadline), -7) : null,
        end: t.deadline ? parseISO(t.deadline) : null,
      }))
      .filter((d) => d.start && d.end) as { start: Date; end: Date }[];

    if (taskDates.length === 0) return;

    const projectStart = new Date(Math.min(...taskDates.map((d) => d.start.getTime())));
    const projectEnd = new Date(Math.max(...taskDates.map((d) => d.end.getTime())));

    // Add project as parent
    ganttTasks.push({
      id: `project-${projectId}`,
      name: project.title,
      start: projectStart,
      end: projectEnd,
      progress: calculateProjectProgress(projectTasks),
      type: 'project',
      styles: {
        backgroundColor: '#3B82F6',
        backgroundSelectedColor: '#2563EB',
        progressColor: '#1D4ED8',
        progressSelectedColor: '#1E40AF',
      },
      isDisabled: false,
    });

    // Add individual tasks
    projectTasks.forEach((task) => {
      const ganttTask = taskToGanttTask(task, projectId);
      if (ganttTask) {
        ganttTasks.push(ganttTask);
      }
    });
  });

  return ganttTasks;
}

/**
 * Convert a single task to gantt format
 */
export function taskToGanttTask(task: Task, projectId: string): GanttTask | null {
  const start = task.startDate
    ? parseISO(task.startDate)
    : task.deadline
    ? addDays(parseISO(task.deadline), -7)
    : null;

  const end = task.deadline ? parseISO(task.deadline) : start ? addDays(start, 7) : null;

  if (!start || !end) return null;

  // Determine task type
  const isMilestone = task.type === 'publishing' || task.status === 'published';
  const taskType: 'task' | 'milestone' = isMilestone ? 'milestone' : 'task';

  const progress = task.percentComplete || 0;
  const colors = getGanttColorsByStatus(task.status);

  return {
    id: task.id,
    name: task.title,
    start,
    end,
    progress,
    type: taskType,
    dependencies: task.dependsOn || [],
    styles: colors,
    project: `project-${projectId}`,
    isDisabled: task.status === 'blocked',
  };
}

/**
 * Calculate overall project progress from tasks
 */
function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const totalProgress = tasks.reduce((sum, task) => {
    return sum + (task.percentComplete || 0);
  }, 0);

  return Math.round(totalProgress / tasks.length);
}

/**
 * Get gantt colors based on task status
 */
export function getGanttColorsByStatus(status: TaskStatus) {
  const colorMap: Record<
    TaskStatus,
    {
      backgroundColor: string;
      backgroundSelectedColor: string;
      progressColor: string;
      progressSelectedColor: string;
    }
  > = {
    not_started: {
      backgroundColor: '#9CA3AF',
      backgroundSelectedColor: '#6B7280',
      progressColor: '#4B5563',
      progressSelectedColor: '#374151',
    },
    brainstorming: {
      backgroundColor: '#A78BFA',
      backgroundSelectedColor: '#8B5CF6',
      progressColor: '#7C3AED',
      progressSelectedColor: '#6D28D9',
    },
    outlining: {
      backgroundColor: '#818CF8',
      backgroundSelectedColor: '#6366F1',
      progressColor: '#4F46E5',
      progressSelectedColor: '#4338CA',
    },
    first_draft: {
      backgroundColor: '#60A5FA',
      backgroundSelectedColor: '#3B82F6',
      progressColor: '#2563EB',
      progressSelectedColor: '#1D4ED8',
    },
    self_edit: {
      backgroundColor: '#22D3EE',
      backgroundSelectedColor: '#06B6D4',
      progressColor: '#0891B2',
      progressSelectedColor: '#0E7490',
    },
    beta_readers: {
      backgroundColor: '#2DD4BF',
      backgroundSelectedColor: '#14B8A6',
      progressColor: '#0D9488',
      progressSelectedColor: '#0F766E',
    },
    revision: {
      backgroundColor: '#4ADE80',
      backgroundSelectedColor: '#22C55E',
      progressColor: '#16A34A',
      progressSelectedColor: '#15803D',
    },
    copy_edit: {
      backgroundColor: '#A3E635',
      backgroundSelectedColor: '#84CC16',
      progressColor: '#65A30D',
      progressSelectedColor: '#4D7C0F',
    },
    proofreading: {
      backgroundColor: '#FDE047',
      backgroundSelectedColor: '#FACC15',
      progressColor: '#EAB308',
      progressSelectedColor: '#CA8A04',
    },
    final: {
      backgroundColor: '#FB923C',
      backgroundSelectedColor: '#F97316',
      progressColor: '#EA580C',
      progressSelectedColor: '#C2410C',
    },
    published: {
      backgroundColor: '#10B981',
      backgroundSelectedColor: '#059669',
      progressColor: '#047857',
      progressSelectedColor: '#065F46',
    },
    blocked: {
      backgroundColor: '#EF4444',
      backgroundSelectedColor: '#DC2626',
      progressColor: '#B91C1C',
      progressSelectedColor: '#991B1B',
    },
  };

  return colorMap[status] || colorMap.not_started;
}

/**
 * Calculate task duration in days
 */
export function calculateTaskDuration(task: Task): number {
  const start = task.startDate
    ? parseISO(task.startDate)
    : task.deadline
    ? addDays(parseISO(task.deadline), -7)
    : new Date();

  const end = task.deadline ? parseISO(task.deadline) : addDays(start, 7);

  return differenceInDays(end, start);
}

/**
 * Detect scheduling conflicts (overlapping tasks with dependencies)
 */
export function detectConflicts(tasks: Task[]): string[] {
  const conflicts: string[] = [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  tasks.forEach((task) => {
    if (!task.dependsOn || task.dependsOn.length === 0) return;

    task.dependsOn.forEach((depId) => {
      const depTask = taskMap.get(depId);
      if (!depTask) return;

      const taskStart = task.startDate
        ? parseISO(task.startDate)
        : task.deadline
        ? addDays(parseISO(task.deadline), -7)
        : null;

      const depEnd = depTask.deadline ? parseISO(depTask.deadline) : null;

      if (taskStart && depEnd && taskStart < depEnd) {
        conflicts.push(
          `Task "${task.title}" starts before dependency "${depTask.title}" ends`
        );
      }
    });
  });

  return conflicts;
}

/**
 * Sort tasks by dependencies (topological sort for critical path)
 */
export function sortTasksByDependencies(tasks: Task[]): Task[] {
  const sorted: Task[] = [];
  const visited = new Set<string>();
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  function visit(taskId: string) {
    if (visited.has(taskId)) return;

    const task = taskMap.get(taskId);
    if (!task) return;

    // Visit dependencies first
    if (task.dependsOn) {
      task.dependsOn.forEach((depId) => visit(depId));
    }

    visited.add(taskId);
    sorted.push(task);
  }

  tasks.forEach((task) => visit(task.id));

  return sorted;
}
