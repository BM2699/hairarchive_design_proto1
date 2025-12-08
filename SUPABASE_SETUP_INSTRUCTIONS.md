# Supabase Setup Instructions

This guide will help you set up Supabase to store your archive data and images, then deploy your static site to GitHub Pages.

## Important: Using Existing Supabase Project

**Your Supabase project already has:**
- `archives` table - for storing user submissions (origin, emotion, connection, etc.)
- `archives` storage bucket - for storing submission images

**This setup will add:**
- `archive_items` table - for displaying the archive page (inheritedtrait, dateofsample, location_source)
- `archive-images` storage bucket - for storing archive display images (originals and outlines)

These are completely separate and won't interfere with each other!

## Prerequisites
- Supabase account (already have one: https://cphqjbvwmrzbrvjkyned.supabase.co)
- GitHub account
- All 31 items in your JSON file
- All images in `archive/images/originals/` and `archive/images/outlines/`

---

## Step 1: Set Up Supabase Database

### 1.1 Create the Table
1. Go to your Supabase project: https://app.supabase.com/project/cphqjbvwmrzbrvjkyned
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy and paste the entire contents of `supabase_setup.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" and a count query showing 31 items

### 1.2 Verify the Data
Run this query to verify:
```sql
SELECT COUNT(*) as total_items FROM public.archive_items;
```
You should see `total_items: 31`

---

## Step 2: Set Up Supabase Storage

### 2.1 Create Storage Bucket
1. In Supabase, go to **Storage** (left sidebar)
2. You should already see the `archives` bucket (for submissions)
3. Click **New bucket** to create a separate bucket for archive display images
4. Name: `archive-images` (note: different from `archives` bucket)
5. **Make it Public** (toggle "Public bucket" to ON)
6. Click **Create bucket**

### 2.2 Create Folders
1. Click on the `archive-images` bucket
2. Click **New folder**
3. Name: `originals`
4. Click **Create folder**
5. Repeat for `outlines` folder

### 2.3 Upload Images

#### Upload Original Images:
1. Click into the `originals` folder
2. Click **Upload file** or drag and drop
3. Upload all 31 files from `archive/images/originals/`:
   - `item001.png` through `item031.png`
4. Wait for all uploads to complete

#### Upload Outline Images:
1. Navigate back to `archive-images` bucket root
2. Click into the `outlines` folder
3. Upload all 31 files from `archive/images/outlines/`:
   - `item001.png` through `item031.png`
4. Wait for all uploads to complete

**Note:** You can upload multiple files at once by selecting them all.

### 2.4 Verify Image URLs
After uploading, click on any image to see its public URL. It should look like:
```
https://cphqjbvwmrzbrvjkyned.supabase.co/storage/v1/object/public/archive-images/originals/item001.png
```

---

## Step 3: Test Locally

### 3.1 Verify Supabase Connection
1. Make sure your local server is running: `python3 -m http.server 8000`
2. Open `http://localhost:8000/archive.html`
3. Open browser console (F12 or Cmd+Option+I)
4. You should see:
   - "Supabase client initialized"
   - "Loading archive items from Supabase..."
   - "Loaded 31 items from Supabase"

### 3.2 Test Image Loading
1. Hover over any item - the outline image should appear
2. Click any item - the original image should appear in the modal
3. Check the browser console for any image loading errors

---

## Step 4: Deploy to GitHub Pages

### 4.1 Commit Your Changes
```bash
# Add all files (except you can optionally remove archive/images/ and archive/data/ if you want)
git add .
git commit -m "Migrate to Supabase: store data in database and images in storage"
git push origin main
```

**Optional:** If you want to keep the repo smaller, you can remove the local images and JSON after confirming Supabase works:
```bash
# Only do this AFTER confirming Supabase works!
# git rm -r archive/images archive/data
# git commit -m "Remove local images and JSON (now in Supabase)"
# git push origin main
```

### 4.2 Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Scroll to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Your site will be live at: `https://[your-username].github.io/[repo-name]/archive.html`

**Note:** It may take a few minutes for GitHub Pages to build and deploy.

---

## Step 5: Verify Deployment

1. Visit your GitHub Pages URL
2. Check that all 31 items load
3. Test hover and click interactions
4. Verify images load from Supabase Storage

---

## Troubleshooting

### Images Not Loading
- **Check bucket is public:** Storage → archive-images → Settings → "Public bucket" should be ON
- **Check folder names:** Must be exactly `originals` and `outlines` (lowercase)
- **Check file names:** Must match item IDs exactly (e.g., `item001.png`)
- **Check browser console:** Look for 404 errors on image URLs

### Data Not Loading
- **Check Supabase connection:** Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `archive.html`
- **Check table exists:** SQL Editor → Run `SELECT * FROM archive_items LIMIT 1;`
- **Check RLS policy:** Table Editor → archive_items → Check "RLS enabled" and policies
- **Check browser console:** Look for Supabase error messages

### CORS Errors
- Supabase handles CORS automatically for public buckets
- If you see CORS errors, check that the bucket is public

---

## File Structure After Migration

```
your-repo/
├── archive.html          (main page)
├── archive-script.js     (updated to use Supabase)
├── style.css
├── supabase_setup.sql   (SQL for database setup)
├── images/              (logo and other assets)
└── fonts/               (custom fonts)
```

**Removed/No longer needed:**
- `archive/data/items.json` (data now in Supabase)
- `archive/images/` (images now in Supabase Storage)

---

## Benefits of This Setup

✅ **Smaller repo size** - Images stored in Supabase, not Git  
✅ **Easy updates** - Update data in Supabase without redeploying  
✅ **Scalable** - Can add more items easily  
✅ **Fast CDN** - Supabase Storage serves images via CDN  
✅ **Free hosting** - GitHub Pages is free for public repos  

---

## Next Steps

- [ ] Run SQL setup in Supabase
- [ ] Upload all images to Supabase Storage
- [ ] Test locally
- [ ] Commit and push to GitHub
- [ ] Enable GitHub Pages
- [ ] Verify live site works

---

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify Supabase bucket is public
3. Verify table has data (run `SELECT * FROM archive_items;`)
4. Check that image paths match exactly (case-sensitive)

