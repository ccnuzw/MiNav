export async function onRequestPost(context) {
    try {
        const kv = context.env.MINAV_KV;

        // 获取客户端IP
        const clientIP = context.request.headers.get('CF-Connecting-IP') ||
            context.request.headers.get('X-Forwarded-For')?.split(',')[0] ||
            'unknown';

        // 速率限制检查 - 5分钟内最多允许5次失败尝试
        const rateLimitKey = `login_attempts:${clientIP}`;
        const attempts = await kv.get(rateLimitKey);
        const attemptCount = attempts ? parseInt(attempts) : 0;

        if (attemptCount >= 5) {
            return new Response(JSON.stringify({
                error: '登录尝试次数过多，请5分钟后再试'
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { username, password } = await context.request.json();

        // In a real production app, use proper password hashing (Argon2, bcrypt).
        // For this demo, we'll assume the db stores a hash (or we compare simplisticly).
        // We'll use Web Crypto API for SHA-256 for a basic level of security.

        const db = context.env.MINAV_DB;

        // Debug: check if db is available
        if (!db) {
            console.error('[Login] Database not available');
            return new Response(JSON.stringify({ error: '数据库未配置' }), { status: 500 });
        }

        const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

        if (!user) {
            // 登录失败，增加尝试次数
            await kv.put(rateLimitKey, String(attemptCount + 1), { expirationTtl: 300 });
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 });
        }

        // Verify password (assuming simple SHA-256 hash storage for this example)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashHex !== user.password_hash) {
            // 登录失败，增加尝试次数
            await kv.put(rateLimitKey, String(attemptCount + 1), { expirationTtl: 300 });
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 });
        }

        // 登录成功，清除尝试计数
        await kv.delete(rateLimitKey);

        // Create Session
        const token = crypto.randomUUID();
        // Store in KV: 24 hours expiration
        await kv.put(`session:${token}`, user.id, { expirationTtl: 86400 });

        // Check if user is using default password (SHA-256 hash of 'admin')
        const defaultPasswordHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
        const requirePasswordChange = user.password_hash === defaultPasswordHash;

        return new Response(JSON.stringify({
            token,
            user: { username: user.username },
            requirePasswordChange
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
