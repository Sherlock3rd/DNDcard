# DNDcard 项目总控会话

## 项目概览

- 项目名称：DNDcard
- 项目目标：提供基于 D&D 5e 的角色创建、保存、读取与当前状态查看能力。
- 当前阶段：基础规则框架与代码仓库初始化。
- 源仓库：`https://github.com/Sherlock3rd/DNDcard`

## 当前全局状态

- 规则状态：已从 Workbencch 的 Rules Bootstrap Spec 初始化。
- 会话状态：已建立项目级总控会话。
- 错题体系：已建立说明、模板和首条平台路由复盘。
- 术语体系：已初始化项目术语表。
- 应用状态：待创建角色卡前端、登录和持久化数据层。
- 部署状态：GitHub Pages 尚未配置。

## 目录总账

- `rules/`：项目规则与执行原则。
- `session/`：项目级及需求级状态跟踪。
- `mistakes/`：错误复盘和防呆检查。
- `spec/`：基础规范及后续功能规格。
- `docs/`：术语表和补充说明。

## 变更记录

| 日期 | 事项 | 影响范围 | 备注 |
| --- | --- | --- | --- |
| 2026-07-29 | 初始化规则体系 | 全项目 | 来源为 Workbencch `rules-bootstrap-spec.md` |
| 2026-07-29 | 建立全局 Codex 规则入口 | `C:\Users\liuweichen\.codex\AGENTS.md` | 今后新项目自动加载基础规则源 |
| 2026-07-29 | 启用 Codex 本地记忆 | `C:\Users\liuweichen\.codex\config.toml` | 作为偏好与近期上下文的辅助层 |

## 下一步

1. 明确 D&D 5e 规则资料范围与角色卡字段契约。
2. 创建网页应用、登录和持久化存储。
3. 配置 GitHub Pages 构建发布。
4. 完成登录、保存、读卡和状态更新的端到端验证。
