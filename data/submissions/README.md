# 历史人工回填材料

2026-09-15 起，正式页面改用统一冒险档案和自动 Git 回传。最新完整档案见 [../save/latest.json](../save/latest.json)，此目录保留旧版手动上传记录，不参与默认读取。下文为旧功能说明。

# 浏览器存档回填材料

角色卡「同步回填到 Git」会下载 JSON，再打开此目录的 GitHub 上传页。
登录有权限的账号后，选择该 JSON，确认内容，再提交；仅打开上传页不代表上传成功。

- `items`：自定义物品、资料覆盖、背包（含图片选择、说明、数量、备注、装备状态）。
- `full`：完整 manager 和战斗状态副本，包括等级、专长、法术等。
- 此仓库公开，提交前检查隐私。网页不采集或保存 GitHub token。
- 快照仅用于备份和后续人工回填，不自动合并目录，不自动覆盖任一浏览器的存档。
- 原有 localStorage key 和 profileVersion 不变，打开窗口、下载或发起上传均不写本地存档。

上传流程：[GitHub 官方说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。
