// api/delete.js
const { put, del, list } = require('@vercel/blob');

async function readManifest() {
  const found = await list({ prefix: 'manifest.json', limit: 1 });
  if (!found.blobs.length) return [];
  const resp = await fetch(found.blobs[0].url, { cache: 'no-store' });
  if (!resp.ok) return [];
  return resp.json();
}

async function writeManifest(items) {
  await put('manifest.json', JSON.stringify(items), {
    access: 'public',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ success: false, error: 'ไม่มี id' });

    const items = await readManifest();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'ไม่พบรายการนี้' });

    const [removed] = items.splice(idx, 1);
    try {
      await del(removed.url);
    } catch (e) {
      // blob may already be gone — still proceed to remove it from the manifest
    }

    await writeManifest(items);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err && err.message || err) });
  }
};
