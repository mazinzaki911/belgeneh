# Production Setup Guide for Belgeneh

This guide will help you configure your app for production use with professional email templates and proper authentication settings.

---

## 🔧 Step 1: Fix "Too Many Requests" Error

The rate limiting error occurs due to Supabase's default security settings. Follow these steps to fix it:

### A. Configure Supabase Auth Settings

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Navigate to**: Authentication → Settings

### B. Adjust Rate Limits

Scroll down to **"Rate Limits"** section and update:

```
Email Signups: 5 per hour → Change to: 20 per hour (or higher for production)
Email Confirmations: 3 per hour → Change to: 10 per hour
```

### C. Configure Email Settings (IMPORTANT)

1. In **Authentication → Settings**, find **"Enable email confirmations"**
2. **Option 1 - Disable Email Confirmation (Faster onboarding)**:
   - Toggle OFF "Enable email confirmations"
   - Users will be auto-logged in after signup
   - ⚠️ Less secure, but better UX

3. **Option 2 - Keep Email Confirmation (Recommended for Production)**:
   - Keep it ON
   - Configure SMTP settings (see Step 2 below)
   - Users must verify email before logging in

### D. Site URL Configuration

1. In **Authentication → URL Configuration**, set:
   ```
   Site URL: https://belgeneh-silk.vercel.app
   Redirect URLs:
   - https://belgeneh-silk.vercel.app/**
   - http://localhost:5173/** (for development)
   ```

---

## 📧 Step 2: Professional Email Configuration

### Option A: Use Supabase's Default SMTP (Quick Start)

Supabase provides free email sending, but with:
- ✅ No configuration needed
- ❌ Limited to 3 emails/hour per IP
- ❌ Emails may go to spam
- ❌ Generic "no-reply@supabase.io" sender

**This is causing your rate limit issues!**

### Option B: Configure Custom SMTP (RECOMMENDED for Production)

Use a professional email service for better deliverability:

#### 1. Choose an Email Service Provider

**Recommended Options:**
- **SendGrid** (Free: 100 emails/day) - https://sendgrid.com
- **Mailgun** (Free: 5,000 emails/month) - https://mailgun.com
- **AWS SES** (Cheapest: $0.10 per 1,000 emails) - https://aws.amazon.com/ses
- **Resend** (Free: 3,000 emails/month) - https://resend.com

#### 2. Setup SendGrid (Example)

1. **Sign up**: https://signup.sendgrid.com
2. **Verify your domain** or use Single Sender Verification
3. **Create API Key**: Settings → API Keys → Create API Key
4. **Get SMTP Credentials**:
   - SMTP Server: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `<your-api-key>`

#### 3. Configure in Supabase

1. Go to: **Authentication → Settings → SMTP Settings**
2. **Enable Custom SMTP**
3. Fill in:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   Sender Email: noreply@yourdomain.com (or verified email)
   Sender Name: Belgeneh
   Username: apikey
   Password: <your-sendgrid-api-key>
   ```
4. **Save**
5. **Send Test Email** to verify

---

## 🎨 Step 3: Professional Email Templates

### A. Confirmation Email Template

1. **Go to**: Authentication → Email Templates → Confirm signup
2. **Replace** with this professional template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Belgeneh</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Container -->
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Cairo', sans-serif;">
                                Belgeneh
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                                مرحباً بك في بلجنة! 🎉
                            </h2>

                            <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                شكراً لإنشاء حساب معنا. للبدء في استخدام أدوات الاستثمار العقاري المتقدمة، يرجى تأكيد عنوان بريدك الإلكتروني.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            تأكيد البريد الإلكتروني
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                أو انسخ هذا الرابط في متصفحك:
                            </p>

                            <p style="margin: 0 0 30px; padding: 12px; background-color: #f7fafc; border-radius: 6px; color: #667eea; font-size: 14px; word-break: break-all;">
                                {{ .ConfirmationURL }}
                            </p>

                            <!-- Features -->
                            <div style="margin: 30px 0; padding: 20px; background-color: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
                                <h3 style="margin: 0 0 15px; color: #2d3748; font-size: 18px; font-weight: 600;">
                                    ما يمكنك فعله:
                                </h3>
                                <ul style="margin: 0; padding-right: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                                    <li>تحليل العقارات بأدوات متقدمة</li>
                                    <li>حساب العائد على الاستثمار</li>
                                    <li>إدارة محفظتك العقارية</li>
                                    <li>تتبع المهام والمستندات</li>
                                </ul>
                            </div>

                            <!-- Security Notice -->
                            <div style="margin: 30px 0; padding: 15px; background-color: #fff5f5; border-radius: 6px; border-left: 3px solid #fc8181;">
                                <p style="margin: 0; color: #742a2a; font-size: 13px; line-height: 1.6;">
                                    <strong>تنبيه أمني:</strong> إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد الإلكتروني.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                                هذا الرابط صالح لمدة 24 ساعة فقط
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2025 Belgeneh. جميع الحقوق محفوظة.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

3. **Click "Save"**
4. **Send test email** to verify it works

### B. Password Reset Email Template (Optional)

Follow the same process for:
- **Reset Password Template**
- **Magic Link Template** (if you use it)

---

## ✅ Step 4: Test the Setup

### A. Clear Rate Limits (If Still Blocked)

If you're still seeing "Too many requests":

1. **Wait 1 hour** for rate limits to reset
2. Or **change your IP** (use mobile hotspot temporarily)
3. Or **use a different email** to test

### B. Test Email Flow

1. **Sign up with a new email**
2. **Check inbox** (and spam folder)
3. **Verify email looks professional**
4. **Click verification link**
5. **Should redirect to app and allow login**

---

## 🚀 Step 5: Production Checklist

Before going live, ensure:

- [ ] Custom SMTP configured (not using Supabase default)
- [ ] Email templates updated with your branding
- [ ] Rate limits increased (20+ signups/hour)
- [ ] Site URL set to production domain
- [ ] Email confirmation enabled (for security)
- [ ] Test signup flow end-to-end
- [ ] Check emails don't go to spam
- [ ] Password requirements clear to users
- [ ] Error messages are user-friendly

---

## 📊 Monitoring & Analytics

### Track Email Deliverability

If using SendGrid:
1. Go to SendGrid Dashboard
2. Check **Activity Feed** for delivery status
3. Monitor bounce and spam rates

### Supabase Auth Logs

1. Go to: **Authentication → Logs**
2. Monitor failed login attempts
3. Check for suspicious activity

---

## 🆘 Troubleshooting

### "Too many requests" still appears

**Solution:**
1. Verify SMTP settings are correct
2. Increase rate limits in Supabase
3. Wait for rate limit window to reset (1 hour)
4. Contact Supabase support if persists

### Emails go to spam

**Solution:**
1. Configure SPF, DKIM, DMARC records for your domain
2. Use a verified sender email
3. Avoid spam trigger words
4. Use reputable SMTP provider

### Email confirmation not working

**Solution:**
1. Check Supabase email template has `{{ .ConfirmationURL }}`
2. Verify SMTP credentials are correct
3. Check email logs in SMTP provider dashboard
4. Ensure redirect URL is correct

---

## 📞 Support

Need help? Check:
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **SendGrid Docs**: https://docs.sendgrid.com
- **Email Delivery Best Practices**: https://sendgrid.com/blog/email-deliverability-guide

---

## 🎯 Next Steps

Once email is working properly:
1. ✅ Remove debug logs from production
2. ✅ Set up analytics (PostHog, Google Analytics)
3. ✅ Configure error monitoring (Sentry)
4. ✅ Add CAPTCHA for signup (prevent spam)
5. ✅ Create mobile APK (see MOBILE_APP_GUIDE.md)

