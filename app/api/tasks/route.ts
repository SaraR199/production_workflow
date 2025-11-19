import { NextRequest, NextResponse } from 'next/server';
import * as storage from '@/lib/storage';
import { autoCommit } from '@/lib/git';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const projectId = searchParams.get('projectId');

    if (id) {
      const task = await storage.getTaskById(id);
      if (!task) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: task });
    }

    if (projectId) {
      const tasks = await storage.getTasksByProject(projectId);
      return NextResponse.json({ success: true, data: tasks });
    }

    const tasks = await storage.getAllTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await storage.createTask(body);
    await autoCommit(`Created task: ${task.title}`);

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
    }

    const task = await storage.updateTask(id, updates);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    await autoCommit(`Updated task: ${task.title} - ${task.status}`);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('PUT /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
    }

    const success = await storage.deleteTask(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    await autoCommit(`Deleted task: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
