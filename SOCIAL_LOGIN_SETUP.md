# Social Login Setup for VetScribe

## 🚀 Enable Google & Microsoft Sign-In

### Step 1: Configure in Supabase Dashboard

1. **Go to Supabase Dashboard** → Your VetScribe project
2. **Authentication** → **Providers** 
3. **Enable Google and Microsoft OAuth**

### Step 2: Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create new project** or select existing
3. **Enable Google+ API**
4. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs: 
     ```
     https://[your-supabase-project].supabase.co/auth/v1/callback
     ```
5. **Copy Client ID and Client Secret**
6. **In Supabase** → Authentication → Providers → Google:
   - Paste Client ID and Client Secret
   - Enable Google provider

### Step 3: Microsoft OAuth Setup

1. **Go to Azure Portal**: https://portal.azure.com
2. **Azure Active Directory** → **App registrations** → **New registration**
3. **Configure**:
   - Name: VetScribe
   - Redirect URI: 
     ```
     https://[your-supabase-project].supabase.co/auth/v1/callback
     ```
4. **Copy Application (client) ID and Client Secret**
5. **In Supabase** → Authentication → Providers → Azure:
   - Paste Application ID and Client Secret
   - Enable Azure provider

### Step 4: Update Redirect URLs

In Supabase → Authentication → URL Configuration:
- Add your production domain redirects:
  ```
  https://vetscribe-app-rouge.vercel.app/**
  https://vetscribe-app-rouge.vercel.app/auth/callback
  ```

### Step 5: Test

1. **Deploy the updated sign-in page**
2. **Go to your sign-in page**
3. **Click "Continue with Google"** → Should redirect to Google
4. **Click "Continue with Microsoft"** → Should redirect to Microsoft

## ✅ Benefits

- **Faster onboarding**: 1 click vs magic link process
- **Higher conversion**: Reduced friction
- **Professional appearance**: Like modern SaaS apps
- **Auto-populated data**: Name and email from OAuth provider

## 🎯 User Experience

**Before**: Enter email → Check email → Click magic link → Access dashboard
**After**: Click "Continue with Google" → Instant access to dashboard

## 🔧 Troubleshooting

- **"Provider not enabled"**: Check Supabase provider configuration
- **"Redirect URI mismatch"**: Verify redirect URLs in Google/Microsoft consoles
- **"Invalid client"**: Check Client ID and Secret are correct

## 📧 Auto-Population

When users sign in with Google/Microsoft:
- Email: Auto-filled from OAuth provider
- Full name: Auto-filled from OAuth provider  
- Practice name: Can be collected on first login
- User type: Defaults to "veterinarian"
