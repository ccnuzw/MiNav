export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const categoryId = url.searchParams.get('category_id');
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM items';
    let countQuery = 'SELECT COUNT(*) as total FROM items';
    const params = [];

    if (categoryId && categoryId !== 'all') {
        query += ' WHERE category_id = ?';
        countQuery += ' WHERE category_id = ?';
        params.push(categoryId);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // D1 bind doesn't support array spread directly in all versions/contexts safely for mixed query building without care.
    // Creating statements separately.

    // 1. Get Total Count
    let total = 0;
    if (categoryId && categoryId !== 'all') {
        const countResult = await db.prepare(countQuery).bind(categoryId).first();
        total = countResult.total;
    } else {
        const countResult = await db.prepare(countQuery).first();
        total = countResult.total;
    }

    // 2. Get Items
    let results;
    if (categoryId && categoryId !== 'all') {
        // params has [categoryId, limit, offset]
        const stmt = db.prepare(query).bind(categoryId, limit, offset);
        const res = await stmt.all();
        results = res.results;
    } else {
        // params has [limit, offset] - need to be careful with push order above. 
        // Logic fix: 
        // If categoryId: params was [categoryId, limit, offset] -> Correct
        // If no categoryId: params was [limit, offset] -> Correct
        const stmt = db.prepare(query).bind(limit, offset);
        const res = await stmt.all();
        results = res.results;
    }

    return new Response(JSON.stringify({ results, total, page, limit }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    try {
        const { category_id, name, description, url, icon, status, sort_order } = await context.request.json();

        const { success, meta } = await db.prepare(
            `INSERT INTO items (category_id, name, description, url, icon, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(category_id, name, description, url, icon, status || 'active', sort_order || 0).run();

        return new Response(JSON.stringify({ success, id: meta.last_row_id }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
