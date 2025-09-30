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

/**
 * 统一解析“有效提供方”。
 * 优先级：
 * 1) 只要显式选择了 openai-compatible 或存在任一 openaiCompatible* 配置，则锁定为 openai-compatible；
 * 2) 模型包含 '/' 判为 openrouter；
 * 3) 模型以 'claude-' 开头判为 anthropic；
 * 4) 其它默认 openai。
 */
export interface ProviderResolutionContext {
    provider?: string;
    specificModel?: string;
    openaiUrl?: string;
    openaiCompatibleApiKey?: string;
    openaiCompatibleBaseUrl?: string;
    openaiCompatibleModel?: string;
}

export function resolveEffectiveProvider(ctx: ProviderResolutionContext): 'openai' | 'anthropic' | 'openrouter' | 'openai-compatible' | 'claude-code' {
    const provider = (ctx.provider ?? '').trim().toLowerCase();
    const model = (ctx.specificModel ?? '').trim();
    const hasCustom = Boolean(
        (ctx.openaiCompatibleApiKey ?? '').trim() ||
        (ctx.openaiCompatibleBaseUrl ?? '').trim() ||
        (ctx.openaiCompatibleModel ?? '').trim()
    );

    // 1) 显式选择或存在任一自定义字段 → 锁定 openai-compatible
    if (provider === 'openai-compatible' || hasCustom) {
        return 'openai-compatible';
    }

    // 2) 模型含 '/' → openrouter
    if (model && model.includes('/')) {
        return 'openrouter';
    }

    // 3) 模型以 'claude-' 开头 → anthropic
    if (model && model.startsWith('claude-')) {
        return 'anthropic';
    }

    // 4) 其它：遵从 provider（若不合法则默认 openai）
    if (provider === 'openai' || provider === 'anthropic' || provider === 'openrouter' || provider === 'claude-code') {
        return provider as any;
    }
    return 'openai';
}

/**
 * 全局沟通指令：语言镜像原则
 * - 作为系统提示的一部分，指导助手始终与用户使用相同语言沟通。
 */
export function buildGlobalCommunicationGuidelines(): string {
    return [
        '- 语言镜像原则：永远使用与用户一致的语言沟通',
    ].join('\n');
}
