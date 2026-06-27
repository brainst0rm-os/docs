import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

// A single, flat sitemap.xml for the docs site. Starlight bundles
// @astrojs/sitemap, which emits a sitemap-index.xml plus chunked sitemap-N.xml
// files; that auto-integration is suppressed in astro.config.mjs so this one
// file is the whole sitemap. URLs are derived from the same `docs` content
// collection Starlight routes, so the sitemap never drifts from the pages.

const route = (id: string): string => {
	// Starlight serves the root index.md at "/" and "<dir>/index.md" at "/<dir>/".
	const slug = id.replace(/(^|\/)index$/, "").replace(/^\/+|\/+$/g, "");
	return slug === "" ? "/" : `/${slug}/`;
};

export const GET: APIRoute = async ({ site }) => {
	const base = (site ?? new URL("https://docs.getbrainstorm.online")).toString().replace(/\/$/, "");
	const docs = await getCollection("docs");
	const locs = [...new Set(docs.map((entry) => route(entry.id)))].sort();

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `\t<url>\n\t\t<loc>${base}${loc}</loc>\n\t</url>`).join("\n")}
</urlset>
`;

	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
