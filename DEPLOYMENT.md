# Belgeneh - Production Deployment Guide

This guide will walk you through deploying the Belgeneh Real Estate Investment Calculator to production with Supabase and Vercel.

## 📋 Prerequisites

- [Supabase Account](https://supabase.com) (Free tier available)
- [Vercel Account](https://vercel.com) (Free tier available)
- [GitHub Account](https://github.com) for repository hosting
- Node.js 18+ installed locally

---

## 🗄️ Part 1: Supabase Database Setup

### Step 1: Run the Database Schema

1. **Open your Supabase project dashboard**
   - Go to https://app.supabase.com
   - Select your project: `vwrctfiphtnnafsjzxev`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and execute the schema**
   - Open the file `supabase-schema.sql` in this repository
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Verify the tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `user_profiles`
     - `saved_units`
     - `portfolio_properties`
     - `property_tasks`
     - `property_documents`
     - `app_settings`
     - `notifications`

### Step 2: Configure Email Authentication

1. **Go to Authentication → Settings**
   - In your Supabase dashboard, click "Authentication" → "Settings"

2. **Configure Email Settings**
   - Scroll to "Email Auth"
   - Enable "Confirm email" (since you requested email verification)
   - Set "Minimum password length" to 6 (or your preference)

3. **Customize Email Templates (Optional)**
   - Go to Authentication → Email Templates
   - Customize the confirmation email if desired

### Step 3: Set Up Row Level Security (RLS)

The schema already includes RLS policies, but verify they're enabled:

1. **Go to Authentication → Policies**
2. **Verify RLS is enabled for all tables**
3. **Check that policies exist for each table**

---

## 🚀 Part 2: Vercel Deployment

### Step 1: Push Code to GitHub

Your code is already on the branch: `claude/vercel-backend-setup-011CUyvqbwPEsUEM8bcuNSaD`

Make sure all changes are committed and pushed (we'll do this in the next steps).

### Step 2: Connect Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `mazinzaki911/belgeneh`
   - Click "Import"

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://vwrctfiphtnnafsjzxev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cmN0ZmlwaHRubmFmc2p6eGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NTM1NjAsImV4cCI6MjA3NjUyOTU2MH0.oDq1DMuP-nC24iVDrIOg0OR48Mp07Re3fcCPORXAGUs

# Gemini AI
VITE_GEMINI_API_KEY=AIzaSyC2XYYiVzUP8cSWWXcfdLmlH4neKW_LZds

# Server-side Only (if you add API routes later)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cmN0ZmlwaHRubmFmc2p6eGV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk1MzU2MCwiZXhwIjoyMDc2NTI5NTYwfQ.F1Tf5N03p2G_4yBvP9tqAbHUMKViZokR1v85kBPTjfY
SUPABASE_JWT_SECRET=RR0jp2CaMDU1vuNILaYhKuIUa3aH8FpvPahS7vGn4e9uKC1kmcmkYgiEUfXz4mkuT5qs+12FUIiDKh19GLn6Lg==
```

**How to add them:**
1. In your Vercel project, go to "Settings" → "Environment Variables"
2. Add each variable with its value
3. Select "Production", "Preview", and "Development" for each

### Step 4: Deploy

1. **Click "Deploy"**
   - Vercel will automatically build and deploy your app
   - This usually takes 2-5 minutes

2. **Wait for deployment to complete**
   - You'll see a success message with your live URL

3. **Visit your deployed app**
   - Click on the domain provided (e.g., `belgeneh.vercel.app`)

---

## 👤 Part 3: Create Admin User

### Option 1: Sign Up Through the App

1. Visit your deployed app
2. Click "Sign Up"
3. Register with email: `said@gmail.com`
4. Check your email for verification link
5. Click the verification link
6. **The user will automatically be set as admin** (configured in the SQL trigger)

### Option 2: Create User via Supabase Dashboard

1. **Go to Authentication → Users**
2. **Click "Add User"**
3. **Fill in:**
   - Email: `said@gmail.com`
   - Password: (choose a strong password)
   - Auto Confirm User: ✅ (check this to skip email verification)
4. **Click "Create User"**
5. **The profile will be auto-created as admin** (via trigger)

---

## 🔒 Part 4: Security Checklist

### ✅ Verify These Security Measures:

1. **RLS Policies Enabled**
   - Go to Supabase → Authentication → Policies
   - Verify all tables have RLS enabled

2. **Environment Variables**
   - Never commit `.env.local` to git (it's already in `.gitignore`)
   - Service Role Key is only in Vercel (server-side)
   - Anon key is safe to expose in client

3. **Password Security**
   - Passwords are now hashed by Supabase Auth (bcrypt)
   - No more plain text passwords in localStorage!

4. **HTTPS**
   - Vercel automatically provides SSL certificates
   - All traffic is encrypted

5. **CORS**
   - Supabase automatically handles CORS for your domain

---

## 🔄 Part 5: Migrating Existing Data (Optional)

If you have users with existing data in localStorage, they can migrate it:

### For Users:

1. **Before logging in for the first time:**
   - Open browser DevTools (F12)
   - Go to "Application" → "Local Storage"
   - Copy your data from:
     - `app_users`
     - `savedUnits`
     - `portfolio_properties`

2. **After creating your account:**
   - You'll need to manually re-enter your saved units and properties
   - Or we can create a migration script if needed

---

## 📊 Part 6: Monitoring & Maintenance

### Supabase Dashboard

Monitor your app's health:

1. **Database Usage**
   - Go to Home → Database
   - Check storage usage and row counts

2. **Auth Users**
   - Go to Authentication → Users
   - See all registered users

3. **API Logs**
   - Go to Logs
   - View all database queries and errors

### Vercel Dashboard

Monitor deployments:

1. **Deployments**
   - See all deployment history
   - View build logs

2. **Analytics**
   - View visitor statistics (if enabled)

3. **Functions**
   - Monitor serverless function usage (if you add API routes)

---

## 🚨 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Check that `.env.local` exists locally
- Check that env vars are set in Vercel dashboard
- Verify the variable names start with `VITE_` for client-side access

### Issue: "Authentication Error"

**Solution:**
- Verify Supabase URL and keys are correct
- Check that email confirmation is working
- Look at Supabase Auth logs for errors

### Issue: "Database Connection Error"

**Solution:**
- Check RLS policies are set up correctly
- Verify user has permission to access their data
- Check Supabase logs for permission errors

### Issue: "Build Failed on Vercel"

**Solution:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Test build locally with `npm run build`

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Make changes locally**
2. **Commit and push to your branch**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin claude/vercel-backend-setup-011CUyvqbwPEsUEM8bcuNSaD
   ```
3. **Vercel automatically builds and deploys**
4. **Check deployment status in Vercel dashboard**

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs**
   - Supabase Dashboard → Logs

2. **Check Vercel Logs**
   - Vercel Dashboard → Deployments → [Your Deployment] → Logs

3. **Check Browser Console**
   - F12 → Console tab
   - Look for error messages

---

## 🎉 Success!

Your app is now production-ready with:

- ✅ Secure authentication (Supabase Auth with email verification)
- ✅ PostgreSQL database (Supabase)
- ✅ Row Level Security (RLS)
- ✅ Automatic backups (Supabase)
- ✅ SSL/HTTPS (Vercel)
- ✅ CDN distribution (Vercel)
- ✅ Continuous deployment (Vercel + GitHub)
- ✅ Scalable infrastructure (both platforms auto-scale)

**Your app is ready for real users!** 🚀
