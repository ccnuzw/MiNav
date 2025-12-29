export async function onRequestPut(context) {
    const db = context.env.DB;
    const id = context.params.id;
    const { category_id, name, description, url, icon, status, sort_order } = await context.request.json();

    const { success } = await db.prepare(
        `UPDATE items SET category_id = ?, name = ?, description = ?, url = ?, icon = ?, status = ?, sort_order = ? WHERE id = ?`
    ).bind(category_id, name, description, url, icon, status, sort_order, id).run();

    return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestDelete(context) {
    const db = context.env.DB;
    const id = context.params.id;

    const { success } = await db.prepare('DELETE FROM items WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
}
