import { json } from "@sveltejs/kit";
import { YoutubeTranscript } from "youtube-transcript";
import type { RequestHandler } from "./$types";

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
	const { url } = await request.json();

	if (!url) {
		return json({ error: "URLが必要です" }, { status: 400 });
	}

	const videoId = extractVideoId(url);
	if (!videoId) {
		return json({ error: "無効なYouTube URLです" }, { status: 400 });
	}

	try {
		const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
			lang: "ja",
		});

		if (!transcript || transcript.length === 0) {
			return json({ error: "この動画には字幕がありません" }, { status: 404 });
		}

		const srt = transcriptToSrt(transcript);
		const text = transcriptToText(transcript);

		return json({ srt, text, videoId });
	} catch (error) {
		console.error("Transcript fetch error:", error);

		// Try without language specification
		try {
			const transcript = await YoutubeTranscript.fetchTranscript(videoId);

			if (!transcript || transcript.length === 0) {
				return json({ error: "この動画には字幕がありません" }, { status: 404 });
			}

			const srt = transcriptToSrt(transcript);
			const text = transcriptToText(transcript);

			return json({ srt, text, videoId });
		} catch {
			return json(
				{
					error:
						"字幕の取得に失敗しました。この動画には字幕がないか、取得できません。",
				},
				{ status: 500 },
			);
		}
	}
};
