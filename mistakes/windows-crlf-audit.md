# Windows 检查脚本换行兼容

- 日期：2026-09-13
- 现象：新克隆项目运行 `audit-modifier-sync.js` 时无法提取 `featEffectDefinitions`。
- 原因：Windows Git 自动签出 CRLF，而测试使用包含 LF 的源码分隔标记。
- 修复：只在测试读取的源码字符串中将 CRLF 规范化为 LF，不修改产品公式或角色数据。
- 预防：跨平台源码解析检查须规范化换行；迁移机器后先执行已有审计，不把文本解析失败误判为产品逻辑故障。
