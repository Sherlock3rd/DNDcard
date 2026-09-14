const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
test('room routes, independent transparent objects and bookshelf preserve saves', async () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  try {
    w.structuredClone = structuredClone;
    w.scrollTo = () => {};
    w.IntersectionObserver = class { observe() {} disconnect() {} };
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
    const errors = [];
    w.addEventListener('error', e => errors.push(e.error));
    for (const [, file] of html.matchAll(/<script src="\.\/([^"?]+)[^"]*"/g)) {
      if (!file.startsWith('cloud-') && !file.startsWith('assets/vendor/')) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), dom.getInternalVMContext(), { filename: file });
    }
    const q = s => w.document.querySelector(s);
    const all = s => [...w.document.querySelectorAll(s)];
    const saved = () => JSON.stringify(Object.entries(w.localStorage));
    const before = saved();
    const route = async (selector) => { q(selector).click(); await new Promise(r => w.setTimeout(r, 15)); };
    assert.equal(w.document.title, 'The Black Tower');
    assert.deepEqual(JSON.parse(JSON.stringify(w.ROOM_LAYER_SPEC)), JSON.parse(fs.readFileSync(path.join(root, 'assets/images/room/layers.json'), 'utf8')), 'runtime hit paths and anchors match the extraction manifest');
    assert.equal(q('#portalApp').hidden, false);
    assert.equal(all('.room-layer[data-room-layer]:not([data-room-layer="background"])').length, 5);
    assert.equal(new Set(all('.room-layer[data-room-layer]:not([data-room-layer="background"])').map(i => i.src)).size, 5);
    for (const img of all('.room-layer[data-room-layer]:not([data-room-layer="background"])')) {
      const png = fs.readFileSync(path.join(root, img.getAttribute('src').split('?')[0]));
      assert.equal(png[25], 6, `${img.src} must retain RGBA alpha`);
    }
    q('#openRelationshipButton').click();
    assert.equal(q('#relationshipDialog').open, true);
    assert.ok(q('#relationshipDialog').textContent.includes('甘阿·道夫'));
    q('#relationshipDialog').close();
    assert.ok(q('#roomMap').hasAttribute('data-open-map-table'));
    assert.equal(q('#roomMap').hasAttribute('data-room-placeholder'), false);
    assert.ok(q('#roomJournal').hasAttribute('data-open-journal'));
    assert.equal(q('#roomJournal').hasAttribute('data-room-placeholder'), false);
    assert.equal(all('.shelf-book').length, 7);
    for (const name of ['classes', 'spell-library', 'item-library', 'rules']) {
      q('[data-open-bookshelf]').click();
      assert.equal(q('#settingsDialog').open, true);
      await route(`.shelf-book[data-portal-route="${name}"]`);
      assert.equal(q('#settingsDialog').open, false);
      assert.equal(w.document.body.dataset.route, name);
      assert.ok(w.document.title.includes('The Black Tower'));
      await route('#archiveApp [data-portal-route="portal"]');
    }
    await route('#roomCharacter');
    assert.equal(q('#characterApp').hidden, false);
    assert.equal(q('#settingsButton'), null);
    await route('#characterApp [data-portal-route="portal"]');
    assert.equal(q('#portalApp').hidden, false);
    assert.equal(saved(), before, 'navigation does not write player data');
    assert.deepEqual(errors, []);
  } finally { w.close(); }
});
