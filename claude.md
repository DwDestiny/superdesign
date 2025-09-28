# 项目进展记录

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
