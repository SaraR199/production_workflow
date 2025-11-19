import { NextRequest, NextResponse } from 'next/server';
import * as storage from '@/lib/storage';
import { analyzeWorkflow, suggestDeadlines, prioritizeTasks, generateProgressReport } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { projectId, action } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      );
    }

    const project = await storage.getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const tasks = await storage.getTasksByProject(projectId);

    let result;
    switch (action) {
      case 'analyze':
        result = await analyzeWorkflow(project, tasks);
        break;

      case 'suggest-deadlines':
        result = await suggestDeadlines(project, tasks);
        break;

      case 'prioritize':
        result = await prioritizeTasks(project, tasks);
        break;

      case 'progress-report':
        result = await generateProgressReport(project, tasks);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('POST /api/ai/analyze error:', error);
    return NextResponse.json(
      { success: false, error: 'AI analysis failed' },
      { status: 500 }
    );
  }
}
