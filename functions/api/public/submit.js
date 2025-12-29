export async function onRequestPost({ request, env }) {
    try {
        const { name, url, description, category_id, icon } = await request.json();

        if (!name || !url || !category_id) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Rate limiting could go here

        const { success } = await env.MINAV_DB.prepare(
            "INSERT INTO items (name, url, description, category_id, icon, status) VALUES (?, ?, ?, ?, ?, 'pending')"
        ).bind(name, url, description, category_id, icon || null).run();

        if (!success) {
            throw new Error("Database insertion failed");
        }

        return new Response(JSON.stringify({ success: true, message: "Submission received. Waiting for approval." }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
