# Mentr - Learner UI Design Specification
## Extracted from "Learner new.pdf" (27 pages)

---

## 1. APPLICATION OVERVIEW

**App Name:** Mentr  
**Tagline:** "Talk with Experts in Seconds."  
**Subtitle:** "Real Experienced People, Real Guidance, Real Results"  
**Purpose:** A learner-mentor video calling & mentorship platform where learners can find experts, book video call sessions, message mentors, and get guidance on topics like career advice, exam prep, job switching, etc.

---

## 2. COLOR SCHEME

| Element | Color | Hex (Approximate) |
|---------|-------|--------------------|
| **Background (Primary)** | Dark charcoal/slate gray | `#2D3436` / `#3B4148` |
| **Background (Secondary)** | Slightly lighter dark gray | `#4A5568` |
| **Accent (Primary)** | Cyan/Turquoise (used for highlights, links, mentor names) | `#00E5FF` / `#5CE0D2` |
| **Accent (Secondary)** | Purple/Violet (buttons, CTAs) | `#7C5CFC` / `#6C63FF` |
| **Button - Call** | Orange | `#E8854A` |
| **Button - Talk Now** | Green | `#4CAF50` |
| **Button - Danger/Download Receipt** | Red/Coral | `#E57373` |
| **Button - Confirm** | Purple | `#7C5CFC` |
| **Button - Rate Now** | Teal/Mint | `#4DB6AC` |
| **Text (Primary)** | White | `#FFFFFF` |
| **Text (Secondary)** | Light gray | `#B0BEC5` |
| **Text (Success)** | Green | `#4CAF50` |
| **Text (Error)** | Red | `#E53935` |
| **Card Background** | Light gray/white | `#F5F5F5` / `#FFFFFF` |
| **Stars/Rating** | Gold/Yellow | `#FFD700` |
| **Online Status Dot** | Green | `#4CAF50` |
| **Notification Badge** | Red | `#F44336` |

---

## 3. GLOBAL LAYOUT STRUCTURE

- **Header (Global):** Logo "Mentr" (top-left, bold white text), hamburger menu icon (≡) below logo
- **Header Icons (Authenticated):** Message icon (chat bubble), Notification icon (megaphone/speaker), User avatar (top-right)
- **Navigation:** Hamburger menu (≡) — no persistent sidebar visible; appears to be a mobile-responsive/collapsible nav
- **Content Area:** Full-width centered content below header
- **No visible footer** in most pages

---

## 4. ALL PAGES & DETAILED COMPONENTS

---

### PAGE 1: HOME / LANDING PAGE
**Route:** `/` or `/home`

**Components:**
- **Header Bar:**
  - Logo: "Mentr" (top-left, bold)
  - Hamburger menu (≡)
  - Buttons: `Signup` (cyan outline), `Become a Mentor` (cyan filled)
  
- **Hero Section:**
  - Heading: "Talk with Experts in Seconds." (bold, white)
  - Subheading: "Real Experienced People, Real Guidance, Real Results"

- **Category Tags Bar (horizontal scroll):**
  - 🎯 Career Advice
  - 📚 Exam Prep
  - 🚂 Job Switch
  - 🤗 Motivation & Clarity
  - 🎓 Any Help

- **Search Bar:**
  - Large dark rounded input field
  - Search icon (🔍) on left
  - Placeholder: "What guidance do you need today?"
  
- **CTA Text:** `"Want to share your expertise instead?" - Become a Mentor` (link)

- **Trending Mentors Section:**
  - Title: "Trending Mentors 🔥"
  - Horizontal scrollable carousel of circular profile avatars
  - Each avatar has a green online status dot
  - Labels below: "GMAT Expert | UPSC CSE Coach | GRE Coach |"
  - Scroll indicator bar

- **Value Propositions (3 columns):**
  - "Live or On-Demand Video Calls ⚡"
  - "100% Refund 🤑 Guarantee!"
  - "Stay Anonymous for privacy 👽"

- **Footer Link:** "Get Help" (red, bottom-left)

---

### PAGE 2: SEARCH RESULTS / EXPERT LISTING
**Route:** `/search?q=CSAT+Coaching` or `/experts/:topic`

**Components:**
- **Header:** Logo "Mentr" + hamburger
- **Page Title:** "Here are the experts on "CSAT Coaching"" (cyan highlight on topic)

- **Tab Bar (3 tabs):**
  - `Experts` (active/selected) | `Videos` | `Live`
  - Underline indicator on active tab

- **Expert Cards Grid (3 columns):**
  Each card contains:
  - Profile image (circular, with green online dot)
  - Follower count badge: "55k Followers", "155k Followers", "41k Followers"
  - Name: "Andrew Smith", "Clayton J", "Gary Morowick"
  - Specialty: "CSAT Specialist", "CSAT Coach"
  - Star rating: "Ratings: 4.5 ⭐⭐⭐⭐☆"
  - Review count: "12 Reviews"
  - Price: "$20 / 30 mins", "$30 / mins", "$15 / 30 mins"
  - `call` button (orange/purple)

- **"People are also Searching for" Section:**
  - Tag pills (rounded, teal/green borders):
    - "How to clear Prelims exam easily?"
    - "How to handle CSAT exams"
    - "How to improve CSAT math questions"
    - "CSAT mock question Advice"
    - "How to reduce negative marking in prelims"
    - "best advice to clear prelims"
    - "How to get maximum marks in CSAT"
    - "Get maximum marks in Prelims"

- **More Expert Cards (second row):** Same structure with:
  - "Richard." (45k Followers) - "I improve your CSAT score"
  - "Anna Jones" (22k Followers) - "UPSC Coach"
  - "Smith John" (122k Followers) - "CSAT and Maths"

---

### PAGE 3: CALL BOOKING PAGE (Mentor is Live)
**Route:** `/call/:mentorId` or `/book/:mentorId`

**Components:**
- **Header:** Logo "Mentr" + hamburger
- **Page Title:** "Call Andrew Smith" (cyan "Call" + white name)
- **Horizontal divider line**

- **Live Status Section:**
  - Label: "Live Status:"
  - Status text: "The Mentor is Live"
  - Live broadcast icon (animated concentric circles)
  - `Talk Now!` button (large, green, prominent)

- **Horizontal divider**

- **Book A Call Date Section:**
  - Label: "Book A Call Date:"
  
  - **Date Picker (scroll wheel):**
    - Title: "Set date"
    - Three columns: Day | Month | Year
    - Scroll values: 26/Mar/2024, **27/Apr/2025** (selected, purple), 28/May/2026
    - Buttons: `Cancel` (text), `Set` (purple filled)
  
  - **Time Picker (scroll wheel):**
    - Title: "Set time"
    - Three columns: Hour | Minute | AM/PM
    - Scroll values: 9/23, **10/24/AM** (selected, purple), 11/25/PM
    - Buttons: `Cancel` (text), `Set` (purple filled)

- **`Book Call`** button (large, blue/cyan, centered)

---

### PAGE 4: AUTH MODAL / QUICK SIGNUP (overlaid on Call page)
**Route:** Modal overlay on `/call/:mentorId`

**Components:**
- **Modal Title:** "We just need a quick account to book your session and send your call link."
- **Form Fields:**
  - `Name:` — Input: "Enter your name"
  - `Email / Phone:` — Input: "Enter your E-mail / Contact No." + 🔒 "Secure, never shared"
  - `OTP / Password:` — Input: "Password"
- **Submit Button:** `Continue with Your Call` (purple)
- **Divider:** "OR"
- **Social Login:** 
  - Label: "Login with:"
  - `Google` (purple pill), `Facebook` (purple pill), `Apple` (purple pill)
- **Privacy Note:** 'Note: "Your info is private & secure"'

---

### PAGE 5: PAYMENT / CHECKOUT PAGE
**Route:** `/payment/:sessionId` or `/checkout`

**Components:**
- **Header:** Logo "Mentr."
- **Page Title:** "You are just one step away from your live call with Andrew Smith" (cyan name)
- **Dialing Animation:** "Dialing...." + video camera icon + "Andrew Smith" (cyan)

- **Currency Selector:**
  - Label: "Change Currency"
  - Dropdown: "Change Currency" (with chevron)

- **Total Bill Display:** "Total Bill: $20 USD"

- **Payment Form (white card):**
  - **Pay with** tabs: `Credit card` (selected, orange), `Google Pay`, `Paypal`, `Debit card`, `Internet Banking`
  - Fields:
    - "Card number" (input)
    - "Card holder" (input)
    - "Expiration date" (input) | "CVV" (input)
  - Checkbox: ☑ "Save my card for future reservation"
  - Legal text: "By selecting the button below, I agree to the Property Rules, Terms and Conditions, Privacy Policy and COVID-19 Safety Requirements."
  - `Confirm and Pay` button (purple, full-width)

- **Right Sidebar:**
  - **Discount Code Section:**
    - Label: "Discount Code:"
    - Input: "Enter coupon code." (dark input)
  - **Billing Details:**
    - Mentor's charges
    - Tax 1:
    - Tax 2:
    - Service Charges
    - $22 USD Fees:
    - **Total Bill: $20 USD**

---

### PAGE 6: ORDER SUCCESS / PAYMENT CONFIRMATION
**Route:** `/order/success` or `/payment/confirmed`

**Components:**
- **Success Card (centered modal-style):**
  - Green checkmark circle icon (✓)
  - Title: "Order placed successfully" (green)
  - Subtitle: "The Best way to learn faster is from an experienced Mentor."
  
  - **Receipt Table (white card):**
    | Field | Value |
    |-------|-------|
    | Subtotal | $20 USD |
    | Tax (10%) | $2 USD |
    | Fees | $0 USD |
    | Card | VISA ****2334 |
    | Total | Success ✓ $22 USD |

  - "How was your experience?" + star rating (4/5 stars)
  - `Continue with Call` button (purple, large)

- **Right Side Buttons:**
  - `Return to Your Dashboard` (purple)
  - `Download Receipt` (red/coral)

---

### PAGE 7: VIDEO CALL / LIVE SESSION SCREEN
**Route:** `/call/live/:sessionId`

**Components:**
- **Header:** "Mentr" + hamburger
- **Call Info Bar:**
  - "Call Connected with: Andrew Smith"
  - "Time Remaining: 29 min 35 secs." (right-aligned)

- **Main Video Area:**
  - Large video feed (mentor) — full center
  - Small picture-in-picture (learner) — top-right corner overlay
  - Camera switch icon on PIP

- **Video Controls Bar (bottom of video, translucent):**
  - 📹 Camera toggle (white)
  - 🎤 Microphone toggle
  - 📞 Hang up / End call (red)
  - 🖥️ Screen share

- **Right Panel:** "Chat History:" (scrollable text area)

- **Bottom Chat Bar:**
  - Attachment icon (📎)
  - Image icon (🖼️)
  - Plus icon (+)
  - Message input: "Send a Message...."
  - `Send` button (blue/purple)

---

### PAGE 8: SESSION COMPLETED / POST-CALL REVIEW
**Route:** `/session/complete/:sessionId`

**Components:**
- **Header:** "Mentr" + hamburger + chat/notification icons
- **Page Title:** "Session Completed Successfully" (bold, quotes)

- **Session Details (left section):**
  - Mentor name: Ajay Shah
  - Date & Time: 21/02/2025
  - Session Type: Live Video Call
  - Call Duration: Total Duration: 29 mins.

- **Notes Section (right):**
  - "Notes Taken during"
  - "Session: abc ......."
  - `Download Notes` button (blue)

- **Rating Section:**
  - ⭐ "Rate This Session:" + 5 stars (interactive)
  - ✏️ "Leave a Review:"

- **File Management (right):**
  - "Upload Files if any" + `Upload Files` button (blue) + 📎 icon
  - "Download Files if any" + `Download` button (blue)

- **Review Input:**
  - Large textarea: "Share your review"

- **Action Buttons (bottom row):**
  - `💰 Tip` (purple)
  - `Rebook Session` (purple)
  - `😡 Report an Issue` (purple)
  - `Back to Dashboard` (purple)

---

### PAGE 9: LEARNER DASHBOARD
**Route:** `/dashboard`

**Components:**
- **Header:** "Mentr" + hamburger
- **Welcome Message:** "Welcome back, Dear Learner!" (quotes, bold)

- **Top Right Section:**
  - "Want to Share your Expertise?" + `Become a Mentor` button (dark)
  - "Toggle for Mentor Acc." + Toggle switch (🔵 active)
  - "(Only Active if learner has turned mentor)" (cyan small text)

- **Upcoming Sessions Table:**
  - Title: "Upcoming sessions"
  - Columns: Date | Time. | Mentor. | Subject | Status
  - Row 1: 20/06/2025 | 09:30 A.m. | Clayton J. (avatar+green dot) | CSAT training | `Join` (green link)
  - Row 2: 23/06/2025 | 09:50 A.m. | Andrew Smith. (avatar+green dot) | CSAT Maths | `Join` (green link)

- **Past Sessions Table:**
  - Title: "Past sessions"
  - Columns: Date | Time. | Mentor. | Subject | Rating Status
  - Row 1: 02/04/2025 | 09:30 A.m. | Gary Morowick (avatar) | CSAT training | Rated: 4.3
  - Row 2: 13/03/2025 | 09:50 A.m. | John Smith. (avatar) | CSAT Maths | `Rate Now` (cyan link)

- **Action Buttons (bottom row):**
  - `Book New Sessions` (purple)
  - `View call/ chat History` (purple)
  - `Profile Settings` (purple)

---

### PAGE 10: BOOKING CONFIRMATION
**Route:** `/booking/confirmed/:bookingId`

**Components:**
- **Header:** "Mentr" + hamburger + chat/notification icons
- **Page Title:** "Booking Confirmed Successfully!"

- **Booking Details:**
  - Booking status: `Confirmed` (green)
  - Call Date: `27th April 2025` (green)
  - Mentor Name: `Andrew Smith` (green)
  - Total Payment done: `$100 USD` (green)

- **Mentor Card (right):**
  - Avatar, "55k Followers", green dot, "Andrew Smith"

- **Additional Details Input:**
  - Textarea: "Submit More Details about meeting for Mentor (Optional)...."
  - `Submit` button

- **Action Buttons (right column):**
  - `Cancel Booking` (purple)
  - `Change Date` (purple)
  - `View Past Bookings` (purple)
  - `Go to Dashboard` (purple)

- **Download Receipt** link (cyan, bottom-left, with download icon)

---

### PAGE 11: SIGN UP / SIGN IN PAGE
**Route:** `/auth` or `/signup` + `/signin`

**Components:**
- **Split Layout (two panels side by side):**

- **Left Panel — Sign Up:**
  - Title: "Sign Up"
  - Fields:
    - "Your full name" (input)
    - "Your username" (input)
    - "Your Password" (input with eye icon)
    - "Your Email" (input)
    - "Your Contact No" (input)
  - "or" divider
  - `Sign up` button (teal/cyan)

- **Right Panel — Sign In:**
  - Title: "Sign In"
  - Close (X) button top-right
  - Social Login buttons:
    - G `Sign in with Google` (teal)
    - f `Sign in with Facebook` (teal)
    - 🍎 `Sign in with Apple Id` (teal)
  - "or" divider
  - Fields:
    - `Username` — "Your username / Email / contact no" (input)
    - `Password` — "Your Password" (input with eye icon)
  - `Sign in` button (blue)

---

### PAGE 12: MENTOR PROFILE (Public View)
**Route:** `/mentor/:mentorId` or `/profile/:username`

**Components:**
- **Header:** "Mentr" + hamburger

- **Profile Header Card:**
  - Avatar (circular, large, with green online dot)
  - Name: "Andrew Smith" + verified badge (✓ blue)
  - Username: "AndrewS22"
  - Specialty: "CSAT Specialist"
  - Stats row: `251.2k Followers` | `15 Following` | `1M Likes`
  
  - **Action Buttons Row:**
    - `Follow` (green)
    - `✉ Message` ($4.99) (red/coral)
    - `📞 Call` ($20/30 min) (red/coral)
    - `📅 Subscribe` ($49.59/month) (red/coral)

  - **About:** "I will help you fix your CSAT issues."
  - Links: "🔗 My Youtube" | "↗ Share Profile"

- **Right Sidebar Cards:**
  - **Rating Card:** "RATING 4.5 ⭐⭐⭐⭐⭐ > 50,000+ Mentees"
  - **Offer Card:** "NEW OFFER 🎯 > 50% off on Subscription"

- **Reviews Section:**
  - Title: "Reviews" + "See All >"
  - Review cards (3 visible):
    - Jinny Oslin (avatar, "A day ago", 4 stars): "He solved all my doubts, regarding Profit and Loss Problems. Highly recommend him."
    - John smith (avatar, "A day ago", 4 stars): "Man knows his stuff so well. Guided me with problem solving, gave me shortcuts for Distance problems... See More"
    - Rihanna Logan (avatar, "A day ago", 5 stars): "He is so good. I have taken subscription. He is available whenever I need. Now I solve my doubts real time.."

- **Video Gallery (horizontal scroll):**
  - 3 video thumbnails with play button overlay
  - "Drag to move" indicator on last card

---

### PAGE 13: PAYMENT FAILED
**Route:** `/payment/failed`

**Components:**
- **Failure Card (centered):**
  - Red X circle icon
  - Title: "Payment Failed" (gray text)
  
  - **Receipt Table (white card):**
    | Field | Value |
    |-------|-------|
    | Subtotal | $20 USD |
    | Tax (10%) | $2 USD |
    | Fees | $0 USD |
    | Card | VISA ****2334 |
    | Total | `Failed` (red) $22 USD |

  - `Try again` button (purple)

- **Top-right:** Chat and notification icons

---

### PAGE 14: MESSAGING / CHAT PAGE
**Route:** `/messages` or `/chat`

**Components:**
- **Header:** "Mentr" + Search bar + notification badges (red: 7, 10) + chat icon + notification icon + avatar

- **Info Banner:** "First time Message is free, You can message mentors before booking. Messaging expires after 24 hours unless you book a session."

- **Left Panel — Conversations List:**
  - Back arrow (←)
  - Title: "Messages" + settings gear icon (⚙)
  - **Message Requests:** "John smith: Hello!" (expandable with arrow)
  - **Conversation Items (each has):**
    - Avatar (circular, with online dot)
    - Name (bold) + Username
    - Last message preview + date
    - Unread count badge (red circle)
  - Conversations:
    - Martin Logs (@martin65L) — "Shared a Video 2/11/2023" — 🔴 10
    - Jacob Hall (@J.hall22) — "You sent a sticker 9/16/2024" — 🔴 2
    - Delila Carciollo (@delila.carci.22) — "You sent a message 8/16/2024"
    - Michelle (@M.floyd) — "Meeting today? 8/17/2024" — 🔴 7
    - Asher Ford (@Ash.ford) — "You sent a photo 2/11/2024"
    - Scott Wicker (@Scotty2hotty) — "Hey This is Awesome! 2/30/2023"

- **Right Panel — Active Chat (with Michelle):**
  - Chat header: Avatar + "Michelle" + 📹 video call + 📞 audio call + ••• more options
  - **Message Types:**
    - Image message (shared photo of boxes)
    - Text message (sent, purple bubble): "Who delivers it?"
    - Text message (received, dark bubble): "It comes with a complete package. We get it delivered with the needed packing"
    - Audio message (play button + waveform + "0:56")
    - Text message (sent, purple): "Thanks for such explanation."
  
  - **Chat Input Bar:**
    - 📎 Attachment | 🖼️ Image | 📍 Location | Input: "Type a message..." | 😊 Emoji | ✈ Send | 🎤 Voice

---

### PAGE 15: CALL / SESSION HISTORY
**Route:** `/history` or `/call-history`

**Components:**
- **Header:** "Mentr" + hamburger + chat/notification icons
- **Page Title:** "Call History"

- **History Table:**
  - Columns: Date | Mentr Name | service taken | Subjects/Topics | Payment | Location | Rate Mentor | Invoice
  - Row data:
    | Date | Mentor | Service | Subject | Payment | Location | Rating | Invoice |
    |------|--------|---------|---------|---------|----------|--------|---------|
    | 03/02/2025 | andrew smith (avatar) | Video Call | CSAT Exams | $55 | Mumbai, India | `Rate now` (red) | Download Invoice |
    | 04/04/2025 | Mina Jay (avatar) | Booked VC | Abroad Studies | $352 | New Orleans, USA | `Rated` (teal) | Download Invoice |
    | 01/05/2025 | luke smith (avatar) | meeting | Visa documents | $70 | San Francisco, USA | `Rated` (teal) | Download Invoice |
    | 12/06/2025 | Dennis J (avatar) | Subscription | Visa Advice | $70 | Lahore, India | `Rated` (teal) | Download Invoice |

- **Bottom Button:** `Return to Your Dashboard` (purple)

---

### PAGE 16: VIDEOS TAB (Search Results)
**Route:** `/search?q=CSAT+Coaching&tab=videos`

**Components:**
- **Header:** "Mentr" + hamburger
- **Page Title:** 'Here are the experts on "CSAT Coaching"' (cyan topic)
- **Tab Bar:** Experts | `Videos` (active/bold) | Live

- **Video Grid (3 columns, 2 rows):**
  - Each video thumbnail with:
    - Large play button overlay (⏵)
    - Creator name below (avatar + name):
      - Luke.swagger, Jacob swan, Amanda
    - Second row partially visible

- **Right Sidebar — "Others are Also Searching for:"**
  - 🔍 CEUT Entrance Guide
  - 🔍 Make Startup in 10 days
  - 🔍 Mental Health Mentors
  - 🔍 Study Abroad For cheap
  - 🔍 Social Media Mentor
  - 🔍 Grant Cardone 10X

---

### PAGE 17: LIVE TAB (Search Results)
**Route:** `/search?q=CSAT+Coaching&tab=live`

**Components:**
- **Header:** "Mentr" + hamburger
- **Page Title:** same as above
- **Tab Bar:** Experts | Videos | `Live` (active, cyan underline)

- **Live Stream Grid (3 columns, 2 rows):**
  - Each livestream card:
    - Full-height portrait-style image
    - `Live` badge (red, top-right)
    - Viewer count (top-left): "👥 5,423", "👥 433", "👥 22"
    - Creator avatar + name at bottom: "Regina.s", "Furiosa", "Agent X"
  - Second row partially visible with more live streams

- **Right Sidebar:** Same "Others are Also Searching for" list

---

### PAGE 18: REPORT SUBMISSION CONFIRMATION (Modal)
**Route:** Modal overlay

**Components:**
- **Message:** "Thanks for Submitting the Report, kindly check your email."
- **Submessage:** "Our Team will connect with you soon as possible."
- **Action Buttons:**
  - `Return to Dashboard.` (purple)
  - `This is Trending` (purple)

---

### PAGE 19: REPORT AN ISSUE MODAL
**Route:** Modal overlay on Session Completed page

**Components:**
- **Close (X) button** (top-right)
- **Issue Categories Note:** "Learner/Mentor was rude", "Technical issue", "Incorrect charge", "Others"
- **Form Fields:**
  - **Issue Type:** Dropdown — "Session Didn't happen" (selected)
  - **Describe the Issue:** Textarea — "Describe the Issue (Min 20 Characters)"
- **Session Details (Autofilled):**
  - Mentor name: Ajay Shah
  - Date & Time: 21/02/2025
  - Session Type: Live Video Call
  - Call Duration: Total Duration: 29 mins.
- **Upload Screenshots:** 📎 + `Upload` button (blue)
- **Checkbox:** ☐ Request Refund
- **`Submit`** button (purple)

---

### PAGE 20: EXPLORE / BROWSE MENTORS PAGE
**Route:** `/explore` or `/browse`

**Components:**
- **Header:** "Mentr" + hamburger
- **Page Title:** "Find your next mentor session. Explore by topic, rating, or availability."

- **Trending Mentors Section:**
  - Title: "Trending Mentors 🔥"
  - Horizontal carousel with left/right arrows (← →)
  - Mentor mini-cards (compact):
    - Avatar, followers count, name, specialty
    - Rating stars, review count, price
    - `call` button (blue)

- **Online Now Section:**
  - Title: "Online Now 🟢"
  - Horizontal carousel with arrows
  - Same card format, all showing green online dots

- **Filters Panel (Right Sidebar):**
  - Title: "Filters"
  - **Sort by:** Alphabet ↕ | Pricing ↕ | Featured | Best Selling
  - **Category:** Dropdown "Choose Category"
  - **Country:** Dropdown "Country"
  - **Audio Calls only:** Toggle switch (🔵)
  - **Ratings:** Range selector (↕ ↕)
  - **Verified only:** Toggle switch (🔵 active)
  - **Pricing:** Min input "Minimum" — to — Max input "Maximum" + range slider
  - **Filter by Tags:** Input "Enter Tags"
  - **Personal Meeting:** Toggle switch
  - `Apply` button (blue)

- **"What Mentors are Saying" Section:**
  - Title: "What Mentors are Saying 😎"
  - `View More >` link (cyan)
  - Video thumbnails carousel (4 visible): play button overlays
  - Creator names below: Luke.swagger, Jacob swan, Amanda, Jacob swan

- **Right Sidebar — Trending Topics:**
  - 📝 Civil Services Exam
  - 📝 GRE Exams
  - 📝 GMAT 2025 exam details
  - 📝 Mentors with best aptitude test
  - 📝 Personality Test advice
  - 📝 Business Ideas for Students

---

### PAGE 21: WRITE A REVIEW PAGE
**Route:** `/review/:mentorId`

**Components:**
- **Header:** "Mentr" + hamburger + chat/notification icons
- **Page Title:** "Share Review for Andrew Smith ✓" (cyan name, blue verified checkmark)
- **Star Rating:** "Rate the Mentor:" + 5 interactive star icons (⭐⭐⭐⭐⭐)
- **Review Textarea:** Placeholder: "How was your Experience?" (large text area)
- **File Upload:**
  - 📎 "Upload File or image"
  - `Upload` button (green/teal)
- **`Submit`** button (purple)

---

### PAGE 22: REVIEW SUBMITTED CONFIRMATION (Modal)
**Route:** Modal overlay

**Components:**
- **Message:** "Thanks for Sharing your Review"
- **Action Buttons:**
  - `Return to Dashboard.` (purple)
  - `This is Trending` (purple)

---

### PAGE 23: MY PROFILE (Learner Profile)
**Route:** `/profile` or `/my-profile`

**Components:**
- **Header:** "Mentr" + hamburger + chat/notification icons
- **Page Title:** "My Profile"

- **Profile Section:**
  - Avatar placeholder (circle with person icon outline)
  - **Info Card:**
    - Name: Ajay Thakur
    - email: ajay21@gmail.com
    - Interests: UPSC, Interview, Resume
  
  - **Stats Card (right):**
    - 📅 Sessions Booked: 5
    - ✅ Sessions Completed: 4
    - ⭐ Avg. Rating Given: 4.8

- **Bio Card:**
  - "My Bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."

- **Quick Actions (icon grid):**
  - 👤 Edit Profile
  - 📊 Dashboard
  - ⭐ See my Reviews
  - 🔖 Saved Videos

---

### PAGE 24: GET SUPPORT / HELP PAGE
**Route:** `/support` or `/help`

**Components:**
- **Header:** "Mentr" + hamburger + chat/notification icons
- **Page Title:** "Get Support"

- **Search Bar:** 🔍 "Search for common issues..." (booking, payout, tech)

- **Left Section:**
  - **FAQ Section** (dropdown): "FAQ Section" ▼
  - **FAQ Categories (collapsible tree):**
    - 📚 FAQs
      - ▸ General
      - ▸ Booking (Learner)
      - ▸ Payouts (Mentor)
      - ▸ Video & Chat
      - ▸ Refunds

  - **Report an Issue Form:**
    - Title: "Report an issue"
    - Category dropdown: "Category" ▼
    - Textarea: "Describe your issue"
    - 📎 Attachment icon
    - `Submit` button (blue)

  - **Need Immediate Help?** 💬
    - `Whats-app chat` button (green)
    - `Email us` button (dark)

- **Right Section:**
  - **Most asked questions (Common):**
    - Forgot password
    - Email/Phone not working
    - Login not working like Reporting Bugs | I found a technical problem form
    - Contact Support
    - Technical issue
    - Payment issue
    - Other like - Refund Policy Info.
  
  - **Topic Sample Questions / Actions (for learners):**
    - Booking Issues - "I can't book a session"
    - "Mentor didn't join" | Payment Problems | "I paid but didn't get confirmation"
    - "My session failed but I was charged" | Chat/Video Issues | "Messages not sending"
    - "Video call didn't start properly" | Refund Request Form | ✅ Trigger refund process
    - Mentor Misconduct | "Mentor was rude/unhelpful" (flags account internally)

---

### PAGE 25: MENTOR REVIEWS LIST (Full Page)
**Route:** `/mentor/:mentorId/reviews`

**Components:**
- **Header:** "M" (truncated logo) + "← Back" button + chat/notification icons
- **Page Title:** "Reviews for Andrew Smith Services"
- **Rating Summary (top-right):** "RATING 4.5 ⭐⭐⭐⭐⭐ 50,000+ Mentees"

- **Review Cards List (vertical scroll):**
  - Each review card (white background):
    - Reviewer avatar + Name + Date + Star rating (right-aligned)
    - Review text
  
  - Reviews:
    1. **Jinny Oslin** (A day ago, 4.5⭐): "He is a an expert at Math and other numerical subjects, helped me a lot."
    2. **Ralph Law** (12/03/2025, 5⭐): "Andrew actually helped me understand the nuances of this subject. Fantastic guidance."
    3. **Jay Shawn** (01/03/2025, 3.5⭐): "He is amazingly a good problem solver who helps clearing the fundamentals."
    4. **Rina Ora** (21/02/2025, 4⭐): "Perfect guidance from him. I loved how he broke down the complex issues into details."

---

### PAGE 26: VIDEO DETAIL / TRENDING VIDEOS
**Route:** `/video/:videoId` or `/trending-videos`

**Components:**
- **Header:** "M" + "← Back"
- **Page Title:** "Trending Videos by mentors"
- **Right Header:** "📝 Comments"

- **Video Title:** "Dont do these 5 Things before you file a Visa - Anna smith"

- **Layout (3-column):**
  - **Left Column — Description:**
    - Full text description (lorem ipsum style content about visa advice)
  
  - **Center Column — Video Player:**
    - Large video player with:
      - Creator avatar overlay (with + follow button)
      - ❤ Like button
      - 📝 Comment button
      - 🔖 Save/Bookmark button
      - ↗ Share button
      - Play button overlay (⏵)
      - Progress bar (blue timeline scrubber)
      - Fullscreen icon (⤢) + Volume icon (🔊)
    - Navigation: Up arrow (↑) / Down arrow (↓) for previous/next video (TikTok-style)

  - **Right Column — Comments:**
    - Comment entries:
      1. 🟢 "Wow this was so insightful I love it the way this is explained." — `Reply`
      2. 🟢 "Awesome, i did not even know how to get through the process. This was all due to the complex process. Thanks Anna." — `Reply`
      3. 🔴 "This is all because government is probably not giving the needed support." — `Reply`
      4. 🔴 "Bangon ! Great one." — `Reply`
    - Each comment has: avatar, text, ••• menu, Reply link

---

### PAGE 27: REPORT SUBMISSION CONFIRMATION (Alternate)
**Route:** Modal overlay (same as Page 18)

**Components:**
- Same as Page 18:
  - "Thanks for Submitting the Report, kindly check your email."
  - "Our Team will connect with you soon as possible."
  - `Return to Dashboard.` + `This is Trending` buttons

---

## 5. NAVIGATION STRUCTURE

### Hamburger Menu (≡) — Inferred Items:
Based on pages visible, the menu likely contains:
- Home / Explore
- Dashboard
- Messages
- Call History
- My Profile
- Get Support
- Become a Mentor
- Settings
- Logout

### Header Navigation (Authenticated):
- Logo (→ Home)
- 💬 Messages (with unread count badge)
- 🔔 Notifications (with count badge)
- 👤 User Avatar (→ Profile)

### In-Page Navigation Tabs:
- Search Results: `Experts` | `Videos` | `Live`
- Mentor Profile: Reviews section, Video gallery (horizontal scroll)

---

## 6. DATA MODELS / API REQUIREMENTS

### User (Learner)
```
{
  id: string,
  fullName: string,
  username: string,
  email: string,
  phone: string,
  password: string (hashed),
  bio: string,
  interests: string[],
  avatar: string (URL),
  sessionsBooked: number,
  sessionsCompleted: number,
  avgRatingGiven: number,
  savedVideos: string[],
  isMentor: boolean (toggle)
}
```

### Mentor
```
{
  id: string,
  name: string,
  username: string,
  specialty: string,
  about: string,
  avatar: string (URL),
  isVerified: boolean,
  isOnline: boolean,
  isLive: boolean,
  followers: number,
  following: number,
  likes: number,
  rating: number,
  totalMentees: number,
  reviewCount: number,
  messagePrice: number (USD),
  callPrice: number (per 30 min, USD),
  subscriptionPrice: number (per month, USD),
  youtubeLink: string,
  location: string,
  videos: Video[],
  reviews: Review[],
  offers: Offer[]
}
```

### Session / Booking
```
{
  id: string,
  learnerId: string,
  mentorId: string,
  date: Date,
  time: string,
  sessionType: "Video Call" | "Booked VC" | "meeting" | "Subscription",
  subject: string,
  duration: number (minutes),
  status: "upcoming" | "completed" | "cancelled",
  paymentAmount: number,
  currency: string,
  ratingGiven: number | null,
  notes: string
}
```

### Payment
```
{
  id: string,
  sessionId: string,
  learnerId: string,
  mentorId: string,
  subtotal: number,
  tax: number,
  taxPercentage: number,
  fees: number,
  serviceCharges: number,
  total: number,
  currency: string,
  discountCode: string | null,
  paymentMethod: "Credit card" | "Google Pay" | "Paypal" | "Debit card" | "Internet Banking",
  cardLast4: string,
  cardBrand: string,
  status: "success" | "failed" | "pending",
  saveCard: boolean,
  createdAt: Date
}
```

### Message
```
{
  id: string,
  senderId: string,
  receiverId: string,
  type: "text" | "image" | "video" | "audio" | "sticker" | "file",
  content: string,
  mediaUrl: string | null,
  audioDuration: number | null,
  isRead: boolean,
  createdAt: Date,
  expiresAt: Date (24 hours if no session booked)
}
```

### Review
```
{
  id: string,
  learnerId: string,
  mentorId: string,
  sessionId: string,
  rating: number (1-5),
  text: string,
  attachments: string[],
  createdAt: Date
}
```

### Video (Mentor Content)
```
{
  id: string,
  mentorId: string,
  title: string,
  description: string,
  thumbnailUrl: string,
  videoUrl: string,
  likes: number,
  comments: Comment[],
  viewCount: number,
  isLive: boolean,
  liveViewerCount: number,
  createdAt: Date
}
```

### Comment
```
{
  id: string,
  videoId: string,
  userId: string,
  text: string,
  createdAt: Date,
  parentCommentId: string | null (for replies)
}
```

### Issue / Report
```
{
  id: string,
  reporterId: string,
  sessionId: string,
  issueType: "Session Didn't happen" | "Learner/Mentor was rude" | "Technical issue" | "Incorrect charge" | "Others",
  description: string (min 20 chars),
  screenshots: string[],
  requestRefund: boolean,
  sessionDetails: {
    mentorName: string,
    dateTime: Date,
    sessionType: string,
    callDuration: number
  },
  status: "submitted" | "in_progress" | "resolved",
  createdAt: Date
}
```

### FAQ
```
{
  id: string,
  category: "General" | "Booking (Learner)" | "Payouts (Mentor)" | "Video & Chat" | "Refunds",
  question: string,
  answer: string
}
```

---

## 7. API ENDPOINTS (Inferred)

### Auth
- `POST /api/auth/signup` — Register (name, username, email, phone, password)
- `POST /api/auth/signin` — Login (username/email/phone + password)
- `POST /api/auth/social` — OAuth (Google, Facebook, Apple)
- `POST /api/auth/otp/send` — Send OTP
- `POST /api/auth/otp/verify` — Verify OTP

### Mentors
- `GET /api/mentors/search?q=` — Search mentors by topic
- `GET /api/mentors/trending` — Trending mentors
- `GET /api/mentors/online` — Online now
- `GET /api/mentors/:id` — Mentor profile
- `GET /api/mentors/:id/reviews` — Mentor reviews
- `GET /api/mentors/:id/videos` — Mentor videos
- `POST /api/mentors/:id/follow` — Follow mentor
- `GET /api/mentors/filter` — Filter (category, country, audio-only, rating, verified, pricing, tags)

### Sessions / Bookings
- `POST /api/sessions/book` — Book a session (mentorId, date, time)
- `GET /api/sessions/upcoming` — Upcoming sessions
- `GET /api/sessions/past` — Past sessions
- `GET /api/sessions/:id` — Session details
- `PUT /api/sessions/:id/cancel` — Cancel booking
- `PUT /api/sessions/:id/reschedule` — Change date
- `POST /api/sessions/:id/join` — Join live session

### Payments
- `POST /api/payments/create` — Create payment
- `POST /api/payments/confirm` — Confirm payment
- `GET /api/payments/:id/receipt` — Download receipt/invoice
- `POST /api/payments/apply-coupon` — Apply discount code

### Video Calls
- `POST /api/calls/initiate` — Start call
- `POST /api/calls/:id/end` — End call
- `GET /api/calls/history` — Call history

### Messages
- `GET /api/messages/conversations` — All conversations
- `GET /api/messages/:conversationId` — Messages in conversation
- `POST /api/messages/send` — Send message (text, image, audio, file)
- `GET /api/messages/requests` — Message requests

### Reviews
- `POST /api/reviews/create` — Submit review
- `GET /api/reviews/mine` — My reviews
- `GET /api/reviews/mentor/:mentorId` — Mentor reviews

### Profile
- `GET /api/profile` — Get my profile
- `PUT /api/profile` — Update profile
- `GET /api/profile/saved-videos` — Saved videos

### Support
- `GET /api/support/faqs` — FAQs by category
- `POST /api/support/report` — Submit issue report
- `POST /api/support/refund-request` — Request refund

### Videos / Content
- `GET /api/videos/trending` — Trending videos
- `GET /api/videos/:id` — Video detail
- `GET /api/videos/:id/comments` — Video comments
- `POST /api/videos/:id/comments` — Add comment
- `POST /api/videos/:id/like` — Like video
- `POST /api/videos/:id/save` — Save/bookmark video
- `GET /api/live/streams` — Active live streams

### Tips
- `POST /api/tips/send` — Send tip to mentor

---

## 8. KEY UI PATTERNS & INTERACTIONS

1. **Modals:** Auth modal, Report Issue modal, Review confirmation, Report confirmation
2. **Carousels:** Trending mentors (horizontal), Online mentors, Video content
3. **Tables:** Dashboard sessions (upcoming/past), Call history
4. **Cards:** Mentor cards, Review cards, Video thumbnails
5. **Star Ratings:** Interactive 5-star component (used in reviews, session rating)
6. **Date/Time Pickers:** Native scroll-wheel style for booking
7. **Real-time:** Video call with WebRTC, live status indicators, live streaming
8. **Chat:** Full messaging with text, images, audio, stickers, files, location
9. **Toggle Switches:** Mentor account toggle, filter toggles
10. **Search:** Global search bar, support search, filter tags
11. **File Upload:** Screenshots for reports, review attachments, profile photos
12. **Download:** Receipts, invoices, notes, files
13. **Notification Badges:** Red circles with count on chat and notification icons
14. **Online Status Dots:** Green dots on mentor avatars indicating availability
15. **Social Login:** Google, Facebook, Apple OAuth buttons
16. **Currency Selector:** Dropdown for payment currency change
17. **Video Player:** Custom player with like/comment/save/share overlays (TikTok-style vertical scrolling)
