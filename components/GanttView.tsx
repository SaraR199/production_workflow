'use client';

import { useState, useMemo } from 'react';
import { Gantt, Task as GanttTaskType, ViewMode } from 'gantt-task-react';
import { Task, Project } from '@/types';
import { tasksToGanttTasks } from '@/lib/gantt-utils';
import TaskModal from './TaskModal';
import 'gantt-task-react/dist/index.css';

interface GanttViewProps {
  tasks: Task[];
  projects: Project[];
  selectedProject: string | null;
}

export default function GanttView({ tasks, projects, selectedProject }: GanttViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks by selected project
  const filteredTasks = useMemo(() => {
    return selectedProject ? tasks.filter((t) => t.projectId === selectedProject) : tasks;
  }, [tasks, selectedProject]);

  // Convert to gantt format
  const ganttTasks = useMemo(() => {
    const projectsToShow = selectedProject
      ? projects.filter((p) => p.id === selectedProject)
      : projects;

    return tasksToGanttTasks(filteredTasks, projectsToShow);
  }, [filteredTasks, projects, selectedProject]);

  // Handle task click
  const handleTaskClick = (task: GanttTaskType) => {
    // Find the original task (skip project rows)
    if (task.id.startsWith('project-')) return;

    const originalTask = tasks.find((t) => t.id === task.id);
    if (originalTask) {
      setSelectedTask(originalTask);
    }
  };

  // Handle task date change (for future drag-and-drop support)
  const handleTaskChange = (task: GanttTaskType) => {
    console.log('Task changed:', task);
    // Future enhancement: Update task dates via API
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gantt Chart</h2>
          <div className="text-sm text-gray-600 mt-1">
            {selectedProject
              ? `Showing: ${projects.find((p) => p.id === selectedProject)?.title || 'Unknown'}`
              : 'Showing: All Projects'}
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(ViewMode.Day)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === ViewMode.Day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Week)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === ViewMode.Week
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Month)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              viewMode === ViewMode.Month
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {ganttTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No tasks to display</div>
          <div className="text-gray-500 text-sm">
            Add tasks with start dates and deadlines to see them in the Gantt chart
          </div>
        </div>
      ) : (
        <div className="gantt-container overflow-x-auto">
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            onDateChange={handleTaskChange}
            onClick={handleTaskClick}
            listCellWidth="200px"
            columnWidth={viewMode === ViewMode.Month ? 60 : viewMode === ViewMode.Week ? 65 : 60}
            rowHeight={50}
            barCornerRadius={4}
            fontSize="14px"
            fontFamily="inherit"
            locale="en-US"
            todayColor="rgba(59, 130, 246, 0.1)"
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

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">How to use Gantt Chart</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click on a task to view details</li>
          <li>• Project rows are shown in blue with overall progress</li>
          <li>• Task colors indicate their current status in the workflow</li>
          <li>• Dependencies are shown as connecting arrows</li>
          <li>• Switch between Day, Week, and Month views for different time scales</li>
        </ul>
      </div>

      <style jsx global>{`
        .gantt-container {
          font-family: inherit;
        }

        /* Gantt task bar styling */
        .gantt-task-bar {
          transition: all 0.15s ease;
        }

        .gantt-task-bar:hover {
          filter: brightness(0.9);
        }

        /* Table header styling */
        .gantt-table-header {
          background-color: #F9FAFB;
          border-bottom: 2px solid #E5E7EB;
        }

        /* Grid styling */
        .gantt-grid-row {
          border-bottom: 1px solid #E5E7EB;
        }

        .gantt-grid-row:hover {
          background-color: #F9FAFB;
        }

        /* Today marker */
        .gantt-today-marker {
          stroke: #3B82F6;
          stroke-width: 2;
        }

        /* Task list styling */
        .gantt-task-list-row {
          padding: 8px;
          font-size: 14px;
        }

        /* Progress bar styling */
        .gantt-task-bar-progress {
          opacity: 0.7;
        }

        /* Milestone styling */
        .gantt-milestone {
          fill: #F59E0B;
          stroke: #D97706;
        }
      `}</style>
    </div>
  );
}
