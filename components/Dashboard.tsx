'use client';

import { Project, Task } from '@/types';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  selectedProject: string | null;
}

export default function Dashboard({ projects, tasks, selectedProject }: DashboardProps) {
  const filteredTasks = selectedProject
    ? tasks.filter((t) => t.projectId === selectedProject)
    : tasks;

  const now = new Date();
  const weekFromNow = addDays(now, 7);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(
      (t) => t.status === 'final' || t.status === 'published'
    ).length,
    inProgressTasks: filteredTasks.filter(
      (t) =>
        t.status !== 'not_started' &&
        t.status !== 'final' &&
        t.status !== 'published' &&
        t.status !== 'blocked'
    ).length,
    overdueTasks: filteredTasks.filter((t) => {
      if (!t.deadline) return false;
      return isBefore(new Date(t.deadline), now) && t.status !== 'final' && t.status !== 'published';
    }).length,
    upcomingDeadlines: filteredTasks.filter((t) => {
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline);
      return isAfter(deadline, now) && isBefore(deadline, weekFromNow);
    }).length,
    blockedTasks: filteredTasks.filter((t) => t.status === 'blocked').length,
  };

  const totalWords = filteredTasks.reduce((sum, t) => sum + (t.wordCountCurrent || 0), 0);
  const totalWordGoal = filteredTasks.reduce((sum, t) => sum + (t.wordCountGoal || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Projects"
        value={stats.activeProjects}
        subtitle={`of ${stats.totalProjects} total`}
        color="blue"
      />
      <StatCard
        title="Tasks"
        value={stats.completedTasks}
        subtitle={`of ${stats.totalTasks} completed`}
        color="green"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgressTasks}
        subtitle={`${stats.blockedTasks} blocked`}
        color="purple"
      />
      <StatCard
        title="Deadlines"
        value={stats.upcomingDeadlines}
        subtitle={`${stats.overdueTasks} overdue`}
        color={stats.overdueTasks > 0 ? 'red' : 'yellow'}
      />

      {totalWordGoal > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Count Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min((totalWords / totalWordGoal) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {totalWords.toLocaleString()} / {totalWordGoal.toLocaleString()} words
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>
        {value}
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
