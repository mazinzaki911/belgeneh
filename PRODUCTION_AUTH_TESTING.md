# Production Authentication Testing Guide

This guide will help you test and verify the complete authentication flow is working correctly with Resend SMTP.

---

## ✅ Pre-Flight Checklist

Before testing, verify in Supabase dashboard:

### 1. **SMTP Configuration** (Authentication → Settings → SMTP)
```
✓ Enable Custom SMTP: ON
✓ Host: smtp.resend.com
✓ Port: 587
✓ Sender Email: your-email@yourdomain.com (or onboarding@resend.dev)
✓ Username: resend
✓ Password: Your Resend API key (starts with re_)
```

### 2. **Email Confirmations** (Authentication → Settings)
```
✓ Enable email confirmations: ON
✓ Confirm email: ON
```

### 3. **Rate Limits** (Authentication → Settings)
```
✓ Email signups per hour: 20 or higher
✓ Email/SMS OTP per hour: 10 or higher
```

### 4. **URL Configuration**  (Authentication → URL Configuration)
```
✓ Site URL: https://belgeneh-silk.vercel.app
✓ Redirect URLs: https://belgeneh-silk.vercel.app/**
```

---

## 🧪 Testing Steps

### **Step 1: Clear Browser Cache**
1. Open **Incognito/Private window** (Ctrl+Shift+N or Cmd+Shift+N)
2. Go to: https://belgeneh-silk.vercel.app
3. Press F12 → Console tab (to see any errors)

### **Step 2: Sign Up**
1. Click **"Sign up now"**
2. Enter:
   - Name: Test User
   - Email: **Use a REAL email you have access to**
   - Password: minimum 6 characters
3. Click **"Sign Up"**

### **Expected Results:**
✅ **Success** - You should see:
```
┌─────────────────────────────────────────┐
│ ✓ تم إنشاء الحساب بنجاح!               │
│                                         │
│ يرجى التحقق من بريدك الإلكتروني        │
│ والنقر على رابط التفعيل                │
│                                         │
│ [انتقل إلى تسجيل الدخول]               │
└─────────────────────────────────────────┘
```
- Green success box appears
- Form disappears
- "Go to Login" button shown

❌ **Failure** - If you see error:
- Check console (F12) for the exact error message
- See troubleshooting section below

### **Step 3: Check Email**
1. Check your email inbox (and spam folder!)
2. You should receive email from: **Belgeneh** or **your-sender-email**
3. Subject: Usually "Confirm Your Email" or similar

### **Expected Email:**
✅ Should contain:
- Professional email template
- Clear "Verify Email" button/link
- Link should start with: `https://vwrctfiphtnnafsjzxev.supabase.co/auth/v1/verify?...`

❌ If no email received:
- Wait 2-3 minutes (Resend can be slow)
- Check spam/junk folder
- Check Resend dashboard: https://resend.com/emails
- See troubleshooting section

### **Step 4: Verify Email**
1. Click the verification link in email
2. You should be redirected to: https://belgeneh-silk.vercel.app

### **Expected Results:**
✅ You should:
- See a brief loading screen
- Be redirected back to the app homepage
- **NOT be logged in automatically**
- Need to manually login

### **Step 5: Login**
1. On the app homepage, you should still see login page
2. Click **"Go to Login"** (if on signup success screen)
3. OR manually click **"Log in"** at the bottom
4. Enter:
   - Email: (same as signup)
   - Password: (same as signup)
5. Click **"Login"**

### **Expected Results:**
✅ **Success** - You should:
- Be logged into the app
- See the main dashboard
- Profile should load

❌ **Failure** - If you see:
- "Please verify your email" → Email not verified yet, check email again
- "Incorrect email or password" → Wrong credentials or email still not verified
- Other error → See console (F12) and troubleshooting below

---

## 🐛 Troubleshooting

### **Issue 1: "An unexpected error occurred"**

**Possible Causes:**
- Rate limiting from Supabase
- SMTP not configured correctly
- Resend API key invalid

**Solutions:**
1. **Check Console Error:**
   - Press F12 → Console tab
   - Look for error message starting with "Signup failed:"
   - Copy the EXACT error message

2. **If error contains "rate limit" or "too many requests":**
   ```
   Solution:
   - Wait 1 hour
   - OR use different email
   - OR use different IP (mobile hotspot)
   - OR increase rate limits in Supabase
   ```

3. **If error contains "SMTP" or "email":**
   ```
   Solution:
   - Verify Resend SMTP settings in Supabase
   - Test SMTP in Supabase dashboard (Send test email)
   - Check Resend API key is correct
   ```

4. **If error contains "User already registered":**
   ```
   Solution:
   - Use a different email address
   - OR delete the existing user in Supabase dashboard:
     Dashboard → Authentication → Users → Find user → Delete
   ```

### **Issue 2: No Verification Email Received**

**Check These:**

1. **Spam Folder**
   - Check spam/junk/promotions folder
   - Mark as "Not Spam" if found

2. **Resend Dashboard**
   - Go to: https://resend.com/emails
   - Check if email was sent
   - Check delivery status
   - Look for bounces or errors

3. **Resend API Key**
   - Verify API key is correct in Supabase
   - Key should start with `re_`
   - Try regenerating key in Resend

4. **Sender Email**
   - If using custom domain, verify it's set up in Resend
   - If using onboarding@resend.dev, should work immediately
   - Add SPF/DKIM records if using custom domain

5. **Supabase SMTP Test**
   - Go to: Supabase → Authentication → Settings → SMTP
   - Click "Send test email"
   - Enter your email
   - Check if it arrives

### **Issue 3: "Please verify your email before logging in"**

**This is CORRECT behavior if:**
- You haven't clicked the verification link yet
- Email verification link expired (24 hours)
- You clicked wrong link

**Solutions:**
1. Check your email for verification link
2. Click the verification link
3. If link expired, request new verification email:
   - Delete user in Supabase
   - Sign up again

### **Issue 4: Verification Link Doesn't Work**

**Check:**
1. **Link Format:**
   - Should start with: `https://vwrctfiphtnnafsjzxev.supabase.co/auth/v1/verify`
   - Should have `?token=` parameter

2. **Redirect URL:**
   - In Supabase → Authentication → URL Configuration
   - Site URL should be: `https://belgeneh-silk.vercel.app`
   - Should NOT have trailing slash

3. **Link Expiry:**
   - Links expire after 24 hours
   - Sign up again if expired

### **Issue 5: After Verification, Still Can't Login**

**Debug Steps:**
1. **Check Supabase Users:**
   - Go to: Supabase → Authentication → Users
   - Find your user
   - Check if "Email Confirmed At" has a timestamp
   - If NO timestamp → email not verified

2. **Manually Confirm Email:**
   - In Supabase Users list
   - Click on your user
   - Click "..." menu → "Confirm email"
   - Try logging in again

3. **Check Console:**
   - Press F12 → Console
   - Try logging in
   - Look for error messages
   - Copy and investigate

---

## 📊 Monitoring

### **Supabase Logs**
Check: **Authentication → Logs**
- See all signup/login attempts
- See failure reasons
- Track email confirmation events

### **Resend Dashboard**
Check: **https://resend.com/emails**
- Email delivery status
- Bounce rate
- Spam complaints
- Failed deliveries

---

## ✅ Success Criteria

Your auth flow is working correctly if:

1. ✅ Signup shows green success box
2. ✅ Verification email arrives within 1-2 minutes
3. ✅ Email has professional branding
4. ✅ Verification link works and redirects
5. ✅ After verification, login works
6. ✅ User sees main dashboard after login
7. ✅ No error messages during normal flow

---

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Resend SMTP working and tested
- [ ] Custom domain email configured (not onboarding@resend.dev)
- [ ] SPF and DKIM records added
- [ ] Email templates branded with your logo/colors
- [ ] Rate limits set appropriately (20+ per hour)
- [ ] Tested complete signup → verify → login flow
- [ ] Tested on multiple devices
- [ ] Error messages are user-friendly
- [ ] Email deliverability is good (no spam)
- [ ] Redirect URLs are correct for production
- [ ] Debug console logs removed
- [ ] Mobile app tested (if applicable)

---

## 📞 Support

If issues persist:

1. **Check Supabase Status:** https://status.supabase.com
2. **Check Resend Status:** https://status.resend.com
3. **Supabase Discord:** https://discord.supabase.com
4. **Resend Support:** https://resend.com/support

---

## 🔧 Quick Fixes

**Reset Everything:**
```bash
1. Delete all users in Supabase dashboard
2. Clear browser cache completely
3. Test with fresh email
4. Check SMTP test email works
5. Try signup again
```

**Bypass Email Verification (Testing Only):**
```
1. Supabase → Authentication → Settings
2. Toggle OFF "Enable email confirmations"
3. Save
4. Users can signup and login immediately
5. Re-enable for production
```

---

Good luck! Your auth flow should be production-ready now. 🎉
