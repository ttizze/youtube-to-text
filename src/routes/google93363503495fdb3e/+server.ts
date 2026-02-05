import type { RequestHandler } from '@sveltejs/kit';

const body = 'google-site-verification: google93363503495fdb3e.html';

export const GET: RequestHandler = async () => {
	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8'
		}
	});
};
