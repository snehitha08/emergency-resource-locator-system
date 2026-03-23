# Emergency Resource Locator System - Setup Guide

Follow these steps to connect your backend and database:

## 1. Supabase Setup
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once the project is ready, go to the **SQL Editor** in the left sidebar.
3. Click **New Query** and paste the contents of the `supabase-schema.sql` file (found in this project).
4. Click **Run**. This will create all your tables, security policies, and sample data.

## 2. Environment Variables (Secrets)
1. In your Supabase Dashboard, go to **Project Settings** > **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In **Google AI Studio**, click the **Settings** (gear icon) or look for the **Secrets** panel.
4. Add the following two secrets:
   - `VITE_SUPABASE_URL`: (Paste your Project URL here)
   - `VITE_SUPABASE_ANON_KEY`: (Paste your anon public key here)

## 3. Authentication Configuration
1. In Supabase, go to **Authentication** > **URL Configuration**.
2. Add your **App URL** (found in the AI Studio Runtime Context) to the **Redirect URLs** list.
   - Example: `https://ais-dev-....run.app`
   - Also add `http://localhost:3000` for local development.

## 4. Verify Connection
1. Refresh your app preview in AI Studio.
2. Go to the **Signup** page and create an account.
3. If successful, you will be redirected to the **Dashboard**.
4. Check the **Resources** page to see the sample data you inserted via SQL.

## 5. Deployment
- **GitHub**: Push your code to a new repository.
- **Vercel**: Import the repository and add the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
