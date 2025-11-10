<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Belgeneh - Real Estate Investment Calculator

A comprehensive real estate investment analysis platform with portfolio management, financial calculators, and user authentication.

## 🚀 Features

- **User Authentication**: Secure login/signup with email verification
- **Financial Calculators**: ROI, ROE, Cap Rate, Payback Period, NPV, and more
- **Portfolio Manager**: Track properties, tasks, and documents
- **Multi-language Support**: Arabic and English
- **Admin Dashboard**: User management and analytics
- **Cloud Database**: All data synced to Supabase (PostgreSQL)
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Styling**: TailwindCSS

## 📋 Prerequisites

- Node.js 18+
- Supabase account (free tier available)
- Vercel account (free tier available)

## 🏃 Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Gemini API credentials:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Set up Supabase database:**
   - Go to your Supabase project
   - Run the SQL in `supabase-schema.sql` in the SQL Editor

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:5173`

## 🚀 Deploy to Production

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete production deployment guide including:
- Supabase database setup
- Vercel deployment configuration
- Environment variables setup
- Security best practices
- Monitoring and maintenance

## 📁 Project Structure

```
belgeneh/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React Context providers
│   ├── lib/           # Utility functions and API clients
│   ├── types.ts       # TypeScript type definitions
│   └── App.tsx        # Main application component
├── public/            # Static assets
├── supabase-schema.sql # Database schema
├── vercel.json        # Vercel configuration
└── DEPLOYMENT.md      # Production deployment guide
```

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all database tables
- ✅ Password hashing (bcrypt via Supabase)
- ✅ JWT-based authentication
- ✅ Email verification
- ✅ HTTPS/SSL encryption
- ✅ Secure environment variable handling
- ✅ CORS configuration

## 📊 Default Admin Account

When deploying, the first user with email `said@gmail.com` will automatically be assigned admin role.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- **AI Studio App**: https://ai.studio/apps/drive/1wS-PAlKG_XUZFKYfSFU_RAXL8gyZQQip
- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📞 Support

For issues and questions, please open an issue on GitHub.
