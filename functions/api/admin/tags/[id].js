// 单个标签操作 API - PUT 更新 / DELETE 删除
export async function onRequestPut(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;

    try {
        const { name, color, sort_order } = await context.request.json();

        if (!name || !name.trim()) {
            return new Response(JSON.stringify({ error: '标签名称不能为空' }), { status: 400 });
        }

        const { success } = await db.prepare(
            'UPDATE tags SET name = ?, color = ?, sort_order = ? WHERE id = ?'
        ).bind(name.trim(), color || '#3B82F6', sort_order || 0, id).run();

        return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return new Response(JSON.stringify({ error: '标签名称已存在' }), { status: 400 });
        }
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;

    try {
        // 删除标签会自动删除关联（ON DELETE CASCADE）
        const { success } = await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
