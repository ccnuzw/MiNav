// 公开的反馈提交API
export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;

    try {
        const body = await context.request.json();
        const { email, content } = body;

        // 验证必填字段
        if (!content || content.trim() === '') {
            return new Response(JSON.stringify({ error: '反馈内容不能为空' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查反馈功能是否开启
        const setting = await db.prepare(
            "SELECT value FROM site_settings WHERE key = 'feedback_enabled'"
        ).first();

        if (setting && setting.value === 'false') {
            return new Response(JSON.stringify({ error: '反馈功能已关闭' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 插入反馈数据
        await db.prepare(
            "INSERT INTO feedbacks (email, content, status) VALUES (?, ?, 'pending')"
        ).bind(email || '', content.trim()).run();

        return new Response(JSON.stringify({ success: true, message: '反馈提交成功，感谢您的建议！' }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
