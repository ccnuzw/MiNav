export async function onRequestGet(context) {
    const { env } = context;
    const db = env.MINAV_DB;

    try {
        const { results } = await db.prepare(
            "SELECT id, title, summary, cover_image, published_at, views, original_url, source FROM articles WHERE status = 'published' ORDER BY published_at DESC"
        ).all();

        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
