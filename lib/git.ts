import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';

const git: SimpleGit = simpleGit(process.cwd());

/**
 * Initialize git repository if not already initialized
 */
export async function ensureGitRepo(): Promise<void> {
  try {
    await git.status();
  } catch (error) {
    // Not a git repo, initialize it
    await git.init();
    console.log('Git repository initialized');
  }
}

/**
 * Auto-commit changes to the data directory
 */
export async function autoCommit(message: string): Promise<void> {
  try {
    await ensureGitRepo();

    // Check if there are changes
    const status = await git.status();
    if (status.files.length === 0) {
      console.log('No changes to commit');
      return;
    }

    // Stage data directory
    await git.add('data/*');

    // Commit with timestamp
    const timestamp = new Date().toISOString();
    const commitMessage = `${message} (${timestamp})`;
    await git.commit(commitMessage);

    console.log(`Auto-committed: ${commitMessage}`);
  } catch (error) {
    console.error('Git auto-commit failed:', error);
    // Don't throw - we don't want git issues to break the app
  }
}

/**
 * Create a branch for a specific project
 */
export async function createProjectBranch(projectName: string): Promise<string> {
  try {
    const branchName = `project/${projectName.toLowerCase().replace(/\s+/g, '-')}`;
    await git.checkoutLocalBranch(branchName);
    return branchName;
  } catch (error) {
    console.error('Failed to create project branch:', error);
    throw error;
  }
}

/**
 * Get current branch
 */
export async function getCurrentBranch(): Promise<string> {
  try {
    const status = await git.status();
    return status.current || 'unknown';
  } catch (error) {
    console.error('Failed to get current branch:', error);
    return 'unknown';
  }
}

/**
 * Get commit history for data file
 */
export async function getDataHistory(limit: number = 10): Promise<any[]> {
  try {
    const log = await git.log({
      file: 'data/workflow-data.json',
      maxCount: limit,
    });
    return [...log.all];
  } catch (error) {
    console.error('Failed to get data history:', error);
    return [];
  }
}

/**
 * Revert to a specific commit
 */
export async function revertToCommit(commitHash: string): Promise<void> {
  try {
    await git.checkout([commitHash, '--', 'data/workflow-data.json']);
    await autoCommit(`Reverted data to commit ${commitHash}`);
  } catch (error) {
    console.error('Failed to revert to commit:', error);
    throw error;
  }
}

/**
 * Get git status
 */
export async function getGitStatus(): Promise<any> {
  try {
    return await git.status();
  } catch (error) {
    console.error('Failed to get git status:', error);
    return null;
  }
}

/**
 * Push to remote (if configured)
 */
export async function pushToRemote(): Promise<void> {
  try {
    const remotes = await git.getRemotes();
    if (remotes.length > 0) {
      await git.push();
      console.log('Pushed to remote');
    } else {
      console.log('No remote configured, skipping push');
    }
  } catch (error) {
    console.error('Failed to push to remote:', error);
    // Don't throw - remote push is optional
  }
}
