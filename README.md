# Author Workflow - Production Management System

A local-first, AI-assisted workflow management system designed specifically for authors to manage their writing projects, track progress, meet deadlines, and stay organized throughout the production process.

## Features

### Core Workflow Management
- **Project Management**: Create and manage multiple writing projects (novels, short stories, articles, etc.)
- **Task Tracking**: Comprehensive task system with status tracking through the entire writing lifecycle
- **Deadline Management**: Set and track deadlines with automatic overdue detection
- **Progress Metrics**: Track word counts, completion percentages, and task progress
- **Priority System**: Prioritize tasks with urgency levels (low, medium, high, urgent)

### Workflow Stages
The system supports the complete author workflow:
- Brainstorming
- Outlining
- First Draft
- Self-Editing
- Beta Readers
- Revision
- Copy Edit
- Proofreading
- Final
- Published

### AI-Powered Features
- **Workflow Analysis**: Get AI insights on your project progress
- **Deadline Suggestions**: Receive realistic deadline recommendations
- **Task Prioritization**: AI helps identify which tasks to focus on
- **Progress Reports**: Generate comprehensive progress summaries
- **Bottleneck Identification**: Discover what's blocking your workflow

### Version Control
- **Automatic Git Commits**: Every change is automatically saved to Git
- **Version History**: Access complete history of your workflow data
- **Data Recovery**: Revert to previous states if needed
- **Branch Management**: Optional project-specific branches

## Tech Stack

- **Frontend**: React with Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Storage**: Local JSON files (Git-tracked)
- **AI**: Anthropic Claude API
- **Version Control**: Git via simple-git

## Installation

### Prerequisites
- Node.js 18+ installed
- Git installed
- Anthropic API key (get one at https://console.anthropic.com/)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Creating Your First Project

1. Click the **"+ New"** button in the Projects panel
2. Enter your project details:
   - **Title**: Your project name
   - **Description**: Optional project description
   - **Type**: Choose from Novel, Short Story, Article, etc.
   - **Word Count Goal**: Total words you aim to write
   - **Deadline**: Target completion date
3. Click **"Create Project"**

### Managing Tasks

1. Select a project from the Projects panel
2. Click **"+ New Task"** in the Tasks panel
3. Fill in task details:
   - **Title**: Task name (e.g., "Chapter 1 - First Draft")
   - **Type**: Chapter, Section, Revision, etc.
   - **Status**: Current workflow stage
   - **Priority**: How urgent this task is
   - **Deadline**: When it should be completed
   - **Word Count Goal**: Target words for this task
4. Click **"Create Task"**

### Updating Task Progress

- Click **"Edit"** on any task to update details
- Update the status as you progress through workflow stages
- Track word count progress
- Adjust deadlines as needed

### Using AI Features

**Note**: AI features require an Anthropic API key configured in `.env.local`

AI features are available through the API routes:

```bash
# Analyze workflow
POST /api/ai/analyze
{
  "projectId": "your-project-id",
  "action": "analyze"
}

# Get deadline suggestions
POST /api/ai/analyze
{
  "projectId": "your-project-id",
  "action": "suggest-deadlines"
}

# Prioritize tasks
POST /api/ai/analyze
{
  "projectId": "your-project-id",
  "action": "prioritize"
}

# Generate progress report
POST /api/ai/analyze
{
  "projectId": "your-project-id",
  "action": "progress-report"
}
```

## Data Storage

All workflow data is stored in `data/workflow-data.json`. This file is:
- **Git-tracked**: Every change is automatically committed
- **Local**: No cloud sync required
- **Portable**: Easy to backup and restore
- **Version-controlled**: Full history available via Git

### Backing Up Your Data

Your data is automatically versioned with Git. To create an additional backup:

```bash
# Copy the data file
cp data/workflow-data.json ~/my-backup.json

# Or commit and push to a remote repository
git push origin main
```

## Project Structure

```
production_workflow/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   │   ├── projects/    # Project CRUD operations
│   │   ├── tasks/       # Task CRUD operations
│   │   └── ai/          # AI-powered features
│   ├── page.tsx         # Main dashboard
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── Dashboard.tsx    # Metrics dashboard
│   ├── ProjectList.tsx  # Project management
│   └── TaskList.tsx     # Task management
├── lib/                 # Utilities
│   ├── storage.ts       # File operations
│   ├── git.ts          # Git integration
│   └── ai.ts           # AI features
├── types/              # TypeScript definitions
│   └── index.ts        # Core types
├── data/               # Data storage
│   └── workflow-data.json
└── README.md
```

## Development

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Run development server
```bash
npm run dev
```

### Type checking
```bash
npx tsc --noEmit
```

## Customization

### Adding Custom Task Types

Edit `types/index.ts` to add new task types:

```typescript
export type TaskType =
  | 'chapter'
  | 'your_custom_type' // Add here
  | ...
```

### Adding Custom Workflow Stages

Edit `types/index.ts` to add new statuses:

```typescript
export type TaskStatus =
  | 'not_started'
  | 'your_custom_stage' // Add here
  | ...
```

### Customizing AI Prompts

Edit `lib/ai.ts` to customize how AI analyzes your workflow.

## Troubleshooting

### Build fails with font errors
The app uses system fonts by default. If you see font-related errors, ensure `app/layout.tsx` doesn't import Google Fonts.

### Data not persisting
Check that the `data/` directory exists and is writable. The system will create it automatically on first run.

### Git commits failing
Ensure Git is initialized in the project directory:
```bash
git init
git add .
git commit -m "Initial commit"
```

### AI features not working
- Verify `ANTHROPIC_API_KEY` is set in `.env.local`
- Check that the key is valid at https://console.anthropic.com/
- API calls require internet connectivity

## Future Enhancements

Potential features for future development:
- Calendar view for deadline visualization
- Gantt chart for project timeline
- Export to various formats (PDF, CSV, etc.)
- Collaboration features for co-authors
- Mobile app version
- Cloud sync option
- Integration with writing tools (Scrivener, Google Docs, etc.)
- Advanced analytics and reporting
- Custom workflow templates
- Pomodoro timer integration

## License

MIT License - feel free to use and modify as needed.

---

**Happy Writing!** 📚✍️
