export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.MINAV_DB.prepare(
            "SELECT * FROM rss_feeds ORDER BY created_at DESC"
        ).all();
        return Response.json(results || []);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { name, url, icon } = body;

        if (!name || !url) {
            return Response.json({ error: "Name and URL are required" }, { status: 400 });
        }

        const info = await env.MINAV_DB.prepare(
            "INSERT INTO rss_feeds (name, url, icon, created_at) VALUES (?, ?, ?, ?)"
        ).bind(name, url, icon || null, Date.now()).run();

        return Response.json({ success: true, id: info.meta.last_row_id });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    // Handling delete via query param or parsing ID from url if mapped, 
    // but mostly DELETE usually goes to /api/admin/feeds/[id].
    // If we use this file for generic delete, we need params.
    // Let's create `feeds/[id].js` for DELETE/UPDATE.
    return Response.json({ error: "Method not allowed on collection" }, { status: 405 });
}
