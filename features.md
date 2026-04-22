# MediConnect — Ready Features

> Last updated: April 2026  
> Stack: Next.js (React) · Spring Boot · PostgreSQL · WebSocket · Stripe · Cloudinary · Docker

---

## Authentication & User Management

- **Email / Password Sign-up & Login** — Registration and login pages with form validation (`signup.jsx`, `login.jsx`)
- **Google OAuth Sign-in** — "Sign in with Google" button wired to the backend OAuth flow
- **JWT-based Sessions** — Secure stateless sessions via Spring Security + JWT (`AuthController.java`)
- **Forgot / Reset Password flow** — Dedicated pages for requesting and completing a password reset (`forgot-password.jsx`, `reset-password.jsx`)
- **User Profile Management** — Patients can view and update personal profile details (`profile.jsx`, `UserProfileController.java`)
- **Role-based layouts** — Separate authenticated layouts and sidebars for **Doctor** (`DoctorLayout`, `DoctorSidebar`) and **Patient** (`PatientLayout`, `PatientSidebar`)

---

## Patient Portal

### Dashboard
- Upcoming consultation hero card — shows next doctor, scheduled time, and a **Join Room** button (enabled only within the ±5 min join window)
- Vitals summary card (Blood Pressure, Heart Rate)
- Active medications list with refill shortcut to Pharmacy
- Care Team Note card from the assigned doctor

### Appointment Booking (Multi-step Wizard)
- **Step 1 – Choose Specialty** — grid of medical categories (Cardiology, General Practice, etc.)
- **Step 2 – Choose Doctor & Time Slot** — expandable doctor cards showing only live, non-expired slots fetched from the backend in real time
- **Step 3 – Confirm Details** — editable patient name + reason for visit
- **Step 4 – Payment Redirect** — payload stored in `sessionStorage`, routed to the Stripe payment page

### Appointments Page
- **Upcoming tab** — filtered list of SCHEDULED future appointments with a Cancel button
- **History tab** — past/completed/cancelled appointments sorted newest-first
- Real-time appointment list updates via WebSocket (new bookings, cancellations, status changes appear instantly without a page refresh)

### Payment Page
- Stripe-integrated payment flow triggered after booking confirmation (`payment.jsx`)

### Consultation Room (Patient)
- Join video call via **Zego Cloud RTC** integration (`[appointmentId].jsx`)
- Session access enforced: joinable from 5 min before to 5 min after scheduled time

### Medical Records
- Dedicated records page (`records.jsx`)

### Pharmacy / Apothecary
- Medication catalog grid with product images, name, type, and price
- Search bar for filtering medications
- Shopping cart button with item count badge
- **E-Prescriptions sidebar** — displays active prescriptions from the doctor with coverage/co-pay info

### Messaging
- Patient messaging page (`messages.jsx`)

---

## Doctor Portal

### Dashboard
- Quick metrics: **Today's Visits**, **Upcoming Appointments**, **Next Break In** countdown
- **Availability Toggle** — doctors can switch between _Accepting Consultations_ and _Paused_ with an optional status note for patients
- **Manage Time Slots** — modal to add new consultation time slots (time-picker → backend save) or mark existing ones unavailable; all changes broadcast to patients via WebSocket in real time
- **Active Consultation panel** — shows next patient's name, scheduled start time, reason; Join Session button opens within a 10-min early / 5-min late window
- **Patient Queue table** — top 4 upcoming appointments with Time, Patient Name, Reason, Status columns
- Inline appointment actions (dropdown menu): **Mark Completed**, **Mark No-Show**, **Cancel**

### Consultation Room (Doctor)
- Full video call via **Zego Cloud RTC** (`[appointmentId].jsx`)
- **Session Snapshot sidebar** — patient name, date/time, reason, room name at a glance
- **Doctor Notes** — free-text textarea for capturing observations during the call
- **Quick Pharmacy panel** — searchable medication list; doctor can add medications with custom dosage and frequency (times per day) directly within the call room

### Patients Page
- Patient list view with management capabilities (`patients.jsx`)

### Schedule Page
- Calendar / schedule management page (`schedule.jsx`)

### Documents Page
- Document management placeholder (`documents.jsx`)

### Messaging
- Doctor messaging page (`messages.jsx`)

---

## Real-Time Infrastructure

- **Spring WebSocket handler** (`RealtimeWebSocketHandler.java`) + **RealtimeEventPublisher** broadcast appointment and slot events to connected clients
- **Frontend WebSocket client** (`realtime.js`) — `subscribeToRealtimeEvents()` utility used across all dashboards and the booking wizard
- Events handled:
  - `appointment.created` / `appointment.updated` / `appointment.deleted` / `appointment.cleared`
  - `doctor-slots.updated`

---

## Backend REST API (Spring Boot)

| Module | Controller | Key Endpoints |
|---|---|---|
| Auth | `AuthController` | Register, login, JWT refresh |
| User Profile | `UserProfileController` | Get / update profile |
| Appointments | `AppointmentController` | CRUD appointments, status updates, cancel |
| Doctor Availability | `DoctorAvailabilityController` | Save / fetch doctor time slots |
| Consultation Sessions | `ConsultationSessionController` | Session lifecycle management |
| Messages | `MessageController` | Send / fetch messages |
| Prescription | _(model + service ready)_ | Prescription data layer |
| Pharmacy / Orders | _(model + service ready)_ | Medication catalog, order data layer |

---

## Infrastructure & DevOps

- **Docker Compose** — single-command local environment spin-up (`docker-compose.yml`)
- **PostgreSQL** — primary database (users, doctors, patients, appointments, prescriptions, medicines, orders)
- **Cloudinary** — file / image storage integration configured
- **Stripe** — payment processing integrated
- **Redis** — caching / real-time state layer configured

---

## Notes

- The **Pharmacy** and **Order** backend controllers are not yet wired up (service/repository layers exist but the controller directory is empty); frontend pharmacy page uses static mock data.
- **Doctor Notes** in the consultation room are UI-only (not yet persisted to the backend).
- **Medical Records** page exists but backend integration is pending.
- The **Documents** and **Schedule** doctor pages are stubs awaiting backend wiring.
