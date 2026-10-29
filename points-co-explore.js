const offers = [
  {id:'cinema',category:'Experiences',title:'AMC horror movie marathon',description:'Five scary classics on the big screen, all week.',image:'assets/movie-theater.png',alt:'Rows of cinema seats facing a movie screen',featured:true},
  {id:'target',category:'Shopping',title:'Halloween costumes and candy',description:'Save with Target Circle through Oct 31.',mark:'target',value:'20%',unit:'off',featured:true},
  {id:'italy',category:'Travel',title:'A little escape to Italy',description:'Explore a stay along the Amalfi Coast.',image:'assets/destinations/italy.jpg',alt:'Cliffside buildings and boats in Positano, Italy',featured:true},
  {id:'california',category:'Travel',title:'Take the scenic route',description:'Find inspiration along the California coast.',image:'assets/destinations/california.jpg',alt:'Pacific waves along the cliffs of Big Sur, California',wide:true,featured:true},
  {id:'japan',category:'Travel',title:'Discover Japan',description:'Make room for a different kind of getaway.',image:'assets/destinations/japan.jpg',alt:'Chureito Pagoda overlooking Mount Fuji in Japan',featured:true},
  {id:'dining',category:'Dining',title:'Something worth sitting down for',description:'Explore dining with your points.',mark:'Dining',featured:false},
  {id:'electronics',category:'Electronics',title:'Your next everyday upgrade',description:'Explore electronics with your points.',mark:'Electronics',featured:false},
  {id:'everyday',category:'Everyday',title:'Put your points to everyday use',description:'Explore possibilities beyond your next trip.',mark:'Everyday',featured:false}
];
const grid = document.querySelector('#offer-grid');
const categories = [...document.querySelectorAll('[data-category]')];
const savedFilter = document.querySelector('#saved-filter');
const dialog = document.querySelector('#details-dialog');
const announcement = document.querySelector('#announcement');
const knownIds = new Set(offers.map(offer => offer.id));
function readIds(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set(Array.isArray(value) ? value.filter(id => knownIds.has(id)) : []);
  } catch { return new Set(); }
}
let saved = readIds('points-co-saved-offers');
let hidden = readIds('points-co-hidden-offers');
let category = 'Featured';
let savedOnly = false;
let dialogTrigger;
function persist() {
  try {
    localStorage.setItem('points-co-saved-offers',JSON.stringify([...saved]));
    localStorage.setItem('points-co-hidden-offers',JSON.stringify([...hidden]));
  } catch { /* Browsing works when local storage is unavailable. */ }
}
function visibleOffers() {
  return offers.filter(offer => !hidden.has(offer.id)
    && (savedOnly ? saved.has(offer.id) : category === 'Featured' ? offer.featured : offer.category === category));
}
function card(offer) {
  const isSaved = saved.has(offer.id);
  const media = offer.image
    ? `<img src="${offer.image}" alt="${offer.alt}" width="1024" height="768" decoding="async" ${offer.wide ? 'loading="lazy"' : ''}>`
    : `<div class="offer-mark" aria-hidden="true">${offer.mark === 'target' ? '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="9"><circle cx="40" cy="40" r="29"/><circle cx="40" cy="40" r="10"/></svg>' : offer.mark}</div>`;
  return `<article class="offer${offer.wide ? ' offer-wide' : ''}" data-id="${offer.id}" aria-label="${offer.title}">
    ${media}
    <div class="offer-tools"><button type="button" data-action="save" aria-label="${isSaved ? 'Unsave' : 'Save'} ${offer.title}" aria-pressed="${isSaved}">${isSaved ? '✓' : '+'}</button><button type="button" data-action="hide" aria-label="Hide ${offer.title}">−</button></div>
    ${offer.value ? `<div class="offer-badge"><strong>${offer.value}</strong><small>${offer.unit}</small></div>` : ''}
    <button class="offer-details" type="button" data-action="details"><strong>${offer.title}</strong><span>${offer.description}</span></button>
  </article>`;
}
function render() {
  const visible = visibleOffers();
  grid.innerHTML = visible.map(card).join('');
  document.querySelector('#empty-state').hidden = visible.length > 0;
  document.querySelector('#offer-count').textContent = `${visible.length} ${savedOnly ? 'saved ' : ''}${visible.length === 1 ? 'offer' : 'offers'}`;
  document.querySelector('#saved-count').textContent = saved.size;
  document.querySelector('#hidden-count').textContent = hidden.size ? `${hidden.size} ${hidden.size === 1 ? 'offer' : 'offers'} hidden` : '';
  document.querySelector('#restore-offers').hidden = hidden.size === 0;
  savedFilter.setAttribute('aria-pressed',String(savedOnly));
  categories.forEach(button => button.setAttribute('aria-pressed',String(!savedOnly && button.dataset.category === category)));
}
function openDetails(title, description, trigger) {
  dialogTrigger = trigger;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-description').textContent = description;
  dialog.showModal();
}
categories.forEach(button => button.addEventListener('click',() => {
  category = button.dataset.category;
  savedOnly = false;
  render();
}));
savedFilter.addEventListener('click',() => { savedOnly = !savedOnly; render(); });
grid.addEventListener('click',event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const article = button.closest('[data-id]');
  const offer = offers.find(item => item.id === article.dataset.id);
  if (button.dataset.action === 'details') {
    openDetails(offer.title,offer.description,button);
    return;
  }
  const oldIndex = [...grid.children].indexOf(article);
  if (button.dataset.action === 'save') {
    if (saved.has(offer.id)) saved.delete(offer.id); else saved.add(offer.id);
    announcement.textContent = `${offer.title} ${saved.has(offer.id) ? 'saved' : 'removed from saved offers'}.`;
  } else {
    hidden.add(offer.id);
    announcement.textContent = `${offer.title} hidden. Use Restore hidden offers to bring it back.`;
  }
  persist();
  render();
  const sameCard = grid.querySelector(`[data-id="${offer.id}"]`);
  const nextFocus = sameCard?.querySelector(`[data-action="${button.dataset.action}"]`)
    || grid.children[Math.min(oldIndex,grid.children.length - 1)]?.querySelector('button')
    || document.querySelector('#reset-filters');
  nextFocus.focus({preventScroll:true});
});
document.querySelector('#restore-offers').addEventListener('click',() => {
  hidden.clear(); persist(); render();
  announcement.textContent = 'Hidden offers restored.';
  (savedOnly ? savedFilter : categories.find(button => button.dataset.category === category)).focus({preventScroll:true});
});
document.querySelector('#reset-filters').addEventListener('click',() => {
  category = 'Featured'; savedOnly = false; hidden.clear(); persist(); render();
  categories[0].focus({preventScroll:true});
});
document.querySelector('#balance-details').addEventListener('click',event => {
  openDetails('Your points balance','28,400 sample rewards points, matching the My Miles tile on your dashboard. A live account is not connected.',event.currentTarget);
});
document.querySelector('#close-dialog').addEventListener('click',() => dialog.close());
dialog.addEventListener('close',() => { if (dialogTrigger?.isConnected) dialogTrigger.focus({preventScroll:true}); });
dialog.addEventListener('click',event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
render();
