const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
  try {
    const found = await list({ prefix: 'manifest.json', limit: 1 });
    if (!found.blobs.length) {
      return res.status(200).json({ success: true, items: [] });
    }
    const resp = await fetch(found.blobs[0].url, { cache: 'no-store' });
    if (!resp.ok) {
      return res.status(200).json({ success: true, items: [] });
    }
    const items = await resp.json();
    return res.status(200).json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err && err.message || err) });
  }
};
