import type { Handle } from '@sveltejs/kit';
import { supportedLangs, defaultLang } from '$lib/i18n';

export const handle: Handle = async ({ event, resolve }) => {
	// Extract lang from URL path
	const pathLang = event.url.pathname.split('/')[1];
	const lang = supportedLangs.includes(pathLang) ? pathLang : defaultLang;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
