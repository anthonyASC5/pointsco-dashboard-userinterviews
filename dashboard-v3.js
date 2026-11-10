'use strict';

// Existing concept data, shared by the overview and points-management charts.
const RewardsAnalytics = (() => {
  const history = Object.freeze([
    {month:'May', balance:19500, hotels:2800}, {month:'Jun', balance:21800, hotels:3100},
    {month:'Jul', balance:20900, hotels:2900}, {month:'Aug', balance:24700, hotels:3600},
    {month:'Sep', balance:26000, hotels:4000}, {month:'Oct', balance:28400, hotels:4400}
  ].map(Object.freeze));
  function series(range) {
    const count = {1:2, 3:3, 6:6}[range];
    return history.slice(-(count || 6));
  }
  function change(range) {
    const values = series(range);
    return (values.at(-1).balance - values[0].balance) / values[0].balance * 100;
  }
  function health(accounts, alerts) {
    if (!Number.isInteger(accounts) || !Number.isInteger(alerts) || accounts <= 0 || alerts < 0 || alerts > accounts) return null;
    return Math.round((accounts - alerts) / accounts * 100);
  }
  function fit(width, height) {
    // Pixel dimensions keep the rendered board inside its frame at every desktop size.
    const scale = Math.min(1, width / 1320, height / 760);
    return {scale, width:width / scale, height:height / scale};
  }
  return {history, series, change, health, fit};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = RewardsAnalytics;

if (typeof document !== 'undefined') (() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const format = value => value.toLocaleString('en-US');
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const board = $('.dashboard-board');
  const frame = $('.board-frame');
  if (board && frame) {
    const fitBoard = () => {
      if (!matchMedia('(min-width:901px)').matches) {
        ['--board-scale','--board-width','--board-height'].forEach(name => board.style.removeProperty(name));
        return;
      }
      if (frame.clientWidth <= 0 || frame.clientHeight <= 0) return;
      const size = RewardsAnalytics.fit(frame.clientWidth, frame.clientHeight);
      board.style.setProperty('--board-scale', size.scale);
      board.style.setProperty('--board-width', `${size.width}px`);
      board.style.setProperty('--board-height', `${size.height}px`);
    };
    const observer = new ResizeObserver(fitBoard);
    observer.observe(frame);
    window.addEventListener('resize', fitBoard);
    fitBoard();
  }

  function renderChart(chart, range) {
    const values = RewardsAnalytics.series(range);
    const low = Math.floor(Math.min(...values.map(item => item.balance)) * .94 / 1000) * 1000;
    const high = Math.ceil(Math.max(...values.map(item => item.balance)) * 1.03 / 1000) * 1000;
    const x = index => 16 + index / (values.length - 1) * 544;
    const y = value => 140 - (value - low) / (high - low) * 114;
    const points = values.map((item,index) => `${x(index)},${y(item.balance)}`).join(' ');
    const ticks = [low, (low + high) / 2, high];
    const historyLabel = values.map(item => `${item.month}: ${format(item.balance)} miles`).join('; ');
    chart.innerHTML = `<svg class="stock-chart" viewBox="0 0 640 180" preserveAspectRatio="none" role="img" tabindex="0" aria-label="Sample rewards balance, 2026. ${historyLabel}. Use left and right arrows to inspect monthly values.">
      ${ticks.map(tick => `<path class="stock-grid" d="M16 ${y(tick)}H560"/><text class="stock-axis" x="635" y="${y(tick)+4}" text-anchor="end">${(tick/1000).toFixed(1)}k</text>`).join('')}
      <polygon class="stock-area" points="16,140 ${points} 560,140"/>
      <polyline class="stock-line" points="${points}" vector-effect="non-scaling-stroke"/>
      ${values.map((item,index) => `<text class="stock-axis" x="${x(index)}" y="170" text-anchor="${index === 0 ? 'start' : 'middle'}">${item.month}</text>`).join('')}
      <line class="stock-crosshair" x1="560" x2="560" y1="20" y2="143" visibility="hidden"/>
      <circle class="stock-dot" cx="560" cy="${y(values.at(-1).balance)}" r="4"/>
    </svg><span class="chart-readout">Oct 2026 · ${format(values.at(-1).balance)} miles</span>`;
    chart.dataset.range = range;
    const svg = chart.querySelector('svg');
    const crosshair = chart.querySelector('.stock-crosshair');
    const dot = chart.querySelector('.stock-dot');
    const readout = chart.querySelector('.chart-readout');
    let selected = values.length - 1;
    function inspect(index, announce = false) {
      selected = Math.max(0, Math.min(values.length - 1, index));
      const item = values[selected];
      crosshair.setAttribute('visibility','visible');
      crosshair.setAttribute('x1',x(selected));
      crosshair.setAttribute('x2',x(selected));
      dot.setAttribute('cx',x(selected));
      dot.setAttribute('cy',y(item.balance));
      readout.textContent = `${item.month} 2026 · ${format(item.balance)} miles`;
      if (announce) $('#status').textContent = readout.textContent;
    }
    svg.addEventListener('pointermove', event => {
      const bounds = svg.getBoundingClientRect();
      const position = (event.clientX - bounds.left) / bounds.width * 640;
      inspect(Math.round((position - 16) / 544 * (values.length - 1)));
    });
    svg.addEventListener('pointerleave', () => { inspect(values.length - 1); crosshair.setAttribute('visibility','hidden'); });
    svg.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        inspect(selected + (event.key === 'ArrowLeft' ? -1 : 1), true);
      }
    });
    const panel = chart.closest('.rewards-panel, .portfolio-panel');
    panel.querySelectorAll('.range-controls button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.range === String(range))));
    const returnValue = panel.querySelector('[data-chart-return]');
    const percent = RewardsAnalytics.change(range).toFixed(1).replace(/\.0$/, '');
    returnValue.replaceChildren();
    returnValue.append(`+${percent}% `);
    const period = document.createElement('span');
    period.textContent = Number(range) === 1 ? 'since September' : `over ${range} months`;
    returnValue.append(period);
  }
  $$('[data-chart]').forEach(chart => renderChart(chart, chart.dataset.range || '6'));
  $$('.range-controls button[data-range]').forEach(button => button.addEventListener('click', () => {
    const panel = button.closest('.rewards-panel, .portfolio-panel');
    renderChart(panel.querySelector('[data-chart]'), button.dataset.range);
    $('#status').textContent = `Rewards chart showing ${button.dataset.range} month${button.dataset.range === '1' ? '' : 's'} of sample history.`;
  }));

  function startChat(prompt) {
    try { sessionStorage.setItem('optivoy-dashboard-prompt', prompt); } catch { /* Chat also works without browser storage. */ }
    location.href = 'optivoy-chat.html';
  }
  const trips = $('.trips-panel');
  if (trips) {
    const destinations = ['Mount Fuji, Japan', 'Italy', 'California'];
    const photos = [...trips.querySelectorAll('[data-destination-photo]')];
    const controls = [...trips.querySelectorAll('[data-destination]')];
    const link = trips.querySelector('.destination-link');
    const toggle = trips.querySelector('[data-slideshow-toggle]');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let paused = reducedMotion.matches;
    let timer;
    let hovering = false;
    const showDestination = index => {
      current = index;
      photos.forEach((photo, i) => photo.classList.toggle('is-active', i === index));
      controls.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      trips.querySelector('[data-destination-name]').textContent = destinations[index];
      link.dataset.prompt = `Help me plan a trip to ${destinations[index]}.`;
    };
    const schedule = () => {
      clearInterval(timer);
      if (!paused && !hovering && !document.hidden && !trips.contains(document.activeElement)) {
        timer = setInterval(() => showDestination((current + 1) % destinations.length), 6000);
      }
    };
    const updateToggle = () => {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} destination slideshow`);
      toggle.querySelector('span').textContent = paused ? 'play_arrow' : 'pause';
      schedule();
    };
    controls.forEach((button, index) => button.addEventListener('click', () => {
      showDestination(index);
      schedule();
    }));
    toggle.addEventListener('click', () => { paused = !paused; updateToggle(); });
    trips.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovering = true;
      schedule();
    });
    trips.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    trips.addEventListener('focusin', schedule);
    trips.addEventListener('focusout', () => queueMicrotask(schedule));
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateToggle(); });
    updateToggle();
  }
  $('#assistant-form')?.addEventListener('submit', event => {
    event.preventDefault();
    startChat($('#travel-prompt').value.trim() || 'Help me plan my next trip using my points.');
  });
  $$('[data-prompt]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startChat(link.dataset.prompt);
  }));

  const panels = {
    health: {title:'Your loyalty health score', rows:[
      ['75 / 100 · Expiry health', '6 of 8 sample loyalty accounts have no expiry alert. The score is (accounts without an expiry alert ÷ total accounts) × 100.'],
      ['2 accounts need attention', 'The existing sample account summary contains two expiry alerts. Individual program names and expiration dates are not connected.'],
      ['What this score measures', 'This prototype measures expiry status only. Redemption value, account sync freshness, and elite status are not included.']
    ]},
    alerts: {title:'Accounts that need attention', rows:[['2 sample expiry alerts','Two of eight sample loyalty accounts have an upcoming expiry alert. Connect real account data to see the programs, balances at risk, and dates.']]},
    bookings: {title:'Your bookings', rows:[['4 trips booked in October','One more than September. The existing sample total includes confirmed flight and hotel bookings.'],['Upcoming reservations','Live destinations, travel dates, and confirmation numbers are not connected. Use the travel assistant to plan your next trip.']]},
    expenses: {title:'Travel expenses', rows:[['$1,240 submitted in October','Down $310, or 20%, from September. Lower accommodation costs drove the decrease.'],['Six-month history','May $1,980 · June $1,820 · July $2,050 · August $1,690 · September $1,550 · October $1,240.']]},
    benefits: {title:'Benefits & perks', rows:[['Explore your card benefits','Lounge access, member rates, and travel coverage depend on your actual cards and loyalty programs.'],['Check eligibility','The cards shown in this prototype are samples. No benefit eligibility has been verified.']]},
    lounge: {title:'Lounge access', rows:[['Check your eligible cards','Access depends on your card, membership, airport, and itinerary. Actual memberships and lounge access are not connected.']]},
    rates: {title:'Member rates', rows:[['Find your member benefits','Eligible loyalty programs may offer member rates. Connect your account to check actual eligibility and availability.']]},
    coverage: {title:'Travel coverage', rows:[['Review your card’s coverage','Coverage varies by card and booking conditions. No coverage has been confirmed for the sample cards shown here.']]},
    profile: {title:'Anthony’s workspace', rows:[['points co · Version 3','Your rewards, travel planning, and loyalty health in one workspace.'],['Sample experience','Live accounts, reservations, card benefits, and AI services are not connected.']]}
  };
  const dialog = $('#details-dialog');
  let dialogTrigger;
  function openPanel(name, trigger) {
    dialogTrigger = trigger;
    const content = $('#dialog-content');
    content.replaceChildren();
    if (name === 'cards') {
      $('#dialog-title').textContent = 'Your cards';
      const stack = document.createElement('div');
      stack.className = 'card-stack';
      stack.innerHTML = `<div class="payment-card silver"><strong>points co rewards</strong>${icon('credit_card')}<span>•••• 2048</span></div><div class="payment-card navy"><strong>points co platinum</strong>${icon('credit_card')}<span>•••• 4821</span></div>`;
      content.append(stack);
      const note = document.createElement('p'); note.className = 'detail-note';
      note.textContent = 'Illustrative cards from the existing dashboard. No payment account or live card data is connected.';
      content.append(note);
    } else {
      const panel = panels[name];
      if (!panel) return;
      $('#dialog-title').textContent = panel.title;
      panel.rows.forEach(([title, text]) => {
        const row = document.createElement('section'); row.className = 'detail-row';
        const heading = document.createElement('h3'); heading.textContent = title;
        const copy = document.createElement('p'); copy.textContent = text;
        row.append(heading,copy); content.append(row);
      });
      const note = document.createElement('p'); note.className = 'detail-note';
      note.textContent = 'Sample data · October 2026.'; content.append(note);
    }
    dialog.showModal();
  }
  $$('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel, button)));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialogTrigger?.focus({preventScroll:true}));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  $$('.holdings-filter button').forEach(button => button.addEventListener('click', () => {
    const attentionOnly = button.dataset.filter === 'attention';
    $$('.holdings-filter button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $$('.holdings-table tbody tr').forEach(row => { row.hidden = attentionOnly && row.dataset.attention !== 'true'; });
    $('#status').textContent = attentionOnly ? 'Showing the rewards wallet with two sample expiry alerts.' : 'Showing all rewards activity.';
  }));
})();
