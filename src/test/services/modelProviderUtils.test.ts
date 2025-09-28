import { deriveProviderFromModel, getDefaultModelByProvider } from '../../services/modelProviderUtils';

type TestCase = {
	name: string;
	assertion: () => void;
};

const providerCases: TestCase[] = [
	{
		name: 'gpt-4o推断为OpenAI提供方',
		assertion: () => {
			const provider = deriveProviderFromModel('gpt-4o');
			if (provider !== 'openai') {
				throw new Error(`期望提供方为openai，实际为${provider}`);
			}
		},
	},
	{
		name: '包含斜杠的模型推断为OpenRouter',
		assertion: () => {
			const provider = deriveProviderFromModel('deepseek/deepseek-r1');
			if (provider !== 'openrouter') {
				throw new Error(`期望提供方为openrouter，实际为${provider}`);
			}
		},
	},
	{
		name: '以claude-前缀的模型推断为Anthropic',
		assertion: () => {
			const provider = deriveProviderFromModel('claude-3-5-sonnet-20241022');
			if (provider !== 'anthropic') {
				throw new Error(`期望提供方为anthropic，实际为${provider}`);
			}
		},
	},
	{
		name: '自定义占位模型推断为OpenAI兼容',
		assertion: () => {
			const provider = deriveProviderFromModel('__custom-openai-compatible__');
			if (provider !== 'openai-compatible') {
				throw new Error(`期望提供方为openai-compatible，实际为${provider}`);
			}
		},
	},
];

const defaultModelCases: TestCase[] = [
	{
		name: 'OpenAI默认模型为gpt-4o',
		assertion: () => {
			const model = getDefaultModelByProvider('openai');
			if (model !== 'gpt-4o') {
				throw new Error(`期望默认模型为gpt-4o，实际为${model}`);
			}
		},
	},
	{
		name: 'Anthropic默认模型为claude-3-5-sonnet-20241022',
		assertion: () => {
			const model = getDefaultModelByProvider('anthropic');
			if (model !== 'claude-3-5-sonnet-20241022') {
				throw new Error(`期望默认模型为claude-3-5-sonnet-20241022，实际为${model}`);
			}
		},
	},
	{
		name: 'OpenRouter默认模型为anthropic/claude-3-7-sonnet-20250219',
		assertion: () => {
			const model = getDefaultModelByProvider('openrouter');
			if (model !== 'anthropic/claude-3-7-sonnet-20250219') {
				throw new Error(`期望默认模型为anthropic/claude-3-7-sonnet-20250219，实际为${model}`);
			}
		},
	},
	{
		name: 'OpenAI兼容提供方默认模型回退到gpt-4o',
		assertion: () => {
			const model = getDefaultModelByProvider('openai-compatible');
			if (model !== 'gpt-4o') {
				throw new Error(`期望默认模型为gpt-4o，实际为${model}`);
			}
		},
	},
];

let failure = false;

for (const test of providerCases.concat(defaultModelCases)) {
	try {
		test.assertion();
		console.log(`✅ ${test.name}`);
	} catch (error) {
		failure = true;
		console.error(`❌ ${test.name}`);
		console.error(error);
	}
}

if (failure) {
	process.exitCode = 1;
} else {
	console.log('🎉 模型提供方工具函数测试通过');
}
