# 项目进展记录

## 2025-09-30
### 刷新=重开一致化修复（Canvas白屏问题）
- 现象：修改设计文件后点击刷新，画板偶发展示空白，需要手动关闭再打开才能恢复。
- 根因推测：仅在 Webview 内部重新加载数据无法复位 Webview 自身运行时与内部状态，导致极端情况下渲染树或 iframe 内容未正确重建。
- 修复策略：新增“硬刷新”命令，使刷新按钮触发扩展侧销毁并重建画板面板，效果等同手动关闭再打开。
- 改动：
  - 扩展侧 `src/extension.ts`
    - 在 `SuperdesignCanvasPanel` 的消息分支中新增 `reloadCanvas` 处理：先 `dispose()` 当前面板，再 `createOrShow()` 重新创建。
  - Webview 侧 `src/webview/components/CanvasView.tsx`
    - 刷新按钮改为发送 `{ command: 'reloadCanvas' }`；若重载失败回退到原有 `{ command: 'loadDesignFiles' }` 软刷新。
  - 类型声明 `src/webview/types/canvas.types.ts`
    - 新增 `ReloadCanvasMessage` 并纳入 `WebviewMessage` 联合类型。
- 验证：`npm run compile` 通过；白屏问题应因完全重建而消除。
- 影响范围：默认刷新路径最小化；保留文件系统 watcher 的软刷新逻辑，手动“刷新”按钮走硬刷新路径，行为与用户心智对齐。

- 问题排查：使用自定义 OpenAI 兼容 Base URL（`superdesign.openaiCompatibleBaseUrl`）与自定义模型为 Claude 系列（例如`claude-3-5-sonnet-20241022`）时，对话会立即终止并弹出 API 配置页面（指向 Anthropic）。
- 根因结论：代码存在按“模型名前缀”推断提供方的逻辑，当模型以`claude-`开头时会强制将 provider 设为`anthropic`，从而检查`superdesign.anthropicApiKey`是否配置，忽略了用户已配置的 OpenAI 兼容端点，导致误弹 Anthropic 配置。
- 涉及位置：
  - `src/services/customAgentService.ts` 中 `getModel()`：
    - 依据`specificModel.startsWith('claude-')`将`effectiveProvider`设为`anthropic`，随后分支要求 `anthropicApiKey`；未优先考虑 `openai-compatible` 的自定义配置。
  - `src/services/chatMessageService.ts` 的错误处理分支：
    - 使用相同的前缀推断逻辑来决定错误提示与“配置密钥”入口，从而在自定义端点场景下误判为需要配置 Anthropic。
- 修复建议（待确认后实施）：
  - 当满足以下任一条件时，优先锁定为 `openai-compatible`，禁止再被模型名前缀覆盖：
    1) `superdesign.aiModelProvider === 'openai-compatible'`
    2) 存在任一自定义字段：`openaiCompatibleApiKey`/`openaiCompatibleBaseUrl`/`openaiCompatibleModel`
  - 将“有效提供方”解析抽取为公共方法，例如在 `src/services/modelProviderUtils.ts` 新增：`resolveEffectiveProvider(ctx)`，入参包含 `provider`、`specificModel`、`openaiUrl`、`openaiCompatible*`，返回 `openai | anthropic | openrouter | openai-compatible`。在 `customAgentService.ts` 与 `chatMessageService.ts` 统一使用，避免重复与偏差。
  - 兼容性保持：
    - `model` 含 `/` 仍判为 OpenRouter。
    - 在未配置 OpenAI 兼容端点时，`claude-*` 仍判为 Anthropic；其它为 OpenAI。
- TDD 计划（实现前先补测试）：
  - 用例1：设置 `aiModelProvider='openai-compatible'` 且 `model='claude-3-5-sonnet-20241022'`，应解析为 `openai-compatible`。
  - 用例2：仅设置 `openaiCompatibleBaseUrl` 与 `openaiCompatibleApiKey`（provider 任意），`model='claude-...'` 亦应解析为 `openai-compatible`。
  - 用例3：未配置自定义端点，`model='anthropic/claude-3-7-sonnet-20250219'` 解析为 `openrouter`。
  - 用例4：未配置自定义端点，`model='claude-3-5-sonnet-20241022'` 解析为 `anthropic`。
  - 用例5：未配置自定义端点，`model='gpt-4o'` 解析为 `openai`。

### 已实施变更
- 新增：`resolveEffectiveProvider(ctx)`（`src/services/modelProviderUtils.ts`）
  - 优先级：显式 `openai-compatible` 或存在任一 `openaiCompatible*` → `openai-compatible`；
    其次 `model` 含 `/` → `openrouter`；`model` 以 `claude-` → `anthropic`；
    否则按 `provider` 回退，无法识别默认 `openai`。
  - 兼容保留：当 `provider==='claude-code'` 时返回 `claude-code`，便于上层在错误提示与密钥检测中保留原有行为。
- 改造：`customAgentService.ts`
  - `getModel()` 使用 `resolveEffectiveProvider`；
  - `hasApiKey()` 使用 `resolveEffectiveProvider` 并补齐 `openai-compatible` 与 `claude-code` 分支（`claude-code` 一直返回 `true`）。
  - 删除 `getModel()` 中不可达的 `case 'claude-code'` 分支（`claude-code` 在 `query()` 开头单独处理）。
- 改造：`chatMessageService.ts`
  - 错误处理分支使用 `resolveEffectiveProvider` 一致解析；
  - 新增 `openai-compatible` 的“配置密钥”入口（`superdesign.configureOpenAICompatibleApiKey`）；
  - 保留 `claude-code` 分支用于展示“打开设置”。
- 测试：新增 `src/test/provider-resolution.test.ts`，并将 `tsconfig.test.json` 的 `include` 扩展到 `src/services/**/*`；
  - 覆盖上述 5 个关键场景，单测通过；
  - 运行 `node node_modules/typescript/bin/tsc --project tsconfig.test.json && node dist-test/test/provider-resolution.test.js` 验证通过。

- 全局提示词增强（语言镜像原则）：
  - 在 `src/services/modelProviderUtils.ts` 新增 `buildGlobalCommunicationGuidelines()`，返回“语言镜像原则：永远使用与用户一致的语言沟通”。
  - `customAgentService.getSystemPrompt()` 注入该指令，作为 `# Instructions` 部分首条规则。
  - 单测 `src/test/language-mirroring.test.ts` 覆盖该指令文本，确保关键语句存在。

### 验证
- 通过 `esbuild` 本地打包（`node esbuild.js`）完成，`eslint` 静态检查通过。
- 手动联调建议：在设置中选择 `AI Model Provider = openai-compatible`，并填写 `openaiCompatibleBaseUrl`、`openaiCompatibleApiKey`；`Model` 选择/填写任意 `claude-*`，应正常走 OpenAI 兼容端点，不再弹出 Anthropic 配置。

### UI 修复：终止会话按钮
- 现象：点击“终止会话”无反应。
- 根因：前端按钮仅 `console.log('Stop requested')`，未向扩展发送消息。
- 修复：`src/webview/components/Chat/ChatInterface.tsx` 的 Stop 按钮 `onClick` 改为 `vscode.postMessage({ command: 'stopChat' })`。
- 扩展侧：`ChatSidebarProvider` 已处理 `stopChat` → 调用 `ChatMessageService.stopCurrentChat()`，该方法会 `AbortController.abort()` 并向 Webview 回发 `chatStopped`，`useChat` 在收到后 `setIsLoading(false)`。

### 写入目录约定修复：design_iterations → .superdesign/design_iterations
- 现象：生成的 HTML 落在项目根目录 `design_iterations/`，而非期望的 `.superdesign/design_iterations/`。
- 修复策略：在工具层对路径做规范化映射，不改动业务调用与提示词。
- 改动：
  - `src/tools/tool-utils.ts` 新增 `normalizeDesignIterationsPath()`，将相对路径 `design_iterations/*` 自动重写为 `.superdesign/design_iterations/*`；
  - 在 `validateWorkspacePath()` 与 `resolveWorkspacePath()` 中应用该映射；
  - 新增单测 `src/test/tool-path-mapping.test.ts` 验证映射与校验通过。
- 兼容性：
  - 已经传入 `.superdesign/design_iterations/*` 的路径不受影响；
  - 其它目录写入不受影响。

### 消息净化修复：避免“messages: text content blocks must be non-empty”
- 现象：重试/继续时偶发 Anthropic 报错，提示文本块不能为空。
- 根因：历史对话中存在仅包含 tool-call 的 assistant 消息，或 text 片段为空，违反 Anthropic 对消息结构的要求。
- 修复：
  - `src/services/chatMessageService.ts` 新增 `sanitizeChatHistory()`，在向模型发送前统一净化历史：
    - 为 assistant 消息：
      - 过滤空字符串 text 片段；
      - 若数组首个不是非空 text，则将首个非空 text 提前；若不存在则在最前插入最小占位 `.`；
      - 字符串 content 为空时改为 `.`；
    - 为 user 消息：丢弃空字符串文本；数组文本片段过滤空 text；
  - 在 `handleChatMessage()` 中使用净化后的 `sanitizedHistory` 调用模型。
- 验证：构建与 Lint 通过；实际使用中不应再出现该报错。

### Canvas 刷新按钮行为修复
- 现象：看板上的“刷新”图标点击后无反应，需要关闭重开才能看到新文件。
- 根因：该按钮原绑定为“重置帧位置”，并未触发文件重新扫描；用户期望是“重新加载设计文件”。
- 修复：
  - `src/webview/components/CanvasView.tsx`
    - 新增 `handleReloadDesignFiles()`，向扩展发送 `{command:'loadDesignFiles'}` 并置 `isLoading=true`；
    - 将现有刷新图标绑定到重新加载；
    - 新增一个“重置帧位置”按钮（使用 SettingsIcon），保留原功能；
  - 扩展侧已有 `loadDesignFiles` 处理与文件系统 watcher，无需改动。
- 结果：点击刷新可立刻重新加载 `.superdesign/design_iterations` 下的 HTML/SVG/CSS。

### 风险与回退
- 本次更改不改变未配置自定义端点时的默认行为；
- 若遇到兼容问题，可将 `aiModelProvider` 临时切换为 `anthropic` 或 `openrouter` 进行对比验证；
- 如需禁用统一解析，可临时在代码中回退到旧逻辑（不建议）。

## 2025-09-29
- 修复：LLM 工具写入路径与用户预期不一致，导致“看起来没写入文件”。
- 变更点：将自定义智能体工具的`workingDirectory`从`.superdesign`改为“工作区根目录”，仍保留`.superdesign`用于缓存与日志；因此诸如 `design_iterations/theme_*.css` 会直接写入项目根目录。
- 涉及文件：`src/services/customAgentService.ts`（仅调整工作目录选择与日志）。
- 风险与兼容性：
  - 工具写入边界从`.superdesign`扩大到工作区根目录，但仍严格限制在当前工作区内（见`tool-utils.ts`安全校验），不影响安全边界；
  - 旧对话中承诺写入`.superdesign/design_iterations/...`的路径，现将落在根目录`design_iterations/...`，更符合产品文案与用户心智。
- 验证：本地`npm run compile`通过；手动检查`.superdesign`与`design_iterations`目录结构无冲突。

## 2025-09-28
- 更新 README：新增 OpenAI 兼容配置说明，仅包含三个字段：`superdesign.openaiCompatibleBaseUrl`、`superdesign.openaiCompatibleApiKey`、`superdesign.openaiCompatibleModel`。
- 本次为文档更新，功能此前已实现并通过测试，无需改动代码。
- 将按流程提交并推送到 GitHub，并调用 Notion 任务流记录提交。

## 2025-02-15
- 新增`AGENTS.md`贡献者指南，定义项目结构、脚本命令、测试与提交规范。
- 暂未进行代码改动或测试执行，仅更新文档以指导后续协作。
- 更新`AGENTS.md`记录自定义OpenAI兼容配置优化方案，准备后续实施计划。
- 完成自定义OpenAI兼容能力：新增配置解析测试、服务层接入、前端模型选择与命令入口。
- 更新`package.json`注册`openaiCompatible*`配置项与命令，`AGENTS.md`同步使用说明。
- 调整`ModelSelector`组件传入`vscode`实例，修复打包时报`Cannot find name 'vscode'`的编译错误。
- 第一步落地（统一方案-基础版）：
  - 新增 `src/services/messageSanitizer.ts` 作为统一入口净化工具，确保 assistant 首块为非空 text、过滤空文本分片、丢弃空的 user 文本；
  - `ChatMessageService` 与 `CustomAgentService` 均改为调用该函数，移除各自的重复实现；
  - 在系统提示中加入“调用工具前/继续生成前先输出非空文本”的规则，直接约束模型输出结构。
  - 单测：`src/test/message-sanitizer.test.ts` 覆盖 4 个场景，已通过。
