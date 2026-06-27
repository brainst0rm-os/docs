// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLlmsTxt from "starlight-llms-txt";

// https://astro.build/config
export default defineConfig({
	site: "https://docs.getbrainstorm.online",
	integrations: [
		starlight({
			title: "Brainstorm Docs",
			description:
				"Documentation for Brainstorm — the local-first, AI-native operating system for knowledge work.",
			logo: {
				// Pink mark in the Rose (light) theme, blue mark in Midnight (dark).
				light: "./src/assets/brandmark.svg",
				dark: "./src/assets/brandmark-midnight.svg",
				alt: "Brainstorm",
			},
			favicon: "/favicon.svg",
			customCss: ["./src/styles/brand.css"],
			components: {
				// Wrap the default <Head> to add Amplitude (same as the marketing site).
				Head: "./src/components/Head.astro",
				// Logo/title link back to the main product site, not the docs root.
				SiteTitle: "./src/components/SiteTitle.astro",
				// Sun/moon toggle matching the marketing site (not Starlight's dropdown).
				ThemeSelect: "./src/components/ThemeSelect.astro",
				// Branded footer matching the marketing site (below Starlight's page nav).
				Footer: "./src/components/Footer.astro",
			},
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/brainst0rm-os/shell",
				},
			],
			// Source lives in a private repo — no public "edit this page" link.
			editLink: undefined,
			plugins: [
				// Emits /llms.txt, /llms-full.txt and a .md twin of every page so
				// agents can read the docs as plain Markdown.
				starlightLlmsTxt({
					projectName: "Brainstorm",
					description:
						"Brainstorm is a local-first, AI-native operating system for knowledge work. A desktop shell hosts sandboxed apps over your own data; every app and every agent only touches what you allow.",
					details:
						"These docs cover using Brainstorm (vaults, apps, objects, local-first sync, the permission model) and building on it (the app model, manifest, capabilities, SDK, and data layer).",
				}),
			],
			sidebar: [
				{
					label: "Start here",
					items: [
						{ label: "What is Brainstorm?", slug: "start-here/what-is-brainstorm" },
						{ label: "Install", slug: "start-here/install" },
						{ label: "Quickstart", slug: "start-here/quickstart" },
					],
				},
				{
					label: "Concepts",
					items: [
						{ label: "Vaults", slug: "concepts/vaults" },
						{ label: "Apps & permissions", slug: "concepts/apps-and-permissions" },
						{ label: "Objects", slug: "concepts/objects" },
						{ label: "Local-first & sync", slug: "concepts/local-first-and-sync" },
						{ label: "Your data & security", slug: "concepts/your-data-and-security" },
					],
				},
				{
					label: "Apps",
					items: [{ autogenerate: { directory: "apps" } }],
				},
				{
					label: "Build",
					items: [
						{ label: "Overview", slug: "build/overview" },
						{ label: "Your first app", slug: "build/your-first-app" },
						{ label: "The manifest", slug: "build/the-manifest" },
						{ label: "Capabilities", slug: "build/capabilities" },
						{ label: "SDK & runtime", slug: "build/the-sdk" },
						{ label: "Working with data", slug: "build/working-with-data" },
						{ label: "Recipes & anti-patterns", slug: "build/recipes" },
					],
				},
			],
		}),
	],
});
