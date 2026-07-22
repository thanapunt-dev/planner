const { list } = require('@vercel/blob');

function decodeMeta(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
  } catch (err) {
    return {};
  }
}

function parseItem(blob) {
  // pathname: images/<weekStart>/<deptSlug>/<ts>-<rand>/<metaToken>.<ext>
  const parts = blob.pathname.split('/');
  const weekStart = parts[1] || '';
  const lastSeg = parts[parts.length - 1] || '';
  const metaToken = lastSeg.replace(/\.[^.]+$/, '');
  const meta = decodeMeta(metaToken);
  return {
    id: blob.pathname,
    weekStart,
    weekLabel: meta.weekLabel || weekStart,
    department: meta.department || '',
    fileName: meta.fileName || '',
    uploadedBy: meta.uploadedBy || '',
    uploadedAt: blob.uploadedAt,
    url: blob.url,
    pathname: blob.pathname,
  };
}

module.exports = async (req, res) => {
  try {
    let items = [];
    let cursor;
    do {
      const result = await list({ prefix: 'images/', cursor, limit: 1000 });
      items = items.concat(result.blobs.map(parseItem));
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
    return res.status(200).json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};
