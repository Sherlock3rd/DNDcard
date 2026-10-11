# 麻烦不断 · 第 16—21 章

2026-10-11，按用户本轮完整团录续写。甘阿·道夫与赛伦已赶到渡鸦镇，因此第 16 章起恢复甘阿·道夫第一人称亲历口吻；费伊独自经历的骨猫传谕按她后续转述记录。

## 日期与事实边界

- 接续 Day 13（谷地历 1388 年风暴之月第一旬九日）：墓园行动发生在上午，下午一时返回镇公所；子夜后的传谕记为 Day 14 凌晨，不补更精确时刻。
- 克里夫对波特镇长、海德家族与亚赞的关系提出指控，但小队仍需搜集实质罪证；正文不把怀疑提前写成已定罪事实。
- 莱特找回次元袋后的 3000 金币免单购物额度，与克里夫事成后承诺的 3000 金币起义酬金是两笔条件奖励，均未到手。已领取的是波特镇长支付的 100 金币阶段赏金；本次不修改角色金币或装备。
- 耶各遗物、神力压制、亡灵灵智与不朽者宗主的命令按团录记录，不扩写神器数值、规则解释或宗主身份。
- 复用渡鸦镇与墓园既有地图绑定；不猜地下主墓、镇公所、海德宅邸与守夜人酒馆的独立坐标，不自动修改案件板关系。

## 素材

正文与完整原始团录：`data/journal/trouble-never-ends.json`。提示词：`docs/journal-trouble-never-ends-image-prompts.json`。

六张 1536×1024 插画由内置 image_gen 生成，以第 15 章图片作风格参考，发布为 WebP：

- `assets/images/journal/16-cemetery-whispers.webp`
- `assets/images/journal/17-oathbreaker-tomb.webp`
- `assets/images/journal/18-rebel-vault.webp`
- `assets/images/journal/19-jergal-relic.webp`
- `assets/images/journal/20-crescent-signal.webp`
- `assets/images/journal/21-bone-cat.webp`

先发布文本与素材，再以日记 revision 乐观锁追加云端，最后触发现有 Adventure save 工作流回传完整 Git 档案。写入前后逐字段核对旧 15 章、地点绑定及 character/map/board，禁止用本地 v42 覆盖实时云端 v43。
