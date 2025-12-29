
export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    try {
        const { results } = await db.prepare('SELECT key, value FROM site_settings').all();
        const settings = {};
        if (results) {
            results.forEach(row => {
                settings[row.key] = row.value;
            });
        }
        return new Response(JSON.stringify(settings), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
