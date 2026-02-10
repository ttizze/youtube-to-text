import { YoutubeTranscript } from "youtube-transcript";

export interface TranscriptItem {
	text: string;
	offset: number;
	duration: number;
}

interface RawTranscriptItem {
	text: string;
	offset: number;
	duration: number;
}

interface CaptionTrack {
	languageCode: string;
	baseUrl: string;
}

interface TracklistRenderer {
	captionTracks?: CaptionTrack[];
}

interface PlayerResponse {
	captions?: {
		playerCaptionsTracklistRenderer?: TracklistRenderer;
	};
}

interface InnertubeClientConfig {
	clientName: "WEB" | "ANDROID";
	clientVersion: string;
	xYoutubeClientName: string;
	userAgent: string;
	contextClient: Record<string, string | number>;
}

export interface FetchTranscriptDependencies {
	fetch?: typeof fetch;
	youtubeFetchTranscript?: (
		videoId: string,
		config?: {
			lang: string;
		}
	) => Promise<RawTranscriptItem[]>;
}

const WEB_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";
const ANDROID_USER_AGENT = "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip";
const DEFAULT_WEB_CLIENT_VERSION = "2.20260206.08.00";
const DEFAULT_ANDROID_CLIENT_VERSION = "20.10.38";
const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const FALLBACK_RETRY_DELAYS_MS = [0, 300, 900];

export function extractVideoId(input: string): string | null {
	const value = input.trim();
	if (!value) {
		return null;
	}

	if (YOUTUBE_VIDEO_ID_REGEX.test(value)) {
		return value;
	}

	const candidates = value.includes("://") ? [value] : [`https://${value}`, value];

	for (const candidate of candidates) {
		const idFromUrl = extractVideoIdFromUrl(candidate);
		if (idFromUrl) {
			return idFromUrl;
		}
	}

	const hasYouTubeHostHint =
		value.includes("youtube.com") ||
		value.includes("youtu.be") ||
		value.includes("youtube-nocookie.com");
	if (!hasYouTubeHostHint) {
		return null;
	}

	const fallbackMatch =
		value.match(
			/(?:youtube\.com\/.*(?:v=|\/embed\/|\/shorts\/|\/live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
		) ?? null;
	return fallbackMatch?.[1] ?? null;
}

function extractVideoIdFromUrl(value: string): string | null {
	try {
		const url = new URL(value);
		const hostname = url.hostname.toLowerCase();

		if (hostname === "youtu.be") {
			const pathId = url.pathname.split("/").filter(Boolean)[0];
			return YOUTUBE_VIDEO_ID_REGEX.test(pathId ?? "") ? pathId : null;
		}

		const isYouTubeDomain =
			hostname.endsWith("youtube.com") || hostname.endsWith("youtube-nocookie.com");
		if (!isYouTubeDomain) {
			return null;
		}

		const queryId = url.searchParams.get("v");
		if (queryId && YOUTUBE_VIDEO_ID_REGEX.test(queryId)) {
			return queryId;
		}

		const pathSegments = url.pathname.split("/").filter(Boolean);
		if (pathSegments.length >= 2) {
			const [kind, id] = pathSegments;
			if (["embed", "shorts", "live", "v", "e"].includes(kind) && YOUTUBE_VIDEO_ID_REGEX.test(id)) {
				return id;
			}
		}

		return null;
	} catch {
		return null;
	}
}

export function transcriptToSrt(items: TranscriptItem[]): string {
	return items
		.map((item, index) => {
			const startTime = formatTimestamp(item.offset);
			const endTime = formatTimestamp(item.offset + item.duration);
			return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
		})
		.join("\n");
}

export function transcriptToText(items: TranscriptItem[]): string {
	return items.map((item) => item.text).join("\n");
}

export async function fetchTranscriptWithFallback(
	videoId: string,
	langsToTry: Array<string | undefined>,
	deps: FetchTranscriptDependencies = {}
): Promise<TranscriptItem[]> {
	const youtubeFetchTranscript =
		deps.youtubeFetchTranscript ??
		((targetVideoId, config) => YoutubeTranscript.fetchTranscript(targetVideoId, config));

	const normalizedLangs = normalizeLangs(langsToTry);
	const youtubeTranscriptLangs = buildYoutubeTranscriptLangs(normalizedLangs);

	for (const lang of youtubeTranscriptLangs) {
		try {
			const transcript = await youtubeFetchTranscript(videoId, lang ? { lang } : undefined);
			const normalized = normalizeYoutubeTranscriptItems(transcript);
			if (normalized.length > 0) {
				return normalized;
			}
		} catch {
			continue;
		}
	}

	const fetchImpl = deps.fetch ?? fetch;

	for (const delayMs of FALLBACK_RETRY_DELAYS_MS) {
		if (delayMs > 0) {
			await sleep(delayMs);
		}

		const fallbackResult = await fetchTranscriptFromInnertube(videoId, normalizedLangs, fetchImpl);
		if (fallbackResult.length > 0) {
			return fallbackResult;
		}
	}

	return [];
}

function normalizeLangs(langs: Array<string | undefined>): Array<string | undefined> {
	const seen = new Set<string>();
	const normalized: Array<string | undefined> = [];

	for (const lang of langs) {
		if (!lang) {
			continue;
		}

		const lowerLang = lang.toLowerCase();
		if (seen.has(lowerLang)) {
			continue;
		}

		seen.add(lowerLang);
		normalized.push(lowerLang);
	}

	normalized.push(undefined);
	return normalized;
}

function buildYoutubeTranscriptLangs(langs: Array<string | undefined>): Array<string | undefined> {
	const firstPreferredLang = langs.find((lang) => !!lang);
	const candidates = [firstPreferredLang, undefined];
	const deduped: Array<string | undefined> = [];
	for (const candidate of candidates) {
		if (deduped.includes(candidate)) {
			continue;
		}
		deduped.push(candidate);
	}
	return deduped;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeYoutubeTranscriptItems(items: RawTranscriptItem[]): TranscriptItem[] {
	return items
		.map((item) => ({
			text: normalizeCaptionText(item.text),
			offset: Math.max(0, Math.round(item.offset * 1000)),
			duration: Math.max(0, Math.round(item.duration * 1000)),
		}))
		.filter((item) => item.text.trim().length > 0);
}

function formatTimestamp(totalMs: number): string {
	const safeTotalMs = Math.max(0, Math.round(totalMs));
	const hours = Math.floor(safeTotalMs / 3_600_000);
	const minutes = Math.floor((safeTotalMs % 3_600_000) / 60_000);
	const seconds = Math.floor((safeTotalMs % 60_000) / 1_000);
	const ms = safeTotalMs % 1_000;

	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

async function fetchTranscriptFromInnertube(
	videoId: string,
	langsToTry: Array<string | undefined>,
	fetchImpl: typeof fetch
): Promise<TranscriptItem[]> {
	const watchPageUrls = [
		`https://www.youtube.com/watch?v=${videoId}&hl=en`,
		`https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1&hl=en`,
		`https://m.youtube.com/watch?v=${videoId}&hl=en`,
	];

	for (const watchPageUrl of watchPageUrls) {
		const watchPageResponse = await safeFetchText(fetchImpl, watchPageUrl, {
			headers: {
				"User-Agent": WEB_USER_AGENT,
				"Accept-Language": "en-US,en;q=0.8",
			},
		});
		if (!watchPageResponse || isBlockedBody(watchPageResponse)) {
			continue;
		}

		const directTracklist = extractTracklistFromWatchPage(watchPageResponse);
		if (directTracklist) {
			const directTranscript = await fetchTranscriptFromTracklist(
				directTracklist,
				langsToTry,
				fetchImpl,
				WEB_USER_AGENT
			);
			if (directTranscript.length > 0) {
				return directTranscript;
			}
		}

		const apiKey = watchPageResponse.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
		if (!apiKey) {
			continue;
		}

		const webClientVersion =
			watchPageResponse.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ??
			DEFAULT_WEB_CLIENT_VERSION;

		const clients: InnertubeClientConfig[] = [
			{
				clientName: "ANDROID",
				clientVersion: DEFAULT_ANDROID_CLIENT_VERSION,
				xYoutubeClientName: "3",
				userAgent: ANDROID_USER_AGENT,
				contextClient: {
					clientName: "ANDROID",
					clientVersion: DEFAULT_ANDROID_CLIENT_VERSION,
					androidSdkVersion: 30,
					hl: "en",
					gl: "US",
				},
			},
			{
				clientName: "WEB",
				clientVersion: webClientVersion,
				xYoutubeClientName: "1",
				userAgent: WEB_USER_AGENT,
				contextClient: {
					clientName: "WEB",
					clientVersion: webClientVersion,
					hl: "en",
					gl: "US",
					utcOffsetMinutes: 0,
				},
			},
		];

		for (const client of clients) {
			const tracklist = await fetchTracklist(fetchImpl, apiKey, videoId, client);
			if (!tracklist || !tracklist.captionTracks || tracklist.captionTracks.length === 0) {
				continue;
			}

			const transcript = await fetchTranscriptFromTracklist(
				tracklist,
				langsToTry,
				fetchImpl,
				client.userAgent
			);
			if (transcript.length > 0) {
				return transcript;
			}
		}
	}

	return [];
}

async function fetchTranscriptFromTracklist(
	tracklist: TracklistRenderer,
	langsToTry: Array<string | undefined>,
	fetchImpl: typeof fetch,
	userAgent: string
): Promise<TranscriptItem[]> {
	if (!tracklist.captionTracks || tracklist.captionTracks.length === 0) {
		return [];
	}

	const timedTextUrls = buildTimedTextUrlCandidates(tracklist.captionTracks, langsToTry);
	for (const timedTextUrl of timedTextUrls) {
		const transcriptBody = await safeFetchText(fetchImpl, timedTextUrl, {
			headers: {
				"User-Agent": userAgent,
				"Accept-Language": "en-US,en;q=0.8",
			},
		});
		if (!transcriptBody || isBlockedBody(transcriptBody)) {
			continue;
		}

		const parsed = parseTranscriptBody(transcriptBody);
		if (parsed.length > 0) {
			return parsed;
		}
	}

	return [];
}

async function fetchTracklist(
	fetchImpl: typeof fetch,
	apiKey: string,
	videoId: string,
	client: InnertubeClientConfig
): Promise<TracklistRenderer | null> {
	try {
		const response = await fetchImpl(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"User-Agent": client.userAgent,
				"X-YouTube-Client-Name": client.xYoutubeClientName,
				"X-YouTube-Client-Version": client.clientVersion,
				Origin: "https://www.youtube.com",
			},
			body: JSON.stringify({
				videoId,
				contentCheckOk: true,
				racyCheckOk: true,
				context: {
					client: client.contextClient,
				},
			}),
		});

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as PlayerResponse;
		return data.captions?.playerCaptionsTracklistRenderer ?? null;
	} catch {
		return null;
	}
}

function extractTracklistFromWatchPage(watchPageHtml: string): TracklistRenderer | null {
	const tracklistFromCaptionsSplit = extractTracklistFromCaptionsSplit(watchPageHtml);
	if (tracklistFromCaptionsSplit) {
		return tracklistFromCaptionsSplit;
	}

	const playerResponseJson = extractJsonObjectAfterMarker(watchPageHtml, "ytInitialPlayerResponse =");
	if (!playerResponseJson) {
		return null;
	}

	try {
		const playerResponse = JSON.parse(playerResponseJson) as PlayerResponse;
		return playerResponse.captions?.playerCaptionsTracklistRenderer ?? null;
	} catch {
		return null;
	}
}

function extractTracklistFromCaptionsSplit(watchPageHtml: string): TracklistRenderer | null {
	const splittedByCaptions = watchPageHtml.split('"captions":');
	if (splittedByCaptions.length <= 1) {
		return null;
	}

	const candidate = splittedByCaptions[1].split(',"videoDetails"')[0];
	if (!candidate) {
		return null;
	}

	try {
		const parsed = JSON.parse(candidate.replace(/\n/g, ""));
		return (parsed?.playerCaptionsTracklistRenderer as TracklistRenderer | undefined) ?? null;
	} catch {
		return null;
	}
}

function extractJsonObjectAfterMarker(source: string, marker: string): string | null {
	const markerIndex = source.indexOf(marker);
	if (markerIndex < 0) {
		return null;
	}

	const objectStart = source.indexOf("{", markerIndex + marker.length);
	if (objectStart < 0) {
		return null;
	}

	let depth = 0;
	let inString = false;
	let escaped = false;

	for (let index = objectStart; index < source.length; index += 1) {
		const char = source[index];
		if (inString) {
			if (escaped) {
				escaped = false;
				continue;
			}

			if (char === "\\") {
				escaped = true;
				continue;
			}

			if (char === '"') {
				inString = false;
			}
			continue;
		}

		if (char === '"') {
			inString = true;
			continue;
		}

		if (char === "{") {
			depth += 1;
			continue;
		}

		if (char === "}") {
			depth -= 1;
			if (depth === 0) {
				return source.slice(objectStart, index + 1);
			}
		}
	}

	return null;
}

function buildTimedTextUrlCandidates(
	tracks: CaptionTrack[],
	langsToTry: Array<string | undefined>
): string[] {
	const results: string[] = [];
	const seen = new Set<string>();
	const add = (url: string) => {
		if (!url || seen.has(url)) {
			return;
		}
		seen.add(url);
		results.push(url);
	};

	for (const lang of langsToTry) {
		if (!lang) {
			continue;
		}

		const matchedTrack = selectTrackByLanguage(tracks, lang);
		if (matchedTrack) {
			for (const url of withFormatVariants(matchedTrack.baseUrl)) {
				add(url);
			}
		}
	}

	for (const track of tracks) {
		for (const url of withFormatVariants(track.baseUrl)) {
			add(url);
		}
	}

	return results;
}

function withFormatVariants(baseUrl: string): string[] {
	const results: string[] = [];
	const seen = new Set<string>();
	const add = (url: string) => {
		if (!seen.has(url)) {
			seen.add(url);
			results.push(url);
		}
	};

	add(baseUrl);

	try {
		const url = new URL(baseUrl);
		url.searchParams.delete("fmt");
		add(url.toString());

		for (const fmt of ["srv3", "json3", "vtt"]) {
			const variant = new URL(url.toString());
			variant.searchParams.set("fmt", fmt);
			add(variant.toString());
		}
	} catch {
		// Keep base URL only.
	}

	return results;
}

function selectTrackByLanguage(tracks: CaptionTrack[], lang: string): CaptionTrack | null {
	const normalizedLang = lang.toLowerCase();
	const exact = tracks.find((track) => track.languageCode.toLowerCase() === normalizedLang);
	if (exact) {
		return exact;
	}

	const prefix = tracks.find((track) => track.languageCode.toLowerCase().startsWith(`${normalizedLang}-`));
	if (prefix) {
		return prefix;
	}

	const baseCode = normalizedLang.split("-")[0];
	return (
		tracks.find((track) => {
			const trackBaseCode = track.languageCode.toLowerCase().split("-")[0];
			return trackBaseCode === baseCode;
		}) ?? null
	);
}

async function safeFetchText(
	fetchImpl: typeof fetch,
	url: string,
	init?: RequestInit
): Promise<string | null> {
	try {
		const response = await fetchImpl(url, init);
		if (!response.ok) {
			return null;
		}
		const body = await response.text();
		return body.trim().length > 0 ? body : null;
	} catch {
		return null;
	}
}

function isBlockedBody(body: string): boolean {
	return body.includes("<title>Sorry") || body.includes("g-recaptcha");
}

export function parseTranscriptBody(body: string): TranscriptItem[] {
	const normalizedBody = body.trim();
	if (!normalizedBody || isBlockedBody(normalizedBody)) {
		return [];
	}

	if (normalizedBody.startsWith("{")) {
		const fromJson = parseJson3Transcript(normalizedBody);
		if (fromJson.length > 0) {
			return fromJson;
		}
	}

	const fromFormat3 = parseFormat3Xml(normalizedBody);
	if (fromFormat3.length > 0) {
		return fromFormat3;
	}

	return parseLegacyTextXml(normalizedBody);
}

function parseLegacyTextXml(xml: string): TranscriptItem[] {
	const matches = xml.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g);
	const items: TranscriptItem[] = [];

	for (const match of matches) {
		const attributes = match[1] ?? "";
		const content = match[2] ?? "";
		const startSeconds = parseNumberAttribute(attributes, "start");
		const durationSeconds = parseNumberAttribute(attributes, "dur") ?? 0;

		if (startSeconds === null) {
			continue;
		}

		const text = normalizeCaptionText(content);
		if (!text.trim()) {
			continue;
		}

		items.push({
			text,
			offset: Math.max(0, Math.round(startSeconds * 1000)),
			duration: Math.max(0, Math.round(durationSeconds * 1000)),
		});
	}

	return items;
}

function parseFormat3Xml(xml: string): TranscriptItem[] {
	const matches = xml.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g);
	const items: TranscriptItem[] = [];

	for (const match of matches) {
		const attributes = match[1] ?? "";
		const content = match[2] ?? "";
		const offsetMs = parseNumberAttribute(attributes, "t");
		const durationMs = parseNumberAttribute(attributes, "d") ?? 0;

		if (offsetMs === null) {
			continue;
		}

		const segments = [...content.matchAll(/<s\b[^>]*>([\s\S]*?)<\/s>/g)].map(
			(segment) => segment[1] ?? ""
		);
		const rawText = segments.length > 0 ? segments.join("") : content;
		const text = normalizeCaptionText(rawText);
		if (!text.trim()) {
			continue;
		}

		items.push({
			text,
			offset: Math.max(0, Math.round(offsetMs)),
			duration: Math.max(0, Math.round(durationMs)),
		});
	}

	return items;
}

function parseJson3Transcript(jsonBody: string): TranscriptItem[] {
	try {
		const data = JSON.parse(jsonBody) as {
			events?: Array<{
				tStartMs?: number;
				dDurationMs?: number;
				segs?: Array<{ utf8?: string }>;
			}>;
		};

		const items: TranscriptItem[] = [];
		for (const event of data.events ?? []) {
			if (typeof event.tStartMs !== "number") {
				continue;
			}

			const rawText = (event.segs ?? []).map((segment) => segment.utf8 ?? "").join("");
			const text = normalizeCaptionText(rawText);
			if (!text.trim()) {
				continue;
			}

			items.push({
				text,
				offset: Math.max(0, Math.round(event.tStartMs)),
				duration:
					typeof event.dDurationMs === "number" ? Math.max(0, Math.round(event.dDurationMs)) : 0,
			});
		}

		return items;
	} catch {
		return [];
	}
}

function parseNumberAttribute(attributes: string, attribute: string): number | null {
	const match = attributes.match(new RegExp(`${attribute}="([^"]+)"`));
	if (!match) {
		return null;
	}

	const value = Number.parseFloat(match[1]);
	return Number.isFinite(value) ? value : null;
}

function normalizeCaptionText(value: string): string {
	const lineBreakExpanded = value
		.replace(/&lt;br\s*\/?&gt;/gi, "\n")
		.replace(/<br\s*\/?>/gi, "\n");
	const tagsStripped = lineBreakExpanded.replace(/<[^>]+>/g, "");
	const decoded = decodeEntities(tagsStripped);
	return decoded.replace(/\r\n?/g, "\n").replace(/\u200b/g, "");
}

function decodeEntities(value: string): string {
	const namedEntities: Record<string, string> = {
		amp: "&",
		lt: "<",
		gt: ">",
		quot: '"',
		apos: "'",
		nbsp: " ",
	};

	return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, entity) => {
		if (entity.startsWith("#x") || entity.startsWith("#X")) {
			const codePoint = Number.parseInt(entity.slice(2), 16);
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : full;
		}

		if (entity.startsWith("#")) {
			const codePoint = Number.parseInt(entity.slice(1), 10);
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : full;
		}

		const named = namedEntities[entity.toLowerCase()];
		return named ?? full;
	});
}
