export async function onRequestPut(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;
    const { category_id, name, description, url, icon, status, sort_order, tag_ids } = await context.request.json();

    try {
        // 更新项目基本信息
        await db.prepare(
            `UPDATE items SET category_id = ?, name = ?, description = ?, url = ?, icon = ?, status = ?, sort_order = ? WHERE id = ?`
        ).bind(category_id, name, description, url, icon, status, sort_order, id).run();

        // 更新标签关联：先删除旧的，再添加新的
        await db.prepare('DELETE FROM item_tags WHERE item_id = ?').bind(id).run();

        if (tag_ids && tag_ids.length > 0) {
            const insertStmt = db.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)');
            const batch = tag_ids.map(tagId => insertStmt.bind(id, tagId));
            await db.batch(batch);
        }

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;

    // item_tags 会通过 ON DELETE CASCADE 自动删除
    const { success } = await db.prepare('DELETE FROM items WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
}
