export async function onRequestPost(context) {
    try {
        const { username, password } = await context.request.json();

        // In a real production app, use proper password hashing (Argon2, bcrypt).
        // For this demo, we'll assume the db stores a hash (or we compare simplisticly).
        // We'll use Web Crypto API for SHA-256 for a basic level of security.

        const db = context.env.MINAV_DB;
        const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // Verify password (assuming simple SHA-256 hash storage for this example)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashHex !== user.password_hash) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // Create Session
        const token = crypto.randomUUID();
        // Store in KV: 24 hours expiration
        await context.env.MINAV_KV.put(`session:${token}`, user.id, { expirationTtl: 86400 });

        return new Response(JSON.stringify({ token, user: { username: user.username } }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
