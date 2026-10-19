const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) {
      return new Response(JSON.stringify({ success: false, error: 'Origin is not allowed.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed.' }, 405, origin);
    }
    if (!env.PUSHPLUS_TOKEN) {
      return jsonResponse({ success: false, error: 'PushPlus is not configured.' }, 503, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON request.' }, 400, origin);
    }

    const message = payload && typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message || message.length > 1000) {
      return jsonResponse({ success: false, error: 'Message must contain 1 to 1000 characters.' }, 400, origin);
    }

    let pushResponse;
    try {
      pushResponse = await fetch('https://www.pushplus.plus/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: env.PUSHPLUS_TOKEN,
          title: '卿美静给你的留言',
          content: message,
          template: 'txt',
        }),
      });
    } catch (error) {
      console.error('PushPlus request failed.', error);
      return jsonResponse({ success: false, error: 'Could not reach the WeChat notification provider.' }, 502, origin);
    }

    let providerResult;
    try {
      providerResult = await pushResponse.json();
    } catch {
      return jsonResponse({ success: false, error: 'The notification provider returned an invalid response.' }, 502, origin);
    }

    if (!pushResponse.ok || String(providerResult.code) !== '200') {
      console.error('PushPlus rejected the notification.', providerResult.code, providerResult.msg);
      return jsonResponse({ success: false, error: 'The WeChat notification provider rejected the message.' }, 502, origin);
    }

    return jsonResponse({ success: true }, 200, origin);
  },
};
