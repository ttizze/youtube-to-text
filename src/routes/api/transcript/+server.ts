import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getTranslation, supportedLangs } from "$lib/i18n";
import {
	extractVideoId,
	fetchTranscriptWithFallback,
	transcriptToSrt,
	transcriptToText,
} from "$lib/transcript/service";

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

	const langsToTry = [lang, ...supportedLangs.filter((supportedLang) => supportedLang !== lang), undefined];

	try {
		const transcript = await fetchTranscriptWithFallback(videoId, langsToTry);
		if (transcript.length === 0) {
			return json({ error: t.errorFetchFailed }, { status: 500 });
		}

		const srt = transcriptToSrt(transcript);
		const text = transcriptToText(transcript);
		return json({ srt, text, videoId });
	} catch {
		return json({ error: t.errorFetchFailed }, { status: 500 });
	}
};
