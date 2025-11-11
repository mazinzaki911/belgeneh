# Resend SMTP Verification Checklist

Please verify these settings in your Supabase dashboard:

## 1. Supabase SMTP Configuration

Go to: **Authentication → Settings → SMTP Settings**

Verify these are set correctly:

```
✓ Enable Custom SMTP: ON
✓ SMTP Host: smtp.resend.com
✓ SMTP Port: 587
✓ Sender Email: onboarding@resend.dev (or your verified domain email)
✓ Sender Name: Belgeneh
✓ Username: resend
✓ Password: re_xxxxxxxxxxxxxxxxxx (your Resend API key)
```

## 2. Email Confirmations

Go to: **Authentication → Settings**

```
✓ Enable email confirmations: ON
✓ Secure email change: ON
✓ Double confirm email changes: OFF (optional)
```

## 3. Rate Limits

Go to: **Authentication → Settings → Rate Limits**

```
✓ Email signups per hour: 20 (or higher)
✓ Email/SMS OTP per hour: 10 (or higher)
```

## 4. URL Configuration

Go to: **Authentication → URL Configuration**

```
✓ Site URL: https://belgeneh-silk.vercel.app
✓ Redirect URLs:
  - https://belgeneh-silk.vercel.app/**
  - http://localhost:5173/** (for development)
```

## 5. Test SMTP

In Supabase dashboard:
1. Go to SMTP Settings
2. Click "Send test email"
3. Enter your email
4. Check if you receive it

If test email fails, check:
- API key is correct
- Sender email is verified in Resend
- SMTP credentials are correct

## 6. Resend Dashboard

Go to: **https://resend.com/emails**

Check:
- ✓ Emails are being sent
- ✓ Delivery status is "Delivered"
- ✓ No bounces or errors
- ✓ From address is verified

## Common Issues

**Issue:** Emails not sending
**Fix:**
- Verify Resend API key in Supabase
- Check sender email is verified
- Check rate limits

**Issue:** Emails go to spam
**Fix:**
- Verify your domain in Resend
- Add SPF/DKIM records
- Use custom domain email (not onboarding@resend.dev)

**Issue:** Rate limiting
**Fix:**
- Increase rate limits in Supabase settings
- Wait 1 hour for limits to reset
- Use different email/IP for testing
