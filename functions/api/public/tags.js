// 公开获取标签列表 API
export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    try {
        const { results } = await db.prepare('SELECT id, name, color FROM tags ORDER BY sort_order ASC, created_at DESC').all();
        return new Response(JSON.stringify(results), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
