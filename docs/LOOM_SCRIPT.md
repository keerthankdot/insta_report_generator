# Loom Demo Script: ReportEngine by Ascnd

**Target runtime:** Under 3 minutes
**Recording mode:** Loom screen + camera (face in bottom-left corner)
**Prep before recording:**
- Terminal open with font size 16pt or larger
- Browser Tab 1: Meta Business Suite content page (ready to export)
- Browser Tab 2: Google Sheet (empty, will populate live)
- Browser Tab 3: Looker Studio dashboard (pre-connected, shows charts)
- Browser Tab 4: Looker Studio scheduled email settings
- Terminal pre-loaded in the project directory with venv activated

---

## Beat 1: The Problem (15 seconds)

**On screen:** Camera only (no screen share yet), or a simple title slide.

**Say (word for word):**
"Your team spends three or more hours every week manually copying numbers from Instagram and Twitter into spreadsheets, then formatting those spreadsheets into client reports. Here's what that entire process looks like with Ascnd."

**Transition:** Start screen share, switch to Meta Business Suite tab.

---

## Beat 2: CSV Export from Meta Business Suite (30 seconds)

**On screen:** Meta Business Suite, Content tab, showing Instagram posts for the brand.

**Say:**
"Step one. Open Meta Business Suite. Go to Content. Set your date range. Click Export. That's it. Two clicks and you have all your Instagram data in a CSV file. This takes about 30 seconds."

**Actions:**
1. Show the Content tab with posts visible
2. Click the date range selector, set to last 30 days
3. Click Export, select CSV
4. Show the download completing

**Transition:** Switch to terminal.

---

## Beat 3: Run the Script (30 seconds)

**On screen:** Terminal, large font, clean prompt.

**Say:**
"Step two. Run one command. The script reads the CSV, cleans the data, calculates engagement rates, and writes everything to a structured Google Sheet."

**Actions:**
1. Type (or paste) the command:
   ```
   python src/report_generator.py --brand "Tinder" --ig-csv ./data/tinder_ig.csv
   ```
2. Let the output print. Pause briefly so viewers can read it.
3. Point out: "47 posts found, top post was a Reel with 45,000 reach and 8.3% engagement. The system surfaces your best content automatically."

**Transition:** "Let's see what the Google Sheet looks like now." Switch to browser Sheet tab.

---

## Beat 4: Google Sheet (15 seconds)

**On screen:** Google Sheet, "IG Posts" tab, showing populated data rows.

**Say:**
"Here's the Google Sheet. Every post, every metric, organized and ready. Nobody typed any of this. The script wrote it directly."

**Actions:**
1. Scroll through a few rows to show the data
2. Briefly point out columns: date, content type, reach, engagement rate
3. Switch to "Dashboard Meta" tab to show the timestamp

**Transition:** "But spreadsheets aren't what you send to clients. This is." Switch to Looker Studio tab.

---

## Beat 5: Looker Studio Dashboard (45 seconds)

**On screen:** Looker Studio dashboard, Page 1 (Overview).

**Say:**
"This is the live dashboard. It pulls directly from the Google Sheet, so it updates every time you run the script."

**Actions:**
1. Show Page 1: scorecards (total reach, engagement, posts), trend line
2. Click the brand filter dropdown, select a brand. "Filter by brand."
3. Navigate to Page 2 (Instagram Deep Dive): "Here's the Instagram breakdown. Engagement rate by content type. You can see Reels are outperforming Carousels by 2x."
4. Show the content type pie chart and engagement bar chart
5. Navigate to Page 4 (Content Type Comparison): "This answers the question every client asks: should we make more Reels or more Carousels? The data answers it."

**Transition:** "And the best part..." Switch to Looker Studio scheduled email settings.

---

## Beat 6: Scheduled PDF Report (15 seconds)

**On screen:** Looker Studio Share > Schedule email delivery dialog.

**Say:**
"Every Monday morning at 9 AM, this report lands in the client's inbox as a PDF. You didn't make it. You didn't format it. You didn't send it. It just happens."

**Actions:**
1. Show the scheduled delivery settings: weekly, Monday 9 AM
2. Show the recipient email field
3. Show the format: PDF

**Transition:** Close the dialog. Look at camera.

---

## Beat 7: The Close (30 seconds)

**On screen:** Camera only, or back to the dashboard.

**Say (word for word):**
"What you just saw uses a simple CSV export. That's Phase 1, and it's live right now. When we move to Phase 2, even that step disappears. The system pulls data from Instagram's API automatically every morning. No CSV exports, no manual steps, no human in the loop. But the dashboard, the reports, the data centre Viren asked for? That's ready today."

**Pause. Smile.**

"Let's talk about getting this set up for your brands."

---

## Recording Tips

- **Keep it tight.** If you go over 3 minutes, cut words, not beats. Every beat matters.
- **Don't narrate what's obvious on screen.** If viewers can see you clicking Export, don't say "I'm clicking Export." Tell them why it matters instead.
- **Pre-run the script** before recording so the output is cached and fast. Nobody wants to watch pip install in a demo.
- **Use Loom's drawing tool** to circle or highlight key numbers on the dashboard (total reach, top engagement rate).
- **Energy.** This is a pitch. Sound like you built something you're proud of, because you did.
- **One take.** Don't aim for perfect. Aim for confident. Loom lets you trim the start and end if needed.
