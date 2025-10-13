# CRISP Sales Methodology Integration Guide

## Overview
JokerVision AutoFollow AI agents (Chat & Voice) are now trained in the **CARWARS CRISP CERTIFICATION** methodology - a proven automotive sales technique focused on appointment setting and objection handling.

---

## What is CRISP?

**CRISP** is an acronym representing the five core steps of the sales process:

- **C = CONNECT**: Make picking up the phone/responding a priority. Get customers connected with you.
- **R = REQUEST**: Request the appointment on EVERY interaction.
- **I = INVITE**: Invite the customer into the dealership for a test drive.
- **S = SET**: Set a specific date and time, and confirm with a reminder.
- **P = PURSUE**: Pursue established customers, rescue stranded calls, save missed opportunities.

---

## Core Principles Integrated

### 1. Capture the Customer on the First Call
Two selling opportunities on every call:
1. Gather complete contact information (first name, last name, cell phone, email, location)
2. Gain commitment for a firm next step (appointment)

### 2. Alternative Offers
When specific vehicle isn't available:
- Offer alternative vehicle
- Priority appointment with product specialist
- Virtual appointment to review options
- Priority trade appraisal
- Test drive on demo vehicle

---

## CRISP Techniques in AI Agents

### Transition/Disrupt/Ask (TDA) - For ALL Objections

**Step 1 - TRANSITION**: Use comfort phrases
- "That makes sense..."
- "I agree..."
- "Thanks for sharing that..."
- "Just out of curiosity..."

**Step 2 - DISRUPT**: Break their resistance pattern
- "I figured you would be..."
- "That's actually why I'm calling..."
- "Most of my customers felt the same way..."
- "I haven't given you enough information yet..."

**Step 3 - ASK**: Offer specific times
- "I have availability today at 3pm or tomorrow at 10am, which works better?"

**Example in Action:**
- Customer: "I'm just looking"
- AI: "That makes sense. I figured you would want to see your options first. I have availability today at 3pm or tomorrow at 10am to show you what's available, which works better?"

---

### Whittle & Shepherd - For Timing Objections

Start broad, narrow to specific times:

1. "Does today or tomorrow work better?"
2. "Morning or afternoon?"
3. "I have 3:15pm or 5:45pm available tomorrow, which one works best?"

**Creating Demand:**
"I see another customer scheduled to view that vehicle tomorrow evening. Would you be available today or tomorrow morning?"

---

### Onion Technique - For Price Objections

**NEVER give total price over text/phone.** Use progressive layers:

**Layer 1 - VALUE**:
"As you may know from your research, that vehicle is $XX,XXX. The good news is it IS still available. I have 3pm or 5pm today, which works?"

**Layer 2 - DEFER TO AUTHORITY**:
"That's actually the easiest part. I'm one of the product specialists and my job is to make sure you get the right fit. My manager will work with you on those details when you're here. I have 2pm or 4pm open, which is better?"

**Layer 3 - PRESENCE IS LEVERAGE**:
"Your presence when you come will be the best thing to help on discounting. We get so many calls and I don't anticipate this will be here much longer. Can you come today at 3pm or tomorrow at 10am?"

**Layer 4 - WEDGE OF DOUBT**:
"Thanks for sharing that. If you see it listed lower elsewhere, find out why - there's usually a good reason. This one IS available now. I have 4pm today or 11am tomorrow, which works?"

---

### Feel/Felt/Found - For Empathy

Standard empathy framework:
- "I understand how you **feel**."
- "Other customers have **felt** the same way."
- "After seeing what options were available, they **found** they could save thousands. Can you come in today at 3pm or tomorrow at 2pm?"

---

### Isolating the Objection

Clarify the core concern:
- "It sounds like [specific concern] is really important to you."
- "Aside from [their core objection], is there anything else we need to address?"
- "Okay, let's work on [their core objection]."

---

## Appointment Confirmation Process

### Verbal Contract (Repeat time AT LEAST 4 times)

"So I'm putting you down for **Thursday at 2:15 PM**. Just in case you're running late, let me give you my number 210-632-8712. If anything changes, will you promise to call and let me know? What time did you write down for **Thursday**?"

### Statement of Appreciation

"Great! We really look forward to seeing you **today at 11:00 am**."

### Paint the Picture (Make them comfortable)

"When you exit the highway, we're right past the first light at 18019 US-281. Park in the customer spots by the big American flag. Walk in and you'll see Mary at reception - she's expecting you. I'll have the vehicle pulled up, washed, and ready when you arrive. I'll also have my trade appraiser ready to evaluate your vehicle if you're trading."

---

## How AI Agents Use CRISP

### Text/Chat AI Agent
- Uses Transition/Disrupt/Ask on every objection
- Applies Whittle & Shepherd for vague timing responses
- Uses Onion Technique layers for price questions
- Confirms appointments with Verbal Contract
- Paints the picture for arrival

### Voice AI Agent  
- Follows same CRISP principles in conversation
- Emphasizes voice confirmation (repeat time 4x)
- Creates comfort through Paint the Picture
- Uses Feel/Felt/Found for empathy in real-time
- Never gives total price over phone

---

## Key Behaviors Programmed

### ALWAYS Do:
✅ Request appointment on EVERY interaction
✅ Offer 2 specific times (never open-ended)
✅ Use Transition/Disrupt/Ask for objections
✅ Create urgency honestly (inventory, promotions)
✅ Get complete contact information
✅ Confirm appointment 4+ times
✅ Paint the picture of their visit

### NEVER Do:
❌ Try to sell cars over text/phone
❌ Give total price without context
❌ Accept vague commitments ("I'll think about it")
❌ Use pressure tactics
❌ Negotiate prices remotely
❌ Skip the confirmation process

---

## Testing the CRISP Integration

### Chat AI Test Scenarios

**Scenario 1: Price Objection**
```
User: "How much is the RAV4?"
Expected AI: Uses Onion Layer 1 or 2, offers specific appointment times
```

**Scenario 2: Timing Objection**
```
User: "Maybe I'll come by sometime"
Expected AI: Uses Whittle & Shepherd, narrows to specific day/time
```

**Scenario 3: Just Looking**
```
User: "I'm just browsing"
Expected AI: Transition ("That makes sense"), Disrupt ("I figured..."), Ask (specific times)
```

### Voice AI Test Scenarios

Test same scenarios via voice call to `/api/voice/realtime/session` endpoint. Voice AI should:
- Use conversational CRISP techniques
- Repeat appointment time multiple times
- Paint the picture of the visit
- Show empathy through Feel/Felt/Found

---

## Implementation Details

### Files Modified

1. **`/app/backend/server.py`** (Lines 1955-2048)
   - Chat AI system message with complete CRISP methodology
   - All objection handling techniques integrated
   - Appointment confirmation process

2. **`/app/backend/server.py`** (Line 6149)
   - Voice AI instructions with condensed CRISP principles
   - Optimized for real-time voice interaction

### Environment Variables Required

- `EMERGENT_LLM_KEY`: Required for AI chat functionality
- Standard dealership configuration in `.env`

---

## Success Metrics

Track these KPIs to measure CRISP effectiveness:

1. **Appointment Request Rate**: % of conversations where appointment is requested
2. **Appointment Set Rate**: % of conversations resulting in scheduled appointment
3. **Show Rate**: % of scheduled appointments that show up
4. **Objection Handling**: % of objections successfully overcome
5. **First Contact Capture**: % of first-time contacts with complete info gathered

---

## Future Enhancements

- [ ] Track specific CRISP technique usage (TDA, Whittle & Shepherd, Onion)
- [ ] A/B testing different objection handling approaches
- [ ] Voice sentiment analysis for Feel/Felt/Found effectiveness
- [ ] Automated follow-up using PURSUE methodology
- [ ] Dashboard showing CRISP compliance scores

---

## Training Resources

Original CRISP training document: `/artifacts/CRISP TIP SHEET CRISP CERTIFICATION.pdf`

For questions or additional training needs, refer to the CARWARS CRISP certification materials.

---

## Quick Reference Card

**Remember the CRISP acronym:**
- **C**onnect - Engage immediately
- **R**equest - Ask for appointment EVERY time
- **I**nvite - Invite to dealership for test drive
- **S**et - Specific date and time
- **P**ursue - Follow up relentlessly

**Three Magic Techniques:**
1. **TDA** (Transition/Disrupt/Ask) - For all objections
2. **Whittle & Shepherd** - For timing
3. **Onion** - For price

**Golden Rule:** Get them IN THE DOOR. You can't sell a car over text/phone, but you CAN get them to visit!

---

*Last Updated: October 13, 2025*
*JokerVision AutoFollow - CRISP Certified AI Agents*
