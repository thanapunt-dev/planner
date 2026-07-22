// api/upload.js
const { put, list } = require('@vercel/blob');

function slugify(s) {
  return (s || 'untitled')
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9ก-๙\-_.]+/g, '-')
    .slice(0, 80) || 'untitled';
}

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
    const { weekStart, weekLabel, department, fileName, mimeType, base64Data, uploadedBy } = req.body || {};
    if (!weekStart || !base64Data) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบ (สัปดาห์ หรือรูปภาพ)' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const deptSlug = slugify(department);
    const ts = Date.now();
    const safeFileName = slugify(fileName || 'plan.jpg');
    const pathname = `images/${weekStart}/${deptSlug}/${ts}-${safeFileName}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: mimeType || 'image/jpeg',
      addRandomSuffix: true,
    });

    const items = await readManifest();
    const id = ts + '-' + Math.random().toString(36).slice(2, 8);
    items.push({
      id,
      weekStart,
      weekLabel: weekLabel || weekStart,
      department: department || '',
      fileName: fileName || '',
      url: blob.url,
      pathname: blob.pathname,
      uploadedBy: uploadedBy || '',
      uploadedAt: new Date().toISOString(),
    });
    await writeManifest(items);

    return res.status(200).json({ success: true, id, url: blob.url });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err && err.message || err) });
  }
};
