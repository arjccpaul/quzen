# Quzen — Smart Queue & Waiting Intelligence Platform

> "Wait from anywhere, not from the line."

---

## 1. Product Overview

Quzen is a real-time smart queue and waiting intelligence platform. Users join queues remotely, track live status, and receive dynamic ETA updates powered by community participation. Businesses only need to do basic setup — the intelligence runs itself through user signals.

---

## 2. Core Problem

People waste hours in physical queues without knowing the actual waiting time — leading to frustration, lost productivity, and crowding in hospitals, diagnostic centers, banks, salons, and government offices.

---

## 3. Solution

A web-first digital queue platform with:
- Remote token generation — no need to physically stand in line
- Live queue position and ETA tracking
- Community-powered prediction engine using user arrival and completion signals
- Lightweight business setup — no complex integrations, no hardware
- Works with just a QR code or a link

---

## 4. Key Differentiator — Community-Powered Intelligence

Quzen does NOT depend on businesses to manually update queue status. The business only needs to set up once. The intelligence is entirely driven by users.

### The Ecosystem

| Actor | Contribution |
|---|---|
| Business | Basic setup only (categories, avg durations) |
| User | Arrival confirmation |
| User | Completion confirmation |
| System | Prediction engine |
| AI (Phase 2) | Estimate optimization |

### Why Users Participate

Users are not asked to help "for free." The message is:
> "Help improve prediction for everyone — including yourself."

Reward: *"You helped 24 people today."* — One tap. Fast. Never forced.

---

## 5. Intelligence Flow (Step by Step)

**Step 1 — Token Issued**
User selects sector, location, service → receives token number + ETA range (e.g. "40–50 mins")

**Step 2 — Arrival Detection (Optional)**
System monitors proximity. When user is near the center:
> "Looks like you reached Apollo Diagnostic. Confirm arrival to improve wait estimates."

User taps **Arrived** → system marks token as actively in use.

**Step 3 — Completion Nudge**
After estimated duration passes, system pushes:
> "Your service time is up. Was it completed? Help your next friend know the wait time!"

User taps **Completed** → system records actual duration.

**Step 4 — System Learns**
- Compares predicted ETA vs actual time
- Updates ETA engine for this location, category, and time of day
- Confidence score improves: *"Estimate accuracy: High (based on 24 recent updates)"*

### Privacy Rules
- No continuous GPS tracking
- Arrival detection is optional and permission-based
- No patient/customer names or service details visible to others
- Only queue position, ETA, and status labels are shown publicly

### Queue Status Labels (No Private Data)
- "Queue moving normally"
- "Slight delay today"
- "High rush currently"

---

## 6. Supported Sectors

### Phase 1
| Sector | Categories |
|---|---|
| Diagnostic Centers | Blood Test, Urine Test, X-Ray, MRI, General Checkup |
| Hospitals & Clinics | OPD, Emergency, Specialist Consultation, Follow-up |
| Banks | Account Opening, Loan, Cash Withdrawal, KYC |
| Restaurants | Table Booking, Takeaway, Billing Counter |
| Salons & Parlours | Haircut, Spa, Facial, Grooming |
| Vehicle Service Centers | Bike Service, Car Service, Repair, Inspection |

### Phase 2 (Future)
- Government offices (RTO, Passport, Municipality)
- Universities & educational institutions
- Pharmacies

---

## 7. User Flow

1. Select sector and location
2. Choose service category / subcategory
3. Join queue → receive token number + ETA range
4. Wait remotely (home, office, café, car)
5. Receive arrival notification when near center (optional)
6. Tap **Arrived** to confirm
7. After service → tap **Completed** (one tap, with community nudge)

---

## 8. Business / Admin Flow

Business owner role is **setup only**. No required actions during live queue operation.

1. Register business and set up profile
2. Add service categories and subcategories
3. Set average service duration per category
4. Generate QR code or shareable link for customers
5. Optionally open/close daily queue sessions
6. View analytics dashboard (passive — no live updates required)

---

## 9. Tech Stack

### Frontend (Web — Primary)
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Forms & Validation | React Hook Form + Zod |
| Real-time Client | Socket.io Client |
| Auth | JWT (httpOnly cookie) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | NestJS |
| ORM | Prisma |
| Auth | JWT + Refresh Tokens |
| Real-time | Socket.io (NestJS Gateway) |
| Validation | class-validator + class-transformer |

### Infrastructure
| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| Cache & Queue | Redis |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Email | Nodemailer (local) / SendGrid (production) |
| SMS | MSG91 / Twilio |
| Frontend Hosting | Vercel (later) |
| Backend Hosting | TBD |

### Mobile (Phase 2)
- React Native (Expo) — reusing existing API and business logic

---

## 10. Database Schema (Core Entities)

| Entity | Key Fields |
|---|---|
| User | id, name, email, phone, role, fcm_token, created_at |
| Business | id, owner_id, name, sector, location, address, is_active |
| ServiceCategory | id, business_id, name, avg_duration_minutes |
| QueueSession | id, business_id, date, status (active/closed) |
| Token | id, session_id, user_id, category_id, token_number, status, issued_at, arrived_at, completed_at, estimated_wait_min |
| FeedbackSignal | id, token_id, signal_type (arrived/completed), timestamp |
| Notification | id, user_id, token_id, message, sent_at, is_read |

---

## 11. Application Modules

### User-Facing Web App
- [ ] Landing page — sector discovery + search
- [ ] Business / service listing page
- [ ] Queue join flow (sector > location > category > token)
- [ ] Live queue tracker (token status, ETA, position)
- [ ] Arrival confirmation screen
- [ ] Completion confirmation screen (with community nudge)
- [ ] Notification center
- [ ] User profile + token history

### Business Admin Dashboard
- [ ] Business registration & onboarding
- [ ] Service category management
- [ ] QR code / link generator
- [ ] Live queue viewer (read-only overview)
- [ ] Analytics (peak hours, avg wait, no-shows)
- [ ] Session open/close

### Backend Modules
- [ ] Auth module (register, login, JWT refresh, roles)
- [ ] Users module
- [ ] Business module
- [ ] Queue engine (token generation, ETA calculation)
- [ ] Real-time WebSocket gateway
- [ ] Intelligence engine (ETA refinement from signals)
- [ ] Notifications module (FCM + email + SMS)
- [ ] Analytics module

---

## 12. Build Phases

### Phase 1 — Core Platform (Web)

**Milestone 1 — Local Setup (Day 1)**
- [ ] Monorepo scaffold (apps/web + apps/api + packages/prisma)
- [ ] PostgreSQL + Redis running via Docker
- [ ] Prisma schema defined and migrated
- [ ] NestJS running on localhost:4000
- [ ] Next.js running on localhost:3000
- [ ] Firebase project configured

**Milestone 2 — Auth & Users**
- [ ] User registration and login (email + password)
- [ ] Business owner registration
- [ ] JWT + refresh token flow
- [ ] Role-based guards (user / business_owner / admin)

**Milestone 3 — Queue Engine**
- [ ] Token generation (sequential per session + category)
- [ ] Base ETA calculation (avg_duration × queue_position)
- [ ] Queue session management (open/close)
- [ ] WebSocket real-time queue updates

**Milestone 4 — User Web App**
- [ ] Sector and business discovery
- [ ] Queue join flow
- [ ] Live token tracker page
- [ ] FCM push notifications

**Milestone 5 — Business Dashboard**
- [ ] Business setup flow
- [ ] Live queue viewer
- [ ] Analytics dashboard

**Milestone 6 — Intelligence Layer**
- [ ] Arrival confirmation signal processing
- [ ] Completion feedback loop
- [ ] Predicted vs actual time comparison
- [ ] ETA engine update
- [ ] Confidence score display

### Phase 2 — Mobile + AI
- React Native (Expo) mobile app
- AI-based crowd prediction
- Geo-fencing auto check-in
- Smart slot recommendation engine
- Multi-branch support
- Government sector pilot

---

## 13. Revenue Model

| Plan | Target | Model |
|---|---|---|
| Free | Small salons, clinics | Limited tokens/month |
| Pro | Growing businesses | Monthly SaaS |
| Business | Multi-counter setups | Per-branch pricing |
| Enterprise | Hospitals, banks, chains | Annual contract |
| Government | Municipal offices, RTO | Annual SaaS + setup fee |

---

## 14. Folder Structure

```
quzen/
  apps/
    web/                  # Next.js 14 frontend
    api/                  # NestJS backend
  packages/
    prisma/               # Prisma schema + migrations + client
    types/                # Shared TypeScript types
  docker-compose.yml      # PostgreSQL + Redis local setup
  PROJECT_SCOPE.md
  README.md
```

---

## 15. Design Principles

1. **No forced dependency on businesses** — queue intelligence runs from user signals
2. **Privacy first** — no continuous GPS, arrival detection is always optional
3. **One-tap interactions** — never burden users with multi-step confirmations
4. **Community psychology** — users help others while helping themselves
5. **Show ETA ranges, not fake exact times** — "40–50 mins" builds more trust than "43 mins"
6. **Mobile-responsive from day one** — web app must work perfectly on mobile browsers
7. **Works without smartphones** — QR code + SMS fallback for offline tokens
8. **Graceful degradation** — app still works if user never taps Arrived or Completed

---

*Last updated: 2026-05-08*
*Status: Active Development — Phase 1, Milestone 1*
