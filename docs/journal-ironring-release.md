# 铁环镇的血与金 · 日记续篇

2026-10-10，按用户团录追加第 6—10 章，甘道夫第一人称、自嘲吐槽口吻；伤亡段落克制处理。正文、原始团录与编辑说明见 `data/journal/ironring-blood-gold.json`。

- 接续日期暂定 Day 4—6：前篇结束 Day 3，筹备间隔未注明；按一天路程及矿洞过夜推进。实际间隔确认后可统一平移。
- 保留既有五章、地图绑定与全部其他存档。复用矿业小镇（铁环镇）与废堡（凡息之堡）的绑定；金矿洞、帕祖遇劫处新建为待定位地点。
- 五张插画由内置 image_gen 生成，1536×1024，灰金色厚涂写实；在线 WebP 共约 1.50 MB，单张约 186—415 KB，沿用现有相邻章节预加载。
- 提示词见 `docs/journal-ironring-image-prompts.json`；原始 PNG 保留于本机 Codex generated_images，发布素材位于 `assets/images/journal/06-*.webp` 至 `10-*.webp`。
- 先发布图片，再通过现有 save_journal 的乐观锁追加云端日记，最后触发现有 Adventure save 工作流回传完整 Git 存档。初始 seed 仍是创作起始模板，最新公开存档由 data/save/latest.json 与云端提供。

验证：内容结构、旧章与绑定保留检查；现有 journal/archive-ui 回归；发布后回读云端、Git 与浏览器章节插画。
