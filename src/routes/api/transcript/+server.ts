import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getTranslation, supportedLangs } from "$lib/i18n";
import {
	extractVideoId,
	fetchTranscriptWithFallback,
	transcriptToSrt,
	transcriptToText,
} from "$lib/transcript/service";

const TRANSCRIPT_CACHE_SECONDS = 60 * 60 * 24;

interface CloudflareCacheStorage extends CacheStorage {
	default?: Cache;
}

function getEdgeCache(): Cache | null {
	const cacheStorage = (globalThis as { caches?: CloudflareCacheStorage }).caches;
	return cacheStorage?.default ?? null;
}

function createTranscriptCacheKey(requestUrl: string, videoId: string, lang: string): Request {
	const url = new URL(requestUrl);
	url.pathname = "/api/transcript/cache";
	url.search = new URLSearchParams({
		videoId,
		lang,
	}).toString();
	return new Request(url.toString(), { method: "GET" });
}

async function readCachedTranscript(requestUrl: string, videoId: string, lang: string): Promise<Response | null> {
	const edgeCache = getEdgeCache();
	if (!edgeCache) {
		return null;
	}

	const cachedResponse = await edgeCache.match(createTranscriptCacheKey(requestUrl, videoId, lang));
	if (!cachedResponse) {
		return null;
	}

	const headers = new Headers(cachedResponse.headers);
	headers.set("X-Transcript-Cache", "HIT");
	return new Response(cachedResponse.body, {
		status: cachedResponse.status,
		headers,
	});
}

async function readCachedTranscriptAnyLang(requestUrl: string, videoId: string): Promise<Response | null> {
	for (const tryLang of supportedLangs) {
		const cachedResponse = await readCachedTranscript(requestUrl, videoId, tryLang);
		if (cachedResponse) {
			return cachedResponse;
		}
	}
	return null;
}

async function putCachedTranscript(
	requestUrl: string,
	videoId: string,
	lang: string,
	response: Response
): Promise<void> {
	const edgeCache = getEdgeCache();
	if (!edgeCache) {
		return;
	}

	await edgeCache.put(createTranscriptCacheKey(requestUrl, videoId, lang), response.clone());
}

export const POST: RequestHandler = async ({ request }) => {
	const { url, lang = "en" } = await request.json();
	const t = getTranslation(lang);

	if (!url) {
		return json({ error: t.errorUrlRequired }, { status: 400 });
	}

	const videoId = extractVideoId(url);
	if (!videoId) {
		return json({ error: t.errorInvalidUrl }, { status: 400 });
	}

	const cachedResponse = await readCachedTranscript(request.url, videoId, lang);
	if (cachedResponse) {
		return cachedResponse;
	}

	const langsToTry = [lang, ...supportedLangs.filter((supportedLang) => supportedLang !== lang), undefined];

	try {
		const transcript = await fetchTranscriptWithFallback(videoId, langsToTry);
		if (transcript.length === 0) {
			const fallbackCachedResponse = await readCachedTranscriptAnyLang(request.url, videoId);
			if (fallbackCachedResponse) {
				return fallbackCachedResponse;
			}
			return json({ error: t.errorFetchFailed }, { status: 500 });
		}

		const srt = transcriptToSrt(transcript);
		const text = transcriptToText(transcript);
		const response = json(
			{ srt, text, videoId },
			{
				headers: {
					"Cache-Control": `public, max-age=${TRANSCRIPT_CACHE_SECONDS}, stale-while-revalidate=604800`,
					"X-Transcript-Cache": "MISS",
				},
			}
		);
		await putCachedTranscript(request.url, videoId, lang, response);
		return response;
	} catch {
		const fallbackCachedResponse = await readCachedTranscriptAnyLang(request.url, videoId);
		if (fallbackCachedResponse) {
			return fallbackCachedResponse;
		}
		return json({ error: t.errorFetchFailed }, { status: 500 });
	}
};
