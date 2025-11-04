Supabase setup (quick start)

This README explains how to set up a Supabase backend for this static web project. It includes recommended table schema and example SQL, storage bucket setup, basic security notes, and example client code usage.

1) Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- Note the Project URL and the ANON public API key (Project Settings -> API -> Config).
https://cphqjbvwmrzbrvjkyned.supabase.co
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaHFqYnZ3bXJ6YnJ2amt5bmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjg3MTMsImV4cCI6MjA3Nzg0NDcxM30.C6bthui6fjKoDgQ9ZKaBLBLo0rDxgcffI7b4j40xVCU
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
  type text NOT NULL CHECK (type IN ('photo')),
  file_path text,                -- path in storage (e.g. "archives/2025-11-04/abc.png")
  file_url text,                 -- optional public URL (can be generated server-side)
  origin text,                   -- response to "Where do you think this strand came from?"
  emotion text,                  -- response to "What emotion does this strand carry?"
  connection text,               -- response to "Who or what might share this strand's lineage?"
  connection_1 text,             -- response to "If this strand encapsulates a trait passed down to me, what would it be?"
  connection_2 text,             -- response to "If this strand could speak, what would it say 100 years from today?"
  connection_3 text,             -- response to "If this strand was a timeline, what would it entail?"
  connection_4 text,             -- response to "How far am I able to trace back my roots?"
  connection_5 text,             -- response to "What kinds of thoughts or feelings are coming up for me as I look at my traces?"
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
  - `insertArchiveRecord(record)` — inserts metadata row into `archives` table
  - `submitArchive({ file, origin, emotion, connection, connection_1, connection_2, connection_3, connection_4, connection_5 })` — convenience function that uploads image and inserts record in one call

7) Security notes
- Never put your `service_role` key in frontend code.
- The ANON key is safe for public calls that are allowed by your policies (e.g., reading public data). Writes using ANON are allowed only if your policies permit.
- Consider adding a basic moderation/backfill pipeline if users can upload arbitrary images.

8) Example: Minimal flow
- User uploads photo in the browser
- User fills in prompt responses (all 8 prompts)
- When user clicks "Release to Archive", the client calls `submitArchive()` with all 8 prompt responses
- This function uploads the image to storage and inserts a record with all prompt responses

9) Data structure
- Each prompt response is stored as a separate column:
  - `origin`: "Where do you think this strand came from?"
  - `emotion`: "What emotion does this strand carry?"
  - `connection`: "Who or what might share this strand's lineage?"
  - `connection_1`: "If this strand encapsulates a trait passed down to me, what would it be?"
  - `connection_2`: "If this strand could speak, what would it say 100 years from today?"
  - `connection_3`: "If this strand was a timeline, what would it entail?"
  - `connection_4`: "How far am I able to trace back my roots?"
  - `connection_5`: "What kinds of thoughts or feelings are coming up for me as I look at my traces?"

-- End
