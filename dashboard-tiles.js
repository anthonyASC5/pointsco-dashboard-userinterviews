'use strict';

// Move existing nodes so links, insight controls, and slideshow stay intact.
(() => {
  const dashboard = document.querySelector('.dashboard');
  const tiles = new Map();
  const labels = new Map();
  const storageKey = 'points-co-tile-order';
  [...dashboard.children].forEach((tile, index) => {
    if (!tile.classList.contains('tile')) return;
    const id = [...tile.classList].find(name => name.startsWith('tile-'));
    tiles.set(id, tile);
    labels.set(id, tile.querySelector('.tile-name')?.innerText.replace(/\s+/g, ' ').trim()
      || (index === 0 ? 'Welcome' : 'New chat'));
  });

  const customize = document.createElement('button');
  customize.type = 'button';
  customize.className = 'tile tile-customize';
  customize.setAttribute('aria-haspopup', 'dialog');
  customize.setAttribute('aria-label', 'Customize tiles');
  customize.innerHTML = '<span class="customize-symbol" aria-hidden="true">+</span><span><span class="tile-name">Customize tiles</span><span class="tile-sub">Swap tiles to make this space yours</span></span>';
  dashboard.append(customize);

  const picker = document.createElement('dialog');
  picker.className = 'tile-picker';
  picker.setAttribute('aria-labelledby', 'tile-picker-title');
  picker.innerHTML = '<div class="tile-picker-heading"><h2 id="tile-picker-title">Swap tiles</h2><button class="tile-picker-close" type="button" aria-label="Close tile picker">×</button></div><p id="tile-picker-description"></p><div class="tile-options"></div><button class="tile-back-choice" type="button" hidden>← Choose a different tile</button><button class="tile-reset" type="button">Restore original layout</button>';
  const announcement = document.createElement('p');
  announcement.className = 'tile-announcement';
  announcement.setAttribute('role', 'status');
  document.body.append(picker, announcement);
  let selectedId;
  const options = picker.querySelector('.tile-options');
  const back = picker.querySelector('.tile-back-choice');

  function renderOptions() {
    picker.querySelector('#tile-picker-description').textContent = selectedId
      ? `Choose a tile to swap positions with ${labels.get(selectedId)}.`
      : 'Choose the first tile you want to move.';
    back.hidden = !selectedId;
    options.replaceChildren();
    [...dashboard.children].forEach(tile => {
      const id = [...tiles].find(([, node]) => node === tile)?.[0];
      if (!id || id === selectedId) return;
      const option = document.createElement('button');
      option.type = 'button';
      option.textContent = labels.get(id);
      option.addEventListener('click', () => {
        if (!selectedId) {
          selectedId = id;
          renderOptions();
          options.querySelector('button')?.focus();
          return;
        }
        const order = currentOrder();
        const from = order.indexOf(selectedId), to = order.indexOf(id);
        [order[from], order[to]] = [order[to], order[from]];
        applyOrder(order);
        persistOrder();
        picker.close();
        announcement.textContent = `${labels.get(selectedId)} and ${labels.get(id)} swapped.`;
      });
      options.append(option);
    });
  }
  function currentOrder() {
    return [...dashboard.children].flatMap(tile => {
      const id = [...tiles].find(([, node]) => node === tile)?.[0];
      return id ? [id] : [];
    });
  }
  function applyOrder(order) {
    // Keep the customization tile last; ignore unknown or obsolete saved IDs.
    const ids = [...new Set([...order, ...tiles.keys()])].filter(id => tiles.has(id));
    ids.forEach(id => dashboard.insertBefore(tiles.get(id), customize));
  }
  function persistOrder() {
    try { localStorage.setItem(storageKey, JSON.stringify(currentOrder())); } catch {}
  }
  try {
    const order = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(order)) applyOrder(order);
  } catch {}
  customize.addEventListener('click', () => {
    selectedId = undefined;
    renderOptions();
    picker.showModal();
  });
  back.addEventListener('click', () => {
    selectedId = undefined;
    renderOptions();
    options.querySelector('button')?.focus();
  });
  picker.querySelector('.tile-picker-close').addEventListener('click', () => picker.close());
  picker.querySelector('.tile-reset').addEventListener('click', () => {
    applyOrder([...tiles.keys()]);
    persistOrder();
    picker.close();
    announcement.textContent = 'Original tile layout restored.';
  });
  picker.addEventListener('close', () => customize.focus({preventScroll:true}));
  picker.addEventListener('click', event => {
    if (event.target !== picker) return;
    const rect = picker.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) picker.close();
  });
})();
