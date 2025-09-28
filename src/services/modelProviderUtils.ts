const DEFAULT_MODELS: Record<string, string> = {
	openai: 'gpt-4o',
	'anthropic': 'claude-3-5-sonnet-20241022',
	openrouter: 'anthropic/claude-3-7-sonnet-20250219',
	'openai-compatible': 'gpt-4o',
};

/**
 * 根据模型标识推断AI提供方。
 */
export function deriveProviderFromModel(model: string): 'openai' | 'anthropic' | 'openrouter' | 'openai-compatible' {
	const trimmed = model.trim();
	if (trimmed === '__custom-openai-compatible__') {
		return 'openai-compatible';
	}
	if (trimmed.includes('/')) {
		return 'openrouter';
	}
	if (trimmed.startsWith('claude-')) {
		return 'anthropic';
	}
	return 'openai';
}

/**
 * 根据提供方获取默认模型。
 */
export function getDefaultModelByProvider(provider: string): string {
	const key = provider.trim().toLowerCase();
	return DEFAULT_MODELS[key] ?? DEFAULT_MODELS.openai;
}
