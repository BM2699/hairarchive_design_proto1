Supabase setup (quick start)

This README explains how to set up a Supabase backend for this static web project. It includes recommended table schema and example SQL, storage bucket setup, basic security notes, and example client code usage.

1) Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- Note the Project URL and the ANON public API key (Project Settings -> API -> Config).
- For production-like flows, create a server `service_role` key and keep it secret (for server-side operations only).

2) Create a Storage bucket
- Storage -> Buckets -> New bucket
- Suggested name: `archives`
- Choose Public (if you want uploaded images to be immediately accessible via public URL), or Private and use signed URLs if you need privacy.

3) Create a table for archives
- SQL Editor -> New query. Run the SQL below.

-- Table to store archive records (metadata)
CREATE TABLE public.archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('photo','drawing')),
  file_path text,                -- path in storage (e.g. "archives/2025-11-04/abc.png")
  file_url text,                 -- optional public URL (can be generated server-side)
  drawing_data text,             -- optional base64/dataURL fallback (not recommended long-term)
  origin text,
  emotion text,
  connections jsonb,             -- store multiple prompt answers as JSON
  created_at timestamptz DEFAULT now()
);

4) Row Level Security (RLS) and policies
- By default Supabase tables have no RLS. For a public website you have options:
  - Option A (simple, but less secure): Keep RLS off and use the anon key to INSERT rows from the client. This is quick but allows anyone with your site to write data.
  - Option B (recommended): Enable RLS and create a policy that allows INSERTs only for authenticated users or for specific conditions. You'd then require users to sign in (e.g., magic link or social) before submitting.

If you enable RLS and want to allow anonymous inserts, you can create a policy like:

-- Example (NOT recommended for public data):
ALTER TABLE public.archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts for anon" ON public.archives
  FOR INSERT
  USING (true) WITH CHECK (true);

Be careful: this effectively allows anyone to insert. Prefer authentication.

5) CORS and Storage
- Storage: if you use signed URLs, your frontend will request them and then upload directly to the returned signed URL.
- API CORS is configured automatically for typical usage; if you experience CORS issues, check your browser console and update allowed origins in Supabase settings.

6) Client usage (summary)
- For client-side usage we provide `supabase-client.js` (example file in this repo). You can include it and call:
  - `uploadImage(file)` — uploads to the `archives` bucket and returns `{ path, publicURL }`
  - `uploadDrawing(dataUrl)` — converts dataURL to Blob and uploads
  - `insertArchiveRecord(record)` — inserts metadata row into `archives` table

7) Security notes
- Never put your `service_role` key in frontend code.
- The ANON key is safe for public calls that are allowed by your policies (e.g., reading public data). Writes using ANON are allowed only if your policies permit.
- Consider adding a basic moderation/backfill pipeline if users can upload arbitrary images.

8) Example: Minimal flow
- User uploads photo/drawing in the browser
- The client calls `uploadImage(file)` or `uploadDrawing(dataUrl)`, obtains `file_path` and `file_url`
- The client calls `insertArchiveRecord({ type, file_path, file_url, origin, emotion, connections })`

9) Need help wiring into the UI?
- I can help integrate the client into `script.js` so that the project uploads and inserts automatically on the "Continue" or "Review" action. Ask and I will implement that wiring.

-- End
