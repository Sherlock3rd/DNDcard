# Supabase 云端存档部署

网站：https://sherlock3rd.github.io/DNDcard/

前端继续由 GitHub Pages 从 `main` 根目录发布；Supabase 提供邮箱密码认证、私有存档、历史版本及乐观并发控制。项目 ID：`yvqpqnoqvckivouzylqk`，区域 `ap-south-1`。

## 使用

1. 主页点击“账号与云端存档”，或在角色页进入“设置 → 账号与云端存档”。
2. 注册邮箱和密码，点击邮箱中的确认链接后登录。
3. 首次账号无存档时，选择当前本机存档、此前 Git 备份，或完整 JSON 文件；核对预览后确认导入。Git 备份为仓库中 2026-09-13 09:24 UTC 的四级角色存档。
4. 之后角色修改会在约 1.2 秒后上传；打开页面、回到页面、网络恢复时同步，前台页面另每 15 秒核对一次。
5. 其他设备登录相同账号后读取云端版本。若两台设备都修改了旧版本，会暂停自动合并，保留两份副本，待选择本机或云端版本。

未登录的本机角色独立保存。退出账号后恢复该设备登录前的角色；账号待上传内容仍保留在该账号缓存中，再次登录后重试。不要在保留待上传内容时清空浏览器站点数据。支持 Web Locks 的浏览器同一站点只允许一个编辑标签页。

## 配置与可重现构建

`cloud-config.js` 只包含项目地址、公开 publishable key、角色 ID 及已确认的网站回跳地址。前端不得放入 secret/service_role key。

使用 Node.js 22 或更高版本：

```sh
npm ci
npm run build:vendor
npm test
npm run preview
```

浏览器客户端从固定版本 `@supabase/supabase-js@2.116.0` 打包到 `assets/vendor/supabase.js`，直接随 Pages 发布。锁文件与许可证一并提交，不依赖页面加载时访问第三方 CDN。

`supabase/migrations/` 导出的是已部署的两条原始迁移，版本号和内容与数据库历史一致。当前项目无需重跑；新环境恢复时按版本顺序应用，并更新前端项目配置。云端保存通过 `save_character` RPC 执行，携带读取时的 `revision`；禁止改用无版本检查的 upsert。

## 认证配置

Supabase Auth 中邮箱注册已开启，匿名登录关闭，注册需确认邮件。用户在此前任务中已设置 Site URL 和 Redirect URLs 为上述 Pages 地址。此次核查了公开 Auth 设置，未改动登录方式、回跳地址或邮件服务。

真实收信及用户账号登录需由用户完成。若注册邮件投递受限，检查 Supabase Auth 的邮件发送配置；默认邮件服务面向测试，向普通玩家开放前配置自己的 SMTP。参考：[Supabase SMTP 文档](https://supabase.com/docs/guides/auth/auth-smtp)。

## 验证与恢复

- `npm test` 覆盖现有角色功能及同步的导入确认、双设备、断网恢复、冲突、账号切换、请求进行中继续编辑、存储配额与不完整快照拒绝。
- `scripts/verify-supabase.sql` 在事务中创建随机测试身份，验证 RPC、版本递增、历史记录、冲突检测、RLS 和匿名拒绝，最后回滚。不得移除事务及回滚语句。测试不发送邮件，也不使用玩家存档。
- 旧的 `gandalf-5e-state`、`gandalf-5e-manager` 键及存档格式版本保持原样；云端缓存使用独立 `dndcard-cloud-v1:` 前缀。下载当前存档仍输出原完整快照格式。
- 覆盖与冲突前保留本机副本，可通过“下载保留的副本”导出；每条记录中的 `snapshot` 可另存为 JSON 后导入。云端每次更新前的版本保存在 `character_save_history`，按本人身份限制读取。
- 回滚前端时回退本次功能提交并重新发布 Pages；保留数据库及本机备份，不执行 drop/truncate 或清空 localStorage。

数据库安全检查当前无告警。未配置 Edge Functions：当前认证和存档流程使用 Supabase Auth、Data API 与现有数据库 RPC 即可。
