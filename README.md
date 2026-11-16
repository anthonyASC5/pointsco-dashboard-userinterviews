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
- An asymmetric three-row desktop layout uses the existing navy and neutral palette. The dashboard scales to the available desktop viewport; mobile uses a readable scrolling layout.
- The rewards tile opens `points-management.html`. It combines the available rewards balance and monthly hotel earnings without adding the earnings to the balance again.
- Rewards charts show the existing monthly sample history, with 1M, 3M, and 6M ranges, grid lines, an area chart, pointer inspection, and keyboard arrow inspection.
- Loyalty health is an expiry-status prototype: `(accounts without an expiry alert / sample accounts) × 100`. Six of eight sample accounts without alerts yields **75/100**. It does not measure redemption value, account freshness, or status benefits.
- Cards and benefit panels are illustrative. No payment account, loyalty service, reservation source, or benefit eligibility is connected.
- Flights, Hotels, and Shopping tiles show sample October points earned, month-over-month arrows and percentage changes, and six-month sparklines. Hotel earnings reuse the existing history; Flights (8,200 vs. 7,600 in September) and Shopping (1,800 vs. 2,000) use illustrative category earnings, separate from the net rewards balance.
- Category links open the assistant or the corresponding Explore category. Assistant prompts use the existing chat route and session-storage key.

All balances, account counts, dates, and activity are **sample data**. The chart history and monthly totals are retained from v2. The eight sample accounts and two expiry alerts are aggregate examples; program names and individual account balances are unavailable.
