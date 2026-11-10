'use strict';

// Keep original tile nodes intact so links, insight controls, and slideshows survive edits.
(() => {
  const dashboard = document.querySelector('.dashboard');
  if (!dashboard) return;
  const tiles = new Map();
  const storageKey = 'points-co-tile-order';
  const removedKey = 'points-co-removed-tiles';
  let editing = false;
  let selectedId;
  let removed = new Set();

  const customize = document.createElement('button');
  customize.type = 'button';
  customize.className = 'tile tile-customize';
  customize.setAttribute('aria-label', 'Customize tiles');
  customize.setAttribute('aria-pressed', 'false');
  customize.innerHTML = '<span class="customize-symbol" aria-hidden="true">+</span><span><span class="tile-name">Customize tiles</span><span class="tile-sub">Swap or remove tiles</span></span>';

  const editor = document.createElement('section');
  editor.className = 'tile-editor';
  editor.hidden = true;
  editor.setAttribute('aria-label', 'Customize dashboard');
  editor.innerHTML = '<div><strong>Edit your tiles</strong><p class="tile-edit-hint" id="tile-edit-hint"></p></div><div class="tile-editor-actions"><button class="tile-reset" type="button">Restore layout</button><button class="tile-edit-done" type="button">Done</button></div>';
  dashboard.before(editor);
  const hint = editor.querySelector('.tile-edit-hint');
  const announcement = document.createElement('p');
  announcement.className = 'tile-announcement';
  announcement.setAttribute('role', 'status');
  document.body.append(announcement);

  [...dashboard.children].forEach((tile, index) => {
    if (!tile.classList.contains('tile')) return;
    const id = [...tile.classList].find(name => name.startsWith('tile-'));
    const label = tile.querySelector('.tile-name')?.innerText.replace(/\s+/g, ' ').trim()
      || (index === 0 ? 'Welcome' : 'New chat');
    // Sibling controls avoid nesting buttons inside linked tiles.
    const slot = document.createElement('div');
    slot.className = 'tile-slot';
    slot.dataset.tileId = id;
    tile.before(slot);
    slot.append(tile);
    const controls = document.createElement('div');
    controls.className = 'tile-edit-controls';
    controls.hidden = true;
    const swap = document.createElement('button');
    swap.type = 'button';
    swap.className = 'tile-swap';
    swap.setAttribute('aria-describedby', 'tile-edit-hint');
    swap.innerHTML = '<span class="tile-swap-label"></span>';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'tile-delete';
    remove.setAttribute('aria-label', `Delete ${label} tile`);
    remove.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg><span>Delete</span>';
    controls.append(swap, remove);
    slot.append(controls);
    tiles.set(id, {tile, slot, label, controls, swap});
    swap.addEventListener('click', () => {
      if (!selectedId || selectedId === id) {
        selectedId = selectedId === id ? undefined : id;
        updateEditor();
        announcement.textContent = hint.textContent;
        return;
      }
      const first = selectedId;
      const order = currentOrder();
      const from = order.indexOf(first), to = order.indexOf(id);
      [order[from], order[to]] = [order[to], order[from]];
      applyOrder(order);
      selectedId = undefined;
      persist();
      updateEditor();
      swap.focus({preventScroll: true});
      announcement.textContent = `${tiles.get(first).label} and ${label} swapped.`;
    });
    remove.addEventListener('click', () => {
      const order = currentOrder();
      const nextId = order[order.indexOf(id) + 1] || order[order.indexOf(id) - 1];
      removed.add(id);
      slot.remove();
      if (selectedId === id) selectedId = undefined;
      persist();
      updateEditor();
      (tiles.get(nextId)?.swap || editor.querySelector('.tile-edit-done')).focus({preventScroll: true});
      announcement.textContent = `${label} removed. Use Restore layout to bring back removed tiles.`;
    });
  });
  dashboard.append(customize);

  function currentOrder() {
    return [...dashboard.children].flatMap(node => tiles.has(node.dataset.tileId) ? [node.dataset.tileId] : []);
  }
  function applyOrder(order) {
    // Include new tiles, but keep deleted tiles out and customization last.
    const ids = [...new Set([...order, ...tiles.keys()])];
    ids.forEach(id => {
      if (tiles.has(id) && !removed.has(id)) dashboard.insertBefore(tiles.get(id).slot, customize);
    });
  }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentOrder()));
      localStorage.setItem(removedKey, JSON.stringify([...removed]));
    } catch {}
  }
  function updateEditor() {
    hint.textContent = selectedId
      ? `Choose another tile to swap with ${tiles.get(selectedId).label}. Select it again to cancel.`
      : 'Hover over a tile to swap or delete it. Changes save automatically.';
    dashboard.classList.toggle('is-editing', editing);
    dashboard.classList.toggle('is-swapping', !!selectedId);
    editor.hidden = !editing;
    customize.setAttribute('aria-pressed', String(editing));
    customize.querySelector('.customize-symbol').textContent = editing ? '✓' : '+';
    customize.querySelector('.tile-name').textContent = editing ? 'Done editing' : 'Customize tiles';
    customize.querySelector('.tile-sub').textContent = editing ? 'Your layout is saved' : 'Swap or remove tiles';
    for (const [id, {tile, slot, controls, swap, label}] of tiles) {
      tile.inert = editing;
      controls.hidden = !editing;
      slot.classList.toggle('is-selected', selectedId === id);
      swap.setAttribute('aria-pressed', String(selectedId === id));
      swap.setAttribute('aria-label', selectedId === id ? `Cancel swapping ${label}` : selectedId ? `Swap ${tiles.get(selectedId).label} with ${label}` : `Swap ${label} tile`);
      swap.querySelector('span').textContent = selectedId === id ? 'Cancel swap' : selectedId ? 'Swap here' : '↔ Swap';
    }
  }
  function setEditing(active) {
    editing = active;
    selectedId = undefined;
    updateEditor();
    announcement.textContent = editing ? 'Editing tiles. Choose a tile to swap or delete.' : 'Tile layout saved.';
    if (editing) editor.querySelector('.tile-edit-done').focus({preventScroll: true});
    else customize.focus({preventScroll: true});
  }
  try {
    const saved = JSON.parse(localStorage.getItem(removedKey));
    if (Array.isArray(saved)) removed = new Set(saved.filter(id => tiles.has(id)));
    removed.forEach(id => tiles.get(id).slot.remove());
    const order = JSON.parse(localStorage.getItem(storageKey));
    applyOrder(Array.isArray(order) ? order : []);
  } catch {}
  customize.addEventListener('click', () => setEditing(!editing));
  editor.querySelector('.tile-edit-done').addEventListener('click', () => setEditing(false));
  editor.querySelector('.tile-reset').addEventListener('click', () => {
    removed.clear();
    selectedId = undefined;
    applyOrder([...tiles.keys()]);
    persist();
    updateEditor();
    announcement.textContent = 'Original layout restored, including removed tiles.';
  });
  document.addEventListener('keydown', event => {
    if (!editing || event.key !== 'Escape') return;
    event.preventDefault();
    if (selectedId) {
      selectedId = undefined;
      updateEditor();
      announcement.textContent = 'Swap canceled.';
    } else setEditing(false);
  });
  updateEditor();
})();
