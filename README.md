# AI Digital Twin - Generic Template
**Powered by UARE.AI**

## Overview
This is a **generic, customizable AI Digital Twin application** for building real-time voice AI personas backed by custom knowledge bases.

### Features
🎤 Real-time voice conversations (Azure OpenAI Realtime API)
🔍 Knowledge base integration (Azure Cognitive Search)
💬 Persistent conversation history (PostgreSQL + Redis)
🎨 Customizable personas and branding
📱 Responsive design (Desktop, Tablet, Mobile)
🔐 GDPR-compliant with audit logging

========================================
## QUICK START
========================================

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure credentials
   ```

3. **Set Up Database**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

4. **Customize Your Persona**
   - Edit `config.example.json` → save as `config.json`
   - Update `src/prompts/generic-persona-instructions.ts`
   - Replace `/public/avatar_headshot.png` with your persona's image
   - Update all `{{PLACEHOLDER}}` values in code

5. **Run**
   ```bash
   pnpm run dev
   ```

========================================
## CUSTOMIZATION GUIDE
========================================

### Step 1: Central Configuration
Edit **config.example.json** → save as **config.json**
- Replace all {{PLACEHOLDER}} values
- Define persona name, title, organization
- Configure UI text, search categories, theme colors

### Step 2: Persona Instructions
Update **src/prompts/generic-persona-instructions.ts**
- Define identity, expertise, and philosophy
- Set conversation style and voice
- Customize search rules for your domain

### Step 3: Replace Code Placeholders
Search for placeholders: `grep -r "{{" src/`
Update in:
- src/app/chat-interface.tsx (UI text, messages)
- src/app/page.tsx (page title)
- src/app/layout.tsx (site metadata)

### Step 4: Update Branding
- **Colors**: tailwind.config.ts, src/app/globals.css
- **Avatar**: /public/avatar_headshot.png
- **Logo**: /public/ assets

### Step 5: Deploy
```bash
pnpm run build
pnpm run start
```

========================================
## KEY FILES
========================================

| File | Purpose |
|------|---------|
| config.example.json | Central persona configuration |
| .env.example | Environment variables (API keys) |
| src/prompts/generic-persona-instructions.ts | AI persona definition |
| src/app/chat-interface.tsx | Main UI component |
| public/avatar_headshot.png | Persona image |
| tailwind.config.ts | Theme colors |

========================================
## TECHNOLOGY STACK
========================================

- Next.js 15 + React 18 + TypeScript
- Azure OpenAI Realtime API (voice)
- Azure Cognitive Search (knowledge base)
- PostgreSQL + Prisma (persistence)
- Redis (caching)
- Tailwind CSS + Radix UI

========================================
## SUPPORT
========================================

**UARE.AI Support**: support@uare.ai

For detailed docs, see:
- .env.example - Environment setup
- config.example.json - Configuration guide
- USER_GUIDE.md - End-user documentation

**Powered by UARE.AI**

========================================
