# 心灵搁浅 · 第 11—15 章

2026-10-10，按用户本轮团录续写。用户明确甘道夫没有参加本轮跑图，因此以留守者听同伴复述的方式记录，保持既有第一人称、自嘲口吻；洞穴、救援和渡鸦镇场景均不写成亲历。

## 日期与事实边界

- 用户书面确认：谷地历1388年风暴之月第一旬三日 = Day 7；五日返堡 = Day 9，六日出发 = Day 10，八日午夜抵镇 = Day 12，九日调查 = Day 13。
- 洞穴战斗与救援没有各自确切日期，以 Day 7—9 章节区间呈现，不虚构分日。
- 200 金币为小队已领赏金；3000 金币是返还次元袋后才可得的购物额度；海德少爷赠金无具体数量。仅记录故事，不改角色金币与装备。
- 保留完整原始团录；其中传送术环阶原写法只在 source 保留，正文不据口述核定法术环阶，不变更规则解释。
- 蓝袍男子身份未知，墓园幕后人也未知；保留牧师的推测口径，不替用户选择下一条路线。

## 素材与关联

正文与团录：`data/journal/mind-adrift.json`。提示词：`docs/journal-mind-adrift-image-prompts.json`。

配图由内置 image_gen 生成，1536×1024，原始 PNG 留在本机 Codex generated_images；发布 WebP 共约 1.48 MB，沿用当前章节与邻页加载机制。

- `assets/images/journal/11-south-ravine.webp`
- `assets/images/journal/12-blue-apparition.webp`
- `assets/images/journal/13-raven-arrival.webp`
- `assets/images/journal/14-mayor-two-troubles.webp`
- `assets/images/journal/15-heir-gift.webp`

五幅示意采用同一五人外出队伍；第二幅另有艾德诺根加入救援，无甘道夫或赛伦。渡鸦镇、墓园关联现有棋子；南涧洞穴与镇东哨所保留待定位。墓园、哨所在本篇只是情报与委托地点，不表示已访问。

通过现有 save_journal 的 revision + 快照哈希守卫追加，保留旧十章、旧地点与非日记存档；先发布图片，再追加云端，最后触发 Git 完整档案回传。
