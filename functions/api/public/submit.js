export async function onRequestPost({ request, env }) {
    const kv = env.MINAV_KV;

    try {
        // 获取客户端IP
        const clientIP = request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For')?.split(',')[0] ||
            'unknown';

        // 速率限制检查 - 1小时内最多允许5次提交
        const rateLimitKey = `submit_limit:${clientIP}`;
        const submissions = await kv.get(rateLimitKey);
        const submitCount = submissions ? parseInt(submissions) : 0;

        if (submitCount >= 5) {
            return new Response(JSON.stringify({
                error: '提交次数过多，请1小时后再试'
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查提交工具功能是否开启
        const setting = await env.MINAV_DB.prepare(
            "SELECT value FROM site_settings WHERE key = 'submit_enabled'"
        ).first();

        if (setting && setting.value === 'false') {
            return new Response(JSON.stringify({ error: '提交工具功能已关闭' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { name, url, description, category_id, icon } = await request.json();

        // 验证必填字段
        if (!name || name.trim() === '') {
            return new Response(JSON.stringify({ error: "请输入项目名称" }), { status: 400 });
        }
        if (!url || url.trim() === '') {
            return new Response(JSON.stringify({ error: "请输入项目链接" }), { status: 400 });
        }
        if (!category_id) {
            return new Response(JSON.stringify({ error: "请选择分类" }), { status: 400 });
        }

        // 验证URL格式
        try {
            new URL(url);
        } catch (e) {
            return new Response(JSON.stringify({ error: "无效的链接格式" }), { status: 400 });
        }

        // 验证长度
        if (name.length > 50) {
            return new Response(JSON.stringify({ error: "名称不能超过50个字符" }), { status: 400 });
        }
        if (description && description.length > 500) {
            return new Response(JSON.stringify({ error: "描述不能超过500个字符" }), { status: 400 });
        }

        // 检查URL是否已存在
        const existing = await env.MINAV_DB.prepare(
            "SELECT id FROM items WHERE url = ?"
        ).bind(url).first();

        if (existing) {
            return new Response(JSON.stringify({ error: "该链接已存在" }), { status: 400 });
        }

        const { success } = await env.MINAV_DB.prepare(
            "INSERT INTO items (name, url, description, category_id, icon, status) VALUES (?, ?, ?, ?, ?, 'pending')"
        ).bind(name.trim(), url.trim(), description ? description.trim() : null, category_id, icon || null).run();

        if (!success) {
            throw new Error("Database insertion failed");
        }

        // 增加提交计数
        await kv.put(rateLimitKey, String(submitCount + 1), { expirationTtl: 3600 });

        return new Response(JSON.stringify({ success: true, message: "提交成功，等待管理员审核。" }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
