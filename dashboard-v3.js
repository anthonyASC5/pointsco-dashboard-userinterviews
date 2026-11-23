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
  if (board && frame && !board.classList.contains('is-spacious')) {
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
      <polyline class="stock-line" pathLength="1" points="${points}" vector-effect="non-scaling-stroke"/>
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

  const sample = DashboardSample;
  const alerts = sample.accounts.filter(account => account.expires);
  const panels = {
    rewards: {title:'October rewards activity', rows:[
      ['28,400 miles available', 'September closing balance: 26,000. October category earnings: 14,400. Sample redemptions: 12,000. Net change: +2,400 miles (+9.2%).'],
      ['How this scenario works', 'For this interview, category points convert 1:1 to the displayed miles. The 14,400 earned miles are already included in the closing balance. No cash value is assigned.']
    ], ledger:[['September closing balance','26,000 miles'],['Flight earnings','+8,200'],['Hotel earnings','+4,400'],['Shopping earnings','+1,800'],['Sample redemptions','−12,000'],['October closing balance','28,400 miles']], action:'Open points management', href:'points-management.html'},
    health: {title:'Your loyalty health score', rows:[
      ['75 / 100 · Expiry health', '6 of 8 sample accounts have no expiry alert. Calculation: 6 ÷ 8 × 100 = 75. This score measures expiry status only.'],
      ['3,000 miles need attention', 'Market Club: 1,800 miles expire November 30, 2026. Vista Rewards: 1,200 miles expire December 15, 2026. The alerts are part of the fixed October interview scenario.'],
      ['Suggested next step', 'Review the two programs before deciding whether to redeem or earn qualifying activity. This prototype does not extend expiry or submit a redemption.']
    ], ledger:sample.accounts.map(account => [account.name, `${format(account.balance)} miles · ${account.expires ? 'Expires '+account.expires : 'No expiry alert'}`])},
    alerts: {title:'Accounts that need attention', rows:[
      ['2 expiry alerts · 3,000 miles', 'These alerts use the same accounts and balances as your loyalty health score.'],
      ...alerts.map(account => [account.name, `${format(account.balance)} miles expire ${account.expires}. Review your redemption options in this sample scenario.`]),
      ['Before you act', 'Programs and expiry rules here are fictional. No redemption, transfer, or account change will occur.']
    ]},
    bookings: {title:'Your bookings', rows:[['4 trips booked in October', 'One more than September. These are fictional upcoming trips as of October 31, 2026. Booking dates are in October; travel dates are shown below.'], ...sample.trips.map(([city,dates,detail]) => [city+' · '+dates, detail])]},
    expenses: {title:'Travel expenses', rows:[['$1,240 submitted in October', 'Four sample expense categories total $1,240. September submissions were $1,550: a decrease of $310 (20%). These are submitted amounts, not confirmed reimbursements.'],['Six-month history', 'May $1,980 · June $1,820 · July $2,050 · August $1,690 · September $1,550 · October $1,240.']], ledger:sample.expenses.map(([date,label,amount]) => [date+' · '+label, '$'+format(amount)])},
    benefits: {title:'Benefits & perks', rows:[['Rewards · ending 2048', 'Sample earning rates: 3 points per $1 on hotel stays, 2 on shopping, and 1 on other eligible purchases. Includes sample member hotel rates.'],['Platinum · ending 4821', 'Sample earning rates: 3 points per $1 on flights, 2 on dining, and 1 on other eligible purchases. Includes two annual lounge visits, with one remaining in this scenario.'],['Using these benefits', 'These fictional card plans support interview tasks. They do not represent an offer or verify real-world eligibility.']]},
    lounge: {title:'Lounge access', rows:[['Platinum · 1 sample visit remaining', 'The fictional plan includes two lounge visits per calendar year. One visit was used on September 18, 2026.'],['Sample visit conditions', 'The primary cardholder can use the remaining visit before December 31, 2026. Guests are not included in this scenario.'],['Planning your visit', 'Bring a same-day boarding pass and review the lounge’s entry conditions. No live lounge directory or access verification is connected.']]},
    rates: {title:'Member rates', rows:[['Rewards · sample hotel benefit', 'Harbor Stays and City Stays offer a fictional member-rate option in this interview scenario.'],['Example comparison · Boston, 3 nights', 'Standard rate: $260 per night. Sample member rate: $240 per night. The difference is $60 across three nights, before taxes and fees.'],['Before booking', 'This is a rate-comparison example, not live availability or a guaranteed discount. No booking is submitted.']]},
    coverage: {title:'Travel coverage', rows:[['Platinum · sample plan', 'For this interview, eligible trips paid in full with the sample card include a fictional baggage-delay benefit.'],['Example benefit limits', 'After a delay of at least six hours, the sample plan covers eligible essentials up to $100 per day for a maximum of three days. Receipts are required in the scenario.'],['What happens next', 'Use the example to discuss how you would find conditions or start a claim. Real insurance terms, eligibility checks, and claim submission are not connected.']]},
    car: {title:'Car rental', rows:[['Compare a sample Boston rental', 'November 12–15, 2026 · Airport pickup · Compact car · 3 rental days.'],['Example cash total', '$54 per day × 3 = $162 base rental. Illustrative taxes and fees: $38. Total: $200, excluding optional extras.'],['Rewards and coverage', 'Road Club has 1,600 sample miles. Redemption pricing and rental coverage are not connected; no points price or coverage eligibility is assumed.']], action:'Explore travel', href:'points-co-explore.html?category=Travel'},
    profile: {title:'Anthony’s workspace', rows:[['Anthony Morgan · Interview persona', 'A fictional traveler based in New York, comparing rewards and planning several upcoming trips.'],['Your sample workspace', '8 loyalty accounts, 2 wallet cards, and 4 trips booked in October. The balance is 28,400 miles, with 3,000 miles under expiry alerts.'],['Scenario date', 'All data is fixed as of October 31, 2026 so interview participants see the same scenario. No live accounts or bookings are connected.']]}
  };
  Object.entries(sample.categories).forEach(([key, category]) => {
    const difference = category.total - category.previous;
    panels[key] = {title:category.title, rows:[
      [`${format(category.total)} ${category.unit} earned in October`, `${difference > 0 ? 'Up' : 'Down'} ${format(Math.abs(difference))} from ${format(category.previous)} in September (${(Math.abs(difference) / category.previous * 100).toFixed(1)}%). The entries below add up to the tile total.`],
      ['About these earnings', 'These are posting dates and fictional activity descriptions, not a record of completed travel. Earnings are already included in your rewards balance; the interview scenario converts category points to miles 1:1.']
    ], ledger:category.transactions.map(([date,label,amount]) => [date+' · '+label, '+'+format(amount)+' '+category.unit]), action:category.action, href:category.href, prompt:category.prompt};
  });
  // Normalize the SVG paths so each analytics line draws at the same pace.
  $$('.category-sparkline polyline').forEach(line => line.setAttribute('pathLength', '1'));
  $$('.dashboard-board > .panel, .category-row > .panel').forEach((panel, index) => {
    panel.style.setProperty('--entrance-delay', `${Math.min(index, 8) * 110}ms`);
  });

  const dialog = $('#details-dialog');
  const walletTrigger = $('.wallet-tile');
  let dialogTrigger;
  function openPanel(name, trigger) {
    dialogTrigger = trigger;
    const content = $('#dialog-content');
    content.replaceChildren();
    if (name === 'cards') {
      $('#dialog-title').textContent = 'Your cards';
      const cards = sample.cards;
      const carousel = document.createElement('section');
      carousel.className = 'wallet-carousel';
      carousel.setAttribute('aria-label', 'Your wallet cards');
      carousel.setAttribute('aria-roledescription', 'carousel');
      carousel.innerHTML = `<p class="wallet-scroll-hint" id="wallet-scroll-hint">Swipe or scroll to browse your cards.</p>
        <div class="wallet-card-track" tabindex="0" role="group" aria-label="Cards" aria-describedby="wallet-scroll-hint">
          ${cards.map((card, index) => `<article class="wallet-slide" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${cards.length}: points co ${card.name}">
            <div class="wallet-full-card ${card.tone}"><span class="wallet-card-brand">points co</span><h3>${card.name}</h3><span class="wallet-card-chip" aria-hidden="true"></span><span class="wallet-card-number"><span class="sr-only">Card ending in </span>•••• ${card.number}</span>${icon('contactless')}</div>
          </article>`).join('')}
        </div>
        <div class="wallet-carousel-controls"><button type="button" class="wallet-page-button" data-direction="-1" aria-label="Previous card">${icon('chevron_left')}</button><span class="wallet-card-position" role="status" aria-live="polite" aria-atomic="true">1 of ${cards.length}</span><button type="button" class="wallet-page-button" data-direction="1" aria-label="Next card">${icon('chevron_right')}</button></div>`;
      content.append(carousel);
      const cardDetails = document.createElement('section');
      cardDetails.className = 'wallet-card-information';
      cardDetails.setAttribute('aria-label', 'Selected card details');
      content.append(cardDetails);
      const renderCardDetails = index => {
        const card = cards[index];
        cardDetails.innerHTML = `<h3>points co ${card.name} · •••• ${card.number}</h3><dl><div><dt>October earnings</dt><dd>${format(card.earned)} points</dd></div><div><dt>Earning rates</dt><dd>${card.rates}</dd></div><div><dt>Sample activity</dt><dd>${card.activity} points</dd></div><div><dt>Included benefit</dt><dd>${card.perk}</dd></div></dl>`;
      };
      renderCardDetails(0);
      const track = carousel.querySelector('.wallet-card-track');
      const slides = [...track.children];
      const previous = carousel.querySelector('[data-direction="-1"]');
      const next = carousel.querySelector('[data-direction="1"]');
      let current = 0;
      const update = () => {
        const previousIndex = current;
        current = slides.reduce((closest, slide, index) =>
          Math.abs(slide.offsetLeft - slides[0].offsetLeft - track.scrollLeft) < Math.abs(slides[closest].offsetLeft - slides[0].offsetLeft - track.scrollLeft) ? index : closest, 0);
        if (previousIndex !== current) renderCardDetails(current);
        carousel.querySelector('.wallet-card-position').textContent = `${current + 1} of ${cards.length}`;
        previous.disabled = current === 0;
        next.disabled = current === cards.length - 1;
      };
      const goTo = index => {
        const target = slides[Math.max(0, Math.min(index, cards.length - 1))];
        track.scrollTo({left:target.offsetLeft - slides[0].offsetLeft, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      };
      previous.addEventListener('click', () => goTo(current - 1));
      next.addEventListener('click', () => goTo(current + 1));
      track.addEventListener('scroll', update, {passive:true});
      track.addEventListener('keydown', event => {
        const target = {ArrowLeft:current - 1, ArrowRight:current + 1, Home:0, End:cards.length - 1}[event.key];
        if (target === undefined) return;
        event.preventDefault();
        goTo(target);
      });
      previous.disabled = true;
      const note = document.createElement('p'); note.className = 'detail-note';
      note.textContent = 'Fictional card plans · Sample data as of '+sample.asOf+'. Earnings are included in the dashboard totals. No live card account or benefit verification is connected.';
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
      if (panel.ledger) {
        const ledger = document.createElement('dl');
        ledger.className = 'sample-ledger';
        panel.ledger.forEach(([label, value]) => {
          const row = document.createElement('div');
          const term = document.createElement('dt'); term.textContent = label;
          const detail = document.createElement('dd'); detail.textContent = value;
          row.append(term, detail); ledger.append(row);
        });
        content.append(ledger);
      }
      if (panel.action) {
        const action = document.createElement('a'); action.className = 'solid-button';
        action.href = panel.href; action.textContent = panel.action;
        if (panel.prompt) action.addEventListener('click', event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); startChat(panel.prompt);
        });
        content.append(action);
      }
      const note = document.createElement('p'); note.className = 'detail-note';
      note.textContent = 'Interview sample · As of '+sample.asOf+'. Programs, activity, rates, and benefit terms are fictional. No live account actions are performed.'; content.append(note);
    }
    dialog.showModal();
    if (name === 'cards' && walletTrigger) {
      walletTrigger.setAttribute('aria-expanded', 'true');
      walletTrigger.classList.add('is-open');
    }
  }
  $$('[data-panel]').forEach(button => button.addEventListener('click', event => {
    if (button.tagName === 'A' && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event.preventDefault();
    openPanel(button.dataset.panel, button);
  }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    walletTrigger?.classList.remove('is-open');
    walletTrigger?.setAttribute('aria-expanded', 'false');
    dialogTrigger?.focus({preventScroll:true});
  });
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
