export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  const { action, user_id } = req.body || {};

  try {
    if (action === 'check_usage') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/usage_logs?user_id=eq.${user_id}&created_at=gte.${weekAgo.toISOString()}&select=id`,
        {
          headers: {
            'apikey': SUPABASE_SECRET_KEY,
            'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`
          }
        }
      );
      const data = await response.json();
      return res.status(200).json({ count: data.length, limited: data.length >= 1 });
    }

    if (action === 'log_usage') {
      await fetch(`${SUPABASE_URL}/rest/v1/usage_logs`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id })
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
