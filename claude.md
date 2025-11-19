# Claude Context: Author Workflow Production Management System

This document provides context and guidelines for working on this codebase with AI assistance.

## Project Overview

A local-first, AI-assisted workflow management system designed for authors to manage writing projects, track progress, meet deadlines, and stay organized throughout the production process.

**Key Principles:**
- **Local-First**: All data stored in JSON files with Git version control
- **Author-Centric**: Designed specifically for writing workflows (novels, articles, etc.)
- **AI-Enhanced**: Optional AI features for workflow analysis and optimization
- **Type-Safe**: Full TypeScript coverage for reliability
- **Zero Config**: Works out of the box with minimal setup

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Local JSON files (`data/workflow-data.json`)
- **Version Control**: Git via simple-git
- **AI**: Anthropic Claude API

### Data Flow
```
User Action (UI)
  ↓
API Route (app/api/*)
  ↓
Storage Layer (lib/storage.ts)
  ↓
JSON File (data/workflow-data.json)
  ↓
Git Auto-Commit (lib/git.ts)
```

### Directory Structure

```
├── app/
│   ├── api/              # Backend API routes
│   │   ├── projects/     # Project CRUD (GET, POST, PUT, DELETE)
│   │   ├── tasks/        # Task CRUD (GET, POST, PUT, DELETE)
│   │   └── ai/analyze/   # AI-powered analysis
│   ├── page.tsx          # Main dashboard (client component)
│   ├── layout.tsx        # Root layout (metadata, no fonts)
│   └── globals.css       # Global styles
├── components/           # React UI components (all client components)
│   ├── Dashboard.tsx     # Metrics and stats display
│   ├── ProjectList.tsx   # Project management UI
│   └── TaskList.tsx      # Task management UI
├── lib/                  # Core utilities (server-side)
│   ├── storage.ts        # File-based storage operations
│   ├── git.ts            # Git automation and versioning
│   └── ai.ts             # Anthropic API integration
├── types/
│   └── index.ts          # TypeScript type definitions
└── data/                 # Git-tracked data storage
    └── workflow-data.json
```

## Core Types

Located in `types/index.ts`:

### Main Entities
- **Project**: Writing projects (novels, short stories, etc.)
- **Task**: Individual work items with workflow stages
- **ProgressMetrics**: Daily/cumulative progress tracking
- **WorkflowAnalysis**: AI-generated insights

### Key Enums
- **TaskStatus**: 12 workflow stages from `not_started` to `published`
- **TaskType**: 9 task types (chapter, section, revision, etc.)
- **TaskPriority**: 4 levels (low, medium, high, urgent)
- **ProjectType**: 6 project types (novel, short_story, article, etc.)

## Development Conventions

### File Organization
1. **API Routes**: RESTful endpoints in `app/api/`
   - Use Next.js route handlers (GET, POST, PUT, DELETE)
   - Always return `{ success: boolean, data?: T, error?: string }`
   - Call storage layer functions, never access files directly
   - Trigger `autoCommit()` after data mutations

2. **Components**: React components in `components/`
   - All are client components (`'use client'`)
   - Props should be explicitly typed interfaces
   - Use Tailwind for styling (no CSS modules)
   - Keep components focused and single-responsibility

3. **Library Functions**: Utilities in `lib/`
   - Server-side only (not imported in client components)
   - Pure functions where possible
   - Comprehensive error handling with try-catch
   - Log errors to console (don't throw in git operations)

### Code Style
- **TypeScript**: Strict mode enabled, no `any` types
- **Naming**:
  - camelCase for functions/variables
  - PascalCase for components/types
  - kebab-case for file names
- **Async/Await**: Prefer over promises
- **Error Handling**: Always catch errors, provide fallbacks
- **Comments**: Explain "why", not "what"

### Data Persistence Pattern

```typescript
// 1. Read current data
const store = await readDataStore();

// 2. Modify data
store.projects.push(newProject);

// 3. Write data
await writeDataStore(store);

// 4. Auto-commit to Git (in API route)
await autoCommit('Created project: My Novel');
```

## Common Tasks

### Adding a New Task Status

1. Update type in `types/index.ts`:
   ```typescript
   export type TaskStatus =
     | 'existing_status'
     | 'new_status'  // Add here
     | ...
   ```

2. Add UI support in `components/TaskList.tsx`:
   - Add `<option>` in status dropdown
   - Add color mapping in `statusColors` object

3. Update AI prompts in `lib/ai.ts` if needed

### Adding a New API Endpoint

1. Create route file: `app/api/[name]/route.ts`
2. Export handler functions (GET, POST, etc.)
3. Use storage layer functions from `lib/storage.ts`
4. Return standard response format
5. Call `autoCommit()` after mutations

Example:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as storage from '@/lib/storage';
import { autoCommit } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await storage.createSomething(body);
    await autoCommit(`Created something: ${result.name}`);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('POST /api/something error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create' },
      { status: 500 }
    );
  }
}
```

### Adding a New Component

1. Create file in `components/[Name].tsx`
2. Add `'use client'` directive at top
3. Define props interface
4. Use Tailwind for styling
5. Import and use in parent component

### Extending Storage Layer

Add new functions to `lib/storage.ts`:
- Follow existing patterns (CRUD operations)
- Use `generateId()` for new entities
- Always update `lastUpdated` timestamp
- Handle errors gracefully

## Working with AI Features

### Current AI Capabilities
- **Workflow Analysis**: Identifies bottlenecks and recommendations
- **Deadline Suggestions**: Proposes realistic task deadlines
- **Task Prioritization**: Suggests which tasks to focus on
- **Progress Reports**: Generates narrative summaries

### Adding New AI Features

1. Add function to `lib/ai.ts`:
   ```typescript
   export async function newAiFeature(
     project: Project,
     tasks: Task[]
   ): Promise<ResultType> {
     const prompt = buildPrompt(project, tasks);

     const message = await anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       max_tokens: 2000,
       messages: [{ role: 'user', content: prompt }],
     });

     return parseResponse(message);
   }
   ```

2. Add API endpoint action in `app/api/ai/analyze/route.ts`

3. Keep prompts focused and specific
4. Always handle API errors gracefully
5. Consider cost (each call uses API credits)

### AI Prompt Design Tips
- Be specific about output format (JSON, markdown, etc.)
- Provide context (project details, task list)
- Ask for structured responses when possible
- Include examples in prompts for consistency

## Git Integration

### Auto-Commit Behavior
- Triggers on ALL data mutations via API routes
- Commits include timestamp in message
- Format: `"Action description (2024-11-19T10:30:00Z)"`
- Non-blocking: failures log to console but don't break app

### Git Functions (`lib/git.ts`)
- `autoCommit(message)`: Commit changes to data/
- `getDataHistory(limit)`: View commit history
- `revertToCommit(hash)`: Restore previous state
- `createProjectBranch(name)`: Branch per project (optional)

### Best Practices
- Write descriptive commit messages
- Don't disable auto-commit (it's your backup)
- Use `getDataHistory()` to audit changes
- Branch per major project is optional

## Database Schema (JSON)

Located in `data/workflow-data.json`:

```typescript
{
  "projects": Project[],
  "tasks": Task[],
  "metrics": ProgressMetrics[],
  "version": "1.0.0",
  "lastUpdated": "2024-11-19T10:30:00Z"
}
```

### Data Relationships
- Tasks → Projects: via `task.projectId`
- Metrics → Projects: via `metrics.projectId`
- Task Dependencies: via `task.dependsOn` (array of task IDs)

### ID Generation
- Format: `${timestamp}-${random9chars}`
- Example: `1700000000000-a1b2c3d4e`
- Generated by `generateId()` in `storage.ts`

## UI/UX Patterns

### Component Structure
```
Dashboard (metrics overview)
  ↓
ProjectList (left sidebar) + TaskList (main area)
  ↓
Individual forms/items
```

### Form Patterns
- Forms inline in list components
- Toggle with `showForm` state
- Reset form after submission
- Call `onRefresh()` parent callback after mutations

### Styling Conventions
- Use Tailwind utility classes
- Color coding:
  - Blue: Projects, general info
  - Green: Completed, success
  - Yellow: Warnings, upcoming
  - Red: Errors, overdue, urgent
  - Purple: In-progress, special
- Consistent spacing: `gap-4`, `p-6`, `mb-4`
- Rounded corners: `rounded-lg`
- Shadows: `shadow` for cards

## Testing & Debugging

### Manual Testing Checklist
- [ ] Create project
- [ ] Create task in project
- [ ] Update task status
- [ ] Edit task details
- [ ] Delete task
- [ ] Check dashboard metrics update
- [ ] Verify Git commit created
- [ ] Test with no projects
- [ ] Test with no tasks

### Common Issues

**Build fails:**
- Check TypeScript errors: `npx tsc --noEmit`
- Ensure no Google Font imports in layout.tsx
- Verify all imports resolve correctly

**Data not persisting:**
- Check `data/` directory exists and is writable
- Verify API routes are being called
- Check browser console for API errors

**Git commits failing:**
- Non-critical, should only log errors
- Check Git is initialized: `git status`
- Verify permissions on data directory

**AI features not working:**
- Verify `ANTHROPIC_API_KEY` in `.env.local`
- Check API key is valid
- Review rate limits and quotas

## Performance Considerations

### Current Scale
- Designed for: 1 user, 10-50 projects, 100-500 tasks
- Load time: ~50ms (local JSON read)
- No pagination needed at this scale

### Future Optimization
If scaling beyond current design:
- Add pagination to task lists
- Implement search/filtering
- Consider SQLite database
- Add caching layer
- Lazy load task details

## Environment Variables

Required in `.env.local`:

```bash
# Required for AI features
ANTHROPIC_API_KEY=sk-ant-...

# Optional (for future features)
# DATABASE_URL=...
# SYNC_ENDPOINT=...
```

## Deployment Notes

### Local Development
```bash
npm run dev     # Development server (hot reload)
npm run build   # Production build (type checking)
npm start       # Production server
```

### Production Considerations
- This is a **local-first** app, not designed for traditional hosting
- Best deployed as:
  - Desktop app (Electron/Tauri wrapper)
  - Local server (personal use)
  - Self-hosted (single user)
- NOT recommended for:
  - Multi-tenant SaaS
  - Public hosting without auth
  - Shared infrastructure

## Extension Ideas

### Easy Additions
- Export data to CSV/PDF
- Import from other formats
- Custom task type colors
- Keyboard shortcuts
- Dark mode
- Task templates

### Medium Complexity
- Calendar view for deadlines
- Gantt chart visualization
- Weekly/monthly reports
- Task search and filters
- Bulk task operations
- Progress notifications

### Complex Features
- Real-time collaboration
- Cloud sync
- Mobile app (React Native)
- Integration with writing tools
- Advanced analytics dashboard
- Machine learning predictions

## Getting Help

### Debugging Steps
1. Check browser console for errors
2. Verify API routes return expected data
3. Check `data/workflow-data.json` contents
4. Review Git commit history
5. Test with minimal data

### Code References
- Next.js App Router: https://nextjs.org/docs/app
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs
- Anthropic API: https://docs.anthropic.com/

## Project Philosophy

**Design Principles:**
1. **Local First**: Your data, your control
2. **Git Everything**: Version control for peace of mind
3. **Author Focused**: Built for writing workflows specifically
4. **AI Optional**: Core features work without AI
5. **Type Safe**: TypeScript prevents runtime errors
6. **Simple**: Prefer simple solutions over complex ones

**Trade-offs Made:**
- File storage over database (simplicity > scale)
- Single user over multi-user (local > cloud)
- Inline forms over modals (less complexity)
- Full page reload over optimistic updates (reliability)

**Anti-patterns to Avoid:**
- Don't add cloud dependencies
- Don't bypass storage layer
- Don't skip Git auto-commits
- Don't use `any` types
- Don't add unnecessary abstractions

---

Last updated: 2024-11-19
