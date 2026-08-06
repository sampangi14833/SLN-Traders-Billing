# SLN Traders Billing

Angular-only billing workspace for SLN Traders.

The repository now keeps only the frontend application. Registration, login,
OTP checks, password reset, sessions, and recent bill history all run inside the
Angular app. No backend service or database is required.

## Project Structure

* `frontend` - Angular application

## Features

* Frontend-only login, registration, OTP verification, and password reset
* Browser-local account storage and JWT-style 12-hour session tokens
* Size sheet entry with automatic stone counts and area totals
* Bill generation with print, view, and HTML download support
* Per-user recent bill history saved in browser storage

## OTP Email Setup

OTP is sent from the Angular app through EmailJS. Connect the Gmail account in
the EmailJS dashboard, then fill these values in both environment files:

* `frontend/src/environments/environment.ts`
* `frontend/src/environments/environment.prod.ts`

```ts
emailjs: {
  serviceId: 'your_service_id',
  templateId: 'your_template_id',
  publicKey: 'your_public_key',
  fromName: 'SLN Traders Billing'
}
```

Your EmailJS template should use these variables:

* `to_email`
* `email`
* `user_email`
* `recipient_email`
* `reply_to`
* `otp`
* `purpose`
* `message`
* `from_name`

In the EmailJS template settings, set the recipient/to email field to
`{{to_email}}`. The app also sends the email address under the alias variables
above so older templates can still work.

If EmailJS is not configured, the app will not show the OTP on screen. Registration
and password reset require a configured email service.

## SMTP and OAuth Note

Do not put Gmail SMTP username/password or app passwords in Angular environment
files. Frontend code is public in the browser, so those credentials would be
exposed. Use EmailJS, a serverless function, or a backend API to hold SMTP/OAuth
secrets safely.

This app has frontend-only JWT-style session tokens for route protection. True
JWT security requires a backend or trusted verifier because a frontend-only
signing key can be inspected by users.

## Run Locally

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:4200`.

## Build

```bash
cd frontend
npm run build
```

The production build is generated in `frontend/dist/SLN-Billing/browser`.

## Deploy On Netlify

This repo is configured for Netlify with `netlify.toml` at the repository root.
After connecting the GitHub repository to Netlify, Netlify should use these
settings automatically:

* Base directory: `frontend`
* Build command: `npm run build`
* Publish directory: `dist/SLN-Billing/browser`
* Node version: `22.12.0`

The SPA redirect rule is included so routes like `/login`, `/register`, and
`/recent-bills` load correctly after refresh.

## Note

This is a browser-only app. Data is saved in the user's browser storage, so it is
not shared across browsers or devices.
