
export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    try {
        const settings = await context.request.json();

        // Use a transaction or batch if possible, but basic loop for now is fine for a few settings
        const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');

        const batch = [];
        for (const [key, value] of Object.entries(settings)) {
            batch.push(stmt.bind(key, value));
        }

        await db.batch(batch);

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
