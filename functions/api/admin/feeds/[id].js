export async function onRequestPut(context) {
    const { request, params, env } = context;
    const id = params.id;
    const db = env.MINAV_DB;

    try {
        const body = await request.json();
        const { name, url } = body;

        if (!name || !url) {
            return Response.json({ error: "Name and URL are required" }, { status: 400 });
        }

        const { success } = await db.prepare(
            "UPDATE rss_feeds SET name = ?, url = ? WHERE id = ?"
        ).bind(name, url, id).run();

        if (!success) {
            return Response.json({ error: "Failed to update feed" }, { status: 500 });
        }

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { params, env } = context;
    const id = params.id; // Correct way to get [id] param in Pages Functions

    try {
        await env.MINAV_DB.prepare(
            "DELETE FROM rss_feeds WHERE id = ?"
        ).bind(id).run();

        // Optionally delete associated articles?
        // await env.MINAV_DB.prepare("DELETE FROM articles WHERE feed_id = ?").bind(id).run();
        // User might want to keep articles even if feed is deleted? 
        // Usually syncing removes them or we assume soft delete. 
        // Let's iterate on this: for now just delete feed, keep articles or clean them up.
        // Clean cleanup is better.
        await env.MINAV_DB.prepare("DELETE FROM articles WHERE feed_id = ?").bind(id).run();

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
