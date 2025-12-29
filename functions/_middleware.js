export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Skip auth for public routes and login
    if (!url.pathname.startsWith('/api/admin')) {
        return context.next();
    }

    // Check for Authorization header
    const authHeader = context.request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Verify token in KV
    // Key format: session:<token> -> user_id
    const userId = await context.env.KV.get(`session:${token}`);

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Attach user info to context for downstream functions
    context.data.user = { id: userId };
    return context.next();
}
