'use client';

import { useState } from 'react';
import { Project } from '@/types';

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (id: string | null) => void;
  onRefresh: () => void;
}

export default function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
  onRefresh,
}: ProjectListProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'novel' as Project['type'],
    status: 'planning' as Project['status'],
    totalWordCountGoal: '',
    deadline: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const projectData = {
      ...formData,
      totalWordCountGoal: formData.totalWordCountGoal
        ? parseInt(formData.totalWordCountGoal)
        : undefined,
      deadline: formData.deadline || undefined,
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          type: 'novel',
          status: 'planning',
          totalWordCountGoal: '',
          deadline: '',
        });
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <input
              type="text"
              placeholder="Project Title"
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
              rows={3}
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Project['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="novel">Novel</option>
              <option value="short_story">Short Story</option>
              <option value="article">Article</option>
              <option value="non_fiction">Non-Fiction</option>
              <option value="screenplay">Screenplay</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Word Count Goal"
              value={formData.totalWordCountGoal}
              onChange={(e) => setFormData({ ...formData, totalWordCountGoal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Project
            </button>
          </form>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
            selectedProject === null ? 'bg-blue-50 border-l-4 border-blue-600' : ''
          }`}
        >
          <div className="font-medium text-gray-900">All Projects</div>
          <div className="text-sm text-gray-500">{projects.length} total</div>
        </button>

        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
              selectedProject === project.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="font-medium text-gray-900">{project.title}</div>
            <div className="text-sm text-gray-500 mt-1">
              {project.type} • {project.status}
            </div>
            {project.currentWordCount && project.totalWordCountGoal && (
              <div className="text-xs text-gray-500 mt-1">
                {project.currentWordCount.toLocaleString()} /{' '}
                {project.totalWordCountGoal.toLocaleString()} words
              </div>
            )}
          </button>
        ))}

        {projects.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No projects yet. Create your first project!
          </div>
        )}
      </div>
    </div>
  );
}
