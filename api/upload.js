const { put } = require('@vercel/blob');

function slugify(s) {
  return (
    (s || 'untitled')
      .toString()
      .trim()
      .replace(/[^a-zA-Z0-9ก-๙\-_.]+/g, '-')
      .slice(0, 60) || 'untitled'
  );
}

function encodeMeta(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
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
    const rand = Math.random().toString(36).slice(2, 8);
    const metaToken = encodeMeta({
      weekLabel: weekLabel || weekStart,
      department: department || '',
      fileName: fileName || 'plan.jpg',
      uploadedBy: uploadedBy || '',
    });
    const ext = mimeType && mimeType.includes('png') ? 'png' : 'jpg';
    // metaToken lives in its own path segment so parsing it back never
    // has to guess where a delimiter is — no shared manifest to go stale.
    const pathname = `images/${weekStart}/${deptSlug}/${ts}-${rand}/${metaToken}.${ext}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: mimeType || 'image/jpeg',
      addRandomSuffix: false,
    });

    return res.status(200).json({ success: true, id: blob.pathname, url: blob.url });
  } catch (err) {
    return res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};
