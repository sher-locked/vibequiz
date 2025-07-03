# 🚀 VibeQuiz Deployment Guide

## Overview
VibeQuiz is a Next.js quiz application that uses Redis Cloud for data storage in production and falls back to local in-memory storage for development.

## Prerequisites
- GitHub account
- Vercel account
- Redis Cloud account
- Google Cloud Console account (for OAuth)

## Step 1: Database Setup (Redis Cloud)

### 1.1 Create Redis Cloud Account
1. Go to [Redis Cloud](https://redis.com/cloud/)
2. Sign up for a free account
3. Create a new database

### 1.2 Get Redis Connection String
1. In your Redis Cloud dashboard, go to your database
2. Click "Connect"
3. Copy the Redis URL (format: `redis://username:password@host:port`)

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### 2.2 Create OAuth Credentials
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: Web application
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://your-app-name.vercel.app/api/auth/callback/google` (for production)

### 2.3 Get OAuth Credentials
1. Copy the Client ID and Client Secret
2. Keep these secure - you'll need them for environment variables

## Step 3: Vercel Deployment

### 3.1 Connect GitHub Repository
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Environment Variables
In your Vercel project settings, add these environment variables:

```
AUTH_SECRET=your-random-secret-key-here
AUTH_URL=https://your-app-name.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIS_URL=redis://username:password@host:port
```

### 3.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Test your application

## Step 4: Update OAuth Settings

### 4.1 Update Google OAuth Redirect URI
1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add your production URL: `https://your-app-name.vercel.app/api/auth/callback/google`

## Step 5: Test Production App

### 5.1 Test Authentication
1. Visit your deployed app
2. Try logging in with Google
3. Verify user data appears correctly

### 5.2 Test Quiz Features
1. Create a new question
2. Answer questions
3. Check that stats update correctly

## Development vs Production

### Local Development
- **Database**: In-memory storage (no setup required)
- **Authentication**: Works with localhost URLs
- **Environment**: Uses `.env.local` file

### Production
- **Database**: Redis Cloud
- **Authentication**: Works with production URLs
- **Environment**: Uses Vercel environment variables

## Troubleshooting

### Common Issues

1. **Authentication fails**: Check OAuth redirect URIs match exactly
2. **Database connection fails**: Verify Redis URL is correct and accessible
3. **Environment variables not working**: Ensure they're set in Vercel dashboard

### Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_SECRET` | Random secret for Auth.js | `your-random-secret-key-here` |
| `AUTH_URL` | Full URL of your app | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-abcdef123456` |
| `REDIS_URL` | Redis connection string | `redis://default:password@host:port` |

## Security Notes

- Never commit real credentials to git
- Use environment variables for all sensitive data
- Rotate AUTH_SECRET periodically
- Use HTTPS in production (automatic with Vercel)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test locally first with `.env.local`
4. Check Redis Cloud connectivity 