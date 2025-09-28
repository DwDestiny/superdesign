export interface OpenAIConfigSource {
	provider: string;
	openAI: {
		apiKey?: string;
		baseUrl?: string;
		model?: string;
	};
	custom: {
		apiKey?: string;
		baseUrl?: string;
		model?: string;
	};
}

export interface ResolvedOpenAIConfig {
	apiKey: string;
	baseUrl: string;
	model: string;
}

const DEFAULT_BASE_URL = 'https://oai.helicone.ai/v1';
const DEFAULT_MODEL = 'gpt-4o';

/**
 * 解析OpenAI及兼容配置，优先使用用户自定义参数。
 */
export function resolveOpenAIConfig(source: OpenAIConfigSource): ResolvedOpenAIConfig {
	const trimmedProvider = source.provider.trim().toLowerCase();
	const customApiKey = source.custom.apiKey?.trim();
	const customBaseUrl = source.custom.baseUrl?.trim();
	const customModel = source.custom.model?.trim();

	const shouldUseCustom = trimmedProvider === 'openai-compatible'
		|| Boolean(customApiKey || customBaseUrl || customModel);

	if (shouldUseCustom) {
		if (!customApiKey) {
			throw new Error('未检测到自定义OpenAI兼容密钥，请先配置superdesign.openaiCompatibleApiKey');
		}
		if (!customBaseUrl) {
			throw new Error('未检测到自定义OpenAI兼容Base URL，请先配置superdesign.openaiCompatibleBaseUrl');
		}
		if (!isValidHttpUrl(customBaseUrl)) {
			throw new Error(`自定义OpenAI兼容Base URL格式不正确：${customBaseUrl}`);
		}
		return {
			apiKey: customApiKey,
			baseUrl: customBaseUrl,
			model: customModel ?? DEFAULT_MODEL,
		};
	}

	const openaiKey = source.openAI.apiKey?.trim();
	if (!openaiKey) {
		throw new Error('OpenAI API Key 未配置，请运行“Configure OpenAI API Key”。');
	}

	const baseUrl = source.openAI.baseUrl?.trim() || DEFAULT_BASE_URL;
	const model = source.openAI.model?.trim() || DEFAULT_MODEL;

	return {
		apiKey: openaiKey,
		baseUrl,
		model,
	};
}

function isValidHttpUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}
