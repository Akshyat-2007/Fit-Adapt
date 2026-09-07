# FitAdapt — Invisible Disability Fitness Companion

FitAdapt is an adaptive fitness companion web application designed to calibrate daily exercise routines for individuals managing invisible physical health conditions and disabilities (such as Asthma & Respiratory, Joint / Arthritis / Hypermobility, PCOS & Hormonal, Postnatal Recovery, and Anxiety-linked Chronic Fatigue) using real-time symptom check-ins, clinical safety filters, and an explainable rule engine.

---

## 🌟 Key Features

- **Personalized Onboarding & Condition Profiles**: Profiles tailored for Asthma, Joint/Hypermobility, PCOS, Postnatal Recovery, and Anxiety/Chronic Fatigue with severity calibrations (Mild, Moderate, Significant).
- **Daily Symptom Check-in**:
  - Touch-friendly 1–5 scale sliders for **Energy**, **Pain**, and **Breathlessness**.
  - Emergency **Active Flare-up switch** to immediately divert into gentle recovery.
- **Explainable Rule Engine**:
  - Automatically selects condition-safe movements and adjusts intensity (**Rest**, **Low**, or **Moderate**).
  - Generates transparent, human-readable clinical rationale explaining every decision.
- **Condition-Safe Exercise Library**:
  - Dual-tier filtering across both Health Conditions and Intensity Tiers.
  - Verified physical therapy YouTube demonstration videos with responsive modal playback.
- **Consistency Dashboard**:
  - Streak tracking (🔥), good vs. flare days breakdown, and a 14-day consistency heatmap.
  - Celebrates rest and pacing as wise listening, not broken streaks.
- **Dark & Light Mode**: WCAG AAA high-contrast design system.
- **Forgot Password Flow**: Built-in modal and API for quick password reset.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Relational architecture via Sequelize ORM with MySQL support and zero-downtime SQLite fallback.
- **Frontend**: EJS Server-Side Rendering, Tailwind CSS, Lucide Icons, Custom High-Contrast CSS.
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly secure cookies & bcryptjs password hashing.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Akshyat-2007/Fit-Adapt.git
cd Fit-Adapt
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_jwt_key_here
```
*(MySQL variables are optional; leaving them blank will automatically use the local SQLite database).*

### 4. Seed Database
Seed the 22 condition-tagged exercises, demo user, and admin account:
```bash
npm run seed
```

### 5. Run the Application
```bash
npm run dev
# or
npm start
```
Visit **http://localhost:3000** in your browser!

---

## 🔑 Default Credentials

- **Admin Account**:
  - Email: `admin@fitadapt.com`
  - Password: `admin123`
- **Demo User Account** (preloaded with 7-day consistency history):
  - Email: `demo@fitadapt.com`
  - Password: `password123`
