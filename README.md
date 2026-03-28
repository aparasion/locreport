# LocReport ©

## Community Signal Proposals (self-hosted)

This repository now includes a self-hosted proposals + voting workflow with no third-party registration required.

### What it does

- Accepts user signal proposals (`pending_review` by default)
- Supports human moderation (`approve` / `reject`)
- Publishes a ranked proposal list with thumbs up/down voting
- Auto-promotes proposals that meet threshold
- Appends promoted items into `_data/signals.yml` with proposer attribution

### Run the API locally

```bash
export SIGNAL_PROPOSALS_ADMIN_TOKEN="change-me"
python scripts/signal_proposals_api.py
```

Default API URL: `http://127.0.0.1:8787`

### Configuration

Environment variables:

- `SIGNAL_PROPOSALS_ADMIN_TOKEN` (required for moderation endpoints)
- `PROPOSAL_PROMOTION_UPVOTES` (default: `10`)
- `PROPOSAL_PROMOTION_SCORE` (default: `8`)
- `SIGNAL_PROPOSALS_HOST` (default: `127.0.0.1`)
- `SIGNAL_PROPOSALS_PORT` (default: `8787`)

### Frontend page

Community UI is available at `/proposals/` (`proposals.md`).

If your API runs on a different host/port, set in the page context before loading scripts:

```html
<script>window.LOCREPORT_PROPOSAL_API = "http://your-host:8787";</script>
```
