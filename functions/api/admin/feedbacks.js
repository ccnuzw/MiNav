// 管理端反馈列表API
export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    const { request } = context;

    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status'); // pending, read, all
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let feedbacks, countResult;

        if (status && status !== 'all') {
            feedbacks = await db.prepare(
                "SELECT * FROM feedbacks WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
            ).bind(status, limit, offset).all();

            countResult = await db.prepare(
                "SELECT COUNT(*) as total FROM feedbacks WHERE status = ?"
            ).bind(status).first();
        } else {
            feedbacks = await db.prepare(
                "SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT ? OFFSET ?"
            ).bind(limit, offset).all();

            countResult = await db.prepare(
                "SELECT COUNT(*) as total FROM feedbacks"
            ).first();
        }

        // 获取未读数量
        const unreadCount = await db.prepare(
            "SELECT COUNT(*) as count FROM feedbacks WHERE status = 'pending'"
        ).first();

        return new Response(JSON.stringify({
            feedbacks: feedbacks.results || [],
            total: countResult?.total || 0,
            unread: unreadCount?.count || 0,
            page,
            limit
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error('Feedbacks API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
