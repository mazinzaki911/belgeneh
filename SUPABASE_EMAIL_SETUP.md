# Supabase Email Verification Setup Guide

This guide will help you configure Supabase to properly handle email verification with your production domain.

## 🔧 Problem

When users click the email verification link, they get redirected to `localhost:3000` with an error:
```
http://localhost:3000/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## ✅ Solution

Configure Supabase with your production URL.

---

## Step 1: Configure Redirect URLs in Supabase

1. **Go to your Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Click "URL Configuration"

3. **Add your Site URL**
   - Find the **"Site URL"** field
   - Replace `http://localhost:3000` with your **production URL**
   - Example: `https://belgeneh.vercel.app`
   - Click "Save"

4. **Add Redirect URLs**
   - Find the **"Redirect URLs"** section
   - Add these URLs (one per line):
     ```
     https://your-production-domain.vercel.app
     https://your-production-domain.vercel.app/
     https://your-production-domain.vercel.app/**
     http://localhost:5173
     http://localhost:5173/
     http://localhost:5173/**
     ```
   - Replace `your-production-domain` with your actual Vercel domain
   - The `localhost` entries are for local development
   - Click "Save"

---

## Step 2: Configure Email Templates

1. **Go to Email Templates**
   - Click "Authentication" in the left sidebar
   - Click "Email Templates"

2. **Update "Confirm signup" template**
   - Click on "Confirm signup"
   - Make sure the template uses `{{ .SiteURL }}` or `{{ .ConfirmationURL }}`
   - Default template should work fine:
     ```html
     <h2>Confirm your signup</h2>
     <p>Follow this link to confirm your user:</p>
     <p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
     ```
   - Click "Save"

3. **Test the template (Optional)**
   - You can send a test email to verify it works

---

## Step 3: Configure Email Provider (If Using Custom Domain)

If you're using a custom email provider:

1. **Go to Authentication → Settings**
2. **Scroll to "SMTP Settings"**
3. **Configure your SMTP provider** (e.g., SendGrid, AWS SES, etc.)
4. **Save settings**

**Note:** If you're using Supabase's default email service, skip this step.

---

## Step 4: Test the Email Flow

1. **Clear your browser cache and cookies**

2. **Go to your production app**
   - Visit `https://your-domain.vercel.app`

3. **Create a new account**
   - Use a real email address you can access
   - Fill in the signup form
   - Click "Sign Up"

4. **Check for success message**
   - You should see: "Account created! Please check your email..."
   - The form should clear

5. **Check your email**
   - Look for an email from Supabase
   - Subject: "Confirm Your Signup"

6. **Click the verification link**
   - Should redirect to your production domain
   - Should show the login page
   - No error message should appear

7. **Log in**
   - Use the email and password you just created
   - Should successfully log in

---

## 🔍 Troubleshooting

### Issue: Still getting localhost redirect

**Solution:**
- Double-check the "Site URL" in Supabase
- Make sure it's your production URL, not localhost
- Clear browser cache
- Try in incognito/private window

### Issue: "Email link is invalid or has expired"

**Possible causes:**
1. **Link already used** - Each verification link can only be used once
2. **Link expired** - Links expire after 24 hours (default)
3. **Wrong redirect URL** - Check Site URL in Supabase

**Solution:**
- Request a new verification email by trying to sign up again
- Or use the "Forgot Password" flow to verify email

### Issue: Email not received

**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check Supabase email logs: Authentication → Logs
- If using custom SMTP, verify SMTP settings

### Issue: Email received but link format is wrong

**Solution:**
- Go to Email Templates in Supabase
- Make sure template uses `{{ .ConfirmationURL }}`
- Don't manually construct URLs in templates

---

## 📋 Quick Checklist

After completing the setup, verify:

- [ ] Site URL is set to production domain (not localhost)
- [ ] Redirect URLs include your production domain
- [ ] Redirect URLs include localhost for development
- [ ] Email templates use `{{ .ConfirmationURL }}`
- [ ] Test signup creates account without auto-login
- [ ] Verification email is received
- [ ] Verification link redirects to production domain
- [ ] After verification, user can login successfully
- [ ] Admin user (said@gmail.com) gets admin role

---

## 🎯 Expected Behavior After Setup

1. **User signs up** → See success toast message
2. **User checks email** → Receives verification email
3. **User clicks link** → Redirected to production app (not localhost)
4. **User sees login page** → Can now login
5. **User logs in** → Successfully authenticated and sees dashboard

---

## 🔐 Security Notes

- Email verification links expire after 24 hours
- Links can only be used once
- Users cannot login until email is verified
- Failed login attempts are logged in Supabase
- Rate limiting is enabled by default

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [URL Configuration](https://supabase.com/docs/guides/auth/redirect-urls)

---

## ⚡ Quick Fix Script (If You Have Supabase CLI)

If you have Supabase CLI installed locally:

```bash
# Update Site URL
supabase secrets set SITE_URL="https://your-domain.vercel.app"

# Update redirect URLs
supabase secrets set REDIRECT_URLS="https://your-domain.vercel.app,https://your-domain.vercel.app/**,http://localhost:5173/**"
```

---

**That's it!** Your email verification should now work correctly! 🎉
