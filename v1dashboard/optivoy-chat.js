'use strict';

// Reference-based sample experience. No live account or AI requests are made.
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const conversation = document.querySelector('#conversation');
const sidebar = document.querySelector('#sidebar');
const menu = document.querySelector('.menu-toggle');
const dialog = document.querySelector('#details-dialog');
let activeHistoryButton;

function closeNavigation() {
  sidebar.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
}

function demoReply(message) {
  if (/attention|expir|briefing/i.test(message)) return 'The sample briefing flags 2 accounts with points expiring soon. Open Wallet to review the overview. Once your loyalty accounts are connected, I can show the affected programs, deadlines, and qualifying activity options.';
  if (/hyatt|hotel|redemption/i.test(message)) return 'Let’s plan a Hyatt points stay. Which destination, dates, and number of guests do you have in mind? We’ll also need your World of Hyatt balance. This demo cannot check award availability or make a booking.';
  if (/amex.*(worth|point)|point.*worth/i.test(message)) return 'The value of your Amex points depends on how you redeem them. Share your points balance and a destination or redemption you’re considering. With a cash price and points price, we can compare the value per point. Your live Amex balance is not connected in this demo.';
  if (/renew|platinum/i.test(message)) return 'Let’s review the benefits you actually use before your renewal. What is your upcoming annual fee, and which credits or travel perks did you use this year? I can help organize a comparison; I don’t have access to your card account.';
  if (/bonvoy|transfer/i.test(message)) return 'Which program are you transferring from, and what trip are you planning? Before transferring points, confirm the current conversion ratio and award availability with the programs. This demo cannot verify transfer terms or move points.';
  if (/sfo|nrt|flight|trip/i.test(message)) return 'Let’s explore your trip. What are your travel dates, preferred cabin, and available airline miles or transferable points? Live award search is not connected, but we can organize the options you want to compare.';
  if (/credit|sapphire/i.test(message)) return 'Which travel credit would you like to review? Share your card’s benefit terms and the travel purchase you’re considering, and I can help organize the details. I can’t see your current benefits or transactions in this demo.';
  if (/hertz|aarp/i.test(message)) return 'What are your pickup location and rental dates? Compare your member quote with the standard rate and review eligibility and cancellation terms before booking. Live rental pricing is not connected here.';
  return 'I can help you think through points redemptions, travel rewards, and loyalty account questions. Tell me your destination, programs, or what you want to understand. This is a demo, so I can’t retrieve live balances, search availability, or book travel.';
}

function appendMessage(text, speaker) {
  const message = document.createElement('p');
  message.className = `message ${speaker}`;
  message.textContent = text;
  conversation.append(message);
}

function sendMessage(message) {
  message = message.trim();
  if (!message) return;
  document.querySelector('#welcome').hidden = true;
  document.querySelector('#suggestions').hidden = true;
  document.querySelector('#demo-note').hidden = false;
  document.querySelector('#main').classList.add('has-conversation');
  conversation.hidden = false;
  if (!activeHistoryButton) {
    activeHistoryButton = document.createElement('button');
    activeHistoryButton.textContent = message;
    activeHistoryButton.title = message;
    // This entry restores the current conversation rather than resending its prompt.
    activeHistoryButton.addEventListener('click', () => {
      closeNavigation();
      input.focus();
      conversation.scrollTop = conversation.scrollHeight;
    });
    document.querySelector('#recent-chats').prepend(activeHistoryButton);
  }
  appendMessage(message, 'user');
  appendMessage(demoReply(message), 'assistant');
  input.value = '';
  closeNavigation();
  conversation.scrollTop = conversation.scrollHeight;
  input.focus();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  sendMessage(input.value);
});
document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => sendMessage(button.dataset.prompt));
});
document.querySelector('#new-chat').addEventListener('click', () => {
  // No persistence is implied: this prototype keeps only the active conversation.
  if (activeHistoryButton) activeHistoryButton.remove();
  activeHistoryButton = undefined;
  conversation.replaceChildren();
  conversation.hidden = true;
  document.querySelector('#welcome').hidden = false;
  document.querySelector('#suggestions').hidden = false;
  document.querySelector('#demo-note').hidden = true;
  document.querySelector('#main').classList.remove('has-conversation');
  input.value = '';
  closeNavigation();
  input.focus();
});
menu.addEventListener('click', () => {
  const open = sidebar.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
    closeNavigation();
    menu.focus();
  }
});

const panels = {
  wallet: {title: 'Your rewards wallet', paragraphs: [
    ['8 accounts · $9,319 in rewards', 'Your wallet overview, as shown in the reference.'],
    ['Keep your points in view', 'Connect loyalty accounts to review balances, program details, and expiration dates.']
  ]},
  bookings: {title: 'Your bookings', paragraphs: [
    ['No live bookings connected', 'Your confirmed flights, stays, and reservations will appear here once a booking source is connected.'],
    ['Planning your next trip?', 'Ask Points Co about using points for a flight or hotel to start a conversation.']
  ]},
  briefing: {title: 'Your daily briefing · Oct 6', paragraphs: [
    ['2 accounts expiring soon', 'Review your loyalty programs for upcoming points expiration dates.'],
    ['$247 earned this month', 'Your monthly rewards summary from the reference.'],
    ['One flight away from Premier Gold', 'Check your qualifying activity and status requirements with your airline.']
  ]}
};
document.querySelectorAll('[data-panel]').forEach(button => {
  button.addEventListener('click', () => {
    const panel = panels[button.dataset.panel];
    document.querySelector('#dialog-title').textContent = panel.title;
    const content = document.querySelector('#dialog-content');
    content.replaceChildren();
    panel.paragraphs.forEach(([title, body]) => {
      const row = document.createElement('div');
      row.className = 'detail-row';
      const heading = document.createElement('strong');
      heading.textContent = title;
      const text = document.createElement('p');
      text.textContent = body;
      row.append(heading, text);
      content.append(row);
    });
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'Sample data from the design reference. Live accounts and bookings are not connected.';
    content.append(note);
    closeNavigation();
    dialog.showModal();
  });
});
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
