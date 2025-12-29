export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    const { results } = await db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    try {
        const { category_id, name, description, url, icon, status, sort_order } = await context.request.json();

        const { success, meta } = await db.prepare(
            `INSERT INTO items (category_id, name, description, url, icon, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(category_id, name, description, url, icon, status || 'active', sort_order || 0).run();

        return new Response(JSON.stringify({ success, id: meta.last_row_id }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
