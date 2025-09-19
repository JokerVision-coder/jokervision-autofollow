# Cloudflare Setup for JokerVision Domain Management

## 1. Purchase Domain

### Option A: Cloudflare Registrar (Recommended)
1. Go to [Cloudflare](https://www.cloudflare.com/)
2. Sign up for account
3. Go to **Domain Registration**
4. Search for `jokervision.com` (or preferred domain)
5. Purchase at cost pricing (~$10/year)

### Option B: Other Registrars
1. Purchase from Namecheap, GoDaddy, etc.
2. You'll need to change nameservers later

## 2. Add Site to Cloudflare

1. In Cloudflare dashboard, click **Add Site**
2. Enter your domain: `jokervision.com`
3. Select **Free** plan (can upgrade later)
4. Cloudflare will scan existing DNS records

## 3. Configure DNS Records

Add these DNS records:

### A Records
```
Type: A
Name: @
Content: [Will point to Vercel IP - Vercel will provide this]
TTL: Auto
Proxy: Enabled (Orange cloud)

Type: A  
Name: www
Content: [Same Vercel IP]
TTL: Auto
Proxy: Enabled (Orange cloud)
```

### CNAME Records
```
Type: CNAME
Name: api
Content: jokervision-backend.up.railway.app
TTL: Auto
Proxy: Enabled (Orange cloud)

Type: CNAME
Name: cms
Content: jokervision-cms.sanity.studio
TTL: Auto  
Proxy: Disabled (Gray cloud)
```

## 4. SSL/TLS Configuration

1. Go to **SSL/TLS** tab
2. Set SSL/TLS encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

## 5. Page Rules (Free Plan: 3 rules)

### Rule 1: Force HTTPS
```
URL: http://*jokervision.com/*
Settings: Always Use HTTPS
```

### Rule 2: API Caching
```
URL: jokervision.com/api/*
Settings: Cache Level = Bypass
```

### Rule 3: Static Assets Caching
```
URL: jokervision.com/*
Settings: Cache Level = Standard, Browser TTL = 1 month
```

## 6. Security Settings

### Firewall Rules
1. Go to **Security** > **WAF**
2. Enable **OWASP Core Ruleset**
3. Set Security Level to **Medium**

### Bot Fight Mode
1. Enable **Bot Fight Mode** (Free)
2. Helps protect against malicious bots

## 7. Performance Optimization

### Auto Minify
```
- JavaScript: Enabled
- CSS: Enabled  
- HTML: Enabled
```

### Brotli Compression
- Enable **Brotli** compression

### Rocket Loader
- Enable **Rocket Loader** for faster JavaScript loading

## 8. Analytics Setup

1. Enable **Web Analytics** (Free)
2. Add analytics script to your React app
3. Track visitors, page views, and performance

## 9. Custom Domain Setup in Vercel

After DNS is configured:

```bash
# In your Vercel project
vercel domains add jokervision.com
vercel domains add www.jokervision.com

# Verify domain ownership
vercel domains verify jokervision.com
```

## 10. Domain Aliases in Railway

For API subdomain:
1. In Railway project dashboard
2. Go to **Settings** > **Domains**
3. Add custom domain: `api.jokervision.com`
4. Railway will provide CNAME target

## 11. Final DNS Configuration

After all services are configured:

```
@ → Vercel (Main site)
www → Vercel (Main site)
api → Railway (Backend API)
cms → Sanity Studio
```

## 12. SSL Certificate Verification

1. Wait 24-48 hours for DNS propagation
2. Check SSL status at [SSL Labs](https://www.ssllabs.com/ssltest/)
3. Should get A+ rating with Cloudflare

## 13. Cost Summary

**Cloudflare**: Free plan includes:
- Unlimited DNS queries
- Global CDN
- DDoS protection
- SSL certificates
- 3 Page Rules
- Basic analytics

**Pro Plan ($20/month)** adds:
- 20 Page Rules
- Advanced analytics  
- Image optimization
- Mobile redirects

**Domain**: ~$10-12/year for .com

Total: $0-20/month + domain cost