export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    const { results } = await db.prepare('SELECT * FROM friend_links ORDER BY sort_order ASC, created_at ASC').all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    try {
        const { name, url, description, icon, sort_order } = await context.request.json();

        const { success, meta } = await db.prepare(
            `INSERT INTO friend_links (name, url, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)`
        ).bind(name, url, description, icon, sort_order || 0).run();

        return new Response(JSON.stringify({ success, id: meta.last_row_id }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
