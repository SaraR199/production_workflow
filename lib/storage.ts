import fs from 'fs/promises';
import path from 'path';
import { DataStore, Project, Task, ProgressMetrics } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'workflow-data.json');

// Initialize empty data store
const initialDataStore: DataStore = {
  projects: [],
  tasks: [],
  metrics: [],
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

/**
 * Ensure data directory and file exist
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(initialDataStore, null, 2), 'utf-8');
  }
}

/**
 * Read the entire data store
 */
export async function readDataStore(): Promise<DataStore> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data) as DataStore;
}

/**
 * Write the entire data store
 */
export async function writeDataStore(store: DataStore): Promise<void> {
  await ensureDataFile();
  store.lastUpdated = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// ===== PROJECT OPERATIONS =====

export async function getAllProjects(): Promise<Project[]> {
  const store = await readDataStore();
  return store.projects;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const store = await readDataStore();
  return store.projects.find((p) => p.id === id) || null;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const store = await readDataStore();
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.projects.push(newProject);
  await writeDataStore(store);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const store = await readDataStore();
  const index = store.projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  store.projects[index] = {
    ...store.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeDataStore(store);
  return store.projects[index];
}

export async function deleteProject(id: string): Promise<boolean> {
  const store = await readDataStore();
  const initialLength = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);

  // Also delete associated tasks
  store.tasks = store.tasks.filter((t) => t.projectId !== id);

  if (store.projects.length < initialLength) {
    await writeDataStore(store);
    return true;
  }
  return false;
}

// ===== TASK OPERATIONS =====

export async function getAllTasks(): Promise<Task[]> {
  const store = await readDataStore();
  return store.tasks;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const store = await readDataStore();
  return store.tasks.find((t) => t.id === id) || null;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const store = await readDataStore();
  return store.tasks.filter((t) => t.projectId === projectId);
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const store = await readDataStore();
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.tasks.push(newTask);
  await writeDataStore(store);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const store = await readDataStore();
  const index = store.tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  store.tasks[index] = {
    ...store.tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeDataStore(store);
  return store.tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const store = await readDataStore();
  const initialLength = store.tasks.length;
  store.tasks = store.tasks.filter((t) => t.id !== id);

  if (store.tasks.length < initialLength) {
    await writeDataStore(store);
    return true;
  }
  return false;
}

// ===== METRICS OPERATIONS =====

export async function getMetricsByProject(projectId: string): Promise<ProgressMetrics[]> {
  const store = await readDataStore();
  return store.metrics.filter((m) => m.projectId === projectId);
}

export async function addMetrics(metrics: ProgressMetrics): Promise<ProgressMetrics> {
  const store = await readDataStore();
  store.metrics.push(metrics);
  await writeDataStore(store);
  return metrics;
}

// ===== UTILITY FUNCTIONS =====

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get overdue tasks across all projects
 */
export async function getOverdueTasks(): Promise<Task[]> {
  const tasks = await getAllTasks();
  const now = new Date();
  return tasks.filter((task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    return deadline < now && task.status !== 'final' && task.status !== 'published';
  });
}

/**
 * Get upcoming deadlines (within next 7 days)
 */
export async function getUpcomingDeadlines(days: number = 7): Promise<Task[]> {
  const tasks = await getAllTasks();
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return tasks.filter((task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    return deadline >= now && deadline <= future && task.status !== 'final' && task.status !== 'published';
  });
}
