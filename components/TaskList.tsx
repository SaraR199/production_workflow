'use client';

import { useState } from 'react';
import { Task, Project, TaskStatus, TaskType, TaskPriority } from '@/types';
import { format, isAfter, isBefore } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  selectedProject: string | null;
  onRefresh: () => void;
}

export default function TaskList({ tasks, projects, selectedProject, onRefresh }: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    type: 'chapter',
    status: 'not_started',
    priority: 'medium',
    projectId: selectedProject || '',
    deadline: '',
    wordCountGoal: undefined,
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by deadline
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    return 0;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const taskData = {
      ...formData,
      projectId: formData.projectId || selectedProject || projects[0]?.id,
      deadline: formData.deadline || undefined,
    };

    try {
      const url = editingTask ? '/api/tasks' : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      const body = editingTask ? { ...taskData, id: editingTask.id } : taskData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      type: 'chapter',
      status: 'not_started',
      priority: 'medium',
      projectId: selectedProject || '',
      deadline: '',
      wordCountGoal: undefined,
    });
  }

  function startEdit(task: Task) {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      deadline: task.deadline?.split('T')[0] || '',
      wordCountGoal: task.wordCountGoal,
      wordCountCurrent: task.wordCountCurrent,
    });
    setShowForm(true);
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Create a project first to start adding tasks.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showForm ? 'Cancel' : '+ New Task'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <input
              type="text"
              placeholder="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="chapter">Chapter</option>
                <option value="section">Section</option>
                <option value="scene">Scene</option>
                <option value="revision">Revision</option>
                <option value="research">Research</option>
                <option value="review">Review</option>
                <option value="editing">Editing</option>
                <option value="publishing">Publishing</option>
                <option value="other">Other</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="not_started">Not Started</option>
                <option value="brainstorming">Brainstorming</option>
                <option value="outlining">Outlining</option>
                <option value="first_draft">First Draft</option>
                <option value="self_edit">Self Edit</option>
                <option value="beta_readers">Beta Readers</option>
                <option value="revision">Revision</option>
                <option value="copy_edit">Copy Edit</option>
                <option value="proofreading">Proofreading</option>
                <option value="final">Final</option>
                <option value="published">Published</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Word Count Goal"
                value={formData.wordCountGoal || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wordCountGoal: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {editingTask && (
              <input
                type="number"
                placeholder="Current Word Count"
                value={formData.wordCountCurrent || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wordCountCurrent: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </form>
        )}
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            project={projects.find((p) => p.id === task.projectId)}
            onEdit={() => startEdit(task)}
            onDelete={() => deleteTask(task.id)}
            onStatusChange={(status) => updateTaskStatus(task.id, status)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No tasks yet. Create your first task!
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  project?: Project;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

function TaskItem({ task, project, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  const now = new Date();
  const isOverdue =
    task.deadline &&
    isBefore(new Date(task.deadline), now) &&
    task.status !== 'final' &&
    task.status !== 'published';

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800',
    brainstorming: 'bg-purple-100 text-purple-800',
    outlining: 'bg-indigo-100 text-indigo-800',
    first_draft: 'bg-blue-100 text-blue-800',
    self_edit: 'bg-yellow-100 text-yellow-800',
    beta_readers: 'bg-pink-100 text-pink-800',
    revision: 'bg-orange-100 text-orange-800',
    copy_edit: 'bg-teal-100 text-teal-800',
    proofreading: 'bg-cyan-100 text-cyan-800',
    final: 'bg-green-100 text-green-800',
    published: 'bg-green-200 text-green-900',
    blocked: 'bg-red-100 text-red-800',
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[task.status]}`}>
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{task.type}</span>
            {project && <span>• {project.title}</span>}
            {task.deadline && (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                • Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
                {isOverdue && ' (overdue)'}
              </span>
            )}
            {task.wordCountGoal && (
              <span>
                • {task.wordCountCurrent || 0} / {task.wordCountGoal} words
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {task.wordCountGoal && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(((task.wordCountCurrent || 0) / task.wordCountGoal) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
