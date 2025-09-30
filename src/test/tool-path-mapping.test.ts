import assert from 'assert';
import path from 'path';
import { resolveWorkspacePath, validateWorkspacePath } from '../tools/tool-utils';

const ctx: any = { workingDirectory: '/tmp/workspace' };

// Case 1: plain design_iterations should map into .superdesign/design_iterations
{
  const p = resolveWorkspacePath('design_iterations/ui_1.html', ctx);
  assert.ok(p.endsWith(path.join('.superdesign', 'design_iterations', 'ui_1.html')), 'design_iterations 应映射到 .superdesign/design_iterations');
  const err = validateWorkspacePath('design_iterations/ui_1.html', ctx);
  assert.strictEqual(err, null, '验证应通过且路径在工作区内');
}

// Case 2: already under .superdesign/design_iterations should keep as-is
{
  const p = resolveWorkspacePath(path.join('.superdesign', 'design_iterations', 'ui_2.html'), ctx);
  assert.ok(p.endsWith(path.join('.superdesign', 'design_iterations', 'ui_2.html')), '已在 .superdesign/design_iterations 下的路径不应重复映射');
}

console.log('✅ tool-path-mapping tests passed');

