# Google OAuth & Professional Email Setup Guide

This guide will help you configure Google Sign-In and set up professional branded email templates for Belgeneh.

---

## 🔐 Part 1: Enable Google OAuth

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"

4. **Configure OAuth Consent Screen** (if prompted)
   - User Type: External
   - App name: Belgeneh
   - User support email: your@email.com
   - Developer contact: your@email.com
   - Scopes: email, profile, openid
   - Save and continue

5. **Set Authorized Redirect URIs**

   Add these redirect URLs:
   ```
   https://vwrctfiphtnnafsjzxev.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```

6. **Copy Your Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Save them securely!

---

### Step 2: Configure Supabase Google Provider

1. **Go to Supabase Dashboard**
   - Open: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication → Providers**
   - Click "Authentication" in sidebar
   - Click "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the list
   - Toggle it **ON**

4. **Enter Your Google Credentials**
   - **Client ID**: Paste the Client ID from Google
   - **Client Secret**: Paste the Client Secret from Google
   - Click "Save"

5. **Configure Redirect URL (if needed)**
   - Site URL should be: `https://belgeneh-silk.vercel.app`
   - Redirect URLs should include: `https://belgeneh-silk.vercel.app/**`

---

### Step 3: Test Google Sign-In

1. **Go to your app**: https://belgeneh-silk.vercel.app
2. **Click "Continue with Google"**
3. **Select your Google account**
4. **Grant permissions**
5. **You should be redirected back and logged in!**

---

## 📧 Part 2: Setup Professional Email Template

### Step 1: Update Email Template in Supabase

1. **Go to Supabase Dashboard**
   - Authentication → Email Templates

2. **Click on "Confirm signup"**

3. **Replace the template with this:**
   - Open the file: `email-templates/confirm-signup.html`
   - Copy the entire HTML content
   - Paste into the Supabase editor

4. **Important Template Variables**
   Make sure these are in your template:
   - `{{ .ConfirmationURL }}` - The verification link
   - `{{ .Email }}` - User's email address
   - `{{ .SiteURL }}` - Your app URL

5. **Preview the Email** (optional)
   - Click "Send test email"
   - Enter your email
   - Check how it looks!

6. **Click "Save"**

---

### Step 2: Customize the Template (Optional)

You can customize the email template by editing `email-templates/confirm-signup.html`:

**Brand Colors:**
```html
<!-- Change the header gradient -->
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

<!-- Change to your brand colors -->
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

**Logo:**
```html
<!-- Replace the text logo with an image -->
<h1 style="...">Belgeneh</h1>

<!-- With -->
<img src="YOUR_LOGO_URL" alt="Belgeneh" style="max-width: 200px; height: auto;" />
```

**Content:**
- Update the welcome message
- Add/remove features
- Customize the security notice

---

## 📋 Email Template Features

The professional template includes:

✅ **Responsive Design** - Works on mobile and desktop
✅ **Brand Gradient** - Eye-catching purple gradient header
✅ **Clear CTA Button** - Prominent "Verify Email Address" button
✅ **Fallback Link** - For email clients that block buttons
✅ **Security Notice** - Professional security warning
✅ **Features Preview** - Shows what users can do
✅ **Footer** - Copyright and branding
✅ **Email Client Compatible** - Works with Gmail, Outlook, etc.

---

## 🎨 Template Customization Options

### Change Colors

1. **Primary Gradient** (Header & Button):
   ```html
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   ```

2. **Accent Color** (Links & Borders):
   ```html
   color: #667eea;
   border-left: 4px solid #667eea;
   ```

### Add Your Logo

Replace the text header with an image:

```html
<!-- Current -->
<h1 style="...">Belgeneh</h1>

<!-- With Logo -->
<img src="https://your-domain.com/logo.png" alt="Belgeneh" />
```

### Customize Features List

Edit the features section:

```html
<ul style="...">
    <li>Your custom feature 1</li>
    <li>Your custom feature 2</li>
    <li>Your custom feature 3</li>
</ul>
```

---

## 🧪 Testing

### Test Email Verification

1. **Create new account** with a real email
2. **Check inbox** (and spam folder)
3. **Email should look professional** with brand colors
4. **Click verification link**
5. **Should redirect to app** and allow login

### Test Google Sign-In

1. **Click "Continue with Google"**
2. **Select Google account**
3. **Should create account automatically**
4. **Should redirect to app**
5. **Should be logged in**

---

## 🔍 Troubleshooting

### Google Sign-In Issues

**Issue: "OAuth Error"**
- Check redirect URIs match exactly
- Ensure Google+ API is enabled
- Verify Client ID and Secret are correct

**Issue: "Access Denied"**
- Complete OAuth Consent Screen
- Add your email to test users (if in testing mode)
- Check scopes are configured

### Email Template Issues

**Issue: Email looks broken**
- Some email clients don't support CSS
- Use inline styles only
- Test with Gmail, Outlook, Apple Mail

**Issue: Variables not working**
- Use exact Supabase variable syntax: `{{ .VariableName }}`
- Check spelling: `ConfirmationURL` not `ConfirmURL`

**Issue: Images not loading**
- Use absolute URLs: `https://domain.com/image.png`
- Some email clients block images by default

---

## 📊 Email Analytics (Optional)

Track email performance:

1. **Add tracking pixel**:
   ```html
   <img src="https://your-analytics.com/track?email={{ .Email }}" width="1" height="1" />
   ```

2. **Track link clicks**:
   ```html
   <a href="{{ .ConfirmationURL }}&utm_source=email&utm_campaign=verification">
   ```

---

## ✅ Checklist

After setup, verify:

- [ ] Google OAuth enabled in Supabase
- [ ] Google credentials configured correctly
- [ ] Redirect URIs match production and local URLs
- [ ] Email template updated in Supabase
- [ ] Template tested and looks professional
- [ ] Email verification works end-to-end
- [ ] Google sign-in works
- [ ] Users receive branded emails

---

## 🎉 You're Done!

Your app now has:
- ✅ Google Sign-In (one-click authentication)
- ✅ Professional branded verification emails
- ✅ Better user experience
- ✅ Multiple login options

---

## 📞 Support

**Email template not rendering correctly?**
- Most email clients have limited CSS support
- Use tables for layout
- Inline styles only
- Test with real email clients

**Google OAuth not working?**
- Double-check redirect URIs
- Verify API is enabled
- Check credentials are correct
- Review Supabase logs

**Need custom branding?**
- Edit `email-templates/confirm-signup.html`
- Update colors, logo, content
- Test before deploying
- Keep template lightweight (< 100KB)
