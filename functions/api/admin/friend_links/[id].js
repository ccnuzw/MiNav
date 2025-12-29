export async function onRequestPut(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;
    const { name, url, description, icon, sort_order } = await context.request.json();

    const { success } = await db.prepare(
        `UPDATE friend_links SET name = ?, url = ?, description = ?, icon = ?, sort_order = ? WHERE id = ?`
    ).bind(name, url, description, icon, sort_order, id).run();

    return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestDelete(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;

    const { success } = await db.prepare('DELETE FROM friend_links WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
}
