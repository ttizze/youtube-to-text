import { json } from "@sveltejs/kit";
import { YoutubeTranscript } from "youtube-transcript";
import type { RequestHandler } from "./$types";
import { getTranslation, supportedLangs } from "$lib/i18n";

function extractVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/^([a-zA-Z0-9_-]{11})$/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

function formatTimestamp(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);
	const ms = Math.floor((seconds % 1) * 1000);

	if (hours > 0) {
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
	}
	return `00:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

interface TranscriptItem {
	text: string;
	offset: number;
	duration: number;
}

function transcriptToSrt(items: TranscriptItem[]): string {
	return items
		.map((item, index) => {
			const startTime = item.offset / 1000;
			const endTime = (item.offset + item.duration) / 1000;
			return `${index + 1}\n${formatTimestamp(startTime)} --> ${formatTimestamp(endTime)}\n${item.text}\n`;
		})
		.join("\n");
}

function transcriptToText(items: TranscriptItem[]): string {
	return items.map((item) => item.text).join("\n");
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

	// Try with preferred language first, then fallback
	const langsToTry = [lang, ...supportedLangs.filter((l) => l !== lang), undefined];

	for (const tryLang of langsToTry) {
		try {
			const transcript = await YoutubeTranscript.fetchTranscript(
				videoId,
				tryLang ? { lang: tryLang } : undefined
			);

			if (transcript && transcript.length > 0) {
				const srt = transcriptToSrt(transcript);
				const text = transcriptToText(transcript);
				return json({ srt, text, videoId });
			}
		} catch {
			// Try next language
			continue;
		}
	}

	return json({ error: t.errorFetchFailed }, { status: 500 });
};
