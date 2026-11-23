# Interview scenario

The participant is Anthony, a fictional traveler based in New York. Treat the dashboard as a snapshot on **October 31, 2026**, regardless of the actual interview date. All programs, account activity, bookings, card rates, rental prices, and coverage terms are fictional examples. Nothing submits a booking, redemption, insurance claim, or payment. The assistant uses the existing prototype chat; it does not retrieve live rewards or travel inventory.

## Facts for moderators

- September balance: 26,000 miles. October earnings: 14,400. October redemptions: 12,000. Closing balance: **28,400**. Net growth: **2,400**, or **9.2%** rounded.
- Category earnings: Flights **8,200** (+600 / +7.9%); Hotels **4,400** (+400 / +10%); Shopping **1,800** (−200 / −10%). The scenario converts category points to miles at 1:1. Earnings are already included in the closing balance.
- Eight fictional program balances total **28,400**. Market Club's **1,800** expire November 30; Vista Rewards' **1,200** expire December 15. Six accounts without alerts divided by eight accounts gives a **75/100** expiry-health score. No other health factors are measured.
- Rewards card ending 2048 earned **6,200** from hotels and shopping. Platinum ending 4821 earned **8,200** from flights. Those totals reuse the same category activity; they are not additional earnings.
- Expenses: accommodation **$720**, ground transport **$220**, meals **$180**, incidentals **$120**. Total **$1,240**, down **$310 / 20%** from September. Submission does not mean reimbursement approval.
- Four trips were booked in October, with travel after the scenario date. Rewards entries describe posting dates and booking activity, not necessarily completed trips. Inspiration images are suggestions, separate from the booked itineraries.
- Fictional card benefits have enough conditions to discuss eligibility. No terms represent an actual financial product or insurance policy.

## Suggested neutral tasks

1. Explain how the rewards balance changed this month.
2. Find which activity earned the most points and inspect the entries behind it.
3. Decide whether any rewards need attention and explain your next step.
4. Compare the two wallet cards for a future flight or hotel purchase.
5. Find the next booked trip and identify its travel dates.
6. Explain what makes up October's travel expenses.
7. Find the lounge benefit and describe what you would check before using it.

Ask participants what they expect each tile to do before clicking, then what they understand after opening it. Avoid directing them to a particular button or implying that a benefit applies to a real card. Ask whether the sample labels and fixed scenario date are clear.

## Data maintenance

Shared account, category, expense, trip, and card fixtures live in `dashboard-sample-data.js`. The dashboard and management page load the same fixture. Summary numbers and historic charts in the existing HTML/analytics code remain fixed; update those together if changing scenario totals. Preserve the reconciliations above. Do not use real account identifiers, reservation codes, contact details, or participant information.
