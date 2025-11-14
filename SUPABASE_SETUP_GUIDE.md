# Supabase Setup Guide for Belgeneh Real Estate Calculator

This guide will walk you through setting up your Supabase backend to work with the Belgeneh application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Admin access to your Google Cloud Console (if using Google OAuth)

---

## Part 1: Create a Supabase Project

### Step 1: Create New Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `belgeneh` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Start with Free tier
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

---

## Part 2: Set Up Database Schema

### Step 2: Run Database Schema Script

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. ✅ You should see: "Success. No rows returned"

### Step 3: Apply RLS Policy Fixes

1. Still in **SQL Editor**, click **"New Query"** again
2. Copy the entire contents of `supabase-schema-fix.sql`
3. Paste into the SQL editor
4. Click **"Run"**
5. ✅ You should see: "Success. No rows returned"

### Step 4: Verify Tables Were Created

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `user_profiles`
   - ✅ `saved_units`
   - ✅ `portfolio_properties`
   - ✅ `property_tasks`
   - ✅ `property_documents`
   - ✅ `app_settings`
   - ✅ `notifications`

---

## Part 3: Configure Authentication

### Step 5: Enable Email/Password Authentication

1. Go to **Authentication → Providers** (left sidebar)
2. Find **"Email"** provider
3. Make sure it's **enabled** (toggle should be ON)
4. **Enable email confirmations** (recommended):
   - Scroll down to **"Email Auth"** section
   - Toggle **"Enable email confirmations"** to ON
   - Click **"Save"**

### Step 6: Set Up Google OAuth (Optional but Recommended)

#### 6.1 - Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth client ID"**
5. If prompted, configure consent screen first:
   - **User Type**: External
   - **App name**: Belgeneh Real Estate Calculator
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Add scopes: `email`, `profile`, `openid`
6. Back to creating OAuth client:
   - **Application type**: Web application
   - **Name**: Belgeneh App
   - **Authorized JavaScript origins**:
     - Add your Supabase project URL (found in Supabase Settings → API)
     - Format: `https://your-project-ref.supabase.co`
   - **Authorized redirect URIs**:
     - Add: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Click **"Create"**
8. **Save** the Client ID and Client Secret

#### 6.2 - Configure Google OAuth in Supabase

1. Back in Supabase dashboard, go to **Authentication → Providers**
2. Find **"Google"** provider and click it
3. Toggle **"Enable Sign in with Google"** to ON
4. Paste your:
   - **Client ID** from Google Console
   - **Client Secret** from Google Console
5. Copy the **"Callback URL"** shown (you may need this)
6. Click **"Save"**

### Step 7: Configure Email Templates (Optional)

1. Go to **Authentication → Email Templates**
2. Customize templates for:
   - **Confirm signup** - Email sent to verify new accounts
   - **Magic Link** - Passwordless login email
   - **Change Email Address** - Confirm email changes
   - **Reset Password** - Password reset email

---

## Part 4: Get Your API Credentials

### Step 8: Copy Your Supabase Credentials

1. Go to **Settings → API** (left sidebar)
2. You'll find:

#### Project URL
   ```
   https://xxxxxxxxx.supabase.co
   ```
   Copy this - you'll need it as `VITE_SUPABASE_URL`

#### API Keys Section
   - **anon / public** key - Copy this as `VITE_SUPABASE_ANON_KEY`
   - **service_role** key - ⚠️ **KEEP SECRET!** This is for server-side only

3. Create a `.env.local` file in your project root:

```bash
# Copy from .env.example and fill in:
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **IMPORTANT**: Never commit `.env.local` to git! It's already in `.gitignore`.

---

## Part 5: Configure Row Level Security (RLS)

### Step 9: Verify RLS is Enabled

1. Go to **Authentication → Policies**
2. Select each table and verify policies exist:

#### `user_profiles` Table
- ✅ "Users can view their own profile"
- ✅ "Users can update their own profile"
- ✅ "Admins can view all profiles"
- ✅ "Admins can update all profiles"

#### `saved_units` Table
- ✅ "Users can view their own saved units"
- ✅ "Users can insert their own saved units"
- ✅ "Users can update their own saved units"
- ✅ "Users can delete their own saved units"

#### `portfolio_properties` Table
- ✅ "Users can view their own properties"
- ✅ "Users can insert their own properties"
- ✅ "Users can update their own properties"
- ✅ "Users can delete their own properties"

#### `property_tasks` Table
- ✅ "Users can view tasks for their properties"
- ✅ "Users can insert tasks for their properties"
- ✅ "Users can update tasks for their properties"
- ✅ "Users can delete tasks for their properties"

#### `property_documents` Table
- ✅ "Users can view documents for their properties"
- ✅ "Users can insert documents for their properties"
- ✅ "Users can delete documents for their properties"

#### `app_settings` Table
- ✅ "Anyone can view app settings"
- ✅ "Only admins can update app settings"

#### `notifications` Table
- ✅ "Users can view their own notifications"
- ✅ "Users can update their own notifications"
- ✅ "Admins can insert notifications"

If any are missing, re-run the schema scripts from Part 2.

---

## Part 6: Set Up Your First Admin User

### Step 10: Create Admin Account

1. **Option A - Via Email (if email auth enabled)**:
   - Sign up through your application
   - Use the email specified in `supabase-schema.sql` line 301
   - Default admin email: `said@gmail.com`
   - Or change it before running the schema

2. **Option B - Manually in Supabase**:
   - Go to **Authentication → Users**
   - Click **"Add User"**
   - Enter email and password
   - Click **"Create user"**
   - Then go to **Table Editor → user_profiles**
   - Find your user and change `role` to `admin`

### Step 11: Verify Admin Access

1. Sign in to your application
2. Navigate to **Admin Dashboard** (should be visible only to admins)
3. Check you can:
   - ✅ View all users
   - ✅ Update app settings
   - ✅ Send notifications

---

## Part 7: Configure Database Settings

### Step 12: Optimize Database Performance

1. Go to **Database → Configuration** (left sidebar)
2. **Connection Pooling**:
   - Mode: Transaction (recommended for most apps)
   - Pool size: Start with default (15)
3. **Connection Strings**:
   - Copy these for your `.env.local` if needed for backend operations:
     - `POSTGRES_URL` - Connection pooling URL
     - `POSTGRES_URL_NON_POOLING` - Direct connection

### Step 13: Set Up Database Backups (Recommended)

1. Go to **Database → Backups**
2. Pro Plan users: Configure automated daily backups
3. Free Plan users: Manually backup regularly:
   - Go to **Database → Backups**
   - Click **"Backup now"**
   - Download SQL dump for safe keeping

---

## Part 8: Testing Your Setup

### Step 14: Test Database Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)

3. Try signing up with a new account

4. Check Supabase **Authentication → Users** to see if user was created

5. Test saving a property calculation:
   - Go to Full Unit Calculator
   - Enter property details
   - Click "Save"
   - Check **Table Editor → saved_units** to verify data was saved

### Step 15: Verify All Features

Test each feature to ensure database operations work:

- ✅ **Authentication**:
  - Sign up with email
  - Sign in with email
  - Sign in with Google OAuth (if configured)
  - Sign out

- ✅ **Property Calculations**:
  - Create new calculation
  - Save calculation
  - Edit saved calculation
  - Delete calculation

- ✅ **Portfolio Management**:
  - Add property to portfolio
  - Add tasks to property
  - Upload documents
  - Delete property

- ✅ **Admin Features** (if admin):
  - View all users
  - Update app settings
  - Send notifications

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**:
1. Check `.env.local` file exists in project root
2. Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart dev server after creating `.env.local`

### Issue: "User not authenticated" errors

**Solution**:
1. Clear browser cookies/localStorage
2. Sign out and sign in again
3. Check Authentication → Users in Supabase to verify user exists
4. Verify email is confirmed (if email confirmation is enabled)

### Issue: Data not saving to database

**Solution**:
1. Open browser console (F12) and check for errors
2. Verify RLS policies are correctly set up (Part 5)
3. Make sure you're signed in
4. Check **Database → Logs** in Supabase for error details

### Issue: "Row Level Security" policy errors

**Solution**:
1. Re-run `supabase-schema-fix.sql` from Part 2
2. Verify `is_admin()` function exists:
   - Go to **Database → Functions**
   - Look for `is_admin` function
3. Check user's role in `user_profiles` table

### Issue: Google OAuth not working

**Solution**:
1. Verify Google OAuth is enabled in Supabase **Authentication → Providers**
2. Check redirect URI matches exactly in Google Console
3. Ensure Google Client ID and Secret are correct
4. Make sure authorized JavaScript origins include your Supabase URL
5. Try in incognito mode to rule out cookie issues

### Issue: Tables not created

**Solution**:
1. Go to **SQL Editor**
2. Re-run `supabase-schema.sql` completely
3. Check for error messages in query results
4. Verify you have sufficient permissions in your Supabase project

---

## Monitoring & Maintenance

### Database Usage
- Go to **Settings → Usage** to monitor:
  - Database size
  - Storage usage
  - Active connections
  - API requests

### View Logs
- **Database → Logs** - SQL query logs
- **Authentication → Logs** - Auth activity
- **Edge Functions → Logs** - Function logs (if using)

### Performance Monitoring
- **Database → Query Performance** (Pro plan)
- Monitor slow queries
- Add indexes as needed

---

## Security Best Practices

1. ✅ **Never** commit `.env.local` file
2. ✅ **Never** expose `service_role` key in client-side code
3. ✅ Keep RLS policies enabled on all tables
4. ✅ Use strong passwords for database and admin accounts
5. ✅ Enable email confirmations for new signups
6. ✅ Regularly backup your database
7. ✅ Monitor authentication logs for suspicious activity
8. ✅ Limit file upload sizes (currently 2MB for documents)
9. ✅ Validate all user inputs before database operations
10. ✅ Use prepared statements (Supabase handles this automatically)

---

## Next Steps

After completing this setup:

1. ✅ Test all application features thoroughly
2. ✅ Set up a staging environment (optional but recommended)
3. ✅ Configure custom email templates for your brand
4. ✅ Set up monitoring/alerts for production
5. ✅ Plan your backup and disaster recovery strategy
6. ✅ Review and optimize RLS policies for your use case

---

## Support & Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord Community**: https://discord.supabase.com
- **Project Repository**: https://github.com/mazinzaki911/belgeneh
- **Report Issues**: Create an issue in the GitHub repository

---

## Summary Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Supabase project created
- [ ] Database schema installed (`supabase-schema.sql`)
- [ ] RLS policies fixed (`supabase-schema-fix.sql`)
- [ ] All 7 tables visible in Table Editor
- [ ] Email authentication enabled
- [ ] Google OAuth configured (optional)
- [ ] Environment variables added to `.env.local`
- [ ] Admin user created and verified
- [ ] RLS policies verified for all tables
- [ ] Connection tested via app
- [ ] Property calculation save/load tested
- [ ] Portfolio features tested
- [ ] Authentication flow tested
- [ ] Database backups configured
- [ ] All features working without errors

---

**Congratulations! Your Supabase backend is now fully configured for the Belgeneh Real Estate Calculator.** 🎉
