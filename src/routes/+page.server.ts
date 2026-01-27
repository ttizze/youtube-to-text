import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supportedLangs, defaultLang } from '$lib/i18n';

export const load: PageServerLoad = ({ request }) => {
	const acceptLanguage = request.headers.get('accept-language') || '';

	// Parse Accept-Language header to find best match
	const preferredLangs = acceptLanguage
		.split(',')
		.map((lang) => {
			const [code, q = 'q=1'] = lang.trim().split(';');
			return {
				code: code.split('-')[0].toLowerCase(),
				quality: parseFloat(q.split('=')[1]) || 1
			};
		})
		.sort((a, b) => b.quality - a.quality);

	// Find first supported language
	const matchedLang = preferredLangs.find((pref) => supportedLangs.includes(pref.code));

	const targetLang = matchedLang?.code || defaultLang;

	throw redirect(302, `/${targetLang}`);
};
