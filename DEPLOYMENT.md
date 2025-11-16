# Deployment Guide

This guide covers deploying NuCalc Pro to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Docker](#docker)
- [Backend Deployment](#backend-deployment)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git repository
- Account on your chosen platform

## Environment Variables

### Frontend (Optional)

No environment variables are strictly required for the frontend, but you can configure:

```bash
# Base URL for API (if using backend)
VITE_API_URL=https://your-api.com

# Analytics tracking ID (if using analytics)
VITE_ANALYTICS_ID=your-analytics-id
```

### Backend (Required for Ruby API)

```bash
# JWT Secret - MUST be set in production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Allowed CORS Origins
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# MongoDB Connection
MONGODB_URI=mongodb://username:password@host:port/database
```

Generate a secure JWT secret:
```bash
openssl rand -hex 32
```

## Deployment Platforms

### Vercel (Recommended)

Vercel provides the easiest deployment with automatic PWA support.

#### Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production:
   ```bash
   vercel --prod
   ```

#### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Click "Deploy"

#### Configuration

Create `vercel.json` (optional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify

#### Via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Initialize:
   ```bash
   netlify init
   ```

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

#### Via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect your Git provider
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

5. Click "Deploy site"

#### Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/NuCalc-Calculator-App",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/NuCalc-Calculator-App/',
     // ... rest of config
   });
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Enable GitHub Pages in repository settings

### Docker

#### Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Service worker cache control
    location /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t nucalc-pro .

# Run container
docker run -d -p 8080:80 nucalc-pro
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## Backend Deployment

### Ruby/Sinatra Backend

#### Prerequisites

- Ruby >= 2.7.0
- MongoDB instance
- Production server (Heroku, DigitalOcean, AWS, etc.)

#### Environment Setup

1. Set environment variables:
   ```bash
   export JWT_SECRET="your-secure-secret-here"
   export ALLOWED_ORIGINS="https://your-frontend-domain.com"
   export MONGODB_URI="mongodb://user:pass@host:port/db"
   export RACK_ENV="production"
   ```

2. Install dependencies:
   ```bash
   cd ruby
   bundle install --without development test
   ```

3. Run with production server:
   ```bash
   bundle exec puma -C config/puma.rb
   ```

#### Heroku Deployment

1. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Add MongoDB addon:
   ```bash
   heroku addons:create mongolab
   ```

3. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set ALLOWED_ORIGINS="https://your-domain.com"
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

## Post-Deployment

### Verification Checklist

- [ ] Application loads without errors
- [ ] All features work correctly
- [ ] PWA installs successfully
- [ ] Service worker caches resources
- [ ] Offline mode works
- [ ] Tests pass in production environment
- [ ] Security headers are set
- [ ] SSL certificate is active
- [ ] Analytics are tracking
- [ ] Error monitoring is working

### Performance Optimization

1. **Enable Compression**: Ensure gzip/brotli is enabled
2. **CDN**: Use a CDN for static assets
3. **Caching**: Configure proper cache headers
4. **Monitoring**: Set up performance monitoring

### Monitoring

Recommended tools:
- **Error Tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible
- **Performance**: Lighthouse CI, WebPageTest
- **Uptime**: UptimeRobot, Pingdom

### Security

1. **HTTPS**: Always use HTTPS in production
2. **Headers**: Set security headers (already configured)
3. **CSP**: Consider Content Security Policy
4. **Secrets**: Never commit secrets to repository
5. **Dependencies**: Regularly update dependencies

### Continuous Deployment

The project includes GitHub Actions workflow that:
- Runs tests on every push
- Checks code quality
- Builds the application
- Can be extended for automatic deployment

To enable auto-deployment to Vercel:
1. Get Vercel token from dashboard
2. Add to GitHub secrets as `VERCEL_TOKEN`
3. Add deployment step to `.github/workflows/ci.yml`

## Troubleshooting

### Build Fails

- Check Node.js version (must be >= 18)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

### PWA Not Working

- Ensure HTTPS is enabled
- Check service worker registration in DevTools
- Verify manifest.json is served correctly
- Check for console errors

### Backend Connection Issues

- Verify CORS configuration
- Check environment variables
- Ensure MongoDB is accessible
- Check API endpoint URLs

## Rollback

If deployment fails:

### Vercel
```bash
vercel rollback
```

### Netlify
Use the Netlify dashboard to revert to a previous deployment

### Docker
```bash
docker tag nucalc-pro:latest nucalc-pro:backup
# Then redeploy previous version
```

## Support

For deployment issues:
1. Check this guide
2. Review platform documentation
3. Check GitHub Issues
4. Create new issue with deployment details

---

For questions or issues, please refer to the [Contributing Guide](CONTRIBUTING.md) or open an issue on GitHub.
