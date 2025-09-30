# 🧠 SuperDesign — AI Design Agent for Your IDE

![SuperDesign Cover](cover.png)

### **By:** [AI Jason](https://x.com/jasonzhou1993)

SuperDesign is the first **open-source design agent** that lives right inside your IDE.  
Generate UI mockups, components, and wireframes directly from natural language prompts.  
Works seamlessly with Cursor, Windsurf, Claude Code, and plain VS Code.

> ✨ "Why design one option when you can explore ten?" — SuperDesign

[Join discord](https://discord.gg/FYr49d6cQ9)

[Upvote on Hackernews](https://news.ycombinator.com/item?id=44376003)

[Install guide](https://www.superdesign.dev/)

---

## 🎬 Demo Video (Click to play)

[![SuperDesign Demo](https://img.youtube.com/vi/INv6oZDhhUM/maxresdefault.jpg)](https://youtu.be/INv6oZDhhUM)

---

## 🚀 Features

- 🖼️ **Product Mock**: Instantly generate full UI screens from a single prompt
- 🧩 **UI Components**: Create reusable components you can drop into your code
- 📝 **Wireframes**: Explore low-fidelity layouts for fast iteration
- 🔁 **Fork & Iterate**: Duplicate and evolve designs easily
- 📥 **Prompt-to-IDE**: Copy prompts into your favorite AI IDE (Cursor, Windsurf, Claude Code)

---

## 🧠 Works Great With Cursor, Windsurf, Claude Code, VS Code

👉 [Install here](https://www.superdesign.dev/)

---

## 🛠️ Getting Started

1. **Install the Extension** from the Cursor/VS Code Marketplace
2. Open the `SuperDesign` sidebar panel
3. Type a prompt (e.g., _"Design a modern login screen"_)
4. View generated mockups, components, and wireframes
5. Fork, tweak, and paste into your project

---

## Can I use my own Claude Code or Cursor subscription?
Yes, after you initialise superdesign extension, some cursor/claude code rules will be added, so you can prompt the agent to do design and preview in superdesign canva (cmd + shift + p -> superdesign: open canva)

If using Cursor - I will highly suggest copy the prompt in 'design.mdc' and create a custom mode in cursor with that same system prompt; This should give you much better performance

Instructions here (Click to play): 
[![Instruction video](v0.0.11.png)](https://youtu.be/KChmJMCDOB0?si=pvU0kNRO4GRWjsec&t=122)

## How to run local OpenAI compatible servers?
1. Select open ai on Ai Model Provider
2. Put anything in Openai Api Key input
3. Add your OpenAi Url on the Openai Url input (example: http://127.0.0.1:1234/v1 for LM Studio)

## OpenAI 兼容接口自定义配置（推荐）

在 VS Code 设置中可配置以下 3 个字段以连接自建或第三方 OpenAI 兼容服务（仅需了解这三项）：

- `superdesign.openaiCompatibleBaseUrl`：OpenAI 兼容接口的 Base URL（如 `http://127.0.0.1:1234/v1`）。
- `superdesign.openaiCompatibleApiKey`：接口鉴权所需的 API Key（本地无鉴权可随意填）。
- `superdesign.openaiCompatibleModel`：使用的模型标识（如 `gpt-4o-mini`、`llama-3.1-8b-instruct`、`claude-3-5-sonnet-20241022` 等）。

注意：
- 当选择 Provider 为 `openai-compatible` 或任一 `openaiCompatible*` 字段已填写时，系统会优先走自定义端点，即使模型名是 `claude-*` 也不会要求配置 Anthropic Key。
- 如果模型名形如 `vendor/model`（如 `anthropic/claude-3-7-sonnet-20250219`），将自动按 OpenRouter 处理。

## 设计文件的生成路径

- 工具生成的文件统一落到 `.superdesign/design_iterations/` 目录。
- 若你在对话中让 Agent 写入 `design_iterations/xxx.html`，系统会自动映射到 `.superdesign/design_iterations/xxx.html`，无需更改你的习惯。

## 终止会话 & 刷新看板

- 终止：对话区的 Stop 按钮会中止当前流式响应并恢复输入框。
- 刷新：看板工具栏的刷新按钮会重新扫描 `.superdesign/design_iterations/` 下的 HTML/SVG/CSS 并即时更新，无需关闭重开。

## 打包安装 VSIX（本地测试）

1. 安装依赖：`npm install`
2. 运行构建：`node esbuild.js --production`
3. 打包：`npx @vscode/vsce package`
4. VS Code 中选择“从 VSIX 安装…”，或命令行 `code --install-extension ./superdesign-<version>.vsix`

## 故障排查

- 报错 `messages: text content blocks must be non-empty`
  - 我们已在发送前对历史消息做净化（删除空 text、确保 assistant 首块为非空 text）；如仍遇到，请在“输出”面板选择 Superdesign，将调试日志反馈给我们。
- 模型选择 `claude-*` 时误弹 Anthropic 配置
  - 请使用 OpenAI 兼容端点，并确保设置了 `openaiCompatibleBaseUrl`/`openaiCompatibleApiKey`；我们已修复按模型名前缀误判 Provider 的问题。

## 语言镜像原则

Superdesign 遵循“语言镜像原则”：始终使用与用户一致的语言进行沟通。

---

## 版本变更（Release Notes）

### 0.0.12（2025-09-30）
- Provider 解析优化：
  - 当 Provider 选择 `openai-compatible` 或任一 `openaiCompatible*` 字段已填写时，优先走自定义端点；即使模型名为 `claude-*` 也不会要求配置 Anthropic Key。
  - `vendor/model` 形式（如 `anthropic/claude-3-7-sonnet-20250219`）自动按 OpenRouter 处理。
- 对话停止：输入框旁的 Stop 按钮可以中止当前流式响应并恢复输入。
- 写入路径规范：将 `design_iterations/*` 自动映射到 `.superdesign/design_iterations/*`，无需更改提示词习惯。
- 消息净化：在发送到模型前过滤空文本分片，并确保 assistant 的首块为非空 text，修复 `messages: text content blocks must be non-empty` 报错。
- 看板刷新：刷新按钮改为“重新加载设计文件”，无需关闭重开即可看到更新；原“重置帧位置”单独保留为齿轮按钮。
- 画板卡在 Loading 的修复：
  - 以文件修改时间参与组件 key，强制重新挂载，避免复用旧状态导致永远 Loading；
  - iframe 改为 `loading="eager"` 并增加 3 秒兜底定时器，确保 onLoad 未触发时也能退出 Loading；
  - 刷新按钮触发扩展侧 `loadDesignFiles` 即时重扫目录。
- 全局提示词增强：加入“语言镜像原则”。
- 单元测试：新增 provider 解析、语言镜像、路径映射等测试用例。

## 📂 Where Are My Designs Stored?

Your generated designs are saved locally inside `.superdesign/`.

---

## ❓ FAQ

**Is it free and open source?**  
Yes! We are open source — fork it, extend it, remix it.

**Can I customize the design agent?**  
Yes — use your own prompt templates, modify behaviors, or add commands.

**Can SuperDesign update existing UI?**  
Absolutely — select a component, describe the change, and let the agent do the rest.

<img width="886" height="586" alt="image" src="https://github.com/user-attachments/assets/71b7cfcc-6123-40ea-aae5-05ea6cdcea96" />


**How can I contribute?**  
Pull requests are welcome. Star the repo and join us on [Discord](https://discord.gg/XYZ)!

---

## 🔗 Links

- 🌐 Website: [https://superdesign.dev](https://superdesign.dev)
- 📦 GitHub: [https://github.com/superdesigndev/superdesign](https://github.com/superdesigndev/superdesign)
- 💬 Discord: [Join the Community](https://discord.gg/XYZ)
- 🐦 Twitter / X: [@SuperDesignDev](https://x.com/SuperDesignDev)
