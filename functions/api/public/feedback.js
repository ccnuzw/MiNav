// 公开的反馈提交API
export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    const kv = context.env.MINAV_KV;

    try {
        // 获取客户端IP
        const clientIP = context.request.headers.get('CF-Connecting-IP') ||
            context.request.headers.get('X-Forwarded-For')?.split(',')[0] ||
            'unknown';

        // 速率限制检查 - 1小时内最多允许3次反馈提交
        const rateLimitKey = `feedback_limit:${clientIP}`;
        const submissions = await kv.get(rateLimitKey);
        const submitCount = submissions ? parseInt(submissions) : 0;

        if (submitCount >= 3) {
            return new Response(JSON.stringify({
                error: '提交次数过多，请1小时后再试'
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await context.request.json();
        const { email, content } = body;

        // 验证必填字段
        if (!content || content.trim() === '') {
            return new Response(JSON.stringify({ error: '反馈内容不能为空' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 内容长度限制
        if (content.trim().length < 10) {
            return new Response(JSON.stringify({ error: '反馈内容至少需要10个字符' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (content.trim().length > 1000) {
            return new Response(JSON.stringify({ error: '反馈内容不能超过1000个字符' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 简单的邮箱格式验证（如果提供了邮箱）
        if (email && email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return new Response(JSON.stringify({ error: '邮箱格式不正确' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
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

        // 增加提交计数
        await kv.put(rateLimitKey, String(submitCount + 1), { expirationTtl: 3600 });

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
