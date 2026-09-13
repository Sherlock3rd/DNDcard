# The Black Tower 原图拆层

当前唯一画面来源为用户确认并重新提供的原图，保存在 assets/images/room/source.png。此前分别生成的家具和人物已被替换。本次按用户要求直接提取原像素，不调用图像生成工具。

## 素材与坐标

- assets/images/room/layers.json：物件轮廓、图层归属顺序、文字锚点。
- assets/images/room/background.png：原图剩余环境像素，物件区域透明。
- relationship-board.png、bookshelf.png、map-table.png、wizard.png、journal.png：各物件在原图中可见的像素，均位于 assets/images/room/。
- 六张图都保留 1672×941 画布，用相同原点与缩放倍率叠放；不是重新摆放的独立家具。
- 阴影、光源、桌边遮挡、手部和日记接触关系均沿用原画像素。被其他物品遮挡的部分没有补画，因此这套图层适合固定场景交互，不应直接拿去拖动家具。

## 页面合成

room.css 保持画布宽高比。超宽屏居中留边，手机竖屏横向探索。所有图层在同一个隔离容器中使用 plus-lighter 合成，使透明边缘缩放时的覆盖量相加，避免普通 alpha 叠加产生黑缝。

独立 SVG 多边形提供物件点击范围；独立 HTML 标签提供名称、说明与键盘焦点反馈。取消素材上的额外投影、亮度改变和悬停位移，避免破坏原图的光影关系。

## 可复现检验

- Python（Pillow、numpy）：python scripts/extract-room-layers.py；加 --check 只检查现有输出。
- npm test：独立 Node PNG 解码测试核对用户原图 SHA-256、每个像素恰好归属一个图层及完整 RGB 重构。
- 启动 npm run preview 后访问 /scripts/room-visual-check.html，在原图、拆分图层和实际 CSS 差异图之间切换，并查看浏览器缩放比较。
- 数值结果：assets/images/room/verification.json。

2026-09-14 验收：1,573,352 个原图像素，重构差异 0。浏览器 1672×941 原尺寸差异 0；1279×720、693×390、1500×844 缩放的最大通道差为 1/255，平均通道差小于 0.001/255。CSS 差异图检查无可见物件轮廓与接缝。桌面、390×844 竖屏和844×390 横屏逐项检查五件物品、文字标签、导览及关闭返回。
