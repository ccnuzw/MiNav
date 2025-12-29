// 标签管理 API - GET 列表 / POST 创建
export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    try {
        const { results } = await db.prepare('SELECT * FROM tags ORDER BY sort_order ASC, created_at DESC').all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    try {
        const { name, color, sort_order } = await context.request.json();

        if (!name || !name.trim()) {
            return new Response(JSON.stringify({ error: '标签名称不能为空' }), { status: 400 });
        }

        const { success, meta } = await db.prepare(
            'INSERT INTO tags (name, color, sort_order) VALUES (?, ?, ?)'
        ).bind(name.trim(), color || '#3B82F6', sort_order || 0).run();

        return new Response(JSON.stringify({ success, id: meta.last_row_id }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return new Response(JSON.stringify({ error: '标签名称已存在' }), { status: 400 });
        }
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
