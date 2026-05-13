// ── REPLACE the uploadInput 'change' event listener in auth.js ──────────────
// Find this block and replace it entirely:
//
//   uploadInput.addEventListener('change', async () => { ... });
//
// With the version below:

uploadInput.addEventListener('change', async () => {
  const file = uploadInput.files?.[0];
  if (!file) return;

  // Validate file type and size (max 2MB)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a JPEG, PNG, WEBP, or GIF image.');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be smaller than 2MB.');
    return;
  }

  const session = SQ.getSession();
  const userId  = session?.user?.id;
  const token   = SQ.getAccessToken();

  if (!userId || !token) {
    alert('You must be logged in to upload a photo.');
    return;
  }

  // Show uploading state
  const uploadBtn = document.getElementById('sq-upload-avatar-btn');
  if (uploadBtn) uploadBtn.textContent = '⏳ Uploading...';

  try {
    // ── 1. Upload file to Supabase Storage ──────────────────────────────
    // Path: avatars/{userId}/{timestamp}.{ext}
    const ext      = file.name.split('.').pop().toLowerCase() || 'jpg';
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/avatars/${filePath}`,
      {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  file.type,
          'x-upsert':      'true',   // overwrite if exists
        },
        body: file,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed (${uploadRes.status})`);
    }

    // ── 2. Build the public URL ──────────────────────────────────────────
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;

    // ── 3. Save public URL to profiles table ────────────────────────────
    await SQ.upsertProfile({
      id:         userId,
      email:      session.user.email || '',
      full_name:  session.user.user_metadata?.full_name || displayName,
      avatar_url: publicUrl,
    }, token);

    // ── 4. Update local session so avatar shows immediately ──────────────
    if (session?.user) {
      session.user.user_metadata        = session.user.user_metadata || {};
      session.user.user_metadata.avatar_url = publicUrl;
      SQ.saveSession(session);
    }

    // Also keep AvatarStore in sync as a fast local cache
    AvatarStore.set(session.user.email, publicUrl);

    // ── 5. Re-render the nav with the new avatar ─────────────────────────
    updateNavForUser(session.user);

    if (uploadBtn) uploadBtn.textContent = '📷 Upload Photo';

  } catch (err) {
    console.error('Avatar upload failed:', err);
    alert('Upload failed: ' + err.message);
    if (uploadBtn) uploadBtn.textContent = '📷 Upload Photo';
  }
});
