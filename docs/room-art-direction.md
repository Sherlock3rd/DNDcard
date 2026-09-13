# The Black Tower 房间素材与图层

采用内置 imagegen 工具生成。背景只含建筑与照明；五件物品各自使用保留 RGBA alpha 的独立 PNG，名称由 HTML 输出。原完整场景图不参与最终页面。

素材目录：`assets/images/room/`。`room.js` 负责按钮与标签，`room.css` 负责位置、遮挡、悬停反馈及手机横向探索。

| 文件 | 用途 |
| --- | --- |
| background.png | 建筑背景 |
| relationship-board.png | 人物关系网 |
| map-table.png | 地图占位入口 |
| bookshelf.png | 书架入口 |
| wizard.png | 甘阿·道夫角色入口 |
| journal.png | 跑团日记占位入口 |

## 最终生成提示词

### background

Edit the supplied fantasy study image into a CLEAN EMPTY ENVIRONMENT BACKGROUND for a layered point-and-click game. Preserve exactly the landscape 16:9 camera perspective, stone Gothic architecture, central blue moonlit arched window, warm amber candle lighting, dark detailed painterly realism, stone floor and atmosphere. REMOVE the full investigation board on the left wall, the whole bookshelf on the right, ALL foreground tables and all items on them, the wizard and his chair, and the diary. Reconstruct clean bare stone wall behind left board, bare stone wall behind the right bookshelf and the full empty floor behind furniture and wizard. Keep subtle architectural candle sconces and window. No foreground furniture, no books, no people, no loose objects, no texts, no UI. This is one empty room background, objects will be added as separate transparent layers. Output landscape 16:9.

### board

Extract/recreate ONLY the left investigation corkboard from the reference as an independent game prop on a genuinely TRANSPARENT BACKGROUND with alpha. Keep the reference's realistic fantasy painted aesthetic and warm amber side-light, aged carved dark wood frame, cream parchment notes, small character portrait sketches and red threads. Include board frame and its pinned materials ONLY, not wall, candles, desk or surrounding objects. Maintain slight room perspective with the right edge mildly receding as in reference. One whole rectangular board, straight coherent geometry, tightly framed with a small transparent margin, no cropped edges. No readable text, no captions, no logos, no checkerboard baked into the image. A high quality isolated transparent PNG game sprite, roughly 4:3.

### shelf

A single isolated fantasy game sprite. An antique dark walnut bookcase filled with old blue, burgundy and brown leather books and a few brass astronomy instruments. Full standing bookcase with feet. Front three quarter view. Painterly realistic illustrated game art. Transparent background. PNG with alpha transparency, no backdrop, no floor, no checkerboard pattern. Landscape image.

### table

Create ONLY the foreground wooden MAP TABLE from the supplied reference as a standalone, fully isolated game prop with actual transparent alpha channel, RGBA PNG, background alpha zero. Preserve realistic detailed fantasy illustration, amber candlelight and cool blue rim light. A broad heavy antique rectangular oak table, view from slightly above the near corner, its top visible with an open parchment map, brass compass, rolled scrolls and one small candle. Include the FULL table and all legs down to their feet, no edges cropped, small transparent margin. No wizard or chair, no journal or quill, no bookshelf or wall or floor. Keep right half of tabletop relatively clear for a separately composited journal. No text or floating labels. No checkerboard pattern baked into pixels. Wide horizontal sprite, roughly 3:2.

### wizard

A single isolated fantasy game sprite. An elderly white bearded wizard wearing dark embroidered robes and a wide pointed hat, seated in a carved wooden chair, full body and chair and feet. Warm candlelight from the left, cool blue rim light from the right. Painterly realistic illustrated game art. Transparent background. PNG with alpha transparency, no backdrop, no floor, no checkerboard pattern. Landscape image.

### journal

Create ONLY a closed antique leather adventure journal and white quill as one tightly framed isolated game prop, actual transparent alpha RGBA PNG. Match the supplied reference's lower table journal: dark burgundy leather cover, worn golden metal corners, ornate gold circular arcane embossing without letters, thick parchment pages, three-quarter view from slightly above as if lying flat on the tabletop; a white feather quill rests diagonally beside it. Warm amber highlights, realistic detailed painterly fantasy style. The book and quill only. No table, floor, map, hands, shadow plane or room. Fully transparent background alpha zero, no checkerboard baked in, no white or black background. No readable text. Wide sprite roughly 4:3.
