import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// The default directory if the user hasn't selected a custom one
const DEFAULT_NOTES_DIR = path.join(process.cwd(), 'data', 'notes');

export interface NoteMetadata {
    id: string;
    title: string;
    projectId?: string | null;
    tags?: string[];
    isPinned?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface MarkdownNote {
    metadata: NoteMetadata;
    content: string;
    filePath: string;
}

/**
 * Ensures the directory exists.
 */
async function ensureDir(dirPath: string) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

/**
 * Sanitizes a string to be used as a folder or file name.
 */
function sanitizeName(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * Determines the target directory for a note, creating it if necessary.
 * If a projectId/projectName is provided, creates a subfolder.
 */
export async function getNoteDirectory(baseDir: string | null | undefined, projectName?: string | null): Promise<string> {
    const rootDir = baseDir || DEFAULT_NOTES_DIR;
    let targetDir = rootDir;

    if (projectName) {
        targetDir = path.join(rootDir, sanitizeName(projectName));
    } else {
        targetDir = path.join(rootDir, 'Inbox');
    }

    await ensureDir(targetDir);
    return targetDir;
}

/**
 * Generates the full file path for a note.
 */
export async function getNoteFilePath(baseDir: string | null | undefined, noteId: string, projectName?: string | null): Promise<string> {
    const dir = await getNoteDirectory(baseDir, projectName);
    // Using ID as filename to prevent issues with changing titles
    return path.join(dir, `${noteId}.md`);
}

/**
 * Reads and parses a markdown note file.
 */
export async function readMarkdownNote(filePath: string): Promise<MarkdownNote | null> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(fileContent);
        
        return {
            metadata: parsed.data as NoteMetadata,
            content: parsed.content,
            filePath
        };
    } catch (error) {
        console.error(`Error reading markdown note at ${filePath}:`, error);
        return null;
    }
}

/**
 * Saves a markdown note to the file system.
 */
export async function saveMarkdownNote(
    baseDir: string | null | undefined,
    metadata: NoteMetadata,
    content: string,
    projectName?: string | null
): Promise<string> {
    const filePath = await getNoteFilePath(baseDir, metadata.id, projectName);
    
    // Ensure the frontmatter is correctly structured
    const fileOutput = matter.stringify(content, {
        id: metadata.id,
        title: metadata.title,
        projectId: metadata.projectId || null,
        tags: metadata.tags || [],
        isPinned: metadata.isPinned || false,
        createdAt: metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    await fs.writeFile(filePath, fileOutput, 'utf-8');
    return filePath;
}

/**
 * Deletes a markdown note from the file system.
 */
export async function deleteMarkdownNote(filePath: string): Promise<boolean> {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        console.error(`Error deleting markdown note at ${filePath}:`, error);
        return false;
    }
}
