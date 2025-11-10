# Email Verification Configuration Guide

## Current Issue
No verification emails are being sent after signup.

## Root Cause
Supabase email confirmation is not enabled or configured properly.

---

## Quick Fix Options

### Option 1: Enable Email Confirmation (Recommended for Production)

1. **Supabase Dashboard → Authentication → Providers**
   - Click on "Email" provider
   - Toggle "Confirm email" to **ON**
   - Save changes

2. **Configure Site URL**
   - Go to Authentication → URL Configuration
   - Site URL: `https://your-vercel-domain.vercel.app`
   - Save

3. **Add Redirect URLs**
   - Same page, add:
     - `https://your-vercel-domain.vercel.app/**`
     - `http://localhost:5173/**`
   - Save

4. **Test:**
   - Sign up with new email
   - Check inbox (and spam!)
   - Click verification link
   - Should redirect to your app

---

### Option 2: Disable Email Confirmation (Quick Testing)

If you want to test the app without email verification:

1. **Supabase Dashboard → Authentication → Providers**
   - Click on "Email" provider
   - Toggle "Confirm email" to **OFF**
   - Save changes

2. **Users can now:**
   - Sign up
   - Login immediately
   - No email verification needed

⚠️ **Warning:** Less secure. Only for development/testing.

---

## Troubleshooting

### Issue: Still no emails after enabling

**Check:**
1. Spam/junk folder
2. Supabase email quota (free tier: 4 emails/hour)
3. Email provider settings
4. Logs in Supabase Dashboard

### Issue: Email received but link doesn't work

**Check:**
1. Site URL is set correctly
2. Redirect URLs include your domain
3. Link hasn't expired (24hr default)
4. Link hasn't been used already

### Issue: "OTP expired" error

**Fix:**
1. Request new verification email
2. Check Site URL matches your domain
3. Try in incognito mode

---

## Current Configuration Needed

Based on your Vercel deployment:

```
Site URL: https://belgeneh.vercel.app
(Replace with your actual Vercel domain)

Redirect URLs:
- https://belgeneh.vercel.app/**
- http://localhost:5173/**
```

---

## Testing Checklist

- [ ] Email confirmation enabled in Supabase
- [ ] Site URL set to production domain
- [ ] Redirect URLs configured
- [ ] Email template is active
- [ ] Signed up with NEW email address
- [ ] Checked spam folder
- [ ] Verified link works

---

## What to Tell Me

After following these steps, let me know:

1. **Did you enable "Confirm email" in Supabase?** (Yes/No)
2. **What is your Vercel domain?** (e.g., belgeneh.vercel.app)
3. **Did you receive the verification email?** (Yes/No/Spam)
4. **Any error messages?** (Copy the exact error)

This will help me diagnose the exact issue!
