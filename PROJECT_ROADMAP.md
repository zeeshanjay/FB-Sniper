# Astraventa FB Sniper - Project Roadmap

## Overview
Multi-tenant SaaS automation platform for Facebook group/page interactions via Meta Graph API.

**Design Language**: Luxury Minimalism (Stripe/Apple inspired)
- High-quality typography
- Generous white space
- Subtle 'Elite' UI components
- Zero-clutter interfaces

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI (Python)
- **Automation Logic**: Python services

### Database/Auth
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase OAuth
- **Project URL**: https://rqpslulmmzlxnfkpphpg.supabase.co
- **Service Key**: <SUPABASE_PAT_REDACTED>

---

## Architecture Principles

### 1. Multi-Tenant Design
- Every database table partitioned by `user_id`
- Row-Level Security (RLS) enabled on all tables
- Isolated data per tenant

### 2. Service Isolation
- All Meta Graph API calls in `backend/services/meta.py`
- Single point of maintenance for Facebook API changes
- Clean separation of concerns

### 3. Security First
- Long-lived tokens stored securely in Supabase
- OAuth 2.0 flow with proper token exchange
- Environment-based configuration

---

## Project Structure

```
sniper/
├── frontend/                    # Next.js 15 App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/         # Luxury Minimalism Sign-in
│   │   │   └── callback/       # OAuth callback
│   │   ├── dashboard/          # Elite Dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   └── ui/                 # Shadcn/UI components
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   └── package.json
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── api/
│   │   │   ├── auth.py         # Auth endpoints
│   │   │   └── sniper.py       # Sniper automation endpoints
│   │   ├── services/
│   │   │   ├── meta.py         # Meta Graph API (ISOLATED)
│   │   │   └── token.py        # Token management
│   │   └── models/
│   │       └── schemas.py      # Pydantic models
│   ├── requirements.txt
│   └── .env.example
│
└── database/
    └── schema.sql              # Supabase schema
```

---

## Database Schema

### Tables (All with RLS + user_id partitioning)

#### 1. users (Extended from Supabase auth.users)
```sql
- id (uuid, FK to auth.users)
- email (text)
- full_name (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 2. meta_tokens
```sql
- id (uuid, PK)
- user_id (uuid, FK, NOT NULL)
- access_token (text, encrypted)
- token_type (text) -- 'long-lived'
- expires_at (timestamptz)
- scopes (text[])
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 3. sniper_logs
```sql
- id (uuid, PK)
- user_id (uuid, FK, NOT NULL)
- action_type (text) -- 'fetch', 'post', 'comment', 'like'
- target_id (text) -- FB group/page ID
- status (text) -- 'success', 'failed', 'rate_limited'
- error_message (text, nullable)
- metadata (jsonb)
- created_at (timestamptz)
```

#### 4. automation_posts
```sql
- id (uuid, PK)
- user_id (uuid, FK, NOT NULL)
- content (text)
- target_groups (text[])
- status (text) -- 'pending', 'posted', 'failed'
- scheduled_at (timestamptz, nullable)
- posted_at (timestamptz, nullable)
- created_at (timestamptz)
```

---

## Implementation Phases

### Phase 1: Multi-Tenant Architecture ✅
**Status**: Starting
- [x] Initialize Next.js 15 project
- [ ] Set up FastAPI backend structure
- [ ] Configure Supabase client
- [ ] Create database schema with RLS
- [ ] Test basic auth connection

### Phase 2: The Meta Handshake
- [ ] Implement OAuth 2.0 flow
- [ ] Build token exchange (short-lived → 60-day long-lived)
- [ ] Store tokens securely in Supabase
- [ ] Token refresh logic
- [ ] Test Meta connection

### Phase 3: The Sniper Engine
- [ ] Create `services/meta.py` with Graph API calls
- [ ] Implement fetch content service
- [ ] Implement post content service
- [ ] Rate limit handling
- [ ] Error handling & retry logic

### Phase 4: Elite Dashboard
- [ ] Build Sign-in page (Luxury Minimalism)
- [ ] Connect Meta account UI
- [ ] Automation status view
- [ ] Sniper action logs
- [ ] Zero-clutter design implementation

---

## Meta Graph API Service Structure

### File: `backend/app/services/meta.py`

This file will contain ALL Facebook API interactions:

```python
# Functions to implement:
- get_user_profile(access_token)
- get_user_groups(access_token)
- get_user_pages(access_token)
- get_group_feed(group_id, access_token)
- post_to_group(group_id, message, access_token)
- post_to_page(page_id, message, access_token)
- comment_on_post(post_id, message, access_token)
- like_post(post_id, access_token)
- exchange_token(short_lived_token)
- refresh_long_lived_token(long_lived_token)
- check_rate_limits(access_token)
```

**Why Isolated?** When Facebook changes their API, only this file needs updating.

---

## Next Steps (Current Phase)

1. **Initialize Project Structure**
   - Create frontend directory with Next.js 15
   - Create backend directory with FastAPI
   - Set up environment files

2. **Configure Supabase**
   - Set up Supabase client in frontend
   - Create database schema
   - Enable RLS policies

3. **Test Auth Layer**
   - Build luxury sign-in page
   - Test Supabase OAuth flow
   - Verify user session

---

## Environment Variables Required

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://rqpslulmmzlxnfkpphpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get_from_supabase>
NEXT_PUBLIC_META_APP_ID=<your_meta_app_id>
NEXT_PUBLIC_META_APP_SECRET=<your_meta_app_secret>
```

### Backend (.env)
```
SUPABASE_URL=https://rqpslulmmzlxnfkpphpg.supabase.co
SUPABASE_SERVICE_KEY=<SUPABASE_PAT_REDACTED>
META_APP_ID=<your_meta_app_id>
META_APP_SECRET=<your_meta_app_secret>
META_REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## Testing Strategy

Each phase will be tested before moving to the next:
- Phase 1: Test database connection and auth
- Phase 2: Test OAuth flow and token storage
- Phase 3: Test actual Graph API calls
- Phase 4: Test UI and end-to-end flow

---

## Notes

- User will provide UI components for Phase 4
- Focus on small, testable increments
- Maintain clean, maintainable code
- Follow Luxury Minimalism design principles
