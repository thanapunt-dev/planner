const crypto = require('crypto');

// Upload/delete require the team code (env PLANNER_KEY), sent by the page in the
// x-planner-key header. Fails closed: if PLANNER_KEY is not set, nothing can be changed.
module.exports = function requireKey(req, res) {
  const expected = process.env.PLANNER_KEY || '';
  if (!expected) {
    res.status(500).json({ success: false, error: 'ยังไม่ได้ตั้งรหัสทีม (PLANNER_KEY) บน Vercel' });
    return false;
  }
  const given = String(req.headers['x-planner-key'] || '');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.status(401).json({ success: false, auth: false, error: 'รหัสทีมไม่ถูกต้อง' });
    return false;
  }
  return true;
};
