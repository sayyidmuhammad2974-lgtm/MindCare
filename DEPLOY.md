# Deployment Guide: MindCare to Cloudflare Pages + Railway

## Prerequisites
- GitHub repo connected to both Cloudflare Pages and Railway
- NVIDIA API key ready

---

## 1. Backend → Railway

### Railway Dashboard Setup
1. **New Project** → "Deploy from GitHub repo"
2. **Root Directory**: `/backend`
3. **Build Command**: `npm ci`
4. **Start Command**: `npm start`

### Environment Variables (Railway Dashboard → Variables)
| Key | Value | Notes |
|-----|-------|-------|
| `NVIDIA_API_KEY` | `nvapi-xxxxxxxxxxxx` | **Required** - from NVIDIA |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | Default |
| `NVIDIA_MODEL` | `nvidia/nemotron-3-ultra-550b-a55b` | Default |
| `FRONTEND_URL` | `https://mindcare.pages.dev` | **Required** - update after frontend deploy |
| `CHAT_RATE_LIMIT` | `8` | Per minute |
| `CHAT_RATE_WINDOW_MS` | `60000` | 1 minute |

### After Deploy
- Copy Railway URL (e.g., `https://mindcare-api.railway.app`)
- Test health: `GET https://mindcare-api.railway.app/up`

---

## 2. Frontend → Cloudflare Pages

### Update API Endpoint
Edit `javascript/chat-api.js`:
```javascript
window.MINDCARE_CHAT_CONFIG = Object.freeze({
    endpoint: 'https://mindcare-api.railway.app/api/chat'  // ← Your Railway URL
});
```

### Cloudflare Pages Dashboard Setup
1. **New Project** → Connect GitHub repo
2. **Project name**: `mindcare-frontend` (or your choice)
3. **Production branch**: `main`
4. **Build settings**:
   - Build command: `echo 'Static site - no build required'`
   - Build output directory: `.` (root)
   - Root directory: `/` (project root)
5. **Environment variables** (optional, for build-time):
   - None needed for static site

### Custom Domain (Optional)
- Pages → Custom domains → Add your domain
- Cloudflare handles SSL automatically

---

## 3. Connect Both Ways

### After Frontend Deploy
1. Get Cloudflare Pages URL (e.g., `https://mindcare-frontend.pages.dev`)
2. Go to Railway → Variables → Update `FRONTEND_URL`
   ```
   FRONTEND_URL=https://mindcare-frontend.pages.dev
   ```
   (Add multiple comma-separated if needed)

### Verify CORS Works
- Open frontend → open chat → send message
- Check browser console for CORS errors

---

## 4. Deploy Commands

```bash
# 1. Update chat-api.js with Railway URL
# 2. Commit & push
git add javascript/chat-api.js wrangler.toml DEPLOY.md
git commit -m "Deploy: configure for Cloudflare Pages + Railway"
git push origin main

# 3. Railway auto-deploys on push to main (if connected)
# 4. Cloudflare Pages auto-deploys on push to main (if connected)
```

---

## 5. Local Development

### Backend
```bash
cd backend
cp .env.example .env  # Create .env with your keys
npm run dev
# Runs on http://localhost:8000
```

### Frontend (with local backend)
```bash
# Option 1: VS Code Live Server (port 5500)
# Option 2: Python
python -m http.server 5500
# Option 3: npx serve
npx serve .
```
Update `chat-api.js` endpoint to `http://localhost:8000/api/chat` for local testing.

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Check `FRONTEND_URL` in Railway matches Cloudflare URL exactly |
| 503 from chat | `NVIDIA_API_KEY` not set or invalid in Railway |
| 504 timeout | NVIDIA API slow - increase `NVIDIA_TIMEOUT` in Railway |
| Assets 404 | Ensure `pages_build_output_dir = "."` in wrangler.toml |
| Fonts not loading | Check CSP headers - Cloudflare Pages allows Google Fonts by default |

---

## 7. Files Created for Deployment

```
MindCare/
├── wrangler.toml          # Cloudflare Pages config
├── DEPLOY.md              # This guide
├── backend/
│   ├── server.mjs         # Node.js backend
│   ├── package.json       # Dependencies & scripts
│   └── .env.example       # Template for local dev
├── javascript/
│   ├── chat-api.js        # Frontend API client (update endpoint)
│   ├── chat.js            # Chat UI logic
│   └── script.js          # Shared utilities
├── css/style.css          # Styles
├── *.html                 # Pages
└── assets/                # Images
```

---

## 8. Cost Estimate (Free Tiers)

| Service | Free Tier Limits |
|---------|------------------|
| Cloudflare Pages | Unlimited sites, 500 builds/mo, unlimited bandwidth |
| Railway | $5/mo credit (covers small Node.js service) |
| NVIDIA API | Pay-per-token (check NVIDIA pricing) |

---

## 9. Monitoring

- **Railway**: Dashboard → Metrics (CPU, RAM, requests)
- **Cloudflare Pages**: Analytics → Web Analytics (enable in dashboard)
- **Health check**: `GET /up` endpoint on backend