# 平台路由与基础规则源误判

## 基本信息

- 日期：2026-07-29
- 分类：rules / environment
- 任务：DNDcard 环境部署

## 问题现象

- 将用户所说的“page 功能”误判为飞书应用托管，并发起了不需要的飞书授权。
- 未先定位 Workbencch 项目中的 `rules-bootstrap-spec.md`。

## 原因分析

- 没有先检索用户既有项目与通用规则源。
- 将模糊的平台词直接映射到当前可用技能，缺少仓库与历史项目核对。
- Workbencch 目录名实际多一个 `c`，按正常拼写搜索未命中后没有立即检查 Codex 项目列表。

## 修复动作

- 终止飞书授权流程。
- 从 Codex 项目列表定位 `D:\charlie\Workbencch`。
- 将 Rules Bootstrap Spec 部署到当前仓库。
- 建立全局 `AGENTS.md`，固定通用规则源与首次任务检查流程。

## 预防办法

- 遇到“按 rule/spec/基础文件部署”时，先检查当前仓库、已登记项目和全局指引。
- 提到 Pages 且提供 GitHub 仓库时，优先确认 GitHub Pages / Sites 路径，不映射到飞书。
- 路径搜索未命中时，检查 Codex 的项目与任务列表，不根据拼写猜测不存在。

## 执行前检查项

- [ ] 已读取全局与项目级 `AGENTS.md`。
- [ ] 已读取项目 `rules/` 与相关 `spec/`。
- [ ] 已检索 `mistakes/`。
- [ ] 已确认部署平台与仓库来源。
