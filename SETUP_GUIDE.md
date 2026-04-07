# AI Brand Architect — Setup Guide

Follow these steps in order. Each phase builds on the previous one.
Estimated total setup time: **45–60 minutes** (most of it is waiting for installs).

---

## BEFORE YOU START — Accounts You Need

Create accounts on these platforms (all have free tiers to start):

| Platform   | URL                          | What For                    |
|------------|------------------------------|-----------------------------|
| Supabase   | https://supabase.com         | Database + Auth             |
| Anthropic  | https://console.anthropic.com| AI (Claude API)             |
| Stripe     | https://stripe.com           | Payments                    |
| Vercel     | https://vercel.com           | Deployment                  |
| GitHub     | https://github.com           | Code hosting (for Vercel)   |

---

## PHASE 1 — Install Tools on Your Computer

Open your terminal and run these one by one:

```bash
# 1. Check Node.js is installed (need v18 or higher)
node --version

# If not installed → go to https://nodejs.org and download LTS version

# 2. Install Supabase CLI
npm install -g supabase

# 3. Install Stripe CLI (Mac)
brew install stripe/stripe-cli/stripe
# Windows → https://stripe.com/docs/stripe-cli#install

# 4. Install Vercel CLI
npm install -g vercel
```

---

## PHASE 2 — Set Up the Project Locally

```bash
# 1. Move into the downloaded folder
cd ai-brand-architect

# 2. Install all dependencies (takes ~2 minutes)
npm install

# 3. Install ShadCN UI components
npx shadcn@latest init
# When prompted:
#   Style: Default
#   Base color: Slate
#   CSS variables: Yes

# 4. Add the UI components the app uses
npx shadcn@latest add button card input textarea label badge progress dialog tabs separator skeleton

# 5. Copy the environment file
cp .env.local.example .env.local
```

Now open `.env.local` in any text editor — you will fill this in during the next steps.

---

## PHASE 3 — Set Up Supabase

### 3a. Create a Supabase project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Choose a name (e.g. `ai-brand-architect`) and a strong database password
4. Select the region closest to your users
5. Wait ~2 minutes for it to provision

### 3b. Get your API keys
1. In your project dashboard → **Settings → API**
2. Copy these values into `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
   
   ⚠️ The `service_role` key is secret — never share it or commit it to Git.

### 3c. Enable pgvector
1. In Supabase dashboard → **Database → Extensions**
2. Search for `pgvector` → click **Enable**

### 3d. Run the database migration
```bash
# Link your local project to your Supabase project
# Find your project ref in the URL: supabase.com/dashboard/project/YOUR-REF-HERE
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the database schema (creates all tables, RLS policies, triggers)
npx supabase db push
```

You should see: `Applying migration 001_initial_schema.sql... done`

### 3e. Enable Email Auth in Supabase
1. Dashboard → **Authentication → Providers**
2. Make sure **Email** is enabled
3. For development, go to **Authentication → URL Configuration**
4. Set Site URL to: `http://localhost:3000`
5. Add `http://localhost:3000/**` to Redirect URLs

---

## PHASE 4 — Set Up Anthropic

1. Go to https://console.anthropic.com
2. **API Keys → Create Key**
3. Copy the key → paste into `.env.local` as `ANTHROPIC_API_KEY`
4. Make sure you have credits or a billing method added

---

## PHASE 5 — Set Up Stripe

### 5a. Create your products
1. Go to https://dashboard.stripe.com/products
2. Click **Add Product** three times, creating:

   | Product Name              | Price  | Billing  |
   |---------------------------|--------|----------|
   | AI Brand Architect Starter| $49.00 | Monthly  |
   | AI Brand Architect Pro    | $99.00 | Monthly  |
   | AI Brand Architect Agency | $249.00| Monthly  |

3. After creating each product, click into it and copy the **Price ID** (starts with `price_`)
4. Paste them into `.env.local`:
   - Starter price ID → `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
   - Pro price ID → `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
   - Agency price ID → `NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID`

### 5b. Get your secret key
1. Dashboard → **Developers → API Keys**
2. Copy **Secret key** → paste as `STRIPE_SECRET_KEY`

### 5c. Set up the Customer Portal
1. Dashboard → **Settings → Billing → Customer portal**
2. Enable it and click **Save**

### 5d. Set up webhooks for local development
```bash
# In a NEW terminal tab (keep this running while developing)
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
It will print a webhook signing secret like `whsec_...`
→ Paste that into `.env.local` as `STRIPE_WEBHOOK_SECRET`

---

## PHASE 6 — Run Locally

Your `.env.local` should now have all values filled in. Run:

```bash
npm run dev
```

Open http://localhost:3000

### Test the full flow:
1. Go to `/signup` → create an account
2. Check your email → click the confirmation link
3. Go to `/pricing` → click **Start Free Trial**
4. Use Stripe test card: **4242 4242 4242 4242** / any future date / any CVC
5. After redirect to `/dashboard` → click **New Brand Kit**
6. Fill in the form → click Generate
7. Wait ~90 seconds for all 6 agents to finish
8. View your complete brand kit

---

## PHASE 7 — Deploy to Vercel

### 7a. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-brand-architect.git
git push -u origin main
```

### 7b. Import into Vercel
1. Go to https://vercel.com/new
2. Click **Import** next to your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** and add every variable from your `.env.local`
   - Change `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g. `https://ai-brand-architect.vercel.app`)
5. Click **Deploy**

⚠️ **Important:** The AI generation takes up to 90 seconds. Free Vercel accounts time out at 60 seconds.
You need **Vercel Pro** ($20/month) for the 300-second timeout in `vercel.json` to work.

### 7c. Set up production webhook in Stripe
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR_DOMAIN.vercel.app/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the new **Signing secret** → update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
5. Redeploy: `vercel --prod`

### 7d. Update Supabase for production
1. Supabase → **Authentication → URL Configuration**
2. Change Site URL to your Vercel domain
3. Add your Vercel domain to Redirect URLs

---

## DONE ✅

Your app is live. Here's a summary of what each URL does:

| URL                         | What It Is                          |
|-----------------------------|-------------------------------------|
| `/`                         | Marketing / landing page            |
| `/signup`                   | Create account                      |
| `/login`                    | Sign in                             |
| `/pricing`                  | Subscription plans                  |
| `/dashboard`                | User's brand kit overview           |
| `/projects/new`             | Create + generate a brand kit       |
| `/brand-kit/[projectId]`    | View completed brand kit            |
| `/api/checkout`             | Creates Stripe checkout session     |
| `/api/portal`               | Opens Stripe billing portal         |
| `/api/webhooks/stripe`      | Receives Stripe events              |
| `/api/brand/generate`       | Runs the 6-agent LangGraph workflow |

---

## Common Problems & Fixes

**"Subscription required" but I just paid**
→ Check the Stripe CLI terminal is running and forwarded the `checkout.session.completed` event.
→ Check the `subscriptions` table in Supabase has a row with `status = active`.

**Generation times out**
→ You need Vercel Pro for 300-second functions. On the free plan, use a shorter prompt or split the workflow.

**"Invalid webhook signature"**
→ Make sure you're using the `whsec_` from the Stripe CLI (local) vs the Dashboard (production). They are different.

**Supabase RLS blocking data**
→ Check you're logged in. RLS requires `auth.uid()` to match the `user_id` column.

**ShadCN components not found**
→ Run `npx shadcn@latest add [component-name]` for any missing ones.
