export async function onRequestGet(context) {
    const { env, params } = context;
    const db = env.MINAV_DB;
    const id = params.id;

    try {
        const article = await db.prepare(
            "SELECT * FROM articles WHERE id = ? AND status = 'published'"
        ).bind(id).first();

        if (!article) {
            return Response.json({ error: "Article not found" }, { status: 404 });
        }

        // Increment view count asynchronously
        context.waitUntil(
            db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").bind(id).run()
        );

        return Response.json(article);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
