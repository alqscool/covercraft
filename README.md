<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

[English](README.md) | [简体中文](README.zh-CN.md)

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1M-ZvAT24D02VUeZhxKfiXlZq5YckRpzK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Production

### Quick Build

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

After building, the `dist` directory contains all static files ready for deployment.

### Deployment Platforms

This project can be deployed to multiple platforms:

- **Vercel** (Recommended) - Zero-config deployment
- **Netlify** - Simple and fast
- **GitHub Pages** - Free hosting
- **Nginx/Apache** - Self-hosted servers
- **Docker** - Containerized deployment
- **Baota Panel** - Visual management

📖 **For detailed deployment instructions, see: [DEPLOYMENT.md](DEPLOYMENT.md)**

> ⚠️ **Security Note**: For production, it's recommended to use a backend API proxy to protect your Gemini API key instead of exposing it in the frontend. See deployment guide for details.
