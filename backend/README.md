# Node.js Backend & Email Service Integration

Backend service for the **Email and Notification Application**, built with **Node.js**, **Express.js**, and **Nodemailer**.

---

## 📋 Table of Contents
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Email Service & SMTP Architecture](#email-service--smtp-architecture)
- [Template Integration (Person 4 Coordination)](#template-integration-person-4-coordination)
- [API Management & Feature Flags (Person 2 Coordination)](#api-management--feature-flags-person-2-coordination)
- [Testing & Verification](#testing--verification)

---

## 🏛️ Architecture & Folder Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── environment.js      # Environment-specific configuration (Dev vs Prod)
│   │   └── mailer.js           # Nodemailer transporter & SMTP connection verification
│   │
│   ├── routes/
│   │   ├── healthRoutes.js     # /api/health endpoint
│   │   ├── emailRoutes.js      # Email sending endpoints with feature flag guards
│   │   └── index.js            # Main router aggregator
│   │
│   ├── services/
│   │   └── emailService.js     # Reusable email service & template rendering engine
│   │
│   ├── templates/              # Reusable HTML email templates (Person 4)
│   │   ├── welcome.html
│   │   ├── verification.html
│   │   └── passwordReset.html
│   │
│   ├── scripts/
│   │   ├── testEmail.js        # Automated SMTP & email delivery test
│   │   └── testHealth.js       # Health-check endpoint integration test
│   │
│   └── server.js               # Express application entrypoint
│
├── .env                        # Local environment variables (Git-ignored)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules for backend
└── package.json                # Project dependencies and scripts
```

---

## ⚙️ Prerequisites

- **Node.js**: LTS version (v18.x or v20.x+)
- **npm**: v9.x or higher
- **Git**

---

## 🚀 Installation & Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```

---

## 🔒 Environment Configuration

The application uses `dotenv` to load environment variables and provides separate configurations for `development` and `production`:

| Variable | Description | Default (Dev) |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `CLIENT_URL` | Allowed frontend URL(s) for CORS | `http://localhost:4200` |
| `EMAIL_HOST` | SMTP server host | `smtp.ethereal.email` |
| `EMAIL_PORT` | SMTP port (`587` for TLS, `465` for SSL) | `587` |
| `EMAIL_SECURE` | Use SSL/TLS connection (`true` / `false`) | `false` |
| `EMAIL_USER` | SMTP username | *Auto-generated in dev if blank* |
| `EMAIL_PASS` | SMTP password | *Auto-generated in dev if blank* |
| `EMAIL_FROM` | Default sender email & display name | `"Notification App" <no-reply@...>` |
| `FEATURE_WELCOME_EMAIL` | Enable/disable welcome notifications | `true` |
| `FEATURE_VERIFICATION_EMAIL`| Enable/disable verification emails | `true` |
| `FEATURE_PASSWORD_RESET_EMAIL`| Enable/disable password reset emails | `true` |
| `FEATURE_PROMOTIONAL_EMAIL` | Enable/disable promotional marketing emails | `false` |

> [!NOTE]
> **Zero-Configuration Ethereal Email in Development**: If `EMAIL_USER` and `EMAIL_PASS` are left empty in development mode, the service automatically creates a test account via [Ethereal Email](https://ethereal.email) and prints web preview URLs directly in the terminal!

---

## 🏃 Running the Server

- **Development Mode (with auto-reload via Nodemon):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

Once started, the backend is available at:
`http://localhost:5000`

---

## 📡 API Endpoints

### 1. Health Check
- **`GET /api/health`**
  - **Response `200 OK`**:
    ```json
    {
      "status": "UP",
      "message": "Backend service is healthy and operational.",
      "timestamp": "2026-11-13T06:03:18.005Z",
      "environment": "development",
      "uptime": "12 seconds",
      "version": "1.0.0"
    }
    ```

### 2. SMTP Verification & Test Email
- **`GET /api/email/test-smtp`**
  - Verifies connection to the SMTP server and sends a sample test email.
  - Returns message ID and Ethereal preview URL.

### 3. Send Generic Email
- **`POST /api/email/send`**
  - **Request Body:**
    ```json
    {
      "to": "user@example.com",
      "subject": "Hello from Node.js",
      "html": "<p>Hello World!</p>"
    }
    ```

### 4. Send Welcome Email (Template)
- **`POST /api/email/welcome`**
  - **Request Body:**
    ```json
    {
      "to": "newuser@example.com",
      "name": "Alex",
      "dashboardLink": "http://localhost:4200/dashboard"
    }
    ```

### 5. Send Verification Email (Template)
- **`POST /api/email/verify`**
  - **Request Body:**
    ```json
    {
      "to": "newuser@example.com",
      "name": "Alex",
      "verificationCode": "492810",
      "verificationLink": "http://localhost:4200/verify?token=xyz"
    }
    ```

### 6. Send Password Reset Email (Template)
- **`POST /api/email/reset-password`**
  - **Request Body:**
    ```json
    {
      "to": "user@example.com",
      "name": "Alex",
      "resetLink": "http://localhost:4200/reset-password?token=xyz",
      "expiresIn": "30 minutes"
    }
    ```

---

## 🎨 Template Integration (Person 4 Coordination)

The backend provides a dynamic template interpolation engine in `src/services/emailService.js`:
- HTML templates are stored in `src/templates/*.html`.
- Placeholder tokens use Mustache syntax: `{{variableName}}`.
- When `sendEmail({ template: 'templateName', data: { variableName: 'Value' } })` is invoked, tokens are substituted with sanitized data.
- Person 4 (Sabari) can add new templates to `src/templates/` without modifying core mailer logic.

---

## 🚩 API Management & Feature Flags (Person 2 Coordination)

- All notification routes are decoupled in `src/routes/emailRoutes.js`.
- Feature flag checks (`config.featureFlags.<flag>`) guard each notification route.
- If a feature is disabled (e.g., `FEATURE_WELCOME_EMAIL=false`), the API responds with `403 Forbidden` and `{ "success": false, "message": "Feature is disabled by feature flags." }`.
- Person 2 (Vickna Sai Kumar) can extend feature flag middleware, integrate remote feature flag services, or add new API endpoints seamlessly.

---

## 🧪 Testing & Verification

1. **Verify Health Check Endpoint:**
   ```bash
   npm test
   ```
2. **Verify SMTP & Send Live Ethereal Test Email:**
   ```bash
   npm run test:email
   ```
   *Logs will display the generated Ethereal preview link to inspect the rendered HTML in a web browser.*

