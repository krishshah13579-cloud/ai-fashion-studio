# 🚀 Deploying AI Fashion Studio to Coolify

This Next.js application is pre-configured with **Docker Standalone** and health check endpoints specifically tailored for **Coolify**.

---

## 🛠️ Step 1: Push This Project to GitHub

In your terminal or terminal app:

```bash
cd /Users/krishshah/.gemini/antigravity/scratch/ai-fashion-studio
git init
git add .
git commit -m "Initial commit: AI Fashion Studio for Coolify"
# Create a repository on GitHub (e.g. ai-fashion-studio) and push:
git remote add origin https://github.com/<YOUR_USERNAME>/ai-fashion-studio.git
git branch -M main
git push -u origin main
```

---

## ☁️ Step 2: Add Application to Coolify

1. Open your **Coolify Dashboard**.
2. Click **+ Create New Resource** $\rightarrow$ **Application**.
3. Select **Public / Private GitHub Repository** and pick your `ai-fashion-studio` repository.
4. Coolify will auto-detect the `Dockerfile` in the root!
5. In **Configuration**:
   * **Port:** `3000`
   * **Health Check URL:** `/api/health`
6. Click **Deploy**!

---

## ⚡ How the Unlimited Free AI Generation Works on Coolify

Because standard VPS instances (like a \$5-\$10/mo Hetzner or DigitalOcean droplet) don't have heavy \$10,000 AI GPUs, the app is architected with a **Hybrid Cloud Architecture**:

1. **Your Next.js App runs 24/7 on Coolify** under your own domain (`studio.yourbrand.com`).
2. Whenever you want to generate photos:
   * Open your Google Colab notebook (`fashion_ai_studio_colab.ipynb`) and click **Run All** (100% Free T4 GPU).
   * Copy the public URL (`https://xxxx.gradio.live`).
   * On your Coolify website, click **GPU Engine** in the top-right and paste the URL.
   * You can now generate as many photos as you want from your laptop, iPad, or phone anywhere in the world!
