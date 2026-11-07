# IG Assistant

An AI-powered Instagram post and carousel creation platform designed for multi-business content management. Features commercial master-grade visual generation (FLUX 1.1 Pro), dynamic topic-accurate captions (GPT-5.4-nano), and mobile publishing.

## Features

- **Multi-Business Art Direction**: Intelligent prompt expansion for saree shops, vehicle showrooms, colleges, cafes, and festival offers.
- **Master Quality AI Visuals**: High-resolution 1024x1024 commercial visuals powered by FLUX 1.1 Pro and ZeroGPU clusters.
- **Unique RAG Captions**: Generates 3 concept-accurate, topic-specific captions per post with relevant hashtags and zero emojis.
- **Mobile Studio Experience**: Device-optimized responsive layout with YouTube-style native share drawer.
- **Turnkey Cloud Deployment**: Pre-configured for single-service deployment on Render.

## Project Structure

```
├── backend/            # Express API, AI generation, and SQLite database
├── frontend/           # Vite + React + Tailwind CSS client
├── render.yaml         # Render deployment blueprint
└── package.json        # Unified root build scripts
```

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm run install:all

# 2. Start local servers
cd backend && npm run dev
cd frontend && npm run dev
```

## Deployment on Render

This project is pre-configured to build and run as a single Web Service on Render:

- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm run start`
- **Environment**: Set `NODE_ENV=production`, `HF_TOKEN`, and `POLLINATIONS_API_KEY`.

