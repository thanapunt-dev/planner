const { del } = require('@vercel/blob');
const requireKey = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireKey(req, res)) return;
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'ไม่มี url ของรูปที่จะลบ' });
    // only plan photos stored by this app (…blob.vercel-storage.com/images/…)
    let u;
    try { u = new URL(url); } catch (e) { u = null; }
    if (!u || u.protocol !== 'https:' || !u.hostname.endsWith('.blob.vercel-storage.com') || !u.pathname.startsWith('/images/')) {
      return res.status(400).json({ success: false, error: 'ลบได้เฉพาะรูปแผนผลิตเท่านั้น' });
    }
    await del(url);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};
