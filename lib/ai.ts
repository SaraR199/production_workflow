import Anthropic from '@anthropic-ai/sdk';
import { Project, Task, WorkflowAnalysis, ProgressMetrics } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Analyze project workflow and provide AI-powered insights
 */
export async function analyzeWorkflow(
  project: Project,
  tasks: Task[],
  metrics?: ProgressMetrics[]
): Promise<WorkflowAnalysis> {
  const prompt = buildAnalysisPrompt(project, tasks, metrics);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    const responseText = content.type === 'text' ? content.text : '';

    return parseAnalysisResponse(responseText, project.id, tasks);
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw new Error('Failed to analyze workflow');
  }
}

/**
 * Get AI suggestions for task deadlines
 */
export async function suggestDeadlines(
  project: Project,
  tasks: Task[]
): Promise<Record<string, string>> {
  const prompt = `You are a project management assistant helping an author manage their writing workflow.

Project: ${project.title}
Target Completion: ${project.deadline || 'Not set'}
Total Word Goal: ${project.totalWordCountGoal || 'Not set'}

Tasks:
${tasks.map((t) => `- ${t.title} (${t.type}, ${t.status}) - Current deadline: ${t.deadline || 'none'}`).join('\n')}

Based on the project timeline and task dependencies, suggest realistic deadlines for each task.
Return ONLY a JSON object mapping task IDs to ISO date strings. No additional text.

Example format:
{
  "task-id-1": "2024-12-01T00:00:00Z",
  "task-id-2": "2024-12-15T00:00:00Z"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const responseText = content.type === 'text' ? content.text : '{}';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error('Failed to suggest deadlines:', error);
    return {};
  }
}

/**
 * Get AI recommendations for task prioritization
 */
export async function prioritizeTasks(
  project: Project,
  tasks: Task[]
): Promise<string[]> {
  const prompt = `You are a project management assistant helping an author prioritize their work.

Project: ${project.title} (${project.status})
Deadline: ${project.deadline || 'Not set'}

Tasks:
${tasks
  .map(
    (t) =>
      `${t.id}: ${t.title} - Status: ${t.status}, Priority: ${t.priority}, Deadline: ${t.deadline || 'none'}`
  )
  .join('\n')}

Analyze the tasks and suggest the top 5 task IDs that should be prioritized right now.
Return ONLY a JSON array of task IDs in priority order. No additional text.

Example: ["task-id-1", "task-id-2", "task-id-3"]`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const responseText = content.type === 'text' ? content.text : '[]';

    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Failed to prioritize tasks:', error);
    return [];
  }
}

/**
 * Get AI-generated progress report
 */
export async function generateProgressReport(
  project: Project,
  tasks: Task[],
  metrics?: ProgressMetrics[]
): Promise<string> {
  const completedTasks = tasks.filter((t) => t.status === 'final' || t.status === 'published');
  const inProgressTasks = tasks.filter(
    (t) => t.status !== 'not_started' && t.status !== 'final' && t.status !== 'published'
  );

  const prompt = `Generate a concise progress report for this writing project:

Project: ${project.title}
Status: ${project.status}
Word Count: ${project.currentWordCount || 0} / ${project.totalWordCountGoal || 'N/A'}
Tasks: ${completedTasks.length} completed, ${inProgressTasks.length} in progress, ${tasks.length} total

Recent Tasks:
${tasks.slice(0, 10).map((t) => `- ${t.title}: ${t.status}`).join('\n')}

Provide a brief summary (2-3 paragraphs) covering:
1. Overall progress and momentum
2. Key accomplishments
3. Areas that need attention
4. Motivational insight or suggestion`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : 'Unable to generate report';
  } catch (error) {
    console.error('Failed to generate progress report:', error);
    return 'Failed to generate progress report. Please try again.';
  }
}

// ===== HELPER FUNCTIONS =====

function buildAnalysisPrompt(
  project: Project,
  tasks: Task[],
  metrics?: ProgressMetrics[]
): string {
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.deadline && new Date(t.deadline) < now && t.status !== 'final' && t.status !== 'published'
  );
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');

  return `Analyze this author's workflow and provide structured insights:

PROJECT:
Title: ${project.title}
Type: ${project.type}
Status: ${project.status}
Deadline: ${project.deadline || 'Not set'}
Word Count Goal: ${project.totalWordCountGoal || 'Not set'}
Current Word Count: ${project.currentWordCount || 0}

TASKS (${tasks.length} total):
${tasks.map((t) => `- ${t.title} (${t.type}): ${t.status}, Priority: ${t.priority}, Deadline: ${t.deadline || 'none'}`).join('\n')}

ISSUES:
- ${overdueTasks.length} overdue tasks
- ${blockedTasks.length} blocked tasks

Provide analysis in this exact format:

OVERDUE: List task titles that are overdue
UPCOMING: List tasks with deadlines in next 7 days
BOTTLENECKS: Identify workflow bottlenecks
RECOMMENDATIONS: Provide 3-5 actionable recommendations
ESTIMATED_COMPLETION: Estimate project completion date based on current progress`;
}

function parseAnalysisResponse(
  response: string,
  projectId: string,
  tasks: Task[]
): WorkflowAnalysis {
  const now = new Date();
  const analysis: WorkflowAnalysis = {
    projectId,
    generatedAt: new Date().toISOString(),
    overdueTasks: tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < now && t.status !== 'final' && t.status !== 'published'
    ),
    upcomingDeadlines: tasks.filter((t) => {
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline);
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return deadline >= now && deadline <= weekFromNow;
    }),
    blockedTasks: tasks.filter((t) => t.status === 'blocked'),
    suggestedPriorities: [],
    recommendations: [],
    bottlenecks: [],
  };

  // Extract recommendations from response
  const recommendationsMatch = response.match(/RECOMMENDATIONS:([\s\S]*?)(?=\n\n|$)/);
  if (recommendationsMatch) {
    analysis.recommendations = recommendationsMatch[1]
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^[-•*]\s*/, '').trim());
  }

  // Extract bottlenecks
  const bottlenecksMatch = response.match(/BOTTLENECKS:([\s\S]*?)(?=RECOMMENDATIONS|$)/);
  if (bottlenecksMatch) {
    analysis.bottlenecks = bottlenecksMatch[1]
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^[-•*]\s*/, '').trim());
  }

  return analysis;
}
