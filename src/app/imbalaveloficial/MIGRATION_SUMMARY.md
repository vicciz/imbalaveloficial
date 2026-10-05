# Migration Summary: PHP API → Supabase

## Changes Made

This document summarizes the migration from PHP backend API to Supabase for Vercel deployment.

### 1. **Environment Configuration**

- **Updated**: `.env.local` now contains Supabase credentials instead of PHP API URL
- **Created**: `.env.example` with template for environment variables
- **Supabase Client**: `supabaseClient.js` now reads from environment variables

### 2. **Authentication Service** (`src/services/auth.ts`)

- **Before**: Used `fetch()` to PHP endpoints (`registro.php`, `login.php`)
- **After**: Uses `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`
- **Added**: `logout()` function

### 3. **Products Service** (`src/services/produtos.ts`)

- **Complete rewrite** to use Supabase client instead of fetch to PHP
- Functions updated:
  - `listarProdutos()` - Now queries Supabase table `produtos`
  - `buscarProduto()` - Queries single product by ID
  - `cadastrarProduto()` - Inserts product record
  - `editarProduto()` - Updates product record
  - `excluirProduto()` - Deletes product record

### 4. **API Compatibility Layer** (`src/services/api.ts`)

- Created wrapper functions that maintain old API response format
- Maps Supabase responses to `{ status: 'ok', produtos: [] }` format
- Ensures backward compatibility with existing components

### 5. **Component Updates**

#### Product Display Components
- `src/components/Carrossel-Outfit.tsx`
- `src/components/Carrossel-Cosmeticos.tsx`
  - Replaced PHP API fetch calls with `listarProdutos()`
  - Updated image URLs to use Supabase Storage: `supabase.storage.from('produtos').getPublicUrl()`

#### Product Detail Page
- `src/app/produto/ProdutoCliente.tsx`
  - Uses `buscarProduto()` instead of fetch
  - Image gallery now loads from Supabase Storage

#### Admin Pages
- `src/app/admin/produtos/cadastrar/page.tsx`
  - Uploads images to Supabase Storage bucket `produtos`
  - Creates product record with uploaded image path
  
- `src/app/admin/produtos/editar/EditarProdutoClient.tsx`
  - Loads product via `buscarProduto()`
  - Uploads new images to Supabase Storage if provided
  - Updates product via `editarProduto()`

- `src/app/admin/produtos/catalogo/page.tsx`
  - Displays images from Supabase Storage

#### Auth Pages
- `src/app/login/page.tsx`
  - Updated to use new auth service response format
  - Handles Supabase `{ data, error }` structure

- `src/app/cadastro/page.tsx`
  - Updated to use new auth service response format
  - Redirects to login after successful registration

### 6. **Image Handling**

- **Before**: Images stored in `uploads/` folder on PHP server
- **After**: Images stored in Supabase Storage bucket `produtos`
- Image URLs now generated with: `supabase.storage.from('produtos').getPublicUrl(path).data.publicUrl`

### 7. **Documentation**

- **Created**: `VERCEL_DEPLOY.md` with deployment instructions
- Includes:
  - Supabase setup guide
  - Database schema for `produtos` table
  - Storage bucket configuration
  - Vercel deployment steps
  - Environment variables setup

## What Still Uses PHP (Not Migrated)

The following components still use the old PHP API endpoints:
- `src/components/NewsletterPopup.tsx` - Newsletter subscription
- `src/components/EnviarEmailUsuarios.tsx` - Email sending
- `src/app/admin/usuarios/gerenciar-usuarios/page.tsx` - User management

These can be migrated to Supabase later if needed.

## Required Supabase Setup

### Database Table: `produtos`

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
  created_at timestamp with time zone default now()
);
```

### Storage Bucket

- **Name**: `produtos`
- **Access**: Public (for image serving)

## Environment Variables for Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Product listing loads correctly
- [ ] Product detail page displays properly
- [ ] Product images load from Supabase Storage
- [ ] Admin can create products with image upload
- [ ] Admin can edit products
- [ ] Admin can delete products
- [ ] Product filtering works (Cosméticos/Outfit)

## Next Steps

1. Create Supabase project if not already done
2. Run SQL migration to create `produtos` table
3. Create `produtos` storage bucket
4. Set environment variables in Vercel
5. Deploy to Vercel
6. Test all functionality
