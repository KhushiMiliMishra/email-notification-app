# Email and Notification Application

## Project Overview

The Email and Notification Application is a web-based application designed to manage and send email notifications through a structured and configurable system.

The project focuses on environment-specific configuration, API management, feature flags, and email integration. It aims to provide a modular application in which email functionality can be controlled through configuration settings and reusable email templates.

## Objectives

- Develop a web application using Angular and Node.js.
- Implement environment-specific configurations for development and production.
- Create and manage REST APIs for application functionality.
- Implement feature flags to enable or disable specific email notification features.
- Integrate email functionality using Nodemailer and SMTP.
- Design reusable HTML email templates.
- Test API endpoints and verify application integration.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Angular, TypeScript |
| Backend | Node.js, Express.js |
| Email Integration | Nodemailer, SMTP |
| API Communication | REST APIs |
| API Testing | Postman |
| Version Control | Git and GitHub |

## Project Structure

```text
email-notification-app/
│
├── frontend/
│   └── Angular application
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   │   └── templates/
│   ├── .env.example
│   └── server.js
│
├── docs/
│   ├── architecture.md
│   └── api-documentation.md
│
├── README.md
└── .gitignore
```

## Team Responsibilities

| Member | Responsibility |
|---|---|
| Srinivasan | Angular frontend and environment configuration |
| Vickna Sai Kumar | API management and feature flags |
| Shreya | Node.js backend and email service integration |
| Sabari | Reusable HTML email templates |
| Khushi | Project coordination, GitHub management, integration testing and documentation |

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js and npm
- Angular CLI
- Git
- A code editor such as Visual Studio Code
- Postman (for API testing)

### Clone the Repository

```bash
git clone <repository-url>
cd email-notification-app
```

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

The Angular application will typically be available at:

`http://localhost:4200`

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference and configure the required environment variables.

Start the backend using the project's configured start script.

The backend will typically run at:

`http://localhost:5000`

## Environment Configuration

The application uses environment-specific configuration to separate development and production settings.

Sensitive information such as SMTP credentials and email service passwords must be stored in environment variables and must never be committed to GitHub.

## Feature Flags

Feature flags will be used to control individual notification features, such as:

- Welcome emails
- Verification emails
- Password reset emails
- Promotional emails

The availability of each feature will be controlled through the application's configuration and backend logic.

## API Documentation

API endpoints, request formats and response structures will be documented in the `docs/api-documentation.md` file as implementation progresses.

## Version Control Workflow

The project uses Git and GitHub for collaborative development.

- `main` – stable application code.
- Each member works on an assigned feature branch.
- Changes are submitted through Pull Requests.
- Code is reviewed before merging into `main`.

## Project Status

Currently under development.

## License

This project is developed for academic purposes.
