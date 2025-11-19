'use client';

import { useState, useEffect } from 'react';
import { Project, Task, ViewMode } from '@/types';
import ProjectList from '@/components/ProjectList';
import TaskList from '@/components/TaskList';
import Dashboard from '@/components/Dashboard';
import ViewSwitcher from '@/components/ViewSwitcher';
import CalendarView from '@/components/CalendarView';
import GanttView from '@/components/GanttView';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Load saved view preference
    const savedView = localStorage.getItem('preferredView') as ViewMode;
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  // Save view preference
  useEffect(() => {
    localStorage.setItem('preferredView', currentView);
  }, [currentView]);

  async function loadData() {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
      ]);

      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();

      if (projectsData.success) setProjects(projectsData.data);
      if (tasksData.success) setTasks(tasksData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = selectedProject
    ? tasks.filter((t) => t.projectId === selectedProject)
    : tasks;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Author Workflow</h1>
              <p className="text-gray-600 mt-1">Manage your writing projects and tasks</p>
            </div>
            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            <Dashboard
              projects={projects}
              tasks={tasks}
              selectedProject={selectedProject}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-1">
                <ProjectList
                  projects={projects}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  onRefresh={loadData}
                />
              </div>

              <div className="lg:col-span-2">
                <TaskList
                  tasks={filteredTasks}
                  projects={projects}
                  selectedProject={selectedProject}
                  onRefresh={loadData}
                />
              </div>
            </div>
          </>
        )}

        {/* List View */}
        {currentView === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onRefresh={loadData}
              />
            </div>

            <div className="lg:col-span-2">
              <TaskList
                tasks={filteredTasks}
                projects={projects}
                selectedProject={selectedProject}
                onRefresh={loadData}
              />
            </div>
          </div>
        )}

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-4">
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onRefresh={loadData}
              />
            </div>
            <CalendarView
              tasks={tasks}
              projects={projects}
              selectedProject={selectedProject}
            />
          </div>
        )}

        {/* Gantt View */}
        {currentView === 'gantt' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-4">
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                onRefresh={loadData}
              />
            </div>
            <GanttView
              tasks={tasks}
              projects={projects}
              selectedProject={selectedProject}
            />
          </div>
        )}
      </main>
    </div>
  );
}
