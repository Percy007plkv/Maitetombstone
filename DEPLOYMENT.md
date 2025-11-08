# Deployment Guide for https://maite.rsvip.online/

## Quick Setup with Netlify

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin master
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and select your repository
   - Netlify will automatically detect the settings from `netlify.toml`

3. **Configure Custom Domain:**
   - In Netlify site settings, go to "Domain management"
   - Click "Add custom domain"
   - Enter: `maite.rsvip.online`
   - Follow Netlify's instructions to update your DNS settings

4. **Deploy:**
   - Netlify will automatically build and deploy
   - Future pushes to master will auto-deploy

### Option 2: Manual Deploy with Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure your custom domain in Netlify dashboard**

## Environment Variables

The following environment variables are already configured in `netlify.toml`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`

These are public keys and safe to include in the build configuration.

## DNS Configuration

To point `maite.rsvip.online` to Netlify, add these DNS records:

**If using Netlify DNS:**
- Netlify will provide nameservers to use

**If using your own DNS provider:**
- Add a CNAME record:
  - Name: `maite` (or `@` if it's the root domain)
  - Value: `YOUR-SITE-NAME.netlify.app`
  - TTL: 3600

OR

- Add an A record:
  - Name: `maite` (or `@`)
  - Value: `75.2.60.5` (Netlify's load balancer)
  - TTL: 3600

## Troubleshooting

### Site not loading:
1. Check DNS propagation: https://dnschecker.org/
2. Verify build succeeded in Netlify dashboard
3. Check browser console for errors

### Images not loading:
1. Verify Supabase URL is correct in environment variables
2. Check Cloudinary URLs in database
3. Verify CORS settings in Supabase

### 404 errors on refresh:
- Already handled by the redirect rule in `netlify.toml`

## Build Locally Before Deploying

Always test the build locally first:

```bash
npm run build
npm run preview
```

Then visit http://localhost:4173 to test the production build.
