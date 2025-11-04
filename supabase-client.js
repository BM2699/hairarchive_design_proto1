/*
  Example Supabase client helper for the static site.
  - Uses the official supabase-js client if available (npm or CDN)
  - Exposes window.supabaseClient helpers if imported as a regular script tag.

  Usage (browser):
  1) Add the CDN for supabase-js in index.html (before this script):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
     <script src="/supabase-client.js"></script>
  2) Set your keys in a small config block in your page (or use a build-time env):
     <script>
       window.SUPABASE_URL = 'https://xyzcompany.supabase.co';
       window.SUPABASE_ANON_KEY = 'public-anon-key';
     </script>
  3) Call window.supabaseClient.uploadImage(file) or uploadDrawing(dataUrl)

  Note: the anon key is public by design. Never put a service_role key in client code.
*/

(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase: SUPABASE_URL or SUPABASE_ANON_KEY not found on window. Please set them before loading this script.');
  }

  // Initialize client (works with CDN version exposing supabase)
  const createClient = () => {
    if (window.supabase) return window.supabase; // already created by CDN global
    if (typeof supabase !== 'undefined' && supabase.createClient) return supabase;
    if (window.Supabase) return window.Supabase; // fallback
    console.error('Supabase client not found. Include @supabase/supabase-js or use a bundler.');
    return null;
  };

  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
  const _client = (typeof window.createSupabaseClient === 'function') ? window.createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  // If @supabase/supabase-js is loaded via CDN it exposes `supabase` global factory
  let sb = null;
  try {
    if (window.supabase && window.supabase.createClient) sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {}
  if (!sb && typeof supabase !== 'undefined' && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // If we still don't have a client but user provided a create function earlier, use it
  if (!sb && _client) sb = _client;

  // Helper: convert dataURL to Blob
  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const matches = parts[0].match(/:(.*?);/);
    const mime = matches ? matches[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  // Upload a File object to storage bucket 'archives' under a dated folder
  async function uploadImage(file, opts = {}) {
    if (!sb) throw new Error('Supabase client not initialized');
    const bucket = opts.bucket || 'archives';
    const folder = opts.folder || (new Date()).toISOString().slice(0,10);
    const filename = (opts.filename || file.name || `upload-${Date.now()}.png`).replace(/[^a-z0-9_\-\.]/gi,'_');
    const path = `${folder}/${filename}`;

    const { data, error } = await sb.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;

    // Get public URL (if bucket is public) or signed URL logic
    const { publicURL } = sb.storage.from(bucket).getPublicUrl(path);
    return { path, publicURL };
  }

  // Upload a dataURL drawing (convert to blob)
  async function uploadDrawing(dataUrl, opts = {}) {
    const blob = dataURLToBlob(dataUrl);
    // Create a filename
    const filename = opts.filename || `drawing-${Date.now()}.png`;
    // Need to set a name on the blob for some libs; use File
    const file = new File([blob], filename, { type: blob.type });
    return uploadImage(file, opts);
  }

  // Insert metadata into 'archives' table
  async function insertArchiveRecord(record) {
    if (!sb) throw new Error('Supabase client not initialized');
    // Expect record = { type, file_path, file_url, drawing_data, origin, emotion, connections }
    const { data, error } = await sb.from('archives').insert([record]);
    if (error) throw error;
    return data?.[0] || null;
  }

  // Convenience combined flow: upload + insert
  async function submitArchive({ type, file, dataUrl, origin, emotion, connections = {} }, opts = {}) {
    // type: 'photo' or 'drawing'
    let uploadResult = null;
    if (file) uploadResult = await uploadImage(file, opts);
    else if (dataUrl) uploadResult = await uploadDrawing(dataUrl, opts);

    const record = {
      type,
      file_path: uploadResult ? uploadResult.path : null,
      file_url: uploadResult ? uploadResult.publicURL : null,
      drawing_data: dataUrl && !uploadResult ? dataUrl : null,
      origin: origin || null,
      emotion: emotion || null,
      connections: connections || null
    };
    const inserted = await insertArchiveRecord(record);
    return { uploaded: uploadResult, record: inserted };
  }

  // Expose to window
  window.supabaseClient = {
    init: (url, key) => {
      if (!url || !key) throw new Error('url and key required');
      try {
        window.SUPABASE_URL = url;
        window.SUPABASE_ANON_KEY = key;
        if (window.supabase && window.supabase.createClient) {
          sb = window.supabase.createClient(url, key);
        }
      } catch (e) {
        console.error(e);
      }
    },
    uploadImage,
    uploadDrawing,
    insertArchiveRecord,
    submitArchive
  };

})();
