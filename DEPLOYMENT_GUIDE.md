# Deployment Guide: Making the Archive Public

## Overview
This guide covers three approaches to make your hair archive website public:
1. **Static Hosting** (Simplest - GitHub Pages/Netlify/Vercel)
2. **Supabase Integration** (Store data and images in Supabase)
3. **Hybrid** (Static hosting + Supabase backend)

---

## Option 1: Static Hosting (Recommended for Quick Launch)

### A. GitHub Pages (Free)

**Steps:**
1. **Commit and push your files to GitHub:**
   ```bash
   git add .
   git commit -m "Add archive page with 31 items"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

3. **Your site will be live at:**
   `https://[your-username].github.io/[repo-name]/archive.html`

**Pros:** Free, automatic deployments, works with your existing repo
**Cons:** Public repo (unless you have GitHub Pro)

---

### B. Netlify (Free, Easy)

**Steps:**
1. **Create a `netlify.toml` file** (optional, for configuration):
   ```toml
   [build]
     publish = "."
   
   [[redirects]]
     from = "/*"
     to = "/archive.html"
     status = 200
   ```

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository
   - Build command: (leave empty)
   - Publish directory: `.` (root)
   - Deploy!

**Pros:** Free, custom domain support, automatic HTTPS, continuous deployment
**Cons:** None really for static sites

---

### C. Vercel (Free, Fast)

**Steps:**
1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login
   - "Add New Project"
   - Import from GitHub
   - Select your repository
   - Deploy!

**Pros:** Very fast, great performance, automatic HTTPS
**Cons:** None for static sites

---

## Option 2: Supabase Integration (Store Data in Database)

### Why Use Supabase?
- Centralized data management
- Easy to update items without redeploying
- Can add admin interface later
- Better for dynamic content

### Steps:

#### 1. Create a Table in Supabase

Go to your Supabase project SQL Editor and run:

```sql
-- Create archive_items table
CREATE TABLE public.archive_items (
  id text PRIMARY KEY,
  inheritedtrait text NOT NULL,
  dateofsample text NOT NULL,
  location_source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable public read access
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.archive_items
  FOR SELECT
  USING (true);

-- Insert your 31 items
INSERT INTO public.archive_items (id, inheritedtrait, dateofsample, location_source) VALUES
  ('item001', 'hormonal imbalances / anxiety', '5/11/2025', 'ITP'),
  ('item002', 'my mom''s skin. I get sunburnt so easily <3 ', '5/11/2025', 'SCALP -370 JAY ST'),
  -- ... (add all 31 items)
  ('item031', 'Docile', '5/12/2025', 'NY');
```

#### 2. Upload Images to Supabase Storage

1. **Create a storage bucket:**
   - Go to Storage → Buckets → New bucket
   - Name: `archive-images`
   - Make it **Public**

2. **Create folders:**
   - `archive-images/originals/`
   - `archive-images/outlines/`

3. **Upload images:**
   - Upload all files from `archive/images/originals/` to `archive-images/originals/`
   - Upload all files from `archive/images/outlines/` to `archive-images/outlines/`

#### 3. Update Your JavaScript to Fetch from Supabase

Modify `archive-script.js` to fetch from Supabase instead of JSON:

```javascript
// Add at the top of archive-script.js
const SUPABASE_URL = 'https://cphqjbvwmrzbrvjkyned.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaHFqYnZ3bXJ6YnJ2amt5bmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjg3MTMsImV4cCI6MjA3Nzg0NDcxM30.C6bthui6fjKoDgQ9ZKaBLBLo0rDxgcffI7b4j40xVCU';

// Add Supabase CDN to archive.html before archive-script.js:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

async function loadArchiveItems() {
  try {
    const { data: items, error } = await supabase
      .from('archive_items')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    // Rest of your existing code...
    // Update image paths to use Supabase storage URLs:
    // const outlineImagePath = `${SUPABASE_URL}/storage/v1/object/public/archive-images/outlines/${item.id}.png`;
    // const originalImagePath = `${SUPABASE_URL}/storage/v1/object/public/archive-images/originals/${item.id}.png`;
  } catch (error) {
    console.error('Error loading items:', error);
  }
}
```

**Pros:** Centralized data, easy updates, scalable
**Cons:** Requires Supabase setup, slightly more complex

---

## Option 3: Hybrid Approach (Recommended)

**Best of both worlds:**
- Host static files on Netlify/Vercel (fast, free)
- Store images in Supabase Storage (easy management)
- Keep JSON file in repo OR use Supabase for data

### Steps:

1. **Upload images to Supabase Storage** (as in Option 2)
2. **Update image paths in your code** to point to Supabase URLs
3. **Deploy static site** to Netlify/Vercel
4. **Keep JSON in repo** OR migrate to Supabase table

---

## Quick Start: GitHub Pages (Easiest)

If you want to go live **right now**, here's the fastest path:

1. **Add all files to Git:**
   ```bash
   git add .
   git commit -m "Add archive page with 31 items and images"
   git push origin main
   ```

2. **Enable GitHub Pages** (as described above)

3. **Done!** Your site is live.

**Note:** GitHub Pages has a 1GB repo size limit. If your images are large, consider:
- Using Supabase Storage for images (Option 2 or 3)
- Or using Netlify/Vercel which have larger limits

---

## File Size Considerations

**Current setup:**
- 31 items × 2 images each = 62 images
- If images are large, your repo might be heavy

**Recommendations:**
- If total repo < 100MB: GitHub Pages is fine
- If total repo > 100MB: Use Supabase Storage for images (Option 2/3)

---

## Security Notes

1. **Supabase Keys:** The ANON key in your README is safe to use in frontend code (it's designed to be public)
2. **RLS Policies:** Make sure your Supabase tables have proper Row Level Security if storing sensitive data
3. **CORS:** Supabase handles CORS automatically for typical usage

---

## Next Steps

1. **Choose your option** (I recommend Option 1 for quick launch, or Option 3 for scalability)
2. **Let me know which option you prefer** and I can help you implement it
3. **Test locally** before deploying
4. **Deploy and share!**

---

## Questions?

- Need help setting up Supabase tables? I can generate the SQL for all 31 items.
- Want to migrate images to Supabase? I can help update the code.
- Need help with Git/GitHub? I can guide you through commits and pushes.

