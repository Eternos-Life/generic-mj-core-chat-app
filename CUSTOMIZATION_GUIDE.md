# 🤖 AI Digital Twin - Complete Customization Guide for Claude

**Purpose**: This guide helps Claude (or any developer) convert this generic template into a fully customized AI Digital Twin for a specific expert persona.

**Last Updated**: 2025-11-26
**Powered by**: UARE.AI

---

## 📋 Table of Contents

1. [Overview - What Was Done](#overview---what-was-done)
2. [Step-by-Step Customization](#step-by-step-customization)
3. [Placeholder Reference](#placeholder-reference)
4. [File-by-File Instructions](#file-by-file-instructions)
5. [Testing & Verification](#testing--verification)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 Overview - What Was Done

### Original State
- **Persona**: Sven Janszky (German Futurist & Trend Researcher)
- **Organization**: 2b AHEAD ThinkTank
- **Domain**: Future trends, megatrends, strategic foresight
- **Language**: German
- **Image**: sven_headshot.png

### Current State (Generic Template)
- **Persona**: Placeholder variables (`AVATAR_NAME`, `{{AVATAR_NAME}}`)
- **Organization**: Placeholder (`{{ORG_NAME}}`)
- **Domain**: Configurable via placeholders
- **Language**: Multilingual support maintained
- **Image**: avatar_headshot.png (generic name)

### Changes Made (Summary)

**Files Created** (6):
1. `src/prompts/generic-persona-instructions.ts` - Persona template with full documentation
2. `config.example.json` - Central configuration for all customizable values
3. `.env.example` - Environment variables with detailed setup guide
4. `CHANGELOG.md` - Complete change history
5. `PATCH_SUMMARY.md` - File-by-file breakdown
6. `QUICK_START.md` - 5-minute setup guide

**Files Modified** (6):
1. `src/app/chat-interface.tsx` - UI text converted to placeholders (~25 locations)
2. `src/app/page.tsx` - Page metadata genericized
3. `src/app/layout.tsx` - Site metadata genericized
4. `README.md` - Comprehensive developer documentation
5. `USER_GUIDE.md` - Generic end-user guide
6. `public/sven_headshot.png` → `public/avatar_headshot.png` (renamed)

**Functionality Preserved**:
- ✅ Real-time voice conversations (Azure OpenAI Realtime API)
- ✅ Knowledge base search (Azure Cognitive Search)
- ✅ Database persistence (PostgreSQL + Prisma + Redis)
- ✅ GDPR compliance features
- ✅ AI Studio with content generation tools
- ✅ Responsive design (Desktop/Tablet/Mobile)
- ✅ German acronym pronunciation rules (adaptable)
- ✅ Custom voice support

---

## 🚀 Step-by-Step Customization

### Step 1: Gather Information About the New Persona

Before starting, collect these details:

```
1. PERSONAL INFO:
   - Full Name: _______________________
   - Professional Title: _______________________
   - Organization/Company: _______________________
   - Short Subtitle (for UI): _______________________

2. EXPERTISE:
   - Main Domain: _______________________
   - 5-7 Expertise Areas:
     • _______________________
     • _______________________
     • _______________________
     • _______________________
     • _______________________

3. KNOWLEDGE BASE:
   - What content is indexed? _______________________
   - 8 main categories:
     1. _______________________
     2. _______________________
     3. _______________________
     4. _______________________
     5. _______________________
     6. _______________________
     7. _______________________
     8. _______________________

4. PERSONALITY:
   - Core Philosophy: _______________________
   - Approach/Methodology: _______________________
   - Conversation Style: _______________________

5. ASSETS:
   - Avatar/Headshot Image: [path or URL]
   - Logo (optional): [path or URL]
   - Brand Colors (optional): _______________________

6. TECHNICAL:
   - Azure OpenAI Endpoint: _______________________
   - Azure Search Index: _______________________
   - Custom Voice Name (if any): _______________________
```

### Step 2: Configure Environment Variables

**File**: `.env`

```bash
# Create from template
cp .env.example .env
```

**Edit `.env` with actual credentials**:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?sslmode=disable"

# Azure OpenAI
AZURE_OPENAI_ENDPOINT="https://your-resource.services.ai.azure.com/api/projects/yourProject"
AZURE_OPENAI_API_KEY="your-actual-api-key"
AZURE_OPENAI_MODEL="gpt-4o-realtime-preview"

# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT="https://your-search.search.windows.net"
AZURE_SEARCH_API_KEY="your-search-api-key"
AZURE_SEARCH_INDEX="your-index-name"

# Custom Voice (optional)
VOICE_DEPLOYMENT_ID="your-voice-deployment-id"
CUSTOM_VOICE_NAME="your_custom_voice_name"

# Redis
REDIS_URL="redis://localhost:6379"

# Development only
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

### Step 3: Update Persona Instructions

**File**: `src/prompts/generic-persona-instructions.ts`

This file contains `{{PLACEHOLDER}}` variables. Replace ALL of them:

**Key Replacements**:

```typescript
// IDENTITY SECTION
{{AVATAR_NAME}} → "Dr. Jane Smith"
{{AVATAR_TITLE}} → "AI Ethics Researcher"
{{ORG_NAME}} → "Future Tech Institute"
{{ROLE_DESCRIPTION}} → "leading researcher in AI ethics and responsible innovation"
{{EXPERTISE_AREA}} → "AI ethics, responsible innovation, and technology governance"

// EXPERTISE AREAS (list 5-7)
{{EXPERTISE_AREA_1}} → "Ethical frameworks and moral theory in AI"
{{EXPERTISE_AREA_2}} → "Algorithmic fairness and bias mitigation"
{{EXPERTISE_AREA_3}} → "Privacy-preserving AI techniques"
{{EXPERTISE_AREA_4}} → "AI governance and policy development"
{{EXPERTISE_AREA_5}} → "Transparency and explainability in ML"
{{EXPERTISE_AREA_6}} → "Social impact assessment of AI systems"
{{EXPERTISE_AREA_7}} → "Ethical design patterns and best practices"

// PHILOSOPHY & APPROACH
{{CORE_PHILOSOPHY}} → "Ethical AI development requires proactive consideration of societal impact at every stage of design and deployment."
{{APPROACH_DESCRIPTION}} → "You believe that responsible AI requires systematic analysis of potential harms, stakeholder engagement, and continuous ethical assessment."

// DOMAIN & SEARCH
{{DOMAIN}} → "AI ethics research"
{{DOMAIN_KEYWORDS}} → "AI ethics, responsible innovation, governance"

// SEARCH CATEGORIES (8 categories for knowledge base)
{{CATEGORY_1}} → "ETHICAL FRAMEWORKS: Moral theories, principles, decision-making models"
{{CATEGORY_2}} → "POLICY & GOVERNANCE: Regulations, standards, compliance"
{{CATEGORY_3}} → "CASE STUDIES: Real-world examples, implementations"
{{CATEGORY_4}} → "BIAS & FAIRNESS: Detection, mitigation, metrics"
{{CATEGORY_5}} → "PRIVACY & SECURITY: Data protection, techniques"
{{CATEGORY_6}} → "TRANSPARENCY: Explainability, accountability"
{{CATEGORY_7}} → "SOCIAL IMPACT: Equity, stakeholder analysis"
{{CATEGORY_8}} → "BEST PRACTICES: Standards, guidelines, patterns"
```

**Search & Replace Strategy**:

```bash
# Find all {{PLACEHOLDER}} in the file
grep "{{.*}}" src/prompts/generic-persona-instructions.ts

# Use your editor's find & replace:
# Find: {{AVATAR_NAME}}
# Replace: Dr. Jane Smith
# (Repeat for all placeholders)
```

**Optional**: Rename the file to match your persona:
```bash
mv src/prompts/generic-persona-instructions.ts src/prompts/jane-smith-instructions.ts
```

Then update `src/prompts/index.ts` to export from the new file.

### Step 4: Update UI Components (Plain Text Placeholders)

**File**: `src/app/chat-interface.tsx`

**Important**: In JSX/UI files, placeholders are **plain text** (not `{{template}}`). Just replace the text directly.

**Locations to Update**:

#### A. Avatar Alt Text (Line 200)
```tsx
// Before:
alt="AVATAR_NAME - AVATAR_TITLE"

// After:
alt="Dr. Jane Smith - AI Ethics Researcher"
```

#### B. Introduction Message (Line 297)
```tsx
// Before:
const INTRODUCTION_MESSAGE = "Hallo! Ich bin {{AVATAR_NAME}}, {{AVATAR_TITLE}} und {{ROLE_DESCRIPTION}}. Ich helfe Ihnen gerne mit {{EXPERTISE_AREA_DESCRIPTION}}.";

// After:
const INTRODUCTION_MESSAGE = "Hello! I'm Dr. Jane Smith, an AI Ethics Researcher and leading expert in responsible AI development. I help organizations navigate ethical challenges in AI systems.";
```

#### C. Error Messages (Line 477)
```tsx
// Before:
content: "Error connecting to {{AVATAR_NAME}}: " + error,

// After:
content: "Error connecting to Dr. Jane Smith: " + error,
```

#### D. Search Enhancement (Line 681)
```tsx
// Before:
enhancedQuery = `${query} {{AVATAR_NAME}} {{AVATAR_TITLE}} {{ORG_NAME}} approach methodology`;

// After:
enhancedQuery = `${query} Dr. Jane Smith AI Ethics Researcher Future Tech Institute approach methodology`;
```

#### E. System Instructions (Lines 707-711, 748-750)
Replace all persona references in system prompts:
```tsx
// Before:
"You are {{AVATAR_NAME}}, a {{AVATAR_TITLE}} with expertise in {{EXPERTISE_AREAS}}."

// After:
"You are Dr. Jane Smith, an AI Ethics Researcher with expertise in algorithmic fairness, privacy-preserving AI, and governance frameworks."
```

#### F. Header Name & Subtitle (Lines 1025, 1029)
```tsx
// Before:
<h1>AVATAR_NAME</h1>
<p>AVATAR_SUBTITLE</p>

// After:
<h1>Dr. Jane Smith</h1>
<p>AI Ethics & Responsible Innovation</p>
```

#### G. Welcome Text (Lines 1081-1082)
```tsx
// Before:
<h3>Willkommen bei AVATAR_NAME</h3>
<p>Klicken Sie auf die Schaltfläche „Verbinden", um Ihr Gespräch mit AVATAR_TITLE zu beginnen.</p>

// After:
<h3>Welcome to Dr. Jane Smith</h3>
<p>Click the "Connect" button to start your conversation with the AI Ethics Researcher.</p>
```

#### H. Search Tool Description (Lines 70-79)
Replace category descriptions:
```tsx
// Before:
"1. {{CATEGORY_1}}: {{DESCRIPTION}}\n" +
"2. {{CATEGORY_2}}: {{DESCRIPTION}}\n" +
...

// After:
"1. ETHICAL FRAMEWORKS: Moral theories, ethical principles, decision-making models\n" +
"2. POLICY & GOVERNANCE: Regulations, standards, oversight mechanisms\n" +
...
```

### Step 5: Update Page Metadata

#### **File**: `src/app/page.tsx`

```tsx
// Before (Lines 5-6):
title: "{{AVATAR_NAME}} - UARE.AI",
description: "{{AVATAR_TITLE}} | Digital Twin Demo",

// After:
title: "Dr. Jane Smith - UARE.AI",
description: "AI Ethics Researcher | Digital Twin Demo",
```

#### **File**: `src/app/layout.tsx`

```tsx
// Before (Lines 13-14):
title: "{{AVATAR_NAME}} - {{AVATAR_TITLE}} - UARE.AI",
description: "{{AVATAR_SUBTITLE}} | Digital Twin Demo",

// After:
title: "Dr. Jane Smith - AI Ethics Researcher - UARE.AI",
description: "Ethics & Responsible AI | Digital Twin Demo",
```

### Step 6: Replace Avatar Image

```bash
# Replace the generic avatar with your persona's headshot
# Recommended: 400x400px, PNG format, optimized

cp /path/to/new-headshot.png public/avatar_headshot.png

# Or using curl if you have a URL:
curl -o public/avatar_headshot.png "https://example.com/jane-smith-headshot.png"
```

**Image Requirements**:
- Format: PNG or JPG
- Size: 400x400px recommended
- File size: < 500KB (optimize if needed)
- Subject: Professional headshot, centered, good lighting

### Step 7: Set Up Database

```bash
# Install dependencies
pnpm install

# Run migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate
```

### Step 8: Test Build

```bash
# Development build
pnpm run dev

# Production build (must succeed!)
pnpm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
```

If you see errors, see [Common Issues](#common-issues--solutions) section.

---

## 📝 Placeholder Reference

### Two Types of Placeholders

#### Type 1: Plain Text (in JSX/UI)
**Format**: `AVATAR_NAME` (no braces)
**Location**: JSX elements, UI strings
**How to Replace**: Just replace the text directly

```tsx
// Find:
<h1>AVATAR_NAME</h1>

// Replace with:
<h1>Dr. Jane Smith</h1>
```

**Files with Plain Text Placeholders**:
- `src/app/chat-interface.tsx` (multiple locations)
- `src/app/page.tsx`
- `src/app/layout.tsx`

#### Type 2: Template Strings (in config/prompts)
**Format**: `{{AVATAR_NAME}}` (with double braces)
**Location**: String literals, template files
**How to Replace**: Replace including the braces

```typescript
// Find:
"You are {{AVATAR_NAME}}"

// Replace with:
"You are Dr. Jane Smith"
```

**Files with Template Placeholders**:
- `src/prompts/generic-persona-instructions.ts` (many)
- `src/app/chat-interface.tsx` (in string literals)

### Complete Placeholder List

| Placeholder | Type | Example Replacement | Locations |
|-------------|------|---------------------|-----------|
| `AVATAR_NAME` | Plain | "Dr. Jane Smith" | chat-interface.tsx (UI) |
| `{{AVATAR_NAME}}` | Template | "Dr. Jane Smith" | prompt files, strings |
| `AVATAR_TITLE` | Plain | "AI Ethics Researcher" | page.tsx, layout.tsx |
| `{{AVATAR_TITLE}}` | Template | "AI Ethics Researcher" | prompt files, strings |
| `AVATAR_SUBTITLE` | Plain | "Ethics & Responsible AI" | chat-interface.tsx |
| `{{AVATAR_SUBTITLE}}` | Template | "Ethics & Responsible AI" | layout.tsx |
| `{{ORG_NAME}}` | Template | "Future Tech Institute" | prompt files |
| `{{DOMAIN}}` | Template | "AI ethics research" | search descriptions |
| `{{EXPERTISE_AREA}}` | Template | "AI ethics and governance" | prompt files |
| `{{CATEGORY_1}}` to `{{CATEGORY_8}}` | Template | Domain-specific categories | search tool config |

---

## 📂 File-by-File Instructions

### Critical Files (Must Edit)

#### 1. `src/prompts/generic-persona-instructions.ts`
**Priority**: ⚠️ CRITICAL
**Placeholders**: ~50 template placeholders
**Task**: Replace all `{{PLACEHOLDER}}` with persona details

**Sections to Customize**:
- `AVATAR_IDENTITY` (lines 4-74)
  - WHO YOU ARE
  - YOUR MAIN EXPERTISE (5-7 items)
  - YOUR CORE PHILOSOPHY
  - VERIFIED BACKGROUND

- `AVATAR_SEARCH_RULES` (lines 76-144)
  - Search categories (8 items)
  - Domain-specific question types

- `AVATAR_CONVERSATION_STYLE` (lines 146-234)
  - Voice & tone
  - Forbidden phrases
  - Response approach

- `AVATAR_CONTEXT_INFO` (lines 236-282)
  - Knowledge base scope (8 types)

**Verification**:
```bash
# Check for remaining placeholders
grep "{{.*}}" src/prompts/generic-persona-instructions.ts

# Should return: (no matches)
```

---

#### 2. `src/app/chat-interface.tsx`
**Priority**: ⚠️ CRITICAL
**Placeholders**: ~25 locations (mixed types)
**Task**: Replace plain text and template strings

**Quick Find & Replace List**:

| Line(s) | Find | Replace With |
|---------|------|--------------|
| 70-79 | `{{CATEGORY_1}}` through `{{CATEGORY_8}}` | Your 8 search categories |
| 200 | `AVATAR_NAME - AVATAR_TITLE` | "Dr. Jane Smith - AI Ethics Researcher" |
| 297 | `{{AVATAR_NAME}}`, `{{AVATAR_TITLE}}`, etc. | Your persona details (in German or English) |
| 477 | `{{AVATAR_NAME}}` | "Dr. Jane Smith" |
| 681 | `{{AVATAR_NAME}} {{AVATAR_TITLE}} {{ORG_NAME}}` | "Dr. Jane Smith AI Ethics Researcher Future Tech Institute" |
| 707-711 | `{{AVATAR_NAME}}`, `{{EXPERTISE_AREAS}}` | Your persona name and expertise |
| 748-750 | `{{AVATAR_NAME}}`, `{{DOMAIN}}` | Your persona and domain |
| 1025 | `AVATAR_NAME` | "Dr. Jane Smith" |
| 1029 | `AVATAR_SUBTITLE` | "AI Ethics & Responsible AI" |
| 1081 | `AVATAR_NAME` | "Dr. Jane Smith" |
| 1082 | `AVATAR_TITLE` | "the AI Ethics Researcher" |

**Verification**:
```bash
# Check for template placeholders in strings
grep "{{.*}}" src/app/chat-interface.tsx

# Check for plain text placeholders in JSX
grep "AVATAR_NAME\|AVATAR_TITLE\|AVATAR_SUBTITLE" src/app/chat-interface.tsx

# Should show only your replacements, no placeholder text
```

---

#### 3. `src/app/page.tsx`
**Priority**: ⚠️ CRITICAL
**Placeholders**: 2
**Task**: Update page metadata

```tsx
export const metadata = {
  title: "Dr. Jane Smith - UARE.AI",
  description: "AI Ethics Researcher | Digital Twin Demo",
  icons: { ... }
};
```

---

#### 4. `src/app/layout.tsx`
**Priority**: ⚠️ CRITICAL
**Placeholders**: 2
**Task**: Update site-wide metadata

```tsx
export const metadata: Metadata = {
  title: "Dr. Jane Smith - AI Ethics Researcher - UARE.AI",
  description: "Ethics & Responsible AI | Digital Twin Demo",
  icons: { ... }
};
```

---

#### 5. `public/avatar_headshot.png`
**Priority**: ⚠️ CRITICAL
**Task**: Replace with persona's image

```bash
# Option 1: Copy from file
cp /path/to/headshot.png public/avatar_headshot.png

# Option 2: Download from URL
curl -o public/avatar_headshot.png "https://example.com/image.png"

# Option 3: Use ImageMagick to resize/optimize
convert input.jpg -resize 400x400^ -gravity center -extent 400x400 public/avatar_headshot.png
```

---

#### 6. `.env`
**Priority**: ⚠️ CRITICAL
**Task**: Add real credentials

```bash
cp .env.example .env
# Edit .env with your actual API keys and endpoints
```

**Required Values**:
- `DATABASE_URL` - PostgreSQL connection
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI URL
- `AZURE_OPENAI_API_KEY` - Your API key
- `AZURE_SEARCH_ENDPOINT` - Search service URL
- `AZURE_SEARCH_API_KEY` - Search API key
- `AZURE_SEARCH_INDEX` - Your index name
- `REDIS_URL` - Redis connection
- `CUSTOM_VOICE_NAME` - If using custom voice

---

### Optional Files (Recommended)

#### 7. `tailwind.config.ts`
**Priority**: Optional
**Task**: Customize theme colors

**Current Theme**: Wine red (`#7A2948`)

**To Change**:
```typescript
// Lines 56-127
theme: {
  extend: {
    colors: {
      'neutral-accent-primary': '#2563EB',      // Change to your brand color
      'neutral-accent-primary-hover': '#3B82F6',
      'neutral-accent-primary-dark': '#1D4ED8',
      ...
    }
  }
}
```

---

#### 8. `src/app/globals.css`
**Priority**: Optional
**Task**: Update CSS color variables

```css
/* Lines with wine red theme */
:root {
  --primary: 37 147 72;  /* Change to your RGB values */
  --accent: 59 130 246;
  ...
}
```

---

#### 9. `README.md` & `USER_GUIDE.md`
**Priority**: Optional
**Task**: Already generic, but you can add org-specific details

These files are already genericized. You can optionally add:
- Organization-specific support contacts
- Custom getting started instructions
- Domain-specific tips

---

## ✅ Testing & Verification

### Pre-Deployment Checklist

#### Configuration
- [ ] `.env` created with valid credentials
- [ ] Database accessible: `pnpm prisma studio` works
- [ ] Redis running and accessible
- [ ] Azure OpenAI endpoint responds
- [ ] Azure Search index exists and has documents

#### Persona Customization
- [ ] All `{{TEMPLATE_PLACEHOLDERS}}` replaced in prompt files
- [ ] All `PLAIN_TEXT_PLACEHOLDERS` replaced in UI files
- [ ] Avatar image replaced: `public/avatar_headshot.png`
- [ ] Page metadata updated: `page.tsx`, `layout.tsx`
- [ ] Introduction message customized (language appropriate)

#### Build & Functionality
- [ ] Dependencies installed: `pnpm install`
- [ ] Prisma generated: `pnpm prisma generate`
- [ ] Development runs: `pnpm run dev`
- [ ] **Production build succeeds**: `pnpm run build` ✅
- [ ] No TypeScript errors
- [ ] No ESLint errors

#### Features
- [ ] Voice recording works (microphone permissions)
- [ ] Connection to Azure OpenAI succeeds
- [ ] Knowledge base search returns relevant results
- [ ] Conversation history persists after refresh
- [ ] AI Studio sidebar tools work
- [ ] Responsive design works on mobile/tablet

#### Content Verification
- [ ] Persona name displays correctly in UI
- [ ] Avatar image loads properly
- [ ] Introduction message is appropriate
- [ ] Search results are relevant to domain
- [ ] AI responses match persona's expertise

---

## 🐛 Common Issues & Solutions

### Issue 1: Build Error - "Object literal may only specify known properties"

**Error Message**:
```
Type error: Object literal may only specify known properties, and 'AVATAR_NAME' does not exist...
```

**Cause**: Using `{{AVATAR_NAME}}` (with braces) in JSX

**Solution**: In JSX elements, use plain text without braces:
```tsx
// ❌ Wrong:
<h1>{{AVATAR_NAME}}</h1>

// ✅ Correct:
<h1>Dr. Jane Smith</h1>
```

---

### Issue 2: Placeholders Still Showing in UI

**Symptom**: You see "AVATAR_NAME" or "{{AVATAR_NAME}}" text in the interface

**Cause**: Placeholder not replaced or replaced incorrectly

**Solution**:
```bash
# Find remaining placeholders
grep -r "AVATAR_NAME\|{{AVATAR" src/app/

# Replace each occurrence manually in the file
```

---

### Issue 3: Search Not Returning Results

**Symptoms**: Knowledge base search returns empty results

**Causes & Solutions**:

1. **Index is empty**
   - Verify documents in Azure Portal
   - Re-index your content

2. **Wrong index name**
   - Check `.env`: `AZURE_SEARCH_INDEX`
   - Verify it matches your Azure index name

3. **Field names don't match**
   - Default fields: `content`, `people`
   - Update in chat-interface.tsx if different

4. **API key lacks permissions**
   - Use Query key (not Admin key) in production
   - Verify key has search permissions

---

### Issue 4: Voice Not Working

**Symptoms**: Microphone button doesn't work or no voice response

**Causes & Solutions**:

1. **Microphone permissions denied**
   - Browser must have microphone access
   - Check browser settings

2. **Not using HTTPS**
   - Use `localhost` for local dev (allowed)
   - Use HTTPS in production (required)

3. **Wrong voice configuration**
   - Verify `CUSTOM_VOICE_NAME` in `.env`
   - Check `VOICE_DEPLOYMENT_ID` if using custom voice

4. **Azure OpenAI endpoint incorrect**
   - Verify `AZURE_OPENAI_ENDPOINT` URL
   - Ensure Realtime API is enabled

---

### Issue 5: Database Connection Failed

**Error**: "Error: connect ECONNREFUSED" or "Database connection failed"

**Solutions**:

1. **PostgreSQL not running**
   ```bash
   # Start PostgreSQL
   brew services start postgresql  # macOS
   sudo service postgresql start   # Linux
   ```

2. **Wrong connection string**
   - Check `DATABASE_URL` format
   - Verify username, password, host, port, database name

3. **Database doesn't exist**
   ```bash
   # Create database
   createdb your_database_name

   # Or in psql:
   psql -U postgres
   CREATE DATABASE your_database_name;
   ```

4. **Migrations not run**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

---

### Issue 6: Redis Connection Failed

**Error**: "Error connecting to Redis" or "ECONNREFUSED 127.0.0.1:6379"

**Solutions**:

1. **Redis not running**
   ```bash
   # Start Redis
   brew services start redis  # macOS
   sudo service redis start   # Linux
   redis-server              # Manual start
   ```

2. **Wrong Redis URL**
   - Check `.env`: `REDIS_URL="redis://localhost:6379"`
   - Verify host and port

3. **Redis password required**
   - Update URL: `redis://:password@host:port`

---

### Issue 7: German Acronyms Mispronounced

**Symptom**: Voice says "kee" instead of "K-I" for "KI"

**Cause**: Missing periods in acronyms

**Solution**: Ensure periods between letters in German responses:
- ✅ "K.I." (pronounced "Kay-Ee")
- ❌ "KI" (pronounced "kee")

This is in the prompt instructions - make sure your persona maintains this rule if using German.

---

## 🎯 Quick Reference Commands

### Find All Placeholders
```bash
# Template placeholders (with braces)
grep -r "{{.*}}" src/ --include="*.ts" --include="*.tsx"

# Plain text placeholders (without braces)
grep -r "AVATAR_NAME\|AVATAR_TITLE\|AVATAR_SUBTITLE" src/ --include="*.tsx"

# Count remaining placeholders
grep -r "{{.*}}" src/ | wc -l
```

### Build & Test
```bash
# Install dependencies
pnpm install

# Database setup
pnpm prisma migrate dev
pnpm prisma generate

# Development server
pnpm run dev

# Production build (must succeed!)
pnpm run build

# Start production server
pnpm run start
```

### Database Management
```bash
# Open Prisma Studio (GUI)
pnpm prisma studio

# Reset database (warning: deletes data!)
pnpm prisma migrate reset

# Create new migration
pnpm prisma migrate dev --name your_migration_name
```

### Verification
```bash
# Check TypeScript
pnpm run type-check

# Check linting
pnpm run lint

# Format code
pnpm run format
```

---

## 📚 Additional Resources

### Documentation
- **Azure OpenAI Realtime API**: https://learn.microsoft.com/azure/ai-services/openai/realtime-audio-quickstart
- **Azure Cognitive Search**: https://learn.microsoft.com/azure/search/
- **Next.js 15**: https://nextjs.org/docs
- **Prisma ORM**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Support
- **UARE.AI Support**: support@uare.ai
- **Project Issues**: Check README.md troubleshooting section

---

## 🎉 Completion Checklist

Before considering the customization complete:

### Must Have
- [ ] All placeholders replaced (0 remaining)
- [ ] Avatar image replaced
- [ ] `.env` configured with valid credentials
- [ ] Production build succeeds: `pnpm run build` ✓
- [ ] Voice functionality works
- [ ] Knowledge base search works
- [ ] Persona responds in character

### Should Have
- [ ] Theme colors updated (optional)
- [ ] README.md updated with org details (optional)
- [ ] USER_GUIDE.md updated with domain-specific examples (optional)
- [ ] Custom logo added (optional)

### Nice to Have
- [ ] Custom voice trained and configured
- [ ] Additional AI Studio tools configured
- [ ] Analytics/telemetry added
- [ ] Custom domain configured

---

## 📝 Notes for Claude

When helping users customize this template:

1. **Start with Step 1**: Gather all persona information first
2. **Follow the order**: Steps 2-8 build on each other
3. **Two placeholder types**: Remember the difference between `AVATAR_NAME` (JSX) and `{{AVATAR_NAME}}` (strings)
4. **Test frequently**: Run `pnpm run build` after major changes
5. **Knowledge base first**: Ensure search is working before fine-tuning prompts
6. **Voice is optional**: The app works without custom voice
7. **Preserve functionality**: Don't modify technical constraints (German acronyms, SSML rules) unless requested

---

**End of Customization Guide**

*This guide provides everything needed to convert the generic template into a fully customized AI Digital Twin for any expert persona.*

**Build Status**: ✅ Verified - Template builds successfully
**Last Updated**: 2025-11-26
**Powered by**: UARE.AI
