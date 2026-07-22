const { del } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'ไม่มี url ของรูปที่จะลบ' });
    await del(url);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};
