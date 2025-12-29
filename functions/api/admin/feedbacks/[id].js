// 单条反馈操作API（更新状态、删除）
export async function onRequestPut(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;

    try {
        const body = await context.request.json();
        const { status } = body;

        if (!status || !['pending', 'read'].includes(status)) {
            return new Response(JSON.stringify({ error: '无效的状态值' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await db.prepare(
            "UPDATE feedbacks SET status = ? WHERE id = ?"
        ).bind(status, id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const db = context.env.MINAV_DB;
    const id = context.params.id;

    try {
        await db.prepare("DELETE FROM feedbacks WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
