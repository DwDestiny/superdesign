import * as path from 'path';
import { ExecutionContext } from '../types/agent';

/**
 * Standard error response structure for all tools
 */
export interface ToolErrorResponse {
  success: false;
  error: string;
  error_type?: 'validation' | 'security' | 'file_not_found' | 'permission' | 'execution' | 'unknown';
  details?: any;
}

/**
 * Standard success response structure for all tools
 */
export interface ToolSuccessResponse {
  success: true;
  [key: string]: any;
}

export type ToolResponse = ToolSuccessResponse | ToolErrorResponse;

/**
 * 规范化“design_iterations”写入路径：
 * - 若用户/Agent 传入相对路径以 design_iterations/ 开头，则重写为 .superdesign/design_iterations/
 * - 已经为 .superdesign/design_iterations/ 的路径保持不变
 */
function normalizeDesignIterationsPath(filePath: string): string {
  const raw = filePath.replace(/\\/g, '/');
  const trimmed = raw.replace(/^\.\/+/, ''); // 移除开头的"./"
  if (trimmed.startsWith('.superdesign/design_iterations')) {
    return filePath; // 已是目标目录
  }
  if (trimmed === 'design_iterations' || trimmed.startsWith('design_iterations/')) {
    const suffix = trimmed === 'design_iterations' ? '' : trimmed.slice('design_iterations/'.length);
    const mapped = `.superdesign/design_iterations${suffix ? '/' + suffix : ''}`;
    // 保持与输入同类分隔符（尽量）
    return filePath.includes('\\') ? mapped.replace(/\//g, '\\') : mapped;
  }
  return filePath;
}

/**
 * Generic error handler that converts exceptions/errors to standardized error responses
 */
export function handleToolError(
  error: unknown, 
  context?: string,
  errorType: ToolErrorResponse['error_type'] = 'unknown'
): ToolErrorResponse {
  let errorMessage: string;
  let details: any;

  if (error instanceof Error) {
    errorMessage = error.message;
    details = {
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3) // Truncated stack trace
    };
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'An unknown error occurred';
    details = { originalError: error };
  }

  // Add context if provided
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }

  console.error(`Tool error (${errorType}): ${errorMessage}`);

  return {
    success: false,
    error: errorMessage,
    error_type: errorType,
    details
  };
}

/**
 * Validate if a path is within the workspace directory (supports both absolute and relative paths)
 */
export function validateWorkspacePath(filePath: string, context: ExecutionContext): ToolErrorResponse | null {
  try {
    // Prevent directory traversal attacks
    if (filePath.includes('..')) {
      return handleToolError('Path cannot contain ".." for security reasons', 'Path validation', 'security');
    }

    const normalizedWorkspace = path.normalize(context.workingDirectory);
    
    // 标准化 design_iterations 目标目录
    const mappedPath = normalizeDesignIterationsPath(filePath);

    // Handle both absolute and relative paths
    let resolvedPath: string;
    if (path.isAbsolute(mappedPath)) {
      resolvedPath = path.normalize(mappedPath);
    } else {
      resolvedPath = path.resolve(context.workingDirectory, mappedPath);
    }
    
    // Check if path is within workspace boundary
    if (!resolvedPath.startsWith(normalizedWorkspace)) {
      return handleToolError(
        `Path must be within workspace directory: ${filePath}`, 
        'Security check', 
        'security'
      );
    }

    return null; // No error
  } catch (error) {
    return handleToolError(error, 'Path validation', 'validation');
  }
}

/**
 * Safely resolve a file path (supports both absolute and relative paths)
 */
export function resolveWorkspacePath(filePath: string, context: ExecutionContext): string {
  const mappedPath = normalizeDesignIterationsPath(filePath);
  if (path.isAbsolute(mappedPath)) {
    return path.normalize(mappedPath);
  } else {
    return path.resolve(context.workingDirectory, mappedPath);
  }
}

/**
 * Create a success response
 */
export function createSuccessResponse(data: Record<string, any>): ToolSuccessResponse {
  return {
    success: true,
    ...data
  };
}

/**
 * Validation helper for required string parameters
 */
export function validateRequiredString(value: any, paramName: string): ToolErrorResponse | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return handleToolError(
      `${paramName} is required and must be a non-empty string`, 
      'Parameter validation', 
      'validation'
    );
  }
  return null;
}

/**
 * Validation helper for file existence
 */
export function validateFileExists(absolutePath: string, filePath: string): ToolErrorResponse | null {
  const fs = require('fs');
  
  try {
    if (!fs.existsSync(absolutePath)) {
      return handleToolError(
        `File not found: ${filePath}`, 
        'File existence check', 
        'file_not_found'
      );
    }
    return null;
  } catch (error) {
    return handleToolError(error, 'File existence check', 'permission');
  }
}

/**
 * Validation helper for directory existence
 */
export function validateDirectoryExists(absolutePath: string, dirPath: string): ToolErrorResponse | null {
  const fs = require('fs');
  
  try {
    if (!fs.existsSync(absolutePath)) {
      return handleToolError(
        `Directory not found: ${dirPath}`, 
        'Directory existence check', 
        'file_not_found'
      );
    }

    const stats = fs.statSync(absolutePath);
    if (!stats.isDirectory()) {
      return handleToolError(
        `Path is not a directory: ${dirPath}`, 
        'Directory validation', 
        'validation'
      );
    }

    return null;
  } catch (error) {
    return handleToolError(error, 'Directory validation', 'permission');
  }
} 
