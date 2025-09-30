// 使用 Node 内置断言，避免额外测试依赖
import assert from 'assert';
import { resolveEffectiveProvider, ProviderResolutionContext } from '../services/modelProviderUtils';

function runCase(name: string, ctx: ProviderResolutionContext, expected: 'openai' | 'anthropic' | 'openrouter' | 'openai-compatible') {
  const actual = resolveEffectiveProvider(ctx);
  assert.strictEqual(actual, expected, `${name}: expected ${expected}, got ${actual}`);
}

// 用例1：显式选择 openai-compatible，模型为 claude-*
runCase('provider=openai-compatible + claude-*', {
  provider: 'openai-compatible',
  specificModel: 'claude-3-5-sonnet-20241022',
}, 'openai-compatible');

// 用例2：存在任一 openaiCompatible* 配置（即使 provider 不是 openai-compatible），模型为 claude-*
runCase('custom fields present + claude-*', {
  provider: 'openai',
  specificModel: 'claude-3-5-sonnet-20241022',
  openaiCompatibleApiKey: 'sk-xxx',
  openaiCompatibleBaseUrl: 'https://example.com/v1',
}, 'openai-compatible');

// 用例3：未配置自定义端点 + 模型含 '/'
runCase('model contains slash -> openrouter', {
  provider: 'openai',
  specificModel: 'anthropic/claude-3-7-sonnet-20250219',
}, 'openrouter');

// 用例4：未配置自定义端点 + 模型以 claude- 开头
runCase('model startsWith claude- -> anthropic', {
  provider: 'openai',
  specificModel: 'claude-3-5-sonnet-20241022',
}, 'anthropic');

// 用例5：未配置自定义端点 + 其它模型默认 openai
runCase('default -> openai', {
  provider: 'openai',
  specificModel: 'gpt-4o',
}, 'openai');

console.log('✅ provider-resolution tests passed');

