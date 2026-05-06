# CSRF Protection Implementation

## Overview

CSRF (Cross-Site Request Forgery) protection has been implemented using the **Synchronizer Token Pattern** with httpOnly cookies.

## How It Works

### 1. Token Generation (Middleware)
- Every response sets a `csrf_token` cookie via `middleware.ts`
- Token is a 32-byte random hex string (64 characters)
- Cookie settings:
  - `httpOnly: true` - Not accessible via JavaScript
  - `sameSite: lax` - Prevents cross-site sending
  - `secure: true` (production) - HTTPS only
  - `maxAge: 3600` - 1 hour expiration

### 2. Token Validation (Server Actions)
All server actions now validate the CSRF token:

```typescript
// In each action
const csrfValid = await validateCSRFToken(formData);
if (!csrfValid) {
  return { success: false, message: "Security check failed..." };
}
```

### 3. Protected Actions

**Authentication:**
- ✅ `loginUserAction`
- ✅ `loginAdminAction`

**User Actions:**
- ✅ `createTicketAction`
- ✅ `replyToTicketAction`
- ✅ `updateUserProfileAction`

**Admin Actions:**
- ✅ `replyAsAdminAction`
- ✅ `updateTicketStatusAction`
- ✅ `upsertUserAction`
- ✅ `updateAdminSettingsAction`

## Files Modified

### Core Libraries
- `lib/csrf.ts` - CSRF token generation and validation utilities
- `middleware.ts` - Automatic CSRF token setting on all responses

### Server Actions
- `lib/actions/auth.ts` - Login actions
- `lib/actions/user.ts` - User ticket/profile actions
- `lib/actions/admin.ts` - Admin management actions

## Security Features

### Constant-Time Comparison
Prevents timing attacks by using `timingSafeEqual()` for token validation.

### Token Rotation
New token generated on each response if not present.

### HttpOnly Cookie
Token stored in httpOnly cookie, inaccessible to JavaScript (prevents XSS token theft).

### SameSite=Lax
Prevents cross-site requests from sending the cookie.

## Testing

### Manual Test
1. Open browser dev tools → Application → Cookies
2. Verify `csrf_token` cookie exists
3. Submit any form (login, ticket, profile)
4. Should succeed with valid token

### Attack Simulation
1. Create a malicious HTML page with a form targeting your app
2. Try to submit from another origin
3. Request will fail CSRF validation (no valid token cookie)

## Production Checklist

- [ ] Ensure `SESSION_SECRET` is at least 32 characters
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Test CSRF validation with forms
- [ ] Monitor for CSRF failures in logs

## Future Enhancements

1. **Logging**: Add CSRF failure logging for security monitoring
2. **Rate Limiting**: Add rate limiting on CSRF failures
3. **Token Refresh**: Implement token refresh before expiration
4. **Double Submit Cookie**: Add header-based validation for API routes

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Server Actions Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
