export async function onRequestPut(context) {
    const { request, env, params } = context;
    const db = env.MINAV_DB;
    const id = params.id;

    try {
        const body = await request.json();
        const { title, content, summary, cover_image, original_url, source, status } = body;

        const { success } = await db.prepare(
            `UPDATE articles SET 
        title = ?, 
        content = ?, 
        summary = ?, 
        cover_image = ?, 
        original_url = ?, 
        source = ?, 
        status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
        ).bind(
            title,
            content,
            summary,
            cover_image,
            original_url,
            source,
            status,
            id
        ).run();

        if (!success) {
            return Response.json({ error: "Failed to update article" }, { status: 500 });
        }

        return Response.json({ message: "Article updated successfully" });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { env, params } = context;
    const db = env.MINAV_DB;
    const id = params.id;

    try {
        const { success } = await db.prepare(
            "DELETE FROM articles WHERE id = ?"
        ).bind(id).run();

        if (!success) {
            return Response.json({ error: "Failed to delete article" }, { status: 500 });
        }

        return Response.json({ message: "Article deleted successfully" });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestGet(context) {
    // Optional: Get single article for admin editing
    const { env, params } = context;
    const db = env.DB;
    const id = params.id;

    try {
        const article = await db.prepare(
            "SELECT * FROM articles WHERE id = ?"
        ).bind(id).first();

        if (!article) {
            return Response.json({ error: "Article not found" }, { status: 404 });
        }

        return Response.json(article);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
