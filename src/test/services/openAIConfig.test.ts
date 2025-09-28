import { resolveOpenAIConfig } from '../../services/openAIConfig';

type TestCase = {
	name: string;
	run: () => void;
};

const tests: TestCase[] = [
	{
		name: '默认OpenAI配置返回既有默认值',
		run: () => {
			const result = resolveOpenAIConfig({
				provider: 'openai',
				openAI: {
					apiKey: 'sk-openai-123',
					baseUrl: undefined,
					model: undefined,
				},
				custom: {
					apiKey: undefined,
					baseUrl: undefined,
					model: undefined,
				},
			});
			if (result.apiKey !== 'sk-openai-123') {
				throw new Error(`期望返回原有OpenAI密钥，实际为 ${result.apiKey}`);
			}
			if (result.baseUrl !== 'https://oai.helicone.ai/v1') {
				throw new Error(`期望默认Base URL为Helicone代理，实际为 ${result.baseUrl}`);
			}
			if (result.model !== 'gpt-4o') {
				throw new Error(`期望默认模型为gpt-4o，实际为 ${result.model}`);
			}
		}
	},
	{
		name: '自定义OpenAI兼容配置覆盖默认值',
		run: () => {
			const result = resolveOpenAIConfig({
				provider: 'openai-compatible',
				openAI: {
					apiKey: 'sk-openai-123',
					baseUrl: 'https://oai.helicone.ai/v1',
					model: 'gpt-4o',
				},
				custom: {
					apiKey: 'custom-key-abc',
					baseUrl: 'http://localhost:1234/v1',
					model: 'my-custom-model',
				},
			});
			if (result.apiKey !== 'custom-key-abc') {
				throw new Error(`期望返回自定义密钥，实际为 ${result.apiKey}`);
			}
			if (result.baseUrl !== 'http://localhost:1234/v1') {
				throw new Error(`期望返回自定义Base URL，实际为 ${result.baseUrl}`);
			}
			if (result.model !== 'my-custom-model') {
				throw new Error(`期望返回自定义模型，实际为 ${result.model}`);
			}
		}
	},
	{
		name: '缺失自定义URL时报错',
		run: () => {
			let error: unknown;
			try {
				resolveOpenAIConfig({
					provider: 'openai-compatible',
					openAI: {
						apiKey: 'sk-openai-123',
						baseUrl: 'https://oai.helicone.ai/v1',
						model: 'gpt-4o',
					},
					custom: {
						apiKey: 'custom-key-abc',
						baseUrl: undefined,
						model: 'my-custom-model',
					},
				});
			} catch (err) {
				error = err;
			}
			if (!error) {
				throw new Error('预期因缺少Base URL抛出异常，但未捕获到错误');
			}
		}
	},
];

let hasFailure = false;

for (const test of tests) {
	try {
		test.run();
		console.log(`✅ ${test.name}`);
	} catch (error) {
		hasFailure = true;
		console.error(`❌ ${test.name}`);
		console.error(error);
	}
}

if (hasFailure) {
	process.exitCode = 1;
} else {
	console.log('🎉 所有openAI配置解析测试通过');
}
