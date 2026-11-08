# STAY IN TRACK

**Product Requirements Document**

|   |   |
|---|---|
| **Product name** | STAY IN TRACK |
| **Author(s)** | Lesedi Modikwe |
| **Course code and cohort** | AI FULLSTACK SOFTWARE DEVELOPMENT, SNPL COHORT APRIL INTAKE |
| **Facilitator / reviewer** | Mnelisi |
| **Version** | v0.1 |
| **Status** | Draft |

#### Change log

| Version | Date | Section(s) changed | What changed | Regenerated? |
|---|---|---|---|---|
| v0.1 | 28 Oct 2026 | All | First draft | None |

---

## 1. Product overview

|   |   |
|---|---|
| **1.1 Product name** | STAY IN TRACK |
| **1.2 One-line pitch** | STAY IN TRACK helps small gym owners to track member payments so that unpaid members no longer enter for free. (20 words) |
| **1.3 Problem statement** | Many small, independent gyms record their members on paper or in loose spreadsheets. An owner with 100 members must check 100 handwritten entries every month to find out who has paid, so some members keep entering without paying and the owner cannot see real revenue. Gyms without turnstiles or access cards have no automatic way to stop them. This costs the gym income, and the owner has no data to plan with. |
| **1.4 Solution** | The Admin (gym owner or manager) adds Members and Plans, then records each Payment. The app works out every Member's Status (Active, Grace period or Overdue) automatically. At the entrance, staff search a Member's name and see the Status in one look. The Admin sees a Dashboard with Members who have paid, Members who have not, revenue this month and Members per Plan. Members log in to see their own Status, Plan, Benefits and Payment history. |
| **1.5 Platform** | Web app (works in a browser). It is designed mobile-first, so it is built and tested on a phone-sized screen first, then adapts to tablet and desktop (Section 9.3). |
| **1.6 Vision** | The simplest way for small gyms in South Africa to manage memberships, with online payments and mobile apps added in the next 2 years. |

### 1.7 Key terms

| Term | Exact meaning in this app |
|---|---|
| Admin | The gym owner or manager. One Admin account per gym. Also the account used by staff at the entrance. |
| Member | A person who trains at the gym and has a Member record added by the Admin. |
| Plan | A membership package set by the Admin with a name, a monthly price in rand and Benefits. |
| Payment | One amount of money received from a Member for 1 to 12 months, recorded by the Admin (BR5). |
| Status | A Member's standing: Active, Grace period or Overdue. It is always calculated, never typed in (BR3). |
| Grace period | The number of days after the "paid until" date during which a Member keeps access (BR4). |
| Benefit | One thing a Plan includes, written as text on the Plan (for example "1 locker"). |
| Dashboard | The home screen of a role: S5 for Admin, S9 for Member. |

## 2. Users, personas and roles

|   |   |
|---|---|
| **2.1 Primary user** | Admin: a gym owner or manager aged 25 to 55 who runs a small independent gym (about 30 to 500 Members) in South Africa. Tech comfort: Low to Medium. Uses an Android phone or a shared laptop at the front desk. Data situation: prepaid mobile data or gym Wi-Fi. |
| **2.2 Secondary users** | Members aged 18 and older of that specific gym. Tech comfort: Medium. They use Android phones on prepaid data. |

### 2.3 Personas

| Field | Persona 1 | Persona 2 |
|---|---|---|
| **Name and age** | Sipho Dlamini, 41 | Naledi Khumalo, 21 |
| **Role (from 2.4)** | Admin | Member |
| **Occupation / situation** | Owns Iron Haven Gym in Soweto with about 120 Members; no turnstile | 3rd-year student who trains at Iron Haven Gym |
| **Device and connectivity** | Android phone and a shared front-desk laptop on gym Wi-Fi | Android phone, prepaid data |
| **Tech comfort** | Medium | High |
| **Language(s)** | English, isiZulu | English, isiZulu |
| **Goal** | Know who has paid and how much he earned this month, without paper | Know when her payment is due and what her Plan includes |
| **Frustrations today** | Spends hours checking paper lists; some Members enter without paying | Forgets her due date and is surprised at the desk |
| **How the app helps** | Status and revenue in one Dashboard; staff check a Member in seconds | Her Dashboard shows her Status and due date, with a reminder |
| **Quote** | "I just want to see who paid, without opening three books." | "Tell me before my payment is due, not after." |

### 2.4 Roles and permissions

| Role | How someone gets this role | Can do | Cannot do |
|---|---|---|---|
| Admin | Signs up with Account type "Gym admin" and creates the gym | Add, edit and delete Members; create and edit Plans; record and undo Payments; set the Grace period; see the Dashboard and all Members of their own gym; delete their own account | See or change data of any other gym; edit or delete a Payment other than undoing the latest one (BR6) |
| Member | Signs up with Account type "Member", using the email the Admin added (BR8) | See their own Status, Plan, Benefits and Payment history; turn reminders on or off; delete their own account | See other Members; see revenue; add or change Plans, Members or Payments |

Every "Cannot do" is blocked by the database through Row-Level Security (RLS), not only hidden on screen (Section 11.4).

|   |   |
|---|---|
| **2.5 Admin work in v1** | Gym Admins are the main users and use normal app screens (S5 to S8, S10). Platform-level admin for the developer is done in the Supabase dashboard, with no separate admin screens in v1. |

## 3. Goals, success metrics and non-goals

### 3.1 Goals

| # | Goal | Metric (what you count) | Target | How you will check it |
|---|---|---|---|---|
| G1 | New gyms get set up quickly | % of new Admins who create at least 1 Plan and add at least 5 Members within 7 days of signing up | 60% | Count Plan and Member rows per gym compared with the Admin's created_at in Profile |
| G2 | Staff can check a Member's Status fast | Average time for a tester to find a named Member's Status on S6 | 10 seconds or less | Stopwatch test with 5 testers using the seed data (Section 10.4) |
| G3 | The app is easy to use | Average rating from a test group | 4 out of 5 | Google Form after a 10-minute test with 10 classmates |

### 3.2 Non-goals (never built in this project)

1. **No online payments.** Payments are recorded by the Admin. Online payment needs a paid provider (PayFast, Yoco or Ozow) and extra security work.
2. **No gate, turnstile, card or QR integration.** Staff check Status on screen. Hardware is out of scope and costs too much for small gyms.
3. **No attendance or check-in logs.** The app tracks payment Status only, to keep the MVP small.
4. **No staff accounts and no multi-gym owners.** One Admin account per gym keeps permissions simple.
5. **No native Android or iPhone app.** The web app works in a phone browser.
6. **No email, SMS or push notifications.** Reminders appear only inside the app (Section 4.5), because SMS costs money and email needs an extra service.

## 4. Features, business rules and notifications

### 4.1 Feature list

| ID | Feature | What the user can do | Priority | Goal | Stories | Screens |
|---|---|---|---|---|---|---|
| F1 | Account | Sign up as Admin or Member, verify email, log in, reset password, log out, delete account, read the Privacy Notice | Must | G1 | US1, US2, US3, US4 | S1-S4, S10, S11, M4 |
| F2 | Member management | Admin adds, edits, searches and deletes Members and assigns each a Plan | Must | G1 | US5, US6 | S6, S7, M1, M5 |
| F3 | Plans and payments | Admin creates and edits Plans with Benefits; records and undoes Payments; sets the Grace period | Must | G1 | US7, US8, US9, US10 | S7, S8, S10, M2, M3, M6 |
| F4 | Entrance Status check | Admin or staff search a Member by name or email and see Status (Active, Grace period, Overdue) | Must | G2 | US11 | S6 |
| F5 | Admin Dashboard | Admin sees Members who paid and did not pay, revenue this month, Members per Plan, and a list of Overdue Members | Must | G3 | US12 | S5 |
| F6 | Member Dashboard | Member sees own Status, paid-until date, Plan, Benefits and Payment history | Should | G3 | US13 | S9 |
| F7 | Payment reminders | Member turns reminders on or off and sees in-app payment notices | Should | G3 | US14 | S9, S10 |

|   |   |
|---|---|
| **4.2 MVP definition** | An Admin can add Members and Plans, record Payments and see each Member's Status and the gym's revenue, so unpaid Members are spotted at the entrance. |
| **4.3 Future features** | Online Payments (PayFast), Member requests to pay in advance, email and SMS reminders, staff accounts, attendance check-in, native mobile apps. |

### 4.4 Business rules

| ID | Rule (exact logic, numbers and limits) | Used by |
|---|---|---|
| BR1 | Plan. Name 2-30 characters, unique within the gym. Price R1.00-R5,000.00 per month. Benefits optional, up to 300 characters, plain text. Status is Active or Inactive. An Inactive Plan cannot be assigned to a new Member; Members already on it keep it. A Plan has no delete button in v1. | F3, S8, M2 |
| BR2 | Member. Full name 2-60 characters. Email required, up to 100 characters, unique within the gym. Phone optional, in +27 format (+27 followed by 9 digits). The Admin must tick "This Member is 18 or older". Maximum 500 Members per gym. A Member must be assigned an Active Plan. | F2, S6, M1 |
| BR3 | Status is calculated at the moment it is shown, in SAST, from paid_until and the gym's Grace period days (BR4).<br>**Active:** paid_until is today or later.<br>**Grace period:** paid_until is earlier than today, but today is no more than the Grace period days after paid_until.<br>**Overdue:** more than the Grace period days after paid_until, or the Member has no Payment yet (paid_until is empty). | F3, F4, F5, F6, S5-S9 |
| BR4 | Grace period. Set by the Admin in S10 as a whole number of days from 0 to 14. The default for a new gym is 3. Changing it changes every Member's Status immediately. | F3, S10 |
| BR5 | Record Payment. Admin enters months paid (1-12, default 1), amount (R1.00-R50,000.00, default = Plan price x months, can be changed), method (Cash, EFT or Card) and payment date (default today, cannot be in the future). New paid_until = (the later of the old paid_until and the payment date) + months. If a day does not exist in the new month, the last day of that month is used (31 Jan + 1 month = 28 Feb). The Payment saves the old paid_until as previous_paid_until. | F3, S7, M3 |
| BR6 | Undo Payment. Only the latest Payment of a Member can be undone, and only within 24 hours of recording it. Undo deletes the Payment and sets paid_until back to previous_paid_until. No Payment can be edited. | F3, S7, M6 |
| BR7 | Revenue this month = the sum of Payment amounts whose payment date is in the current calendar month (SAST) for the gym. | F5, S5 |
| BR8 | Member sign-up link. A person can sign up as a Member only if the Admin has already added a Member with the same email (BR2) and no account is linked to it yet. On sign-up the account is linked to that Member record. After linking, the Member's email cannot be changed. | F1, F2, S2, M1 |
| BR9 | Search. On S6, results appear after 2 or more characters of name or email, sorted by full name A to Z, 20 at a time. A Status filter shows All, Active, Grace period or Overdue. Each row shows a Status badge with an icon and text. | F4, S6 |
| BR10 | Reminders. The "Payment due soon" notice shows on S9 when reminders are on and paid_until is within the next 3 days (today to today + 3 days). The Grace period and Overdue notices always show, whatever the reminder setting. | F7, S9, S10 |
| BR11 | Delete Member. Deletes the Member record and all its Payments immediately and permanently. If the Member has an account, the account is unlinked and the Member sees "Your membership record was removed. Please contact your gym." on next log-in. Revenue totals drop by the deleted Payments. | F2, S7, M5 |
| BR12 | Gym data isolation. Every Plan, Member and Payment belongs to one gym. A user can only see data of their own gym (Section 11.4). | All |

### 4.5 Notifications

In-app only in v1. No push, email or SMS. The only emails sent are the account emails in Section 5.

| Trigger | Who receives it | Channel | Exact text | Tapping it opens |
|---|---|---|---|---|
| Reminders on and paid_until within 3 days (BR10) | Member | In-app banner on S9 | "Payment due soon: your membership ends on 15 Nov 2026." | Nothing (banner only) |
| Status is Grace period | Member | In-app banner on S9 | "Your payment is late. Please pay by 29 Oct 2026 to keep your access." | Nothing (banner only) |
| Status is Overdue | Member | In-app banner on S9 | "Your membership has expired. Please pay at the gym to get access again." | Nothing (banner only) |

## 5. Accounts and sign-in

|   |   |
|---|---|
| **Sign-up methods** | Email + password only |
| **Who may sign up** | Admin: anyone aged 18 or older. Member: only a person whose email was added by an Admin (BR8). |
| **Minimum age** | 18. S2 has the checkbox "I am 18 or older", which must be ticked. This avoids needing parent consent under POPIA in v1. |
| **Email verification** | Required. After sign-up the user goes to S3 with the banner "Check your email and tap the link to verify your account." Log-in is refused until the email is verified. |
| **Password rules** | At least 8 characters, including at least 1 number. An eye icon shows or hides the password. |
| **Forgot password** | S4 sends a reset link. The link works for 1 hour. |
| **Failed login attempts** | After 5 wrong passwords: "Too many attempts. Try again in 15 minutes." |
| **Stay logged in** | 30 days, then the user must log in again. |
| **Log out** | S10 → "Logout". No confirmation. Goes to S1. |
| **Delete account** | S10 → "Delete account" → M4. Admin: deletes the account, the gym, all Plans, Members and Payments immediately and permanently. Member: deletes the login and reminder setting immediately; the gym keeps the Member record and Payments for its financial records until the Admin deletes them (BR11). |
| **Change email or phone** | Not in v1. |

## 6. User stories, acceptance criteria and edge cases

### 6.1 Stories

**US1 (F1):** As an Admin, I want to create an account and a gym so that I can start tracking my Members.

- **T-US1-1** Given I am on S2 Sign Up, when I choose Account type "Gym admin", enter gym name, full name, email, a password of 8+ characters with a number, tick "I am 18 or older" and "I agree to the Privacy Notice", and tap "Sign up", then my account and gym are created and I go to S3 with the banner "Check your email and tap the link to verify your account."
- **T-US1-2 (unhappy)** Given the email already has an account, when I tap "Sign up", then I see "This email already has an account. Log in instead?" with a "Log in" link.
- **T-US1-3 (unhappy)** Given either checkbox is unticked, or the password is shorter than 8 characters or has no number, then "Sign up" is greyed out. When I leave the password field, it shows a red border and "At least 8 characters, including a number."

**US2 (F1):** As an Admin or Member, I want to log in and reset my password so that I can get back into my account.

- **T-US2-1** Given my email is verified, when I enter the correct email and password on S3 and tap "Login", then an Admin goes to S5 Admin Dashboard and a Member goes to S9 Member Dashboard.
- **T-US2-2 (unhappy)** Given I have not verified my email, when I tap "Log in", then I see "Please verify your email first." and a "Resend email" link.
- **T-US2-3** Given I tap "Forgot password?" and enter my email on S4, when I tap "Send link", then I always see "If an account exists for this email, we've sent a reset link." The message never reveals whether the account exists.
- **T-US2-4 (unhappy)** Given I enter a wrong password 5 times, then I see "Too many attempts. Try again in 15 minutes." and "Login" is disabled.

**US3 (F1):** As a Member, I want to sign up with the email my gym gave so that I can see my own Status.

- **T-US3-1** Given the Admin added naledi.k@example.com, when I choose Account type "Member" on S2 and sign up with that email, then my account is linked to my Member record (BR8) and I go to S3 with the verify-email banner.
- **T-US3-2 (unhappy)** Given no Admin added my email, when I tap "Sign up", then I see "We can't find this email at any gym. Ask your gym Admin to add you first."

**US4 (F1):** As an Admin or Member, I want to delete my account so that my personal information is removed.

- **T-US4-1** Given I am an Admin on S10, when I tap "Delete account" and then "Delete" in M4, then my account, gym, Plans, Members and Payments are deleted, I go to S1 and I see the toast "Account deleted".
- **T-US4-2** Given I am a Member on S10, when I tap "Delete account" and then "Delete" in M4, then my login is deleted, my Member record stays with the gym (Section 5), I go to S1 and I see the toast "Account deleted".
- **T-US4-3 (unhappy)** Given I am offline, when I open M4, then "Delete" is disabled and the offline banner shows.

**US5 (F2):** As an Admin, I want to add a Member so that their payments can be tracked.

- **T-US5-1** Given I am on S6, when I tap "Add member", enter full name, email, an optional phone, choose an Active Plan, tick "This Member is 18 or older" and tap "Save" in M1, then M1 closes, I see the toast "Member added" and the Member appears in the list with the badge "Overdue" (no Payment yet, BR3).
- **T-US5-2 (unhappy)** Given a Member with the same email exists in my gym, when I tap "Save", then I see "A Member with this email already exists." under the Email field.
- **T-US5-3 (unhappy)** Given I already have 500 Members, when I tap "Add member", then I see "You have reached the limit of 500 Members."

**US6 (F2):** As an Admin, I want to edit or delete a Member so that my list stays correct.

- **T-US6-1** Given I am on S7 Member Details, when I tap "Edit", change the phone number and tap "Save" in M1, then I see the toast "Member updated" and the new phone number on S7.
- **T-US6-2** Given I am on S7, when I tap "Delete member" and then "Delete" in M5, then the Member and their Payments are deleted, I go to S6 and I see the toast "Member deleted".
- **T-US6-3 (unhappy)** Given the Member already has an account, when I open M1 to edit, then the Email field is disabled with the text "Email can't be changed after the Member signs up."
- **T-US6-4 (unhappy)** Given the Admin deleted my Member record, when I log in as that Member, then I see "Your membership record was removed. Please contact your gym." and I go to S1.

**US7 (F3):** As an Admin, I want to create Plans with Benefits so that I can assign them to Members.

- **T-US7-1** Given I am on S8 Plans, when I tap "Add plan", enter name "Standard", price 350 and Benefits "Gym floor access, 1 fitness assessment", and tap "Save" in M2, then I see the toast "Plan saved" and a Plan card showing "Standard", "R350.00 per month" and the Benefits.
- **T-US7-2 (unhappy)** Given a Plan named "Standard" already exists, when I tap "Save", then I see "A Plan with this name already exists." under the Name field.
- **T-US7-3 (unhappy)** Given I enter a price of 0 or above 5000, when I tap "Save", then I see "Price must be between R1.00 and R5,000.00."

**US8 (F3):** As an Admin, I want to record a Payment so that the Member's Status and my revenue are correct.

- **T-US8-1** Given I am on S7 for an Overdue Member on the Standard Plan, when I tap "Record payment", keep Months at 1, keep the amount R350.00, choose "Cash", keep today's date and tap "Save payment" in M3, then I see the toast "Payment recorded", the Status badge changes to "Active" and the Payment appears at the top of the Payment history.
- **T-US8-2** Given a Member is paid until 15 Nov 2026, when I record a Payment of 2 months dated 28 Oct 2026, then the Member is paid until 15 Jan 2027 (BR5).
- **T-US8-3 (unhappy)** Given I pick a payment date after today, when I tap "Save payment", then I see "Payment date can't be in the future." under the Payment date field.
- **T-US8-4 (unhappy)** Given I enter an amount below R1.00 or above R50,000.00, when I tap "Save payment", then I see "Amount must be between R1.00 and R50,000.00."

**US9 (F3):** As an Admin, I want to undo my latest Payment so that I can fix a mistake.

- **T-US9-1** Given the latest Payment was recorded 2 hours ago, when I tap "Undo" next to it on S7 and then "Undo Payment" in M6, then I see the toast "Payment undone", the Payment disappears and the paid-until date goes back to its old value (BR6).
- **T-US9-2 (unhappy)** Given the latest Payment was recorded more than 24 hours ago, or the Payment is not the latest, then no "Undo" button is shown for it.

**US10 (F3):** As an Admin, I want to set the Grace period so that Status follows my gym's policy.

- **T-US10-1** Given I am on S10, when I change "Grace period (days)" to 5 and tap "Save", then I see the toast "Grace period saved" and a Member who is 4 days past their paid-until date now shows "Grace period".
- **T-US10-2 (unhappy)** Given I enter 15 or leave the field empty, when I tap "Save", then I see "Enter a number from 0 to 14." under the field.

**US11 (F4):** As an Admin or staff member at the entrance, I want to search a Member and see their Status so that I only let paid Members in.

- **T-US11-1** Given I am on S6, when I type "tha" in the search field, then within 3 seconds I see Thando Mokoena with a Status badge showing an icon and the text "Grace period".
- **T-US11-2** Given I am on S6, when I choose the filter "Overdue", then only Overdue Members are listed.
- **T-US11-3 (unhappy)** Given no Member matches my search, then I see "No Members found. Check the spelling or tap Add member."

**US12 (F5):** As an Admin, I want a Dashboard so that I can see payments and revenue at a glance.

- **T-US12-1** Given the seed data (Section 8.4) and today is 28 Oct 2026, when I open S5, then I see Total Members 4, Active 2, Grace period 1, Overdue 1, Revenue this month "R1,350.00", and Members per Plan: Student 2, Standard 1, Premium 1.
- **T-US12-2** Given the Overdue Members list shows Ayesha Patel, when I tap her row, then I go to S7 for Ayesha Patel.
- **T-US12-3 (unhappy)** Given my gym has no Members, then S5 shows "No Members yet. Add your first Member." with a button "Add member" that goes to S6.

**US13 (F6):** As a Member, I want to see my own Status and Benefits so that I know where I stand.

- **T-US13-1** Given I am Naledi Khumalo, when I open S9, then I see the badge "Active", "Paid until 15 Nov 2026", my Plan "Student" with "R250.00 per month", its Benefits and my Payment history.
- **T-US13-2** Given my Status is Overdue, when I open S9, then I see the banner "Your membership has expired. Please pay at the gym to get access again."
- **T-US13-3 (unhappy)** Given I have no Payments, then the Payment history shows "No Payments yet."

**US14 (F7):** As a Member, I want payment reminders so that I pay before my due date.

- **T-US14-1** Given reminders are on, today is 13 Nov 2026 and I am paid until 15 Nov 2026, when I open S9, then I see "Payment due soon: your membership ends on 15 Nov 2026."
- **T-US14-2** Given I am on S10, when I switch "Payment reminders" off, then I see the toast "Reminders turned off" and the "Payment due soon" banner no longer shows on S9.
- **T-US14-3 (unhappy)** Given I am offline, when I open S10, then the "Payment reminders" switch is disabled and the offline banner shows.
- **T-US14-4** Given reminders are off and my Status is Grace period, when I open S9, then the Grace period banner still shows (BR10).

### 6.2 Edge cases

| Situation | What the user sees (exact text) | What the app does |
|---|---|---|
| Admin records a Payment while offline | "You're offline. Changes will not be saved." | "Save payment" is disabled; nothing is saved |
| Session expires while the Admin fills in M3 | "Please log in again." | Goes to S3; nothing is saved |
| Admin lowers the Grace period from 3 to 0 while a Member is in Grace period | Member badge shows "Overdue" | Status is recalculated at once (BR3, BR4) |
| Member signs up before the Admin adds them | "We can't find this email at any gym. Ask your gym Admin to add you first." | No account is created |
| Payment on 31 Jan for 1 month | Paid until 28 Feb 2027 | Uses the last day of the month (BR5) |
| Admin deletes a Member while that Member is viewing S9 | "Your membership record was removed. Please contact your gym." | Logs the Member out and goes to S1 |
| Admin tries to undo a Payment after another Payment was recorded | No "Undo" button on the older Payment | Only the latest Payment can be undone (BR6) |
| Two Admins' browsers open the same Member | Latest saved data shows after refresh | The database keeps the last saved version |

## 7. User flows and navigation map

### 7.1 Flows

#### Flow 1: Admin creates an account (F1)

**Starts when:** Sipho opens the app for the first time.

1. S1 Welcome: taps "Create account" → S2 Sign Up
2. S2: chooses "Gym admin", fills in the form, taps "Sign up" → S3 Log In with the verify-email banner
3. Taps the link in his email, returns to the app, logs in on S3
4. If the email is not verified → "Please verify your email first."; otherwise → S5 Admin Dashboard

**Ends when:** S5 shows "No Members yet. Add your first Member."

#### Flow 2: Create a Plan and add a Member (F3, F2)

**Starts when:** Sipho is on S5 and wants to set up his gym.

1. Taps the "Plans" tab → S8 Plans, taps "Add plan" → M2 Plan Form
2. Fills in name, price and Benefits, taps "Save" → S8 shows the Plan
3. Taps the "Members" tab → S6 Members, taps "Add member" → M1 Member Form
4. If the email already exists → "A Member with this email already exists."; otherwise Member saved → S6

**Ends when:** S6 lists the new Member with the badge "Overdue".

#### Flow 3: Record a Payment (F3)

**Starts when:** Thando pays at the desk and Sipho wants to record it.

1. S6: taps Thando's row → S7 Member Details
2. S7: taps "Record payment" → M3 Record Payment
3. Fills in months, amount, method and date, taps "Save payment" → S7
4. If the Payment was a mistake and is under 24 hours old → taps "Undo" → M6 Undo Payment, taps "Undo Payment" → S7

**Ends when:** S7 shows the correct Status, paid-until date and Payment history.

#### Flow 4: Entrance Status check (F4)

**Starts when:** A Member arrives at the gym door and staff open S6 on the front-desk device.

1. S6 Members: types the first letters of the Member's name
2. If the badge is "Active" or "Grace period" → staff let the Member in; otherwise (badge "Overdue") → staff ask the Member to pay, then continue with Flow 3

**Ends when:** Staff have seen the Status badge and decided on entry.

#### Flow 5: Review the Dashboard (F5)

**Starts when:** Sipho wants a month-end summary.

1. S5 Admin Dashboard: reads Total Members, Active, Grace period, Overdue, Revenue this month and Members per Plan
2. If there are Overdue Members → taps a name in the Overdue Members list → S7 Member Details; otherwise nothing more to do

**Ends when:** Sipho knows who has not paid and how much was earned.

#### Flow 6: Member signs up and checks Status (F1, F6)

**Starts when:** Naledi's Admin has added her email and she opens the app.

1. S1 Welcome: taps "Create account" → S2 Sign Up
2. S2: chooses "Member", fills in the form, taps "Sign up" → S3 with the verify-email banner
3. If her email is not on the gym's list → "We can't find this email at any gym. Ask your gym Admin to add you first."; otherwise she verifies her email and logs in on S3 → S9 Member Dashboard

**Ends when:** S9 shows her Status, paid-until date, Plan and Benefits.

#### Flow 7: Reset a forgotten password (F1)

**Starts when:** Naledi cannot remember her password and is on S3.

1. S3 Log In: taps "Forgot password?" → S4 Forgot Password
2. S4: enters her email, taps "Send link" → sees "If an account exists for this email, we've sent a reset link."
3. Opens the link within 1 hour and sets a new password; if the link is older than 1 hour, she repeats step 2
4. Taps "Back to log in" → S3

**Ends when:** She logs in on S3 with the new password.

#### Flow 8: Manage settings and account (F1, F3, F7)

**Starts when:** A logged-in user taps the "Settings" tab → S10 Settings.

1. If the user is an Admin → changes "Grace period (days)" and taps "Save"; if the user is a Member → switches "Payment reminders" on or off
2. Taps "Privacy Notice" → S11 Privacy Notice, reads it and taps the back arrow → S10
3. To leave: taps "Logout" → S1 Welcome; or, to delete the account, taps "Delete account" → M4 Delete Account, then "Delete" → S1

**Ends when:** The setting is saved, or the user is back on S1.

## 8. Screens

### 8.1 Screen inventory

| ID | Screen name | Type | Who can open it | Purpose (one line) | Tab bar? | Stories |
|---|---|---|---|---|---|---|
| S1 | Welcome | Full screen | Logged out | Logo, pitch, "Create account" and "Log in" buttons | No | US1, US2, US3 |
| S2 | Sign Up | Full screen | Logged out | Create an Admin or Member account | No | US1, US3 |
| S3 | Log In | Full screen | Logged out | Log in; shows the verify-email banner after sign-up | No | US2 |
| S4 | Forgot Password | Full screen | Logged out | Request a password reset link | No | US2 |
| S5 | Admin Dashboard | Tab | Logged in: Admin | Counts, revenue, Members per Plan, Overdue Members list | Yes | US12 |
| S6 | Members | Tab | Logged in: Admin | Search, filter and add Members; see each Status | Yes | US5, US11 |
| S7 | Member Details | Full screen | Logged in: Admin | One Member's Status, Plan, Payment history; edit, record Payment, delete | No | US6, US8, US9 |
| S8 | Plans | Tab | Logged in: Admin | List and add Plans with Benefits | Yes | US7 |
| S9 | Member Dashboard | Tab | Logged in: Member | Own Status, paid-until date, Plan, Benefits, Payment history, notices | Yes | US13, US14 |
| S10 | Settings | Tab | Logged in: Admin, Member | Account details, Grace period (Admin), reminders (Member), Privacy Notice, logout, delete account | Yes | US4, US10, US14 |
| S11 | Privacy Notice | Full screen | Logged out; Logged in: Admin, Member | What personal information is collected, why, and how to delete it | No | US1 |
| M1 | Member Form | Modal (full height) | Logged in: Admin | Add or edit a Member | - | US5, US6 |
| M2 | Plan Form | Modal (full height) | Logged in: Admin | Add or edit a Plan | - | US7 |
| M3 | Record Payment | Modal (full height) | Logged in: Admin | Record a Payment | - | US8 |
| M4 | Delete Account | Modal | Logged in: Admin, Member | Confirm deleting own account | - | US4 |
| M5 | Delete Member | Modal | Logged in: Admin | Confirm deleting a Member | - | US6 |
| M6 | Undo Payment | Modal | Logged in: Admin | Confirm undoing the latest Payment | - | US9 |

**Checked against the list of screens almost every app needs:** Welcome (S1), Sign up (S2), Log in (S3), Forgot password (S4), Home (S5 for Admin, S9 for Member) and Profile and settings (S10, including logout, delete account and Privacy Notice) are all included. **Not needed:** a separate Onboarding screen, because S5 shows "No Members yet. Add your first Member." for a new gym.

### 8.2 Screen specifications

*Shared component names refer to Section 8.3. **Every screen** also has the Offline state (the Offline banner shows under the Header, the last loaded data stays visible and every save button is disabled) and the Error state (the text "Something went wrong. Try again." with a "Try again" button).*

#### S1 Welcome

|   |   |
|---|---|
| **Purpose** | Introduce the app and send the user to sign up or log in. |
| **Who / flow** | Logged out. Comes from: app start, logout, M4. Goes to: S2, S3. |
| **Layout** | 1. Logo (wordmark)  2. Pitch text "Know who has paid. Every time."  3. Primary button "Create account"  4. Secondary button "Log in" |
| **Buttons** | "Create account" → S2; "Log in" → S3 |
| **States** | Normal: as above. Empty / Loading / Success: not needed because the screen shows no data. |
| **Sample content** | Wordmark "STAY IN TRACK"; pitch as above. |

#### S2 Sign Up

|   |   |
|---|---|
| **Purpose** | Create an Admin or Member account. |
| **Who / flow** | Logged out. S1 → S2 → S3, S11. |
| **Layout** | 1. Header: back arrow, title "Create account"  2. Field "Account type"  3. Field "Gym name" (only when "Gym admin" is chosen)  4. Fields "Full name", "Email", "Password"  5. Checkbox "I am 18 or older"  6. Checkbox "I agree to the Privacy Notice" with link → S11  7. Primary button "Sign up" (greyed out until both checkboxes are ticked and all fields are valid)  8. Link "Already have an account? Login" |
| **Buttons** | "Sign up" → S3 with the verify-email banner; "Login" link → S3; "Privacy Notice" link → S11 |
| **States** | Normal: empty form. Loading: "Sign up" shows a spinner and is disabled. Success: go to S3 with the banner. Empty: not needed because it is a form. |
| **Sample content** | Account type "Gym admin", Gym name "Iron Haven Gym", Full name "Sipho Dlamini", Email "sipho@ironhaven.example.com". |

#### S3 Log In

|   |   |
|---|---|
| **Purpose** | Log in. |
| **Who / flow** | Logged out. S1, S2, S4 → S3 → S4, S5, S9. |
| **Layout** | 1. Header: back arrow, title "Login"  2. Notice banner (after sign-up: "Check your email and tap the link to verify your account.")  3. Fields "Email", "Password"  4. Primary button "Login"  5. Link "Forgot password?" |
| **Buttons** | "Login" → S5 (Admin) or S9 (Member); "Forgot password?" → S4 |
| **States** | Normal; Loading (button spinner); Error text for wrong details: "Email or password is incorrect."; Empty and Success: not needed because it is a form that leaves the screen on success. |
| **Sample content** | Email "naledi.k@example.com". |

#### S4 Forgot Password

|   |   |
|---|---|
| **Purpose** | Request a reset link. |
| **Who / flow** | Logged out. S3 → S4 → S3. |
| **Layout** | 1. Header: back arrow, title "Reset password"  2. Text "Enter your email and we'll send you a reset link."  3. Field "Email"  4. Primary button "Send link"  5. Link "Back to login" |
| **Buttons** | "Send link" → shows the toast-sized message "If an account exists for this email, we've sent a reset link." and stays on S4; "Back to login" → S3. The link works for 1 hour. |
| **States** | Normal; Loading (button spinner); Success (message above); Empty: not needed because it is a form. |
| **Sample content** | Email "thando.m@example.com". |

#### S5 Admin Dashboard

|   |   |
|---|---|
| **Purpose** | See payments and revenue at a glance. |
| **Who / flow** | Logged in: Admin. S3 → S5 → S7, tabs. |
| **Layout** | 1. Header: title "Dashboard", gym name  2. Stat cards in a 2-column grid: "Total Members", "Active", "Grace period", "Overdue", "Revenue this month"  3. Block "Members per Plan": one row per Plan with the Plan name and the number of Members  4. Block "Overdue Members": up to 5 Member rows (Name, Plan name, Status badge, "Paid until" date)  5. Tab bar (Dashboard active) |
| **Lists and cards** | Stat card: label, large number (Revenue shown as "R1,350.00"). Member row: full name, Plan name, Status badge, paid-until date. |
| **Buttons** | Member row → S7 |
| **States** | Normal: as above. Empty: "No Members yet. Add your first Member." with a primary button "Add member" → S6. Loading: 5 grey placeholder cards. Overdue list empty: "Nobody is overdue." Success: not needed because the screen only reads data. |
| **Sample content** | Total Members 4; Active 2; Grace period 1; Overdue 1; Revenue this month R1,350.00; Student 2, Standard 1, Premium 1; Overdue Members: Ayesha Patel, Student, "Overdue", paid until 10 Oct 2026. |

#### S6 Members

|   |   |
|---|---|
| **Purpose** | Search and filter Members, check Status at the entrance, add Members. |
| **Who / flow** | Logged in: Admin. Tabs, S5, M5 → S6 → S7, M1. |
| **Layout** | 1. Header: title "Members"  2. Search field "Search by name or email"  3. Status filter chips: "All", "Active", "Grace period", "Overdue"  4. Member rows, 20 at a time  5. Floating primary button "Add member"  6. Tab bar (Members active) |
| **Lists and cards** | Member row: full name, Plan name, Status badge (icon + text), paid-until date ("Paid until 15 Nov 2026" or "No Payment yet"). |
| **Buttons** | Member row → S7; "Add member" → M1 |
| **States** | Normal: as above. Empty (no Members): "No Members yet. Add your first Member." with "Add member". No search results: "No Members found. Check the spelling or tap Add member." Loading: 3 grey placeholder rows. Success: toasts "Member added", "Member deleted". |
| **Sample content** | Naledi Khumalo, Student, Active, Paid until 15 Nov 2026; Thando Mokoena, Standard, Grace period, Paid until 26 Oct 2026; Ayesha Patel, Student, Overdue, Paid until 10 Oct 2026; Johan van der Merwe, Premium, Active, Paid until 1 Dec 2026. |

#### S7 Member Details

|   |   |
|---|---|
| **Purpose** | See one Member and manage their Payments. |
| **Who / flow** | Logged in: Admin. S5, S6 → S7 → M1, M3, M5, M6. |
| **Layout** | 1. Header: back arrow, title is the Member's full name  2. Status badge and text "Paid until 26 Oct 2026"  3. Details block: Plan name and price, Benefits, email, phone  4. Primary button "Record payment"  5. Secondary button "Edit"  6. Block "Payment history": Payment rows newest first; the latest row has "Undo" if it is under 24 hours old (BR6)  7. Danger button "Delete member" |
| **Lists and cards** | Payment row: payment date, amount, method, months ("1 month"). |
| **Buttons** | "Record payment" → M3; "Edit" → M1; "Undo" → M6; "Delete member" → M5; back arrow → S5 or S6 |
| **States** | Normal: as above. Empty: Payment history shows "No Payments yet." Loading: 3 grey placeholder blocks. Success: toasts "Payment recorded", "Payment undone", "Member updated". |
| **Sample content** | Thando Mokoena, Standard, R350.00 per month, thando.m@example.com, +27 82 555 0147; Payment: 26 Sep 2026, R350.00, Cash, 1 month. |

#### S8 Plans

|   |   |
|---|---|
| **Purpose** | List and add Plans. |
| **Who / flow** | Logged in: Admin. Tabs → S8 → M2. |
| **Layout** | 1. Header: title "Plans"  2. Plan cards  3. Floating primary button "Add plan"  4. Tab bar (Plans active) |
| **Lists and cards** | Plan card: name, "R350.00 per month", Benefits text, Status text ("Active" or "Inactive"), number of Members on the Plan. |
| **Buttons** | Plan card → M2 (edit); "Add plan" → M2 |
| **States** | Normal; Empty: "No Plans yet. Add your first Plan." with "Add plan"; Loading: 3 grey placeholder cards; Success: toast "Plan saved". |
| **Sample content** | Student R250.00, "Gym floor access", 2 Members; Standard R350.00, "Gym floor access, 1 fitness assessment", 1 Member; Premium R550.00, "Gym floor access, group classes, 1 locker", 1 Member. |

#### S9 Member Dashboard

|   |   |
|---|---|
| **Purpose** | The Member sees their own Status and details. |
| **Who / flow** | Logged in: Member. S3 → S9 → S10 (tab). |
| **Layout** | 1. Header: title "My membership", gym name  2. Notice banner (BR10, Section 4.5) when one applies  3. Large Status badge  4. Text "Paid until 15 Nov 2026"  5. Plan block: name, "R250.00 per month", Benefits  6. Block "Payment history": Payment rows newest first  7. Tab bar (Home active) |
| **Lists and cards** | Payment row: payment date, amount, method, months. |
| **Buttons** | None other than the tab bar. |
| **States** | Normal; Empty: "No Payments yet."; Loading: 3 grey placeholder blocks; Success: not needed because the screen only reads data. Record removed: see US6. |
| **Sample content** | Naledi Khumalo, Active, Paid until 15 Nov 2026, Student, R250.00 per month, "Gym floor access"; Payment: 15 Oct 2026, R250.00, EFT, 1 month. |

#### S10 Settings

|   |   |
|---|---|
| **Purpose** | Manage account and settings. |
| **Who / flow** | Logged in: Admin, Member. Tabs → S10 → S11, M4, S1. |
| **Layout** | 1. Header: title "Settings"  2. Block "Account": name and email (read-only)  3. Admin only: field "Grace period (days)" and primary button "Save"  4. Member only: toggle "Payment reminders"  5. Row "Privacy Notice" → S11  6. Secondary button "Logout"  7. Danger button "Delete account"  8. Tab bar (Settings active) |
| **Buttons** | "Save" → toast "Grace period saved"; toggle → toast "Reminders turned off" or "Reminders turned on"; "Privacy Notice" → S11; "Logout" → S1; "Delete account" → M4 |
| **States** | Normal; Loading: grey placeholders; Success: toasts above; Empty: not needed because the screen always has account details. |
| **Sample content** | Sipho Dlamini, sipho@ironhaven.example.com, Grace period (days) 3; Naledi Khumalo, naledi.k@example.com, Payment reminders on. |

#### S11 Privacy Notice

|   |   |
|---|---|
| **Purpose** | Explain what is collected and why. |
| **Who / flow** | Logged out and logged in. S2, S10 → S11 → back. |
| **Layout** | 1. Header: back arrow, title "Privacy Notice"  2. Text sections: "What we collect", "Why", "Who can see it", "Where it is stored", "How long we keep it", "How to delete it" (content from Section 12.4) |
| **Buttons** | Back arrow → previous screen |
| **States** | Normal only. Empty, Loading, Success: not needed because the text is fixed in the app. |
| **Sample content** | "We collect your name, email and, for Members, phone number and Payment records, so your gym can manage memberships." |

#### M1 Member Form

|   |   |
|---|---|
| **Purpose / access** | Add or edit a Member. Admin. S6, S7 → M1 → S6 or S7. |
| **Layout** | 1. Header: close icon, title "Add member" or "Edit member"  2. Fields "Full name", "Email", "Phone (optional)", "Plan"  3. Checkbox "This Member is 18 or older"  4. Primary button "Save" |
| **Buttons** | "Save" → closes, toast "Member added" or "Member updated"; close icon → closes without saving |
| **States** | Normal; Loading (button spinner); Error: field errors from 8.3; Empty and Success: not needed because it is a form. |
| **Sample content** | Full name "Johan van der Merwe", Email "johan.vdm@example.com", Plan "Premium". |

#### M2 Plan Form

|   |   |
|---|---|
| **Purpose / access** | Add or edit a Plan. Admin. S8 → M2 → S8. |
| **Layout** | 1. Header: close icon, title "Add plan" or "Edit plan"  2. Fields "Plan name", "Price per month (R)", "Benefits (optional)"  3. Toggle "Active"  4. Primary button "Save" |
| **Buttons** | "Save" → closes, toast "Plan saved"; close icon → closes |
| **States** | Normal; Loading; Error: field errors; Empty and Success: not needed because it is a form. |
| **Sample content** | "Premium", 550.00, "Gym floor access, group classes, 1 locker". |

#### M3 Record Payment

|   |   |
|---|---|
| **Purpose / access** | Record a Payment. Admin. S7 → M3 → S7. |
| **Layout** | 1. Header: close icon, title "Record payment"  2. Fields "Months paid", "Amount (R)", "Payment method", "Payment date"  3. Text "New paid until date: 28 Nov 2026" (updates as fields change, BR5)  4. Primary button "Save payment" |
| **Buttons** | "Save payment" → closes, toast "Payment recorded"; close icon → closes |
| **States** | Normal; Loading; Error: field errors; Empty and Success: not needed because it is a form. |
| **Sample content** | Months paid 1, Amount R350.00, Payment method "Cash", Payment date 28 Oct 2026. |

#### M4 Delete Account

|   |   |
|---|---|
| **Purpose / access** | Confirm deleting the account. Admin, Member. S10 → M4 → S1. |
| **Layout** | Confirmation pop-up with title "Delete your account?". Admin text: "This permanently deletes your gym, all Plans, Members and Payments. This cannot be undone." Member text: "Your login will be deleted. Your gym keeps your membership and Payment records." Buttons: danger "Delete", secondary "Cancel". |
| **Buttons** | "Delete" → S1 with toast "Account deleted"; "Cancel" → closes |
| **States** | Normal; Loading (button spinner); Offline: "Delete" disabled; Empty and Success: not needed because it is a confirmation. |

#### M5 Delete Member

|   |   |
|---|---|
| **Purpose / access** | Confirm deleting a Member. Admin. S7 → M5 → S6. |
| **Layout** | Confirmation pop-up with title "Delete this Member?" and text "This permanently deletes the Member and all their Payments. Revenue totals will change." Buttons: danger "Delete", secondary "Cancel". |
| **Buttons** | "Delete" → S6 with toast "Member deleted"; "Cancel" → closes |
| **States** | Normal; Loading; Offline: "Delete" disabled; Empty and Success: not needed because it is a confirmation. |

#### M6 Undo Payment

|   |   |
|---|---|
| **Purpose / access** | Confirm undoing the latest Payment. Admin. S7 → M6 → S7. |
| **Layout** | Confirmation pop-up with title "Undo this Payment?" and text "The paid until date goes back to 10 Oct 2026." Buttons: danger "Undo Payment", secondary "Cancel". |
| **Buttons** | "Undo Payment" → S7 with toast "Payment undone"; "Cancel" → closes |
| **States** | Normal; Loading; Offline: "Undo Payment" disabled; Empty and Success: not needed because it is a confirmation. |

### 8.3 Shared components

| Component | Used on | What it contains | How it behaves |
|---|---|---|---|
| Header | S2-S11, M1-M3 | Back arrow or close icon, title, optional subtitle | Back arrow goes to the previous screen; hidden on S1 |
| Tab bar (phone) / Side menu (tablet and desktop) | S5, S6, S8, S9, S10 | Admin: Dashboard, Members, Plans, Settings. Member: Home, Settings. Icon + label for each. | Active tab is filled and in primary colour |
| Primary button | All | Text label, 48px tall | Greyed out and not tappable when disabled |
| Secondary button | S1, S7, S10, M4-M6 | Outlined button | Same size as primary |
| Danger button | S7, S10, M4-M6 | Red filled button with white text | Always asks for confirmation (M4-M6) |
| Status badge | S5, S6, S7, S9 | Icon + text: check-circle "Active" (green), clock "Grace period" (amber), alert-circle "Overdue" (red) | Never uses colour alone (icon and text always shown) |
| Member row | S5, S6 | Full name, Plan name, Status badge, paid-until date | Tap → S7 |
| Stat card | S5 | Label and large number | Not tappable |
| Plan card | S8 | Name, price, Benefits, Status, Member count | Tap → M2 |
| Notice banner | S3, S9 | Icon and text on a tinted background | Not tappable; stays until the situation changes |
| Toast | All logged-in screens | One line, dark background, white text | Disappears after 3 seconds |
| Confirmation pop-up | M4, M5, M6 | Title, text, danger button, "Cancel" | Tapping outside closes it without action |
| Empty-state block | S5, S6, S8, S9 | Simple line icon, text, optional button | Tells the user what to do next |
| Loading placeholder | All lists | Grey rounded blocks | Shown while data loads |
| Offline banner | All logged-in screens | Grey bar: "You're offline. Changes will not be saved." | Save actions disabled while shown |

#### Field table

| Field label | Type | Required? | Placeholder | Rules | Error message (exact text) |
|---|---|---|---|---|---|
| Account type | Choice (Gym admin, Member) | Yes | - | Default "Gym admin" | "Choose an account type." |
| Gym name | Text | Yes (Admin only) | "Iron Haven Gym" | 2-60 characters | "Enter a gym name of 2 to 60 characters." |
| Full name | Text | Yes | "Your full name" | 2-60 characters | "Enter a name of 2 to 60 characters." |
| Email | Email | Yes | "name@example.com" | Valid email, up to 100 characters | "Enter a valid email address." |
| Password | Password | Yes | "Password" | 8+ characters, at least 1 number | "At least 8 characters, including a number." |
| I am 18 or older | Checkbox | Yes | - | Must be ticked | "You must be 18 or older." |
| I agree to the Privacy Notice | Checkbox | Yes | - | Must be ticked | "You must agree to the Privacy Notice." |
| Search by name or email | Text | No | "Search by name or email" | After 2+ characters (BR9) | - |
| Phone (optional) | Phone | No | "+27 82 555 0147" | +27 followed by 9 digits (BR2) | "Enter a phone number like +27 82 555 0147." |
| Plan | Dropdown (Active Plans) | Yes | "Choose a Plan" | Active Plans only (BR1) | "Choose a Plan." |
| This Member is 18 or older | Checkbox | Yes | - | Must be ticked | "The Member must be 18 or older." |
| Plan name | Text | Yes | "Standard" | 2-30 characters, unique (BR1) | "Enter a Plan name of 2 to 30 characters." |
| Price per month (R) | Decimal | Yes | "350.00" | R1.00-R5,000.00 | "Price must be between R1.00 and R5,000.00." |
| Benefits (optional) | Long text | No | "Gym floor access, 1 locker" | Up to 300 characters | "Benefits can be up to 300 characters." |
| Months paid | Dropdown (1-12) | Yes | - | Default 1 | "Choose the number of months." |
| Amount (R) | Decimal | Yes | "350.00" | R1.00-R50,000.00 (BR5) | "Amount must be between R1.00 and R50,000.00." |
| Payment method | Dropdown (Cash, EFT, Card) | Yes | "Choose a method" | - | "Choose a payment method." |
| Payment date | Date | Yes | - | Today or earlier (BR5) | "Payment date can't be in the future." |
| Grace period (days) | Whole number | Yes | "3" | 0-14 (BR4) | "Enter a number from 0 to 14." |
| Payment reminders | Toggle | - | - | On or off; default on | - |

### 8.4 Sample data set

Used on every screen and in the seed data. Today is 28 Oct 2026 and the Grace period is 3 days.

| Member | Plan | Paid until | Status on 28 Oct 2026 | Payment recorded |
|---|---|---|---|---|
| Naledi Khumalo (naledi.k@example.com) | Student, R250.00 | 15 Nov 2026 | Active | 15 Oct 2026, R250.00, EFT, 1 month |
| Johan van der Merwe (johan.vdm@example.com) | Premium, R550.00 | 1 Dec 2026 | Active | 1 Oct 2026, R1,100.00, Card, 2 months |
| Thando Mokoena (thando.m@example.com) | Standard, R350.00 | 26 Oct 2026 | Grace period (until 29 Oct 2026) | 26 Sep 2026, R350.00, Cash, 1 month |
| Ayesha Patel (ayesha.p@example.com) | Student, R250.00 | 10 Oct 2026 | Overdue | 10 Sep 2026, R250.00, Cash, 1 month |

**Gym:** Iron Haven Gym. **Admin:** Sipho Dlamini. **Plans:** Student R250.00 ("Gym floor access"), Standard R350.00 ("Gym floor access, 1 fitness assessment"), Premium R550.00 ("Gym floor access, group classes, 1 locker"). **Revenue this month (Oct 2026):** R250.00 + R1,100.00 = R1,350.00.

## 9. Design direction

### 9.1 Look and brand

| Item | Your choice |
|---|---|
| **Look and feel (3 words)** | Clear, calm, trustworthy |
| **Primary colour** | Navy #1F3A5F (buttons, active tab, headings; white text on it passes 4.5:1) |
| **Secondary / accent colour** | Teal #0F766E (links, toggles, filter chips; white text on it passes 4.5:1) |
| **Background colour** | Light grey #F5F7FA (screen) and white #FFFFFF (cards) |
| **Main text colour** | Near-black #111827 |
| **Secondary text colour** | Grey #4B5563 (passes 4.5:1 on both backgrounds) |
| **Error / success / warning colours** | #C62828 / #2E7D32 / #7A4B00 |
| **Status badge colours (background / text)** | Active #E3F4E6 / #1B5E20; Grace period #FFF3CD / #7A4B00; Overdue #FBE3E3 / #9B1C1C |
| **Dark mode** | No (v1) |
| **Font** | Inter |
| **Text sizes** | Title 22px bold; heading 18px semibold; body 16px regular; small text 13px regular; big numbers on stat cards 28px bold |
| **Spacing unit** | 8px, so all gaps are 8, 16, 24 or 32px |
| **Screen side margin** | 16px |
| **Corner radius** | Cards 12px; inputs 8px; buttons 8px; badges fully rounded |
| **Shadows** | Soft: 0 1px 3px rgba(0,0,0,0.12) on cards only |
| **Button height** | 48px |
| **Icon set** | Lucide, outline (check-circle, clock, alert-circle, users, layout-dashboard, credit-card, settings) |
| **Logo** | Wordmark "STAY IN TRACK" in Inter bold, navy #1F3A5F, with a small check mark inside a rounded square to its left |
| **Images and illustrations** | No photos. Simple line icons for empty states. No profile pictures. |
| **Reference apps** | Stripe Dashboard (clear stat cards and numbers); Notion (clean lists and simple forms) |

|   |   |
|---|---|
| **9.2 Tone of voice** | Short, clear and respectful, like a helpful front-desk colleague. Example: "Payment recorded." rather than "Your payment has been successfully recorded in the system!" |

### 9.3 Platform rules

- **Designed first for:** phone browser at 390px wide. Layout for tablet and desktop is adapted from it.
- **Phone (under 640px wide):** one column; Tab bar fixed at the bottom; stat cards in 2 columns; main buttons at the bottom within thumb reach.
- **Tablet (640-1024px):** Side menu (icons and labels) replaces the Tab bar; stat cards in 3 columns; modals are centred popups 480px wide.
- **Desktop (over 1024px):** left Side menu 240px wide; stat cards in 5 columns; maximum content width 1200px, centred.
- **Menu choice:** bottom Tab bar on phone, left Side menu on tablet and desktop.
- Every clickable thing has a hover look (slightly darker colour) and a keyboard-focus look (2px teal #0F766E outline).
- Keep content clear of the phone's top status bar and bottom edge.

### 9.4 Accessibility

- Body text is 16px; small text is 13px (never below 12px).
- Text contrast is at least 4.5 to 1. All text colour pairs in 9.1 were checked and pass (lowest: white on teal #0F766E, 5.47:1).
- Everything tappable is at least 44 x 44px.
- Colour is never the only signal: every Status badge has an icon and text, and every field error has a red border plus an error message.
- Every icon-only button (close, back) and every icon has a text label for screen readers.

## 10. Data model

*Times are saved in UTC and shown in SAST. Dates (such as paid_until) are calendar dates in SAST.*

### 10.1 Entities and fields

#### Gym: one gym run by one Admin

| Field | Type | Required? | Default | Unique? | Rules | If the linked record is deleted |
|---|---|---|---|---|---|---|
| id | ID | Yes | Auto | Yes | - | - |
| name | Text (60) | Yes | - | No | 2-60 characters | - |
| grace_days | Whole number | Yes | 3 | No | 0-14 (BR4) | - |
| created_at | Date-time | Yes | Now | No | - | - |

#### Profile: one login account (Admin or Member)

| Field | Type | Required? | Default | Unique? | Rules | If the linked record is deleted |
|---|---|---|---|---|---|---|
| id | ID | Yes | Same as the login account ID | Yes | - | - |
| email | Email | Yes | - | Yes | Lower-case; up to 100 characters | - |
| full_name | Text (60) | Yes | - | No | 2-60 characters | - |
| role | Choice (admin, member) | Yes | - | No | Set at sign-up | - |
| gym_id | Link to Gym | Yes | - | No | - | Delete this too |
| is_18_or_older | Yes/No | Yes | - | No | Must be Yes | - |
| reminders_on | Yes/No | Yes | Yes | No | Used only by Members (BR10) | - |
| created_at | Date-time | Yes | Now | No | - | - |

#### Plan: one membership package of a gym

| Field | Type | Required? | Default | Unique? | Rules | If the linked record is deleted |
|---|---|---|---|---|---|---|
| id | ID | Yes | Auto | Yes | - | - |
| gym_id | Link to Gym | Yes | - | No | - | Delete this too |
| name | Text (30) | Yes | - | Yes, within the gym | 2-30 characters (BR1) | - |
| price | Money (ZAR) | Yes | - | No | R1.00-R5,000.00 (BR1) | - |
| benefits | Long text (300) | No | Empty | No | Plain text (BR1) | - |
| status | Choice (active, inactive) | Yes | active | No | BR1 | - |
| created_at | Date-time | Yes | Now | No | - | - |

#### Member: one person with a membership at a gym

| Field | Type | Required? | Default | Unique? | Rules | If the linked record is deleted |
|---|---|---|---|---|---|---|
| id | ID | Yes | Auto | Yes | - | - |
| gym_id | Link to Gym | Yes | - | No | - | Delete this too |
| user_id | Link to Profile | No | Empty | Yes | Set when the Member signs up (BR8) | Clear the field |
| full_name | Text (60) | Yes | - | No | 2-60 characters (BR2) | - |
| email | Email | Yes | - | Yes, within the gym | Up to 100 characters (BR2) | - |
| phone | Phone (+27 format) | No | Empty | No | BR2 | - |
| plan_id | Link to Plan | Yes | - | No | Active Plan only (BR1) | Block the delete |
| paid_until | Date | No | Empty | No | Set by Payments (BR5, BR6) | - |
| is_18_or_older | Yes/No | Yes | - | No | Must be Yes (BR2) | - |
| created_at | Date-time | Yes | Now | No | - | - |

#### Payment: one amount received from a Member

| Field | Type | Required? | Default | Unique? | Rules | If the linked record is deleted |
|---|---|---|---|---|---|---|
| id | ID | Yes | Auto | Yes | - | - |
| gym_id | Link to Gym | Yes | - | No | - | Delete this too |
| member_id | Link to Member | Yes | - | No | - | Delete this too |
| amount | Money (ZAR) | Yes | - | No | R1.00-R50,000.00 (BR5) | - |
| method | Choice (Cash, EFT, Card) | Yes | - | No | - | - |
| months | Whole number | Yes | 1 | No | 1-12 (BR5) | - |
| payment_date | Date | Yes | Today | No | Not in the future (BR5) | - |
| previous_paid_until | Date | No | Empty | No | Saved by the app for Undo (BR6) | - |
| recorded_by | Link to Profile | Yes | Current user | No | - | Clear the field |
| created_at | Date-time | Yes | Now | No | Used for the 24-hour Undo rule (BR6) | - |

### 10.2 Relationships

- One Gym has many Profiles, Plans, Members and Payments.
- One Plan has many Members.
- One Member has many Payments.
- One Profile (with role member) links to at most one Member.

### 10.3 Status values and changes

| Entity.field | From | To | Who or what causes it |
|---|---|---|---|
| Plan.status | active | inactive | Admin, by turning off "Active" in M2 (BR1) |
| Plan.status | inactive | active | Admin, by turning on "Active" in M2 |
| Member Status (calculated, not saved) | Overdue | Active | A Payment is recorded that makes paid_until today or later (BR3, BR5) |
| Member Status (calculated, not saved) | Active | Grace period | The day after paid_until passes (BR3) |
| Member Status (calculated, not saved) | Grace period | Overdue | The Grace period days run out, or the Admin lowers the Grace period (BR3, BR4) |
| Member Status (calculated, not saved) | Active or Grace period | Overdue | The Admin undoes the only Payment (BR6) |

### 10.4 Reference and seed data

- **Reference data:** None needed before the first sign-up. Every gym creates its own Plans.
- **Seed data:** the sample data set in Section 8.4 (gym Iron Haven Gym, 3 Plans, 4 Members, 4 Payments).
- **Test accounts** (one per role; passwords are test-only and kept in the seed script's README, never in this document): Admin: sipho@ironhaven.example.com; Member: naledi.k@example.com; Member: thando.m@example.com.

## 11. Tech stack and architecture

### 11.1 Stack

| Layer | Your choice (with version) | Why |
|---|---|---|
| **Frontend** | React 18.3 with Vite 5 and React Router 6 | Covered in the course; fast to build |
| **Styling** | Tailwind CSS 3.4 | Matches the design tokens in Section 9 |
| **Backend / API** | Supabase (supabase-js 2) | Log-in, database and RLS in one service |
| **Database** | PostgreSQL (Supabase) | Relational data fits Members, Plans and Payments |
| **Log-in (authentication)** | Supabase Auth (email + password) | Email verification and password reset built in |
| **File / image storage** | None | v1 stores no files |
| **Scheduled jobs** | None | Status is calculated when shown (BR3), so nothing needs to run on a timer |
| **Hosting / demo** | Vercel (public URL) | Free tier; easy deploy from GitHub |
| **Language and package manager** | TypeScript, npm, Node.js 20 LTS | Fewer type bugs |
| **Testing** | Vitest for BR3, BR5, BR6 and BR7; manual checklist for all T- criteria | The Status and Payment calculations are the riskiest rules |
| **Version control** | GitHub repository | Save this PRD as docs/PRD.md and MASTER.md in the root folder |

|   |   |
|---|---|
| **11.2 Third-party services** | None. Supabase is the only external service, and its free tier is enough for the MVP (no paid or key-based service beyond Supabase's own keys). |
| **11.3 How the parts connect** | The React app runs in the browser and talks to Supabase through the supabase-js client. Supabase Auth handles sign-up, log-in and password reset. The database stores Gyms, Profiles, Plans, Members and Payments, and RLS policies decide who can read or change each row. The app calculates Status (BR3), paid_until (BR5) and revenue (BR7) from the data it loads. |

### 11.4 Permissions (Row-Level Security)

| Entity | Action | Who is allowed | Extra rule |
|---|---|---|---|
| Gym | Read | Admin and Members of that gym | Only their own gym (BR12) |
| Gym | Update | Admin of that gym | grace_days 0-14 |
| Gym | Create | Created by the sign-up function when an Admin signs up | - |
| Gym | Delete | Admin of that gym | Through Delete account (M4); deletes all its data |
| Profile | Read / update | Owner only | Members can update only reminders_on |
| Profile | Delete | Owner only | Through Delete account (M4) |
| Plan | Read | Admin of the gym: all Plans. Member: only their own Plan. | - |
| Plan | Create / update | Admin of that gym | BR1; no Plan delete in v1 |
| Member | Read | Admin of the gym: all Members. Member: only their own record. | - |
| Member | Create / update / delete | Admin of that gym | BR2, BR8, BR11 |
| Payment | Read | Admin of the gym: all Payments. Member: only their own Payments. | - |
| Payment | Create | Admin of that gym | BR5 |
| Payment | Delete | Admin of that gym | Only the Member's latest Payment, only within 24 hours (BR6) |
| Payment | Update | Nobody | Payments are never edited (BR6) |

### 11.5 Environment variables and secrets

| Name | What it is | Where to get it | Public or secret? |
|---|---|---|---|
| VITE_SUPABASE_URL | Project address | Supabase dashboard → Project Settings → API | Public: safe in the app |
| VITE_SUPABASE_ANON_KEY | Public (anon / publishable) key | Same | Public. Safe only because RLS is on for every table. |
| SUPABASE_SERVICE_ROLE_KEY | Admin (service role / secret) key | Same | Secret: used only by the seed script; never in the app |

Real values live in a .env file that is never uploaded to GitHub. A .env.example file with the same names and placeholder values is committed.

### 11.6 Folder structure

- **src/pages/:** one file per full screen (S1-S11)
- **src/modals/:** M1-M6
- **src/components/:** Header, TabBar, SideMenu, StatusBadge, MemberRow, StatCard, PlanCard, NoticeBanner, Toast, ConfirmModal, EmptyState, LoadingPlaceholder, OfflineBanner
- **src/lib/:** Supabase client, status.ts (BR3), payments.ts (BR5, BR6), revenue.ts (BR7), format.ts (rand and date formats)
- **supabase/migrations/:** tables, RLS policies, signup and Member-linking functions
- **supabase/seed/:** seed script and README with the test passwords
- **tests/:** Vitest tests
- **docs/PRD.md** and **MASTER.md**

### 11.7 Testing plan

Every T- criterion is tested manually in Chrome on a phone-sized screen and on a laptop, using the checklist in MASTER.md. BR3 (Status), BR5 (paid until calculation), BR6 (Undo) and BR7 (revenue) get automated Vitest tests, including the 31 Jan case and the 3-day Grace period. Test accounts are from Section 10.4.

#### 5-minute demo script

1. Sign up as Admin, verify the email and log in (Flow 1).
2. Create the Plans and add a Member (Flow 2).
3. Record a Payment and show the Status change; undo it (Flow 3).
4. Search "tha" on S6 and show the Grace period badge (Flow 4); show the Dashboard (Flow 5).
5. Log in as naledi.k and show her Member Dashboard and reminders (Flow 6).

## 12. Quality, errors, security and privacy

### 12.1 Quality requirements

| Area | Requirement (must be checkable) |
|---|---|
| **Speed** | Every screen shows content or a loading placeholder within 3 seconds on mobile data, tested on my phone |
| **Data usage** | No images or video; initial JavaScript under 300 KB compressed (checked in the build output); lists load 20 items at a time |
| **Offline** | The last loaded data stays visible; the banner "You're offline. Changes will not be saved." shows; all save buttons are disabled |
| **Devices** | Latest Chrome, Edge and Safari; phone screens from 360px wide |
| **Language and region** | English (South Africa); dates written like 28 Oct 2026; 24-hour time; SAST; currency written like R1,350.00; phone numbers +27 |
| **Accessibility** | As in Section 9.4 |
| **Scale** | Works for 1 gym with 500 Members and for 5 gyms in the first semester |
| **Abuse limits** | Maximum 500 Members per gym (BR2); 5 wrong passwords locks log-in for 15 minutes (Section 5) |

### 12.2 Error messages used everywhere

| Situation | Exact message | What happens next |
|---|---|---|
| No internet | "You're offline. Changes will not be saved." | Save buttons disabled |
| Server or unknown error | "Something went wrong. Try again." | "Try again" button |
| Logged out because the session expired | "Please log in again." | Go to S3 |
| Not allowed (wrong role) | "You can't do that." | Go back to the previous screen |
| Form field error | Red border + message under the field | The field keeps the user's text |

### 12.3 Security

- Passwords are handled only by Supabase Auth, never stored by my own code.
- The service role key is never in the app or on GitHub (Section 11.5).
- Every "Cannot do" in 2.4 and every rule in 11.4 is enforced by RLS in the database, so one gym can never read another gym's data (BR12).
- Payment data is limited to amounts, dates and method. Card numbers and bank details are never stored.

### 12.4 Privacy and POPIA

| Personal information | Why you need it | Who can see it | Where it is stored | How long you keep it | How the user deletes it |
|---|---|---|---|---|---|
| Email | Log-in, linking a Member to their record | Admin of the gym; the owner | Supabase (country of the chosen region) | Until the account or Member record is deleted | S10 → M4 (account); S7 → M5 (Admin deletes the Member) |
| Full name | Identify Members and Admins | Admin of the gym; the owner | Same | Same | Same |
| Phone (optional) | Contact the Member | Admin of the gym | Same | Until the Member record is deleted | S7 → M5 |
| Payment records (amount, date, method, months) | Work out Status and revenue | Admin of the gym; the Member sees their own | Same | Until the Member record or the gym is deleted | S7 → M5 or S10 → M4 (Admin) |
| 18-or-older confirmation | Meet the age rule | Admin of the gym | Same | Same as the account or Member record | Same |

- **Consent:** on S2 the checkbox "I agree to the Privacy Notice" is unticked by default, with a link to S11. The Privacy Notice is also in the S10 menu.
- **Privacy Notice:** S11 says what is collected, why, who sees it, where it is stored and how to delete it. It also says that when a Member deletes their account, the gym keeps the Member record and Payment records for its own financial records until the Admin deletes them.
- **Under-18 users:** not allowed in v1. The minimum age is 18 (Section 5), and the Admin must confirm that each Member is 18 or older (BR2).
- **Data outside South Africa:** the Privacy Notice names the country of the Supabase region. If the region is outside South Africa, the notice says so.

## 13. Assumptions, risks, open questions and milestones

### 13.1 Assumptions

- Small gym owners will record Payments in the app each time money is received. **Check:** ask 3 gym owners or testers to record 3 Payments each and note any trouble.
- Staff can use the Admin account on a shared device at the entrance. **Check:** stopwatch test with 5 testers (G2).
- Members have a smartphone and internet access. **Check:** ask the 10 classmates in the G3 test group.
- Status calculated from the "paid until" date matches how gyms already decide who may enter. **Check:** ask 3 gym owners to read the Status rules (BR3).

### 13.2 Risks

| Risk | Likelihood | Impact | What you will do about it |
|---|---|---|---|
| Admin forgets to record a Payment, so a paid Member shows Overdue | High | High | M3 is two taps from S7 with defaults filled in; the Dashboard shows the Overdue list |
| Several staff share one Admin login | Medium | High | Passwords need 8+ characters with a number; log out is one tap; staff accounts are a future feature |
| One gym sees another gym's data | Low | High | RLS on every table; test with two gyms before the demo |
| The project is too large for the deadline | Medium | High | Must features first; Should features (F6, F7) last; non-goals in 3.2 |
| Wrong Payment recorded | Medium | Medium | Undo within 24 hours (BR6) |

|   |   |
|---|---|
| **13.3 Open questions** | None. (Every question was answered and moved into the right section.) |

### 13.4 Milestones

| Milestone | What is finished | Where to find it (link) | Target date |
|---|---|---|---|
| M0: Idea submitted | App Concept Document (SDLC planning report) | To be added | Done (21 Oct 2026) |
| M1: PRD approved | This PRD, Status = Approved, signed off by your facilitator | docs/PRD.md | 30 Oct 2026 |
| M2: Design ready | Style guide and every screen in 8.1 generated and checked | To be added | 6 Nov 2026 |
| M3: MASTER.md ready | Generated and checked against this PRD | MASTER.md | 9 Nov 2026 |
| M4: MVP built | F1-F5 working on a real device or URL | To be added | 4 Dec 2026 |
| M5: Tested and demoed | Every T- test passed; demo script presented | Test checklist in MASTER.md | 11 Dec 2026 |

## 15. Checklist sign-off

*Section 14 (the AI prompts) and Section 16 (the glossary) are the same in every PRD, so they are not repeated here.*

### Traceability check

| Feature | Stories | Screens | Rules |
|---|---|---|---|
| F1 Account | US1, US2, US3, US4 | S1-S4, S10, S11, M4 | BR8 |
| F2 Member management | US5, US6 | S6, S7, M1, M5 | BR2, BR8, BR11 |
| F3 Plans and payments | US7, US8, US9, US10 | S7, S8, S10, M2, M3, M6 | BR1, BR4, BR5, BR6 |
| F4 Entrance Status check | US11 | S6 | BR3, BR9 |
| F5 Admin Dashboard | US12 | S5 | BR3, BR7 |
| F6 Member Dashboard | US13 | S9 | BR3 |
| F7 Payment reminders | US14 | S9, S10 | BR10 |

### Peer review

| Reviewer name | Date | Their one-sentence summary of your app |
|---|---|---|
| To be added | To be added | To be added |
