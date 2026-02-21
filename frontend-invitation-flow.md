# Frontend Changes for Admin User Invitation Flow

## Overview

Previously, admins created users with passwords via `POST /api/v1/users`. Now, the password field is optional. When omitted, the user receives an invitation email to set their own password.

---

## 1. Create User Form (`POST /api/v1/users`)

**Password is now optional.** The `password` field can be omitted entirely from the request body.

**Two flows based on whether password is provided:**

| Field sent | What happens | User state |
|------------|-------------|------------|
| `{email, full_name, role}` (no password) | User created + invitation email sent | `email_verified: false`, `password_hash: ""` |
| `{email, password, full_name, role}` | Old flow, unchanged | `email_verified: true`, has password |

**Recommended UI change:** Remove the password field from the admin create-user form. Just collect email, name, and role. The user will set their own password via the invitation link.

---

## 2. New Public Route: Accept Invitation

```
POST /api/v1/auth/accept-invitation
```

**No auth required** (public route, like login/register).

**Request:**
```json
{
  "token": "<JWT from email link>",
  "password": "min8characters"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "...", "..." : "..." },
    "tokens": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_at": "..."
    }
  }
}
```

The user is auto-logged in. Store the tokens and redirect to dashboard.

**Error responses:**

| Status | Code | Meaning |
|--------|------|---------|
| 401 | `INVALID_INVITATION_TOKEN` | Token expired (72h), already used, or malformed |
| 403 | `USER_INACTIVE` | Admin deactivated the user before they accepted |
| 400 | `VALIDATION_ERROR` | Password missing or < 8 chars |

**Frontend page needed:** `/accept-invitation?token=<token>`

The invitation email links here. Show a "Set your password" form with just a password field (+ confirm). On submit, call the endpoint above.

---

## 3. Resend Invitation (Admin Only)

```
POST /api/v1/users/:id/resend-invitation
```

**Requires auth** (admin role). No request body.

**Success (200):**
```json
{
  "success": true,
  "data": { "message": "invitation resent" }
}
```

**Errors:**

| Status | Code | Meaning |
|--------|------|---------|
| 401 | `INVALID_INVITATION_TOKEN` | User already accepted (has password) or is a Google OAuth user |
| 404 | `NOT_FOUND` | User not found |

**Recommended UI:** In the user list, show a "Resend Invitation" button for users who haven't accepted yet (see section 5 for how to identify them).

---

## 4. New Login Error

When an invited user tries to log in before accepting:

```json
{
  "success": false,
  "error": {
    "code": "INVITATION_PENDING",
    "message": "please check your email and accept the invitation to set your password"
  }
}
```

**HTTP status: 403.** The frontend should show this message on the login page instead of a generic error.

---

## 5. How to Identify Invited-But-Pending Users

From the user list (`GET /api/v1/users`), an invited user who hasn't accepted yet has:

- `email_verified: false`
- They're on a paid tenant (not free tier)

This is the only scenario where a paid-tenant user has `email_verified: false` (previously all admin-created users were always `email_verified: true`).

Use this to conditionally show:
- A "Pending Invitation" badge/status
- A "Resend Invitation" action button

---

## 6. Forgot Password

Invited users who click "Forgot Password" before accepting will get no email (silent skip by design). No frontend change needed, but you could optionally show a hint: "If you were recently invited, please check your email for the invitation link instead."

---

## Summary of New/Changed Endpoints

| Endpoint | Auth | Change |
|----------|------|--------|
| `POST /users` | Admin | `password` now optional |
| `POST /auth/accept-invitation` | **Public** (new) | Token + password -> auto-login |
| `POST /users/:id/resend-invitation` | Admin (new) | Resends invitation email |
| `POST /auth/login` | Public | New `INVITATION_PENDING` (403) error code |

---

## Invitation Email Details

- **Subject:** "You've been invited to join SATVOS"
- **Link:** `{FRONTEND_URL}/accept-invitation?token=<jwt>`
- **Expiry:** 72 hours
- **Body:** Includes the user's name, their assigned role, and a CTA button to set their password
