# Repository Guidelines

## 项目结构与模块组织
- 代码主入口位于`src/extension.ts`，负责注册Superdesign命令与激活流程。
- `src/providers/`包含Webview和侧边栏提供者，`src/services/`存放日志、代理与工具逻辑。
- UI资源与模板分别放在`src/webview/`与`src/templates/`；静态资产集中于`src/assets/`。
- 建议在`src/test/`下按功能子目录组织测试，并使用`dist-test/`作为编译输出目录。

## 构建、测试与开发命令
- 初次克隆后运行`npm install`或`pnpm install`以安装依赖。
- `npm run compile`会顺序执行类型检查、Lint与`esbuild`打包，适合CI。
- 本地联调可使用`npm run watch`并结合VS Code调试扩展。
- 静态检查使用`npm run lint`，完整扩展测试通过`npm run test`触发`@vscode/test-electron`。
- 细分测试命令：`npm run test:core`验证核心组件，`npm run test:tools`聚焦工具链。

## 代码风格与命名规范
- 项目采用TypeScript与React，默认使用制表符缩进，保留分号并统一使用单引号。
- 遵循`eslint.config.mjs`规则：导入使用`camelCase`或`PascalCase`，禁用松散等号并必须使用花括号。
- React组件、Provider类使用`PascalCase`命名，工具函数与实例使用`camelCase`，常量使用全大写加下划线。

## 测试指南
- 单元测试与集成测试应位于`src/test/**/*`，编译目标目录是`dist-test/`，不要将输出纳入版本控制。
- 在编写功能代码前先补充或更新测试用例，运行`npm run pretest`验证编译链路。
- 尽量覆盖主要命令路径与服务失败分支，新增测试文件建议命名为`*.test.ts`或`*.spec.ts`。
- 复杂依赖可通过VS Code测试夹具或模拟API密钥配置来隔离。

## 提交与合并请求规范
- 参考历史提交，优先使用英文祈使句，如`Add`, `Fix`, `Update`开头，必要时附带作用域。
- 单一提交聚焦一个功能或修复，描述中说明受影响模块与验证方式。
- 发起Pull Request时附上问题链接、测试输出摘要与关键截图，确保审核者可复现。
- 所有提交前运行`npm run compile`与相关测试，避免CI失败。

## 安全与配置提示
- API密钥通过命令面板(`Superdesign: Configure ...`)写入VS Code设置，严禁提交到仓库。
- `.superdesign/`生成的用户数据仅用于本地调试，提交前请清理或加入`.gitignore`。
- 如需新增配置项，请同步更新文档与默认值，并说明备份或降级策略。
- 新增的OpenAI兼容设置项包括`superdesign.openaiCompatibleApiKey`/`BaseUrl`/`Model`，对应命令位于`Superdesign: Configure Custom OpenAI-Compatible ...`系列。

## 待实施优化方案：自定义OpenAI兼容配置
- **目标**：允许用户为OpenAI兼容接口自定义Base URL、API Key与模型标识，覆盖私有部署与第三方网关场景。
- **阶段拆分**：
  1. **配置扩展**：在`package.json`中新增`superdesign.openaiCompatible*`设置项，并提供命令面板配置入口。
  2. **服务调整**：更新`CustomAgentService`以读取新配置，构造自定义`createOpenAI`客户端，保留旧配置兼容。
  3. **前端交互**：为`ModelSelector`添加“自定义模型”入口，支持手动输入/编辑模型ID并回写到`superdesign.aiModel`。
  4. **测试保障**：编写服务层单元测试覆盖配置优先级、异常提示与回退逻辑，同时补充Webview交互测试桩。
- **风险与对策**：
  - 需确保默认行为不变，避免老用户配置失效，计划通过特性检测回退到现有`openai`逻辑。
  - 用户输入URL/模型需做基础校验并记录至日志，防止格式错误导致崩溃。
