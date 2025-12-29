export async function onRequestGet(context) {
    const db = context.env.DB;

    try {
        // Fetch categories
        const { results: categories } = await db.prepare(
            'SELECT * FROM categories ORDER BY sort_order ASC'
        ).all();

        // Fetch items
        const { results: items } = await db.prepare(
            'SELECT * FROM items WHERE status = "active" ORDER BY sort_order ASC'
        ).all();

        return new Response(JSON.stringify({ categories, items }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60' // Cache for 1 minute
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
