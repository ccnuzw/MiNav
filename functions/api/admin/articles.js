export async function onRequestGet(context) {
    const { request, env } = context;
    const db = env.MINAV_DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    try {
        const { results } = await db.prepare(
            "SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?"
        ).bind(limit, offset).all();

        const totalResult = await db.prepare(
            "SELECT COUNT(*) as count FROM articles"
        ).first();

        return Response.json({
            items: results,
            total: totalResult.count,
            page,
            limit,
            totalPages: Math.ceil(totalResult.count / limit)
        });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.MINAV_DB;

    try {
        const body = await request.json();
        const { title, content, summary, cover_image, original_url, source, status } = body;

        // Validation
        if (!title) {
            return Response.json({ error: "Title is required" }, { status: 400 });
        }

        const { success } = await db.prepare(
            `INSERT INTO articles (title, content, summary, cover_image, original_url, source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            title,
            content || '',
            summary || '',
            cover_image || '',
            original_url || '',
            source || 'manual',
            status || 'published'
        ).run();

        if (!success) {
            throw new Error("D1 execution failed but no exception thrown");
        }

        return Response.json({ message: "Article created successfully" }, { status: 201 });
    } catch (e) {
        console.error("POST /api/admin/articles ERROR:", e);
        // Return detailed error in response for easier debugging on frontend too
        return Response.json({
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const db = env.MINAV_DB;

    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return Response.json({ error: "IDs array is required" }, { status: 400 });
        }

        // D1 doesn't support "WHERE id IN (?)" with array binding directly well in one go usually, 
        // but we can construct the query or loop. 
        // Constructing placeholders is better.
        const placeholders = ids.map(() => '?').join(',');
        const query = `DELETE FROM articles WHERE id IN (${placeholders})`;

        const { success } = await db.prepare(query).bind(...ids).run();

        if (!success) {
            throw new Error("Batch delete failed");
        }

        return Response.json({ success: true, deleted: ids.length });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
