# Automation Roadmap: TNT x Ascnd

A phased plan to take TNT's social media reporting from manual spreadsheets to a fully automated data centre.

---

## Where We Are Now

Your team spends 3+ hours per week per brand pulling numbers from Instagram and Twitter, typing them into spreadsheets, and formatting client reports. That process doesn't scale. Every new brand multiplies the workload.

The system we've built changes that. Here's the roadmap.

---

## Phase 1: CSV-Based Pipeline (Live Now)

**What it does:**
Export a CSV from Meta Business Suite (60 seconds). Run a single command. The system cleans the data, calculates engagement metrics, and writes everything to a structured Google Sheet. A Looker Studio dashboard auto-updates from the Sheet and delivers a PDF report to client inboxes every Monday.

**What changes for TNT:**
- No more manual data entry into spreadsheets
- Engagement rates, top posts, and content breakdowns calculated automatically
- Clients get a professional, branded PDF report without anyone building it

**Time saved:** ~2.5 hours per week per brand

**Cost:** Included in current engagement. No additional infrastructure.

**Status:** Live and operational.

---

## Phase 2: Instagram API Automation (Month 2)

**What it does:**
Connect directly to Instagram's Graph API through a Meta Developer App. The system pulls Instagram data automatically every morning at 6 AM. No more CSV exports. No more opening Meta Business Suite.

**What changes for TNT:**
- Instagram reporting becomes completely hands-free
- Data arrives daily instead of weekly, enabling more responsive content decisions
- X/Twitter remains CSV-based until Phase 3 (or uses a Chrome extension for free export)

**Build timeline:** 1 week

**Cost:** Rs. 0 additional. The Instagram Graph API is free for business accounts you own.

---

## Phase 3: Full Automation + Custom Reports (Month 3-4)

**What it does:**
Add X/Twitter API integration so both platforms pull data automatically. Generate branded PowerPoint reports using each client's visual identity. Give each brand a unique dashboard link they can access anytime.

**What changes for TNT:**
- Zero manual steps for both Instagram and X reporting
- Auto-generated PPTX reports replace manual deck building
- Each client gets their own live dashboard link
- Slack or email alerts when a post breaks out (performs 2x above the brand's average reach)

**Build timeline:** 2-3 weeks

**Cost:** X API Basic tier is approximately $200/month. A small VPS to run the automated scheduler is approximately Rs. 500/month.

---

## Phase 4: Intelligence Layer (Month 5+)

**What it does:**
Layer AI-powered analysis on top of the performance data. The system doesn't just report what happened. It tells you what to do next.

**What changes for TNT:**
- AI-generated content recommendations based on what's actually working for each brand
- Automated competitive benchmarking against similar accounts
- Predictive posting time optimization: the system tells you when to post for maximum reach
- This is where the data centre becomes a strategic advantage, not just a reporting tool

**Build timeline:** Scoped after Phase 3 is stable

**Cost:** TBD based on scope and AI provider costs

---

## Summary

| Phase | What | Time Saved | Cost | Timeline |
|-------|------|-----------|------|----------|
| Phase 1 | CSV to Sheets + Dashboard | ~2.5 hrs/week/brand | Included | Live now |
| Phase 2 | Instagram API automation | +30 min/week/brand | Rs. 0 | 1 week build |
| Phase 3 | Full automation + PPTX | +1 hr/week/brand | ~$200/mo + Rs. 500/mo | 2-3 weeks build |
| Phase 4 | AI insights + predictions | Strategic value | TBD | After Phase 3 |

---

## Next Step

Phase 1 is live. The CSV pipeline is working, the dashboard is connected, and reports are being delivered.

Let's discuss the Phase 2 timeline. Instagram API integration is a one-week build with zero additional cost, and it eliminates the last manual step for Instagram reporting entirely.

When works for a quick call?
