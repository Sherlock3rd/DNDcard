function renderRoomScene(level) {
  return `<header class="room-heading"><a class="room-wordmark" href="#portal" aria-label="书房主页"><span class="room-seal" aria-hidden="true">B</span><span><h1>The Black Tower</h1><small>PRIVATE ADVENTURE ARCHIVE</small></span></a><span class="room-edition">黑塔 · 私人书房<span>归来，落座，再启程</span></span></header>
    <section class="room-viewport" aria-label="可左右探索的书房" tabindex="0"><div class="room-stage">
      <img class="room-art" src="./assets/images/room/background.png" alt="月光与烛火照亮黑塔的石砌书房" width="1672" height="941" fetchpriority="high" />
      <button class="room-object room-board" id="openRelationshipButton" type="button" aria-haspopup="dialog" aria-controls="relationshipDialog"><img class="room-sprite" src="./assets/images/room/relationship-board.png" alt="" draggable="false" /><span class="room-object-label"><i aria-hidden="true"></i><strong>案板墙</strong><small>人物关系网</small></span></button>
      <button class="room-object room-map" id="roomMap" type="button" data-room-placeholder="map" aria-haspopup="dialog"><img class="room-sprite" src="./assets/images/room/map-table.png" alt="" draggable="false" /><span class="room-object-label"><i aria-hidden="true"></i><strong>地图桌</strong><small>地图资料 · 待绘制</small></span></button>
      <button class="room-object room-shelf" id="roomBookshelf" type="button" data-open-bookshelf aria-haspopup="dialog" aria-controls="settingsDialog" aria-expanded="false"><img class="room-sprite" src="./assets/images/room/bookshelf.png" alt="" draggable="false" /><span class="room-object-label"><i aria-hidden="true"></i><strong>书架</strong><small>规则、资料与设置</small></span></button>
      <button class="room-object room-character" id="roomCharacter" type="button" data-portal-route="character"><img class="room-sprite" src="./assets/images/room/wizard.png" alt="" draggable="false" /><span class="room-object-label"><i aria-hidden="true"></i><strong>甘阿·道夫</strong><small>法师 ${level} 级 · 进入角色卡</small></span></button>
      <button class="room-object room-journal" id="roomJournal" type="button" data-room-placeholder="journal" aria-haspopup="dialog"><img class="room-sprite" src="./assets/images/room/journal.png" alt="" draggable="false" /><span class="room-object-label"><i aria-hidden="true"></i><strong>冒险日记</strong><small>跑团记录 · 待开启</small></span></button>
    </div></section>
    <footer class="room-footer"><p><span class="room-spark" aria-hidden="true"></span>点击房间内的物品，翻开你的冒险档案。<small>左右滑动探索房间，也可使用下方导览。</small></p><nav class="room-guide" aria-label="房间位置导览"><button type="button" data-room-focus="openRelationshipButton">案板墙</button><button type="button" data-room-focus="roomMap">地图桌</button><button type="button" data-room-focus="roomBookshelf">书架</button><button type="button" data-room-focus="roomCharacter">甘阿·道夫</button><button type="button" data-room-focus="roomJournal">日记本</button></nav><span class="room-occupant">一间书房<span>SRD 5.1 · CC BY 4.0</span></span></footer>`;
}

let roomScrollPosition = null;
function initializeRoomScene(root) {
  const viewport = root.querySelector(".room-viewport");
  requestAnimationFrame(() => {
    if (!viewport.isConnected) return;
    viewport.scrollLeft = roomScrollPosition ?? Math.max(0, (viewport.scrollWidth - viewport.clientWidth) * 0.52);
  });
  viewport.addEventListener("scroll", () => { roomScrollPosition = viewport.scrollLeft; }, { passive: true });
  root.querySelectorAll("[data-room-focus]").forEach((button) => button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.roomFocus);
    viewport.scrollTo({ left: target.offsetLeft + target.offsetWidth / 2 - viewport.clientWidth / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
