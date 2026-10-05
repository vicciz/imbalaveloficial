# Deployment to Vercel

This Next.js app is configured to use Supabase as the backend and can be deployed to Vercel.

## Prerequisites

1. A Supabase account and project
2. A Vercel account

## Setup Steps

### 1. Supabase Configuration

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings > API**
3. Copy your:
   - Project URL (e.g., `https://xxx.supabase.co`)
   - Anon/Public key

### 2. Database Setup

Create a `produtos` table in your Supabase database:

```sql
create table produtos (
  id bigint primary key generated always as identity,
  nome text not null,
  preco text not null,
  originalPreco text,
  categoria text,
  image text,
  image1 text,
  image2 text,
  image3 text,
  rating text,
  reviews integer,
  descricao text,
  detalhes text,
  link text,
  fornecedor text,
  tipo_cosmetico text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 3. Storage Setup

Create a storage bucket named `produtos` for product images:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `produtos`
3. Set it as **Public** if you want images to be publicly accessible
4. Configure RLS policies as needed

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com
3. Click **New Project**
4. Import your repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click **Deploy**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### 5. Post-Deployment

1. Test authentication (login/register)
2. Test product CRUD operations
3. Verify image uploads work correctly
4. Check that product listings display properly

## Environment Variables

Make sure these are set in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Notes

- The app now uses Supabase for authentication instead of PHP sessions
- Product images are stored in Supabase Storage bucket `produtos`
- All API calls have been migrated from PHP endpoints to Supabase client SDK
