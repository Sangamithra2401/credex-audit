# Metrics

## North Star Metric

**Audits completed per week.**

Why: An "audit completed" means the user saw results — they got value. Visitors who bounce on the form don't count. Email captures are downstream of this. Credex consultations are downstream of that. Everything good in the funnel starts with a completed audit, so optimizing for audit completions optimizes the whole funnel.

Not "DAU" — this tool is used once per quarter per team, not daily. Not "page views" — traffic without completions is worthless. Not "email captures" — email captures before value is a vanity metric that gaming the gate would distort.

---

## 3 Input Metrics

1. **Form completion rate** (visitors → completed audits)
   - Target: ≥40% of people who start the form complete it
   - Why: If this drops, the form is too long or confusing. First thing to optimize.

2. **High-savings audit rate** (audits → audits showing >$500/mo savings)
   - Target: ≥20% of completions surface meaningful savings
   - Why: This drives Credex consultation bookings. If this is low, either the tool's not reaching the right users or the pricing data is stale.

3. **Email capture rate** (completions → email submissions)
   - Target: ≥20% of completions submit email
   - Why: This is the lead pipeline. Below 15% means either the value isn't landing or the gate friction is too high.

---

## What I'd instrument first

1. `audit_started` — user hits "Get my free audit" button
2. `audit_completed` — audit result page loaded successfully
3. `email_submitted` — lead capture form submitted
4. `consultation_clicked` — Credex CTA clicked (for high-savings cases)
5. `share_link_copied` — viral loop signal

All events go to PostHog (free tier) or Plausible for privacy-friendly analytics. No Google Analytics (GDPR risk, ad-blocker blocked).

---

## What number triggers a pivot decision

**If form completion rate drops below 25% for 2 consecutive weeks**, the form is the problem — shorten it, add progress indicators, or pre-fill common tool combos.

**If high-savings audit rate drops below 10%**, the tool is attracting the wrong audience (already-optimised teams) — revisit distribution channels.

**If email capture rate stays below 10% for 3 weeks**, the value isn't landing — redesign the results page or reconsider the email gate timing.

**If 0 Credex consultation bookings in 30 days** despite audits completing — the Credex CTA placement or copy isn't working. A/B test the CTA on the results page.
