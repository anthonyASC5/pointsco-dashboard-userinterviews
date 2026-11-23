'use strict';

// Frozen interview scenario. Fictional programs and benefits; never live account data.
const DashboardSample = (() => {
  const asOf = 'October 31, 2026';
  const accounts = [
    {name:'Atlas Air', balance:8200}, {name:'Harbor Stays', balance:4400},
    {name:'Market Club', balance:1800, expires:'November 30, 2026'},
    {name:'Coast Air', balance:5600}, {name:'City Stays', balance:3200},
    {name:'Journey Rail', balance:2400}, {name:'Road Club', balance:1600},
    {name:'Vista Rewards', balance:1200, expires:'December 15, 2026'}
  ];
  const categories = {
    flights:{title:'Flight earnings', total:8200, previous:7600, unit:'points', action:'Find flights', href:'optivoy-chat.html', prompt:'Help me find flights I can book with my points.', transactions:[['Oct 28','Atlas Air · New York to Boston',3600],['Oct 18','Coast Air · Chicago return',2800],['Oct 10','Atlas Air · Seattle booking',1800]]},
    hotels:{title:'Hotel earnings', total:4400, previous:4000, unit:'miles', action:'Find a stay', href:'optivoy-chat.html', prompt:'Help me find a hotel stay using my rewards.', transactions:[['Oct 25','Harbor Stays · Boston, 3 nights',2400],['Oct 17','City Stays · Chicago, 2 nights',1400],['Oct 08','Harbor Stays · Seattle, 1 night',600]]},
    shopping:{title:'Shopping earnings', total:1800, previous:2000, unit:'points', action:'Explore shopping', href:'points-co-explore.html?category=Shopping', transactions:[['Oct 26','Market Club · Everyday purchases',900],['Oct 14','Market Club · Travel essentials',600],['Oct 03','Vista Rewards · Online purchases',300]]}
  };
  const expenses = [['Oct 25','Accommodation',720],['Oct 18','Ground transport',220],['Oct 12','Meals',180],['Oct 06','Travel incidentals',120]];
  const trips = [['Boston','Nov 12–15, 2026','Flight + 3 hotel nights · Booked Oct 25'],['Chicago','Nov 20–22, 2026','Flight + 2 hotel nights · Booked Oct 17'],['Seattle','Dec 04–05, 2026','Flight + 1 hotel night · Booked Oct 08'],['Tokyo','Jan 15–20, 2027','Flight reservation · Booked Oct 02']];
  const cards = [
    {name:'rewards', number:'2048', tone:'cream', earned:6200, rates:'3 points per $1 on hotel stays; 2 on shopping; 1 on other eligible purchases.', perk:'Member hotel rates in this sample plan.', activity:'Hotel stays: 4,400 · Shopping: 1,800'},
    {name:'platinum', number:'4821', tone:'sage', earned:8200, rates:'3 points per $1 on flights; 2 on dining; 1 on other eligible purchases.', perk:'2 lounge visits per year in this sample plan; 1 visit remaining.', activity:'Flight bookings: 8,200'}
  ];
  return {asOf, accounts, categories, expenses, trips, cards, openingBalance:26000, redeemed:12000};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DashboardSample;
