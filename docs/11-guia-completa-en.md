# Daily Revenue Report — Full Feature Guide (EN)

This is the source text for Tuco's contextual help, one block per screen, in the order they
appear in the sidebar. Each screen: what it is, how to use it, why it matters. Written because
staff were missing features they didn't know existed — this is meant to surface every one of them.

---

## DAY TO DAY

### Enter today
**What it is.** The daily entry screen — where you type in what came in today, area by area,
service by service (Breakfast, Lunch, Dinner, Overnight), plus Covers, Food, Beverage and any
discounts.

**How to use it.**
- Pick the date at the top. It defaults to the next day that hasn't been loaded yet.
- Every box only accepts numbers — letters get blocked automatically, so a stray keystroke can't
  wreck a total.
- The area total and the day total calculate themselves as you type. You never add anything by hand.
- Hit **Enter** to jump to the next box in the grid instead of reaching for the mouse — it moves
  left to right, then down, like a spreadsheet.
- There's a paste shortcut: copy a row of numbers from Excel and paste it straight into the grid —
  it lands in the right boxes instead of one giant blob in a single cell.
- The **shifts** section is on this same screen: who worked, from what time to what time, and in
  which area. Shifts are **per area** — the people who worked Penny Blue are not the same people
  who worked In Room Dining, and the screen remembers who usually works where so it suggests names
  instead of starting from a blank list every day.
- Leave a comment in the notes box for anything worth flagging — a big group, a delay, an
  incident. Comments follow the day forever and show up later in the Presentation screen.

**Why it matters.** This is the only screen where numbers get typed by hand. Everything else in
the system — the month summary, the forecast, the presentation, the staff cost — is built from
what gets entered here. A number wrong here is wrong everywhere.

---

### Month summary
**What it is.** The home view for the month: how much has come in so far, day by day, against the
forecast and the target.

**How to use it.**
- The top cards show the running total for the month, the forecast for the close, and how many
  days are left.
- The calendar below colors each day: **green** means it hit its target, **red** means it fell
  short, **yellow** means it went so far over that it shouldn't be used as a baseline (an event
  day, for example — using it to plan a normal day would set an unrealistic bar), and grey means
  no data yet.
- Click any day in the calendar to jump straight to it.
- Switch the month with the selector in the top bar — every screen in the system follows that same
  month.

**Why it matters.** This is the screen for a five-second check: "are we on pace this month or
not." Everything else answers *why*.

---

### One day
**What it is.** The full detail of a single day: every area, every service, covers, food,
beverage, discounts, and how it compares to similar days.

**How to use it.**
- Pick the day from the dropdown, or arrive here by clicking a day on the calendar.
- Each area is broken out by service, so you can see exactly where the money came in — say,
  strong lunch in Penny Blue but a quiet dinner.
- The comparison line shows this day against the median of similar days (same weekday, same
  event status), so a slow Tuesday isn't compared against a busy Saturday by mistake.

**Why it matters.** The month summary tells you *that* something moved; this screen tells you
*where* inside that one day.

---

### Notes
**What it is.** Every comment ever left on any day, all in one place, instead of buried inside
each day's entry.

**How to use it.**
- Filter by area to see only what was flagged for Penny Blue, Exchange Lane, or In Room Dining.
- Click a comment to jump to the day it came from.

**Why it matters.** A comment left three weeks ago about a recurring problem is useless if nobody
can find it again. This screen is the search for all of them.

---

## WHAT THE NUMBERS SAY

### Forecast
**What it is.** A projection of how the month will close, recalculated every single day as new
data comes in — and it explains itself instead of just showing a number.

**How to use it.**
- The forecast combines what's already in, the pace of the days remaining, and whether any of
  those remaining days are expected to be event days.
- **Targets are set per area**, not as one number for the whole hotel — Penny Blue has its own
  target, Exchange Lane has its own, In Room Dining has its own. The month target is the sum of
  the three.
- There's a shortcut to split a single total target across the three areas automatically, based on
  what each one has historically brought in — useful when you're handed one number from above and
  need it broken down.
- Each area's card shows its own progress, its own forecast, and how many days of load are left to
  close the gap.

**Why it matters.** A single hotel-wide number hides which area is actually behind. This screen is
what turns "we're behind" into "Exchange Lane is behind, the other two are on pace."

---

### Hours
**What it is.** Shows what time of day actually makes the money in each area, split into time
slots (breakfast, lunch, afternoon, dinner, late night).

**How to use it.**
- Switch the area with the dropdown at the top.
- The system calls out, in plain language, which slot earns the most per staff-hour worked versus
  the slot that earns the least — the two extremes, not just a table of numbers.

**Why it matters.** This is the answer to "should we have more people on at 7pm or at 10pm." It's
built from data instead of a guess.

---

### Staff
**What it is.** How staffing levels compare to what a day like this one usually needs, and what
that staff actually cost.

**How to use it.**
- Shows hours worked, how that compares to similar days, and total staff cost as a percentage of
  that day's sales.
- Flags automatically if a day was noticeably over- or under-staffed relative to its own sales
  volume, so it doesn't need to be spotted by eye.
- Manager notes can be left directly here — for example, explaining *why* a day ran heavy on
  staff (a large booking, an event) so the flag isn't a mystery later.

**Why it matters.** Sales without a staff-cost lens hide half the picture. A great sales day with
a bloated staff bill isn't actually a great day.

---

## TO HAND OVER

### Presentation
**What it is.** The one-page, boss-ready daily report — formal, printable, and complete.

**How to use it.**
- Pick the day; the page assembles itself: the day's total, the comparison to similar days, the
  month running total, the forecast, and per-area detail.
- **Staff is shown in full detail here** — not just "6 people, 45 hours." Every person who worked
  that day is listed by name, with their exact shift time, hours, and which area they worked, plus
  a cost total per area and the staff cost as a percentage of that area's sales. A `*` marks any
  shift that included a penalty rate.
- Comments left on that day show up at the bottom.
- Print it directly from the browser — it's laid out to fit one page.

**Why it matters. **This is the document that actually goes to the boss. Everything upstream
exists to make this one page accurate.

---

### Send
**What it is.** Sends the daily report by email or WhatsApp — a human reviews it before it goes
out; nothing sends itself automatically.

**How to use it.**
- Recipients (email addresses) are saved once and remembered for next time.
- **The WhatsApp button** opens a chat with the report already written, with the important
  numbers marked in `*bold*` — the day's total, the month-to-date, the forecast, and the gap
  against target. It's a WhatsApp draft, not an automatic send: you review it and hit send
  yourself, on your own phone, in your own chat.
- The email preview shows exactly what will be sent before it's sent.
- A copy button lets you grab the text for pasting anywhere else — a chat, a note, wherever.

**Why it matters.** The report is only useful once it reaches the person who needs to see it, and
this is the fastest way to get it there without retyping a single number.

---

## SETUP

### Teams and pay
**What it is.** Hourly rates, by team and by individual person — the base for every cost figure
in the system.

**How to use it.**
- Set a rate for a whole team (say, all of Front of House) or override it for one specific person.
- Individual rates always win over team rates when both exist.
- This is also where each person is marked as **casual** or **permanent**, which matters for how
  Pay rules calculates what they're owed (see below).

**Why it matters.** Every staff-cost number anywhere in the system — Staff, Presentation, the
forecast's staff-cost line — is built on the rates set here.

---

### Pay rules
**What it is.** How an hour of work is actually paid, depending on when it falls — and it starts
with **no loadings at all**, because that's what this hotel reported: one hour is worth the same
any day, at any time, unless you say otherwise.

**How to use it.**
- Set a **day multiplier** per day type (weekday, Saturday, Sunday, public holiday), with a
  separate column for casual staff — casual already carries its own loading, so the two are never
  multiplied together.
- Add **time-of-day loadings** as a flat amount per hour (not a percentage) — for example, a
  premium for hours worked overnight. Each loading can be scoped to specific days only, so one
  could apply only on Sundays, or only on public holidays.
- Two shortcuts at the top: **No loadings** (reset to flat, this hotel's default) and **Load the
  award values** (fills in the current Hospitality Industry Award rates as a reference starting
  point — not an official source, just a baseline to adjust from).
- A live worked example at the bottom shows exactly what a given shift would pay under the current
  rules, before it's applied to any real day.
- Change anything here and it **recalculates every day already loaded** — nothing needs to be
  re-entered.

**Why it matters.** This is the one screen that decides whether every staff-cost figure in the
system is right or wrong. It's built to match how this specific hotel actually pays, not a
generic template.

---

### Import Excel
**What it is.** Reads an existing Excel file and loads it in, instead of retyping everything by
hand.

**How to use it.**
- Drop in the Excel file; the system detects areas, services, and metrics on its own by reading
  the column headers — it doesn't need an exact template.
- Rows that don't match anything recognizable get flagged instead of silently dropped, so nothing
  goes missing without a warning.
- Duplicate days already in the system are caught and flagged before they overwrite anything.

**Why it matters.** A month of history doesn't have to be retyped by hand to get the system fully
populated.

---

### The data
**What it is.** Where the system's own data lives — how much is stored, backups, and the reset
button.

**How to use it.**
- Shows how many days are loaded and how much space that's using.
- **Download a backup** any time — a file with everything, safe to keep outside the browser.
- **Restore** from a previous backup file.
- **Start from scratch** wipes everything — used once, deliberately, before loading real data for
  the first time (for example, to clear out the sample/demo numbers that ship with the app).

**Why it matters.** Everything the system knows lives in this one place. This screen is the safety
net for it.

---

## A note on language and currency

Every screen works in both Spanish and English — the switch is in the top bar, and it's a full
switch, not word-by-word. Currency is always AUD. Numeric fields only ever accept numbers.
