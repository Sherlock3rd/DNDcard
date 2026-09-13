function renderRoomScene(level) {
  return `<header class="room-heading"><a class="room-wordmark" href="#portal" aria-label="书房主页"><span class="room-seal" aria-hidden="true">B</span><span><h1>The Black Tower</h1><small>PRIVATE ADVENTURE ARCHIVE</small></span></a><span class="room-edition">黑塔 · 私人书房<span>归来，落座，再启程</span></span></header>
    ${renderOriginalRoomLayers(level)}
    <footer class="room-footer"><p><span class="room-spark" aria-hidden="true"></span>点击房间内的物品，翻开你的冒险档案。<small>左右滑动探索房间，也可使用下方导览。</small></p><nav class="room-guide" aria-label="房间位置导览"><button type="button" data-room-focus="openRelationshipButton">案板墙</button><button type="button" data-room-focus="roomMap">地图桌</button><button type="button" data-room-focus="roomBookshelf">书架</button><button type="button" data-room-focus="roomCharacter">甘阿·道夫</button><button type="button" data-room-focus="roomJournal">日记本</button></nav><span class="room-occupant">一间书房<span>SRD 5.1 · CC BY 4.0</span></span></footer>`;
}


// Every image uses one shared, unwarped source canvas. Hit paths do not move the art.
function renderOriginalRoomLayers(level) {
  const spec = window.ROOM_LAYER_SPEC;
  const labels = {
    board: ['openRelationshipButton', '案板墙', '人物关系网', 'aria-haspopup="dialog" aria-controls="relationshipDialog"'],
    shelf: ['roomBookshelf', '书架', '规则、资料与设置', 'data-open-bookshelf aria-haspopup="dialog" aria-controls="settingsDialog" aria-expanded="false"'],
    map: ['roomMap', '地图桌', '地图资料 · 待绘制', 'data-room-placeholder="map" aria-haspopup="dialog"'],
    character: ['roomCharacter', '甘阿·道夫', '法师 ' + level + ' 级 · 进入角色卡', 'data-portal-route="character"'],
    journal: ['roomJournal', '冒险日记', '跑团记录 · 待开启', 'data-room-placeholder="journal" aria-haspopup="dialog"']
  };
  const asset = file => './assets/images/room/' + file + '?v=20260914-original-pixels';
  const artwork = ['background.png', ...spec.layers.map(layer => layer.file)].map((file, index) =>
    '<img class="room-layer" data-room-layer="' + (index ? spec.layers[index - 1].id : 'background') + '" src="' + asset(file) + '" width="' + spec.width + '" height="' + spec.height + '" alt="" draggable="false" fetchpriority="high" />'
  ).join('');
  const objects = spec.layers.map((layer, index) => {
    const [id, title, subtitle, attrs] = labels[layer.id];
    return '<button class="room-object room-' + layer.id + '" id="' + id + '" type="button" ' + attrs + ' style="--label-x:' + (100 * layer.anchor[0] / spec.width) + '%;--label-y:' + (100 * layer.anchor[1] / spec.height) + '%;z-index:' + (index + 2) + '" data-room-anchor="' + layer.anchor[0] / spec.width + '">' +
      '<svg class="room-hit-area" viewBox="0 0 ' + spec.width + ' ' + spec.height + '" aria-hidden="true"><polygon points="' + layer.polygon.map(p => p.join(',')).join(' ') + '" /></svg>' +
      '<span class="room-object-label"><strong>' + title + '</strong><small>' + subtitle + '</small></span></button>';
  }).join('');
  return '<section class="room-viewport" aria-label="可左右探索的书房" tabindex="0"><div class="room-stage"><div class="room-artwork" role="img" aria-label="原画中的黑塔书房：案板墙在左侧，甘阿·道夫坐在地图桌后，书架在右侧，日记放在桌上。">' + artwork + '</div>' + objects + '</div></section>';
}

let roomScrollPosition = null;
function initializeRoomScene(root) {
  const viewport = root.querySelector(".room-viewport");
  requestAnimationFrame(() => {
    if (!viewport.isConnected) return;
    viewport.scrollLeft = roomScrollPosition ?? Math.max(0, (viewport.scrollWidth - viewport.clientWidth) * 0.66);
  });
  viewport.addEventListener("scroll", () => { roomScrollPosition = viewport.scrollLeft; }, { passive: true });
  root.querySelectorAll('.room-object').forEach((button) => button.addEventListener('focus', () => {
    if (!button.matches(':focus-visible')) return;
    const label = button.querySelector('.room-object-label').getBoundingClientRect();
    const visible = viewport.getBoundingClientRect();
    if (label.left < visible.left + 12 || label.right > visible.right - 12) {
      viewport.scrollTo({ left: Number(button.dataset.roomAnchor) * viewport.querySelector('.room-stage').clientWidth - viewport.clientWidth / 2, behavior: 'auto' });
    }
  }));
  root.querySelectorAll("[data-room-focus]").forEach((button) => button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.roomFocus);
    viewport.scrollTo({ left: Number(target.dataset.roomAnchor) * viewport.querySelector(".room-stage").clientWidth - viewport.clientWidth / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  }));
}

document.addEventListener("click", (event) => {
  const placeholder = event.target.closest("[data-room-placeholder]");
  if (placeholder) {
    const isMap = placeholder.dataset.roomPlaceholder === "map";
    const dialog = document.querySelector("#roomPlaceholderDialog");
    dialog.querySelector("h2").textContent = isMap ? "地图桌" : "冒险日记";
    dialog.querySelector("[data-room-empty-title]").textContent = isMap ? "下一段旅程，尚待绘制" : "新的篇章，尚待落笔";
    dialog.querySelector("[data-room-empty-description]").textContent = isMap ? "地图信息将在这里展开。本次先安放地图桌，具体地图与地点资料稍后补充。" : "这本日记将记录每一次跑团的经历。目前仅保留入口，记录与编辑功能稍后开启。";
    dialog.showModal();
  }
  if (event.target.closest("[data-close-room-placeholder]")) document.querySelector("#roomPlaceholderDialog").close();
  if (event.target.closest(".shelf-book[data-portal-route]")) document.querySelector("#settingsDialog").close();
});
