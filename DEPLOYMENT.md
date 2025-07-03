# 🚀 VibeQuiz Deployment Guide

This guide will help you deploy VibeQuiz to Vercel with all necessary configurations.

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository ready
- [ ] Google OAuth credentials configured
- [ ] Vercel account created
- [ ] Environment variables prepared

---

## 🔧 Step 1: Google OAuth Setup

### 1.1 Create Google OAuth Credentials

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Choose **Web application**
6. Set **Authorized redirect URIs** to:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
7. Save **Client ID** and **Client Secret**

### 1.2 Generate AUTH_SECRET

Run this command to generate a secure auth secret:
```bash
npx auth secret
```

Or visit: https://generate-secret.vercel.app/32

---

## 🌐 Step 2: Vercel Deployment

### 2.1 Deploy to Vercel

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Or deploy via GitHub integration
   ```

2. **GitHub Integration (Recommended)**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **New Project**
   - Import your GitHub repository
   - Configure project settings

### 2.2 Environment Variables

In Vercel Dashboard, go to **Settings** > **Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `AUTH_SECRET` | Your generated secret | Production |
| `AUTH_URL` | `https://your-app.vercel.app` | Production |
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Production |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Production |

**Note:** KV variables will be added automatically in Step 3.

---

## 💾 Step 3: Add Vercel KV Database

### 3.1 Create KV Database

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **KV**
4. Choose your preferred region
5. Click **Create**

### 3.2 Connect to Project

1. Click on your new KV database
2. Go to **Settings** tab
3. Click **Connect Project**
4. Select your VibeQuiz project
5. Choose **Production** environment

This automatically adds these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

---

## 🔄 Step 4: Update OAuth Redirect URI

After deployment, update your Google OAuth settings:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth client
4. Update **Authorized redirect URIs** with your actual Vercel URL:
   ```
   https://your-actual-app-name.vercel.app/api/auth/callback/google
   ```

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Core Features

Visit your deployed app and verify:

- [ ] Homepage loads correctly
- [ ] Google OAuth login works
- [ ] Questions feed displays (empty initially)
- [ ] Question creation modal opens
- [ ] Can create new questions
- [ ] Can answer questions
- [ ] Stats update correctly

### 5.2 Check Logs

Monitor deployment in Vercel Dashboard:
1. Go to **Functions** tab
2. Check real-time logs
3. Verify no errors in API endpoints

---

## 🐛 Troubleshooting

### Common Issues

**1. OAuth Redirect Mismatch**
```
Error: redirect_uri_mismatch
```
**Solution:** Ensure redirect URI in Google Console matches your Vercel domain exactly.

**2. AUTH_SECRET Missing**
```
Error: AUTH_SECRET environment variable is not set
```
**Solution:** Add AUTH_SECRET environment variable in Vercel settings.

**3. KV Connection Issues**
```
Error: KV_REST_API_URL is not defined
```
**Solution:** Ensure KV database is connected to your project.

### Debug Mode

Enable debug logging by adding to environment variables:
```
AUTH_DEBUG=true
```

---

## 📦 Local Development Setup

For local development with production data:

1. Copy `.env.example` to `.env.local`
2. Add your environment variables
3. Run: `pnpm dev`

**Note:** Local development uses in-memory storage by default. To use production KV locally, add KV environment variables to `.env.local`.

---

## 🔄 Continuous Deployment

The app is configured for automatic deployment:
- **Push to `main`** → Deploys to production
- **Push to other branches** → Creates preview deployments

### Manual Deployment

```bash
# Using Vercel CLI
vercel --prod

# Or trigger from GitHub
git push origin main
```

---

## 📊 Production Monitoring

Monitor your app performance:
1. Vercel **Analytics** (built-in)
2. **Functions** logs for API monitoring
3. **Speed Insights** for performance

---

## 🎉 Success!

Your VibeQuiz app should now be live at: `https://your-app-name.vercel.app`

Share the URL with your workshop participants and start creating engaging quizzes! 🚀 