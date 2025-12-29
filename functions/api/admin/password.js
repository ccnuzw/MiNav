export async function onRequestPost(context) {
    const { oldPassword, newPassword } = await context.request.json();
    const userId = context.data.user.id; // From middleware
    const db = context.env.MINAV_DB;

    try {
        // 1. Get current user
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // 2. Verify old password
        const encoder = new TextEncoder();
        const oldData = encoder.encode(oldPassword);
        const oldHashBuffer = await crypto.subtle.digest('SHA-256', oldData);
        const oldHashArray = Array.from(new Uint8Array(oldHashBuffer));
        const oldHashHex = oldHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (oldHashHex !== user.password_hash) {
            return new Response(JSON.stringify({ error: 'Initial password incorrect' }), { status: 401 });
        }

        // 3. Hash new password
        const newData = encoder.encode(newPassword);
        const newHashBuffer = await crypto.subtle.digest('SHA-256', newData);
        const newHashArray = Array.from(new Uint8Array(newHashBuffer));
        const newHashHex = newHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 4. Update password
        await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHashHex, userId).run();

        // Optional: Invalidate all other sessions? For simplicity, we just keep current session valid.

        return new Response(JSON.stringify({ success: true, message: 'Password updated successfully' }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
