'use client';

import { Task, Project } from '@/types';
import { format, parseISO } from 'date-fns';
import { getStatusColor, getPriorityColor } from '@/lib/calendar-utils';

interface TaskModalProps {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onEdit?: () => void;
}

export default function TaskModal({ task, projects, onClose, onEdit }: TaskModalProps) {
  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate progress
  const wordProgress = task.wordCountGoal
    ? Math.round(((task.wordCountCurrent || 0) / task.wordCountGoal) * 100)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <div className="text-gray-900">{project?.title || 'Unknown Project'}</div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="text-gray-900 whitespace-pre-wrap">{task.description}</div>
            </div>
          )}

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="text-gray-900">{formatDate(task.startDate)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <div className="text-gray-900">{formatDate(task.deadline)}</div>
            </div>
          </div>

          {/* Word Count Progress */}
          {task.wordCountGoal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Count Progress
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {(task.wordCountCurrent || 0).toLocaleString()} /{' '}
                    {task.wordCountGoal.toLocaleString()} words
                  </span>
                  <span className="font-medium text-gray-900">{wordProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(wordProgress || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Overall Progress */}
          {task.percentComplete !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Progress
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{task.percentComplete}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(task.percentComplete, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="grid grid-cols-2 gap-4">
              {task.estimatedHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <div className="text-gray-900">{task.estimatedHours}h</div>
                </div>
              )}
              {task.actualHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Hours
                  </label>
                  <div className="text-gray-900">{task.actualHours}h</div>
                </div>
              )}
            </div>
          )}

          {/* Blocked Status */}
          {task.status === 'blocked' && task.blockedReason && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <label className="block text-sm font-medium text-red-800 mb-1">Blocked</label>
              <div className="text-red-700">{task.blockedReason}</div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                {task.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
