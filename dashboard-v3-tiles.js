'use strict';

// Move the original nodes between fixed layout slots to preserve charts and controls.
(() => {
  const board = document.querySelector('.dashboard-board');
  const customize = document.querySelector('#customize-tiles');
  if (!board || !customize) return;
  const storageKey = 'points-co-v3-tile-layout';
  const definitions = [
    ['assistant', '.assistant-panel', 'Travel assistant', 'assistant'],
    ['rewards', '.rewards-panel', 'My rewards', 'rewards'],
    ['wallet', '.wallet-tile', 'My wallet', 'wallet'],
    ['flights', '.category-flights', 'Flights', 'compact'],
    ['hotels', '.category-hotels', 'Hotels', 'compact'],
    ['shopping', '.category-shopping', 'Shopping', 'compact'],
    ['health', '.health-panel', 'Loyalty health', 'compact'],
    ['car', '.category-car', 'Car rental', 'compact'],
    ['benefits', '.benefits-panel', 'Benefits & perks', 'bottom'],
    ['activity', '.activity-panel', 'Monthly activity', 'bottom'],
    ['trips', '.trips-panel', 'Trips & inspiration', 'bottom']
  ];
  const tiles = new Map();
  const slots = [];
  let editing = false;
  let selected = null;
  let removed = new Set();
  let order = definitions.map(([id]) => id);

  const editor = document.createElement('section');
  editor.id = 'tile-editor';
  editor.className = 'tile-editor';
  editor.hidden = true;
  editor.setAttribute('aria-label', 'Customize dashboard');
  editor.innerHTML = '<div><strong>Edit your tiles</strong><p id="tile-edit-hint">Choose a tile, then choose where to swap it. Changes save automatically.</p></div><div class="tile-editor-actions"><button type="button" class="tile-reset">Restore layout</button><button type="button" class="solid-button tile-edit-done">Done</button></div>';
  document.querySelector('.board-frame').before(editor);
  const hint = editor.querySelector('#tile-edit-hint');
  const status = document.querySelector('#status');
  const announce = text => { status.textContent = text; };

  definitions.forEach(([id, selector, label, size], index) => {
    const tile = board.querySelector(selector);
    tile.dataset.tileId = id;
    tiles.set(id, {tile, label});
    const slot = document.createElement('div');
    slot.className = 'tile-slot';
    slot.dataset.size = size;
    slot.dataset.slot = index;
    tile.before(slot);
    slot.append(tile);
    const controls = document.createElement('div');
    controls.className = 'tile-edit-controls';
    controls.hidden = true;
    const swap = document.createElement('button');
    swap.type = 'button';
    swap.className = 'tile-swap';
    swap.setAttribute('aria-describedby', 'tile-edit-hint');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'tile-remove';
    remove.textContent = 'Remove';
    controls.append(swap, remove);
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'tile-add';
    add.hidden = true;
    slot.append(controls, add);
    slots.push({slot, controls, swap, remove, add});
    swap.addEventListener('click', () => {
      if (selected === null || selected === index) {
        selected = selected === index ? null : index;
        update();
        announce(hint.textContent);
        return;
      }
      const first = selected;
      const firstLabel = tiles.get(order[first]).label;
      const secondLabel = tiles.get(order[index]).label;
      [order[first], order[index]] = [order[index], order[first]];
      selected = null;
      render();
      persist();
      swap.focus({preventScroll: true});
      announce(`${firstLabel} and ${secondLabel} swapped.`);
    });
    remove.addEventListener('click', () => {
      const {label} = tiles.get(order[index]);
      removed.add(order[index]);
      if (selected === index) selected = null;
      render();
      persist();
      add.focus({preventScroll: true});
      announce(`${label} removed. Use Add ${label} to bring it back.`);
    });
    add.addEventListener('click', () => {
      removed.delete(order[index]);
      render();
      persist();
      (editing ? swap : customize).focus({preventScroll: true});
      announce(`${tiles.get(order[index]).label} restored.`);
    });
  });

  function update() {
    board.classList.toggle('is-editing', editing);
    editor.hidden = !editing;
    customize.setAttribute('aria-pressed', String(editing));
    customize.querySelector('span:last-child').textContent = editing ? 'Done editing' : 'Customize tiles';
    hint.textContent = selected === null
      ? 'Choose a tile, then choose where to swap it. Changes save automatically.'
      : `Choose another tile to swap with ${tiles.get(order[selected]).label}. Select it again to cancel.`;
    slots.forEach(({slot, controls, swap, remove, add}, index) => {
      const {tile, label} = tiles.get(order[index]);
      const hidden = removed.has(order[index]);
      tile.hidden = hidden;
      tile.inert = editing;
      controls.hidden = !editing || hidden;
      add.hidden = !hidden;
      add.textContent = `+ Add ${label}`;
      slot.classList.toggle('is-empty', hidden);
      slot.classList.toggle('is-selected', selected === index);
      swap.textContent = selected === index ? 'Cancel swap' : selected === null ? '↔ Swap' : 'Swap here';
      swap.setAttribute('aria-pressed', String(selected === index));
      swap.setAttribute('aria-label', selected === index ? `Cancel swapping ${label}` : selected === null ? `Swap ${label} tile` : `Swap ${tiles.get(order[selected]).label} with ${label}`);
      remove.setAttribute('aria-label', `Remove ${label} tile`);
    });
  }
  function render() {
    slots.forEach(({slot}, index) => slot.prepend(tiles.get(order[index]).tile));
    update();
  }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({order, removed: [...removed]}));
    } catch {
      hint.textContent = 'Layout updated for this visit. Browser storage is unavailable, so changes cannot be saved.';
      announce(hint.textContent);
    }
  }
  function setEditing(active) {
    editing = active;
    selected = null;
    update();
    if (editing) slots.find(({controls}) => !controls.hidden)?.swap.focus({preventScroll: true});
    else customize.focus({preventScroll: true});
    announce(editing ? 'Editing tiles. Select Swap on two tiles to exchange them, or remove a tile.' : 'Finished editing tiles.');
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.order) && saved.order.length === tiles.size && new Set(saved.order).size === tiles.size && saved.order.every(id => tiles.has(id))) {
      order = saved.order;
      if (Array.isArray(saved.removed)) removed = new Set(saved.removed.filter(id => tiles.has(id)));
    }
  } catch { /* An invalid saved layout falls back to the current v3 arrangement. */ }
  customize.addEventListener('click', () => setEditing(!editing));
  editor.querySelector('.tile-edit-done').addEventListener('click', () => setEditing(false));
  editor.querySelector('.tile-reset').addEventListener('click', () => {
    order = definitions.map(([id]) => id);
    removed.clear();
    selected = null;
    render();
    persist();
    announce('Default v3 layout restored, including removed tiles.');
  });
  document.addEventListener('keydown', event => {
    if (!editing || event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    event.preventDefault();
    if (selected !== null) {
      const previous = selected;
      selected = null;
      update();
      slots[previous].swap.focus({preventScroll: true});
      announce('Swap canceled.');
    } else setEditing(false);
  });
  render();
})();
