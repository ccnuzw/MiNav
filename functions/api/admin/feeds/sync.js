export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        let ids = [];
        try {
            const body = await request.json();
            if (body && body.ids) ids = body.ids;
        } catch (e) {
            // body might be empty if just POSTing to sync all
        }

        let query = "SELECT * FROM rss_feeds WHERE status = 'active'";
        let params = [];

        if (ids && Array.isArray(ids) && ids.length > 0) {
            query += ` AND id IN (${ids.map(() => '?').join(',')})`;
            params = ids;
        }

        const { results: feeds } = await env.MINAV_DB.prepare(query).bind(...params).all();

        if (!feeds || feeds.length === 0) {
            return Response.json({ message: "No active feeds to sync", count: 0 });
        }

        let totalNewItems = 0;
        const errors = [];

        // 2. Iterate and fetch
        // Note: In a production worker, we might want to use durability or queue, but for personal use, loop is fine.
        for (const feed of feeds) {
            try {
                const response = await fetch(feed.url);
                if (!response.ok) throw new Error(`Failed to fetch ${feed.url}: ${response.status}`);
                const text = await response.text();

                // Simple XML Parse
                const isAtom = text.includes('<entry>');
                const itemRegex = isAtom ? /<entry>([\s\S]*?)<\/entry>/g : /<item>([\s\S]*?)<\/item>/g;

                let match;
                while ((match = itemRegex.exec(text)) !== null) {
                    const entryBlock = match[1];

                    // Extract fields
                    const titleMatch = entryBlock.match(/<title[^>]*>([\s\S]*?)<\/title>/);
                    const linkMatch = isAtom ? entryBlock.match(/<link[^>]+href="([^"]+)"/) : entryBlock.match(/<link>([^<]+)<\/link>/);
                    const guidMatch = entryBlock.match(/<guid[^>]*>([^<]+)<\/guid>/) || entryBlock.match(/<id>([^<]+)<\/id>/);
                    const pubDateMatch = entryBlock.match(/<published>([^<]+)<\/published>/) || entryBlock.match(/<pubDate>([^<]+)<\/pubDate>/) || entryBlock.match(/<updated>([^<]+)<\/updated>/);
                    const contentMatch = entryBlock.match(/<content[^>]*>([\s\S]*?)<\/content>/) || entryBlock.match(/<description>([\s\S]*?)<\/description>/);

                    const clean = (s) => s ? s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
                    const stripHtml = (s) => s ? s.replace(/<[^>]+>/g, '').trim() : '';

                    let link = linkMatch ? (isAtom ? linkMatch[1] : linkMatch[1]) : null;
                    const title = clean(titleMatch ? titleMatch[1] : 'Untitled');
                    const guid = clean(guidMatch ? guidMatch[1] : link); // Fallback to link if no guid
                    const content = clean(contentMatch ? contentMatch[1] : '');
                    const pubDateStr = clean(pubDateMatch ? pubDateMatch[1] : '');
                    const pubDate = pubDateStr ? new Date(pubDateStr).getTime() : Date.now();

                    // Fallback: If link is missing but guid is a URL, use guid as link
                    if (!link && guid && guid.startsWith('http')) {
                        link = guid;
                    }

                    // Cover image extraction
                    let cover_image = '';
                    const mediaMatch = entryBlock.match(/<media:content[^>]+url="([^"]+)"/) || entryBlock.match(/<media:thumbnail[^>]+url="([^"]+)"/);
                    if (mediaMatch) cover_image = mediaMatch[1];
                    else if (content) {
                        const img = content.match(/<img[^>]+src="([^"]+)"/);
                        if (img) cover_image = img[1];
                    }

                    if (link && title) {
                        // Check existence
                        const existing = await env.MINAV_DB.prepare(
                            "SELECT id FROM articles WHERE guid = ? OR original_url = ?"
                        ).bind(guid, link).first();

                        const summaryText = stripHtml(content).substring(0, 200).replace(/\s+/g, ' ') + '...';

                        if (!existing) {
                            await env.MINAV_DB.prepare(
                                `INSERT INTO articles 
                                (feed_id, title, summary, content, cover_image, original_url, guid, source, status, published_at, created_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`
                            ).bind(
                                feed.id,
                                title,
                                summaryText,
                                content,
                                cover_image,
                                link,
                                guid,
                                feed.name,
                                pubDate,
                                Date.now()
                            ).run();
                            totalNewItems++;
                        } else {
                            // Optional: Update existing to fix summary if needed (since user just had this issue)
                            await env.MINAV_DB.prepare(
                                `UPDATE articles SET summary = ?, content = ?, cover_image = ?, title = ? WHERE id = ?`
                            ).bind(summaryText, content, cover_image, title, existing.id).run();
                        }
                    }
                }

                // Update Feed Sync Status
                await env.MINAV_DB.prepare(
                    "UPDATE rss_feeds SET last_sync = ? WHERE id = ?"
                ).bind(Date.now(), feed.id).run();

            } catch (e) {
                console.error(`Error syncing feed ${feed.name}:`, e);
                errors.push({ feed: feed.name, error: e.message });
            }
        }

        return Response.json({ success: true, new_items: totalNewItems, errors });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
