# Deployment Guide

This guide will help you deploy your Smart Library System to GitHub and Vercel.

## Prerequisite: Install Git
Ensure you have Git installed. You can check by running:
```bash
git --version
```
If not installed, download it from [git-scm.com](https://git-scm.com/).

## Part 1: Push to GitHub

1. **Initialize Git Repo**
   Open your project folder in the terminal and run:
   ```bash
   git init
   ```

2. **Add Files**
   Add all files to staging (we already created a `.gitignore` to exclude unnecessary files):
   ```bash
   git add .
   ```

3. **Commit Changes**
   ```bash
   git commit -m "Initial commit - Smart Library System"
   ```

4. **Create a GitHub Repository**
   - Go to [github.com/new](https://github.com/new).
   - Name your repository (e.g., `smart-library-system`).
   - Click **Create repository**.

5. **Connect and Push**
   Copy the commands provided by GitHub (under "...or push an existing repository from the command line") and run them. They look like this:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/smart-library-system.git
   git branch -M main
   git push -u origin main
   ```

## Part 2: Deploy to Vercel

1. **Sign Up / Login**
   Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Add New Project**
   - Click **"Add New..."** -> **"Project"**.
   - Select your `smart-library-system` repository from the list.
   - Click **Import**.

3. **Configure Project**
   - **Framework Preset**: select "Other".
   - **Root Directory**: Leave as `./`.
   - **Build Command**: Vercel might auto-detect, but if not, leave default or use `vercel build` (our `vercel.json` handles the logic).
   - **Environment Variables**:
     - Key: `django_secret`
     - Value: (Paste your SECRET_KEY from `settings.py` or generate a new one)
     - *Note: In `settings.py`, ideally use `os.environ.get('django_secret')`, but for this quick setup, the hardcoded key works unless you change the code to read from env.*

4. **Deploy**
   - Click **Deploy**.
   - Wait for the build to complete.
   - Once finished, you will get a live URL (e.g., `https://smart-library-system.vercel.app`).

## Important Note on Database
Since we are using **SQLite** (`db.sqlite3`) and Vercel is serverless:
- **Your data will reset on every deployment.**
- Any books you add or users you register on the live site will disappear when you push new code or if the server sleeps and wakes up.
- To fix this for a real production app, you need to connect a PostgreSQL database (like Neon or Railway).
