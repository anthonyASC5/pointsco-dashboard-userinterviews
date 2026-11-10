'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const status = $('#status');
  // Scale the complete two-row layout, including charts and controls, to the available space.
  const dashboard = $('.dashboard');
  const main = $('#main');
  const editor = $('.tile-editor');
  function fitDashboard() {
    if (!matchMedia('(min-width: 901px)').matches) {
      dashboard.style.removeProperty('--dashboard-scale');
      dashboard.style.removeProperty('--dashboard-width');
      dashboard.style.removeProperty('--dashboard-height');
      return;
    }
    const style = getComputedStyle(main);
    const availableWidth = main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const editorHeight = editor.hidden ? 0 : editor.offsetHeight + parseFloat(getComputedStyle(editor).marginBottom);
    const availableHeight = Math.max(1, main.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - editorHeight);
    const scale = Math.min(1, availableWidth / 1200, availableHeight / 848) * 0.9;
    // Explicit pixel dimensions avoid percentage widths being resolved twice under CSS zoom.
    dashboard.style.setProperty('--dashboard-scale', String(scale));
    dashboard.style.setProperty('--dashboard-width', `${availableWidth / scale}px`);
    dashboard.style.setProperty('--dashboard-height', `${availableHeight / scale}px`);
  }
  const layoutObserver = new ResizeObserver(fitDashboard);
  layoutObserver.observe(main);
  layoutObserver.observe(editor);
  window.addEventListener('resize', fitDashboard);
  fitDashboard();

  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  // Concept data only; replace these series with account data when integrated.
  const insights = {
    'tile-hotels':{title:'Hotel rewards',value:'4,400',unit:'miles earned this month',values:[2800,3100,2900,3600,4000,4400],explanation:'Hotel rewards increased by 400 miles from last month. One additional qualifying stay contributed to the increase.'},
    'tile-mytrips':{title:'Your bookings',value:'4',unit:'trips booked this month',values:[1,2,2,3,3,4],explanation:'You booked 1 more trip than last month. This total includes confirmed flight and hotel bookings.'},
    'tile-benefits':{title:'My miles & rewards',value:'28,400',unit:'miles available',values:[19500,21800,20900,24700,26000,28400],explanation:'Your available rewards grew by 2,400 miles from last month. Miles earned exceeded miles redeemed during this period.'},
    'tile-expenses':{title:'Travel expenses',value:'$1,240',unit:'submitted this month',values:[1980,1820,2050,1690,1550,1240],explanation:'Submitted travel expenses decreased by $310 from last month. Lower accommodation costs drove the reduction.'}
  };
  const trendIcon = up => icon(up ? 'trending_up' : 'trending_down');
  const summaries = {'tile-hotels':'One additional qualifying stay lifted hotel earnings.', 'tile-mytrips':'One more confirmed trip than last month.', 'tile-benefits':'Miles earned exceeded miles redeemed this month.', 'tile-expenses':'Lower accommodation costs reduced submitted expenses.'};
  const detailPanels = {'tile-hotels':'hotels', 'tile-mytrips':'bookings', 'tile-benefits':'wallet', 'tile-expenses':'expenses'};
  document.querySelectorAll('.dashboard .tile').forEach(tile => {
    const key = [...tile.classList].find(name => insights[name]);
    const data = insights[key];
    if (!data) return;
    const previous = data.values.at(-2), current = data.values.at(-1);
    const up = current >= previous;
    const change = Math.abs((current - previous) / previous * 100).toFixed(1).replace(/\.0$/, '');
    const low = Math.min(...data.values), high = Math.max(...data.values);
    const points = data.values.map((value, i) => `${i * 60},${56 - (value - low) / (high - low || 1) * 48}`).join(' ');
    tile.classList.add('analytics-tile');
    tile.setAttribute('aria-label', data.title);
    tile.innerHTML = `<div class="analytics-heading"><h2 class="tile-name">${data.title}</h2>${icon(key === 'tile-expenses' ? 'receipt_long' : key === 'tile-mytrips' ? 'luggage' : key === 'tile-hotels' ? 'hotel' : 'account_balance_wallet')}</div>
      <div class="analytics-metric"><strong>${data.value}</strong><span>${data.unit}</span></div>
      <p class="analytics-change">${trendIcon(up)}<strong>${up ? '+' : '−'}${change}%</strong><span>vs. September</span></p>
      <figure class="analytics-history"><svg viewBox="0 0 300 64" preserveAspectRatio="none" role="img" aria-label="${data.title}, May through October: ${data.values.join(', ')}"><path class="chart-baseline" d="M0 63H300"/><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${data.values.map((value,i) => `<circle cx="${i*60}" cy="${56-(value-low)/(high-low || 1)*48}" r="3" fill="currentColor"><title>${['May','Jun','Jul','Aug','Sep','Oct'][i]}: ${value.toLocaleString('en-US')}</title></circle>`).join('')}</svg><figcaption><span>May</span><span>6-month trend</span><span>Oct</span></figcaption></figure>
      <p class="analytics-explanation">${summaries[key]}</p>
      <button class="tile-inline-link" data-details="${detailPanels[key]}">View details ${icon('arrow_forward')}</button>`;
  });

  $('#customize-button').addEventListener('click', () => {
    const button = $('.tile-customize');
    if (button.getAttribute('aria-pressed') !== 'true') button.click();
    else $('.tile-edit-done').focus();
  });
  const customize = $('.tile-customize');
  // Retain the original swap/remove editor and its localStorage keys.
  function labelCustomize() {
    const editing = customize.getAttribute('aria-pressed') === 'true';
    customize.querySelector('.customize-symbol').classList.add('material-symbols-outlined');
    customize.querySelector('.customize-symbol').textContent = editing ? 'check' : 'add';
    customize.querySelector('.tile-name').textContent = editing ? 'Done editing' : 'Add widget';
    customize.querySelector('.tile-sub').textContent = editing ? 'Your layout is saved' : 'Add, swap or restore tiles';
    customize.setAttribute('aria-label', editing ? 'Finish customizing dashboard' : 'Add or customize widgets');
  }
  new MutationObserver(labelCustomize).observe(customize, {attributes:true, attributeFilter:['aria-pressed']});
  labelCustomize();
  function startChat(prompt) {
    try { sessionStorage.setItem('optivoy-dashboard-prompt', prompt); } catch {}
    location.href = '../optivoy-chat.html';
  }
  document.querySelectorAll('[data-chat-prompt]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startChat(link.dataset.chatPrompt);
  }));
  const panels = {
    wallet: {title:'Rewards wallet', rows:[['28,400 miles available','Your available rewards grew by 2,400 miles from last month. Miles earned exceeded miles redeemed.'],['8 sample accounts · $9,319 in rewards','Individual loyalty balances and expiration dates will be available when your accounts are connected.'],['Six-month history','May 19,500 · June 21,800 · July 20,900 · August 24,700 · September 26,000 · October 28,400.']]},
    bookings: {title:'My trips', rows:[['4 trips booked this month','One more than last month. This sample total includes confirmed flight and hotel bookings.'],['No live bookings connected','Upcoming destinations, reservation dates, and status will appear once a booking source is connected.']]},
    expenses: {title:'Travel expenses', rows:[['$1,240 submitted this month','Submitted travel expenses decreased by $310 from last month. Lower accommodation costs drove the reduction.'],['Six-month history','May $1,980 · June $1,820 · July $2,050 · August $1,690 · September $1,550 · October $1,240.']]},
    hotels: {title:'Hotel rewards', rows:[['4,400 miles earned this month','Up 400 miles from last month. One additional qualifying stay contributed to the increase.'],['Six-month history','May 2,800 · June 3,100 · July 2,900 · August 3,600 · September 4,000 · October 4,400.']]},
    notifications: {title:'Your notifications', rows:[['2 accounts expiring soon','Review your loyalty programs for upcoming points expiration dates. This is a sample briefing; live account deadlines are not connected.']]},
    profile: {title:'Your profile', rows:[['Anthony','Your points co travel workspace.'],['Sample experience','Live loyalty accounts, booking sources, and AI services are not connected.']]}
  };
  const dialog = $('#details-dialog');
  function openPanel(name) {
    const panel = panels[name];
    if (!panel) return;
    $('#dialog-title').textContent = panel.title;
    const content = $('#dialog-content');
    content.replaceChildren();
    panel.rows.forEach(([title, text]) => {
      const row = document.createElement('div'); row.className = 'detail-row';
      const heading = document.createElement('strong'); heading.textContent = title;
      const copy = document.createElement('p'); copy.textContent = text;
      row.append(heading, copy); content.append(row);
    });
    if (['wallet','bookings','expenses','hotels','notifications'].includes(name)) {
      const note = document.createElement('p'); note.className = 'detail-note';
      note.textContent = 'Sample data · October 2026. Live accounts and bookings are not connected.';
      content.append(note);
    }
    dialog.showModal();
  }
  document.querySelectorAll('[data-details]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.details)));
  $('#notification-button').addEventListener('click', () => openPanel('notifications'));
  $('#profile-button').addEventListener('click', () => openPanel('profile'));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  const destinations = [
    {title:'Mount Fuji, Japan', src:'japan.jpg', alt:'Chureito Pagoda overlooking Mount Fuji in Japan'},
    {title:'Positano, Italy', src:'italy.jpg', alt:'Cliffside buildings and boats off Positano, Italy'},
    {title:'Big Sur, California', src:'california.jpg', alt:'Pacific waves along the cliffs of Big Sur, California'}
  ];
  let destinationIndex = 0, playing = false, timer;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function destination(direction) {
    destinationIndex = (destinationIndex + direction + destinations.length) % destinations.length;
    const data = destinations[destinationIndex];
    $('#destination-image').src = 'assets/destinations/' + data.src;
    $('#destination-image').alt = data.alt;
    $('#destination-title').textContent = data.title;
  }
  function playback() {
    clearInterval(timer);
    $('#destination-pause').innerHTML = icon(playing ? 'pause' : 'play_arrow');
    $('#destination-pause').setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} destination slideshow`);
    if (playing && !document.hidden) timer = setInterval(() => destination(1), 5500);
  }
  $('#destination-prev').addEventListener('click', () => { destination(-1); playback(); });
  $('#destination-next').addEventListener('click', () => { destination(1); playback(); });
  $('#destination-pause').addEventListener('click', () => { playing = !playing; playback(); });
  motion.addEventListener('change', event => { if (event.matches) { playing = false; playback(); } });
  document.addEventListener('visibilitychange', playback);
  // Same destination rotation as v1, paused by default for a quieter workspace.
  function focusSearch() {
    $('#search-form').classList.add('search-open');
    $('#dashboard-search').focus();
  }
  $('#mobile-search-button').addEventListener('click', focusSearch);
  $('#dashboard-search').addEventListener('blur', () => $('#search-form').classList.remove('search-open'));
  $('#search-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = $('#dashboard-search').value.trim().toLowerCase();
    if (!query) return;
    const match = [
      [/wallet|miles|rewards|points|loyalty/, 'wallet'], [/trip|booking/, 'bookings'],
      [/hotel|stay/, 'hotels'],
      [/expense|receipt/, 'expenses']
    ].find(([pattern]) => pattern.test(query));
    if (match) openPanel(match[1]);
    else if (/explore|activit|destination/.test(query)) location.href = '../points-co-explore.html';
    else if (/chat|assistant/.test(query)) location.href = '../optivoy-chat.html';
    else { status.textContent = `No results for “${$('#dashboard-search').value.trim()}”. Try wallet, trips, hotels, expenses, or explore.`; openSearchResult(status.textContent); }
  });
  function openSearchResult(text) {
    $('#dialog-title').textContent = 'Search points co';
    $('#dialog-content').textContent = text;
    dialog.showModal();
  }
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !dialog.open && !event.target.closest('input, textarea, [contenteditable="true"]')) {
      event.preventDefault(); focusSearch();
    }
  });
})();
