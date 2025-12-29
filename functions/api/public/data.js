export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;

    try {
        // Fetch categories
        const { results: categories } = await db.prepare(
            'SELECT * FROM categories ORDER BY sort_order ASC'
        ).all();

        // Fetch items
        const { results: items } = await db.prepare(
            'SELECT * FROM items WHERE status = "active" ORDER BY sort_order ASC'
        ).all();

        // Fetch all item tags with tag info
        let itemsWithTags = items;
        if (items.length > 0) {
            const itemIds = items.map(item => item.id);
            const placeholders = itemIds.map(() => '?').join(',');

            const { results: tagResults } = await db.prepare(`
                SELECT it.item_id, t.id, t.name, t.color 
                FROM item_tags it 
                JOIN tags t ON it.tag_id = t.id 
                WHERE it.item_id IN (${placeholders})
            `).bind(...itemIds).all();

            // Group tags by item_id
            const tagsByItem = {};
            for (const row of tagResults) {
                if (!tagsByItem[row.item_id]) {
                    tagsByItem[row.item_id] = [];
                }
                tagsByItem[row.item_id].push({ id: row.id, name: row.name, color: row.color });
            }

            // Attach tags to items
            itemsWithTags = items.map(item => ({
                ...item,
                tags: tagsByItem[item.id] || []
            }));
        }

        return new Response(JSON.stringify({ categories, items: itemsWithTags }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60' // Cache for 1 minute
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
