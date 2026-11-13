# Backend Setup and Integration Documentation

**Author / Responsibility:** Shreya (`rshreya@virtusa.com`)  
**Role:** Node.js Backend and Email Service Integration  
**Branch:** `backend-email`  

---

## 1. Overview
This document describes the initial setup, architectural design, environment management, and email service integration for the **Email and Notification Application**.

---

## 2. Research & Technology Selection

### Node.js & Express.js
- **Node.js (LTS v22)** provides a lightweight, asynchronous, event-driven runtime ideal for high-throughput notification dispatching.
- **Express.js** provides minimal, robust HTTP server routing, JSON parsing, and middleware integration (CORS, error handling).

### Nodemailer & SMTP
- **Nodemailer** is the industry standard for sending emails in Node.js applications.
- Supports SMTP connections over TLS/SSL, authentication, attachments, and HTML rendering.
- For development and automated testing, **Ethereal Email** (`smtp.ethereal.email`) generates throwaway test accounts with real-time web preview URLs without delivering emails to real inboxes.

---

## 3. Directory Layout

```text
backend/
├── src/
│   ├── config/
│   │   ├── environment.js      # Central environment config (Dev & Prod)
│   │   └── mailer.js           # Nodemailer transport creation & verification
│   ├── routes/
│   │   ├── healthRoutes.js     # Health check (/api/health)
│   │   ├── emailRoutes.js      # Email sending endpoints with feature flags
│   │   └── index.js            # Route aggregator
│   ├── services/
│   │   └── emailService.js     # Email delivery & template interpolation
│   ├── templates/              # HTML templates (integrated with Person 4)
│   │   ├── welcome.html
│   │   ├── verification.html
│   │   └── passwordReset.html
│   ├── scripts/
│   │   ├── testEmail.js        # Automated SMTP verification script
│   │   └── testHealth.js       # Health-check automated test
│   └── server.js               # Express application initialization
├── .env                        # Local environment file (git-ignored)
├── .env.example                # Sample environment file template
├── .gitignore                  # Git ignore rules
└── package.json                # Project manifest & scripts
```

---

## 4. Environment Configurations

### Security & Credentials Management
- Real credentials and sensitive secrets are stored exclusively in `.env`.
- `.env` is listed in both root `.gitignore` and `backend/.gitignore` to prevent leaking credentials to GitHub.
- `.env.example` serves as the public blueprint.

### Variables Reference
- `PORT`: HTTP port (`5000`)
- `NODE_ENV`: Runtime environment (`development` / `production`)
- `CLIENT_URL`: Allowed origins for CORS (e.g. `http://localhost:4200`)
- `EMAIL_HOST`: SMTP host (`smtp.ethereal.email` for testing)
- `EMAIL_PORT`: SMTP port (`587` or `465`)
- `EMAIL_SECURE`: `false` (TLS on port 587) or `true` (SSL on port 465)
- `EMAIL_USER`: SMTP account username
- `EMAIL_PASS`: SMTP account password
- `EMAIL_FROM`: Default sender address
- `FEATURE_*`: Feature flags controlling notification availability

---

## 5. Email Service Implementation

### Transporter Initialization (`src/config/mailer.js`)
- Lazy-initializes a singleton Nodemailer transporter.
- In `development` mode, if `EMAIL_USER` and `EMAIL_PASS` are unset, it automatically provisions an Ethereal test account on the fly.
- Exposes `verifyTransporter()` to validate connection at startup.

### Reusable Email Service (`src/services/emailService.js`)
- `sendEmail({ to, subject, text, html, template, data })`: Core reusable dispatcher.
- `renderTemplate(templateName, data)`: Replaces `{{token}}` in templates with provided values.
- Returns `{ success: true, messageId, accepted, previewUrl }`.
- Helper methods for standardized notifications:
  - `sendWelcomeEmail(to, data)`
  - `sendVerificationEmail(to, data)`
  - `sendPasswordResetEmail(to, data)`

---

## 6. Team Collaboration Notes

### Coordination with Person 2 (Vickna Sai Kumar - API Management & Feature Flags)
- Routes are modularized inside `src/routes/emailRoutes.js`.
- Each notification route contains feature flag guards checking `config.featureFlags`.
- Person 2 can hook custom feature flag management middleware or config providers directly into these endpoints.

### Coordination with Person 4 (Sabari - Reusable HTML Templates)
- Templates (`welcome.html`, `verification.html`, `passwordReset.html`) from the `email---template` branch have been integrated into `src/templates/`.
- All templates use standard Mustache-style `{{placeholder}}` variables.
- Person 4 can refine template markup and CSS styling in `src/templates/` without touching backend code.

---

## 7. Verification & Deliverables Checklist

- [x] Node.js LTS verified (`v22.22.2`).
- [x] Project initialized with `npm init -y` and required dependencies (`express`, `cors`, `dotenv`, `nodemailer`, `nodemon`).
- [x] Express server implemented on port `5000` with JSON parsing and CORS.
- [x] Health-check endpoint operational at `GET /api/health` returning `200 OK`.
- [x] Secure environment management with `.env` and `.env.example`, protected via `.gitignore`.
- [x] Development and production configuration separation in `src/config/environment.js`.
- [x] Reusable email service in `src/services/emailService.js` with template interpolation.
- [x] Ethereal SMTP test verified with live delivery and preview URL generation.
- [x] Team coordination alignment for API feature flags (Person 2) and templates (Person 4).
- [x] Comprehensive setup documentation created.
