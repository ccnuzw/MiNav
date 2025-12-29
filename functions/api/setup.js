export async function onRequestGet(context) {
    const db = context.env.DB;

    // Check if any user exists
    const { count } = await db.prepare('SELECT COUNT(*) as count FROM users').first();

    if (count > 0) {
        return new Response('Setup already completed', { status: 400 });
    }

    // Create default admin
    // Password: admin (SHA-256 for 'admin')
    // 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
    const defaultHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

    const { success } = await db.prepare(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    ).bind('admin', defaultHash).run();

    return new Response('Admin user created. Username: admin, Password: admin', { status: 200 });
}
