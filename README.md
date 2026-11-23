# points co dashboards

The current dashboard is **v3**, served from `index.html`.

| Version | Entry point | Status |
| --- | --- | --- |
| v3 | `index.html` | Current dashboard |
| v2 | `v2dashboard/index.html` | Archived November 4, 2026 |
| v1 | `v1dashboard/index.html` | Original dashboard |

Version links are available in the v3 top navigation. The v2 archive contains its own styles, scripts, tile editor, and tokens, while referencing shared images and travel routes in the root directory. Existing v2 root files are retained for compatibility; v3 does not load them.

## Local preview

This is a static HTML/CSS/JavaScript project with no build or install step.

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## Version 3

- **Customize tiles** opens the tile editor. Select **Swap** on two tiles to exchange them across rows, **Remove** to hide one, or **Add** to restore it in its slot. **Restore layout** returns to the default v3 arrangement. Changes save in this browser independently of the archived dashboards. Press Escape to cancel a selection or leave editing.
- All dashboard tiles are visible in a spacious scrolling layout, including category earnings, benefits, and monthly activity.
- Short route and chart animations support the visuals. Destination photography transitions between the existing three destinations with pause/play controls. Reduced-motion preferences disable animation and pause the slideshow.
- The rewards tile opens `points-management.html`. It combines the available rewards balance and monthly hotel earnings without adding the earnings to the balance again.
- Rewards charts show the existing monthly sample history, with 1M, 3M, and 6M ranges, grid lines, an area chart, pointer inspection, and keyboard arrow inspection.
- Loyalty health is an expiry-status prototype: `(accounts without an expiry alert / sample accounts) × 100`. Six of eight sample accounts without alerts yields **75/100**. It does not measure redemption value, account freshness, or status benefits.
- Cards and benefit panels use fictional plans with sample rates, activity, and eligibility conditions. No payment account, loyalty service, reservation source, or benefit eligibility is connected.
- Opening My wallet shows one full-size card at a time with card-specific earning rates, October activity, and a sample benefit. Swipe or scroll horizontally, use the previous/next controls, or focus the cards and press Left/Right (Home/End for the first/last card) to browse the two sample cards.
- Flights, Hotels, and Shopping tiles show sample October points earned, month-over-month arrows and percentage changes, and six-month sparklines. Hotel earnings reuse the existing history; Flights (8,200 vs. 7,600 in September) and Shopping (1,800 vs. 2,000) use illustrative category earnings, separate from the net rewards balance.
- Category tiles open earnings or rental details, with a link to the assistant or the corresponding Explore category. Assistant prompts use the existing chat route and session-storage key.

All balances, account counts, dates, and activity are **sample data**. The chart history and monthly totals are retained from v2. The eight fictional account balances and two expiry alerts come from `dashboard-sample-data.js`. See `INTERVIEW-SCENARIO.md` for scenario facts and suggested tasks.
