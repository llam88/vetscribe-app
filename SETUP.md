# 🚀 VetScribe Setup Guide

## 🔧 Required Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: OpenAI API Key for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourvetclinic.com
```

## 🗄️ Supabase Setup

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com)
2. **Get your keys**: Project Settings → API → Copy URL and anon key
3. **Create database tables**: Use the SQL provided in the app's database setup

## 🔑 Why Sign-In Doesn't Work

If clicking "Log in" does nothing, you need to:

1. **Add Supabase credentials** to `.env.local`
2. **Restart your dev server**: `npm run dev`
3. **Set up database tables** via the dashboard

## 🧪 Test Without Supabase

For development/demo purposes, you can:
- Skip sign-in and go directly to `/dashboard`
- Use mock data in components
- Set up Supabase later

## 📧 Need Help?

The app will work in demo mode, but authentication requires Supabase setup.
