import { describe, expect, it, vi } from "vitest";
import { extractVideoId, fetchTranscriptWithFallback, parseTranscriptBody } from "./service";

describe("extractVideoId", () => {
	it("主要な YouTube URL パターンを抽出できる", () => {
		expect(extractVideoId("RZELBd78SDc")).toBe("RZELBd78SDc");
		expect(extractVideoId("https://youtu.be/RZELBd78SDc?si=57x4Pw1t-N1s90WM")).toBe(
			"RZELBd78SDc"
		);
		expect(extractVideoId("https://www.youtube.com/watch?v=RZELBd78SDc&t=12s")).toBe(
			"RZELBd78SDc"
		);
		expect(extractVideoId("https://www.youtube.com/embed/RZELBd78SDc")).toBe("RZELBd78SDc");
		expect(extractVideoId("https://www.youtube.com/shorts/RZELBd78SDc?feature=share")).toBe(
			"RZELBd78SDc"
		);
		expect(extractVideoId("https://www.youtube.com/live/RZELBd78SDc?feature=share")).toBe(
			"RZELBd78SDc"
		);
	});

	it("不正 URL は null を返す", () => {
		expect(extractVideoId("https://example.com/watch?v=RZELBd78SDc")).toBeNull();
		expect(extractVideoId("not-a-url")).toBeNull();
	});
});

describe("parseTranscriptBody", () => {
	it("format=3 の p/s 字幕を解析できる", () => {
		const xml = `<?xml version="1.0" encoding="utf-8" ?><timedtext format="3"><body>
<p t="440" d="8560"><s>自分</s><s t="279">が</s></p>
<p t="3790" d="5210" a="1"></p>
<p t="9000" d="4719"><s>悟れ</s><s t="360">に</s></p>
</body></timedtext>`;

		const actual = parseTranscriptBody(xml);

		expect(actual).toEqual([
			{ text: "自分が", offset: 440, duration: 8560 },
			{ text: "悟れに", offset: 9000, duration: 4719 },
		]);
	});

	it("legacy text 字幕を解析し、秒をミリ秒に変換する", () => {
		const xml = `<transcript><text start="0.44" dur="1.2">hello &amp; world</text><text start="2.0" dur="0.5">line&lt;br/&gt;2</text></transcript>`;

		const actual = parseTranscriptBody(xml);

		expect(actual).toEqual([
			{ text: "hello & world", offset: 440, duration: 1200 },
			{ text: "line\n2", offset: 2000, duration: 500 },
		]);
	});

	it("json3 字幕を解析できる", () => {
		const json3 = JSON.stringify({
			events: [
				{ tStartMs: 440, dDurationMs: 8560, segs: [{ utf8: "hello " }, { utf8: "world" }] },
				{ tStartMs: 9000, dDurationMs: 4719, segs: [{ utf8: "line\n2" }] },
			],
		});

		const actual = parseTranscriptBody(json3);

		expect(actual).toEqual([
			{ text: "hello world", offset: 440, duration: 8560 },
			{ text: "line\n2", offset: 9000, duration: 4719 },
		]);
	});
});

describe("fetchTranscriptWithFallback", () => {
	it("youtube-transcript が空配列を返したら innertube fallback で取得する", async () => {
		const watchHtml = `<!doctype html><html><script>var ytInitialData={};</script>"INNERTUBE_API_KEY":"test-key","INNERTUBE_CLIENT_VERSION":"2.20260206.08.00"</html>`;
		const playerResponse = {
			captions: {
				playerCaptionsTracklistRenderer: {
					captionTracks: [
						{ languageCode: "ja", baseUrl: "https://www.youtube.com/api/timedtext?v=RZELBd78SDc" },
					],
				},
			},
		};
		const timedText = `<?xml version="1.0" encoding="utf-8" ?><timedtext format="3"><body><p t="440" d="8560"><s>自分</s><s>が</s></p></body></timedtext>`;

		const fetchMock = vi.fn(async (input: string | URL | Request) => {
			const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
			if (url.includes("/watch")) {
				return new Response(watchHtml, { status: 200 });
			}
			if (url.includes("/youtubei/v1/player")) {
				return Response.json(playerResponse, { status: 200 });
			}
			if (url.includes("/api/timedtext")) {
				return new Response(timedText, { status: 200 });
			}
			return new Response("", { status: 404 });
		});

		const youtubeFetchTranscript = vi.fn().mockResolvedValue([]);

		const actual = await fetchTranscriptWithFallback("RZELBd78SDc", ["ja", undefined], {
			fetch: fetchMock as typeof fetch,
			youtubeFetchTranscript,
		});

		expect(actual).toEqual([{ text: "自分が", offset: 440, duration: 8560 }]);
		expect(fetchMock).toHaveBeenCalled();
	});

	it("youtube-transcript で取れた場合は fallback を使わない", async () => {
		const youtubeFetchTranscript = vi.fn().mockResolvedValue([
			{ text: "hello", offset: 0.44, duration: 1.2 },
		]);
		const fetchMock = vi.fn();

		const actual = await fetchTranscriptWithFallback("RZELBd78SDc", ["ja", undefined], {
			fetch: fetchMock as typeof fetch,
			youtubeFetchTranscript,
		});

		expect(actual).toEqual([{ text: "hello", offset: 440, duration: 1200 }]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("fallback は一時失敗時に再試行して復旧する", async () => {
		let watchCount = 0;
		const watchHtml = `<!doctype html><html>"INNERTUBE_API_KEY":"test-key","INNERTUBE_CLIENT_VERSION":"2.20260206.08.00"</html>`;
		const playerResponse = {
			captions: {
				playerCaptionsTracklistRenderer: {
					captionTracks: [{ languageCode: "ja", baseUrl: "https://www.youtube.com/api/timedtext?v=RZELBd78SDc" }],
				},
			},
		};
		const timedText = `<?xml version="1.0" encoding="utf-8" ?><timedtext format="3"><body><p t="440" d="8560"><s>自分</s><s>が</s></p></body></timedtext>`;

		const fetchMock = vi.fn(async (input: string | URL | Request) => {
			const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

			if (url.includes("/watch")) {
				watchCount += 1;
				if (watchCount === 1) {
					return new Response(`<html><title>Sorry...</title><div class="g-recaptcha"></div></html>`, {
						status: 200,
					});
				}
				return new Response(watchHtml, { status: 200 });
			}
			if (url.includes("/youtubei/v1/player")) {
				return Response.json(playerResponse, { status: 200 });
			}
			if (url.includes("/api/timedtext")) {
				return new Response(timedText, { status: 200 });
			}
			return new Response("", { status: 404 });
		});

		const youtubeFetchTranscript = vi.fn().mockResolvedValue([]);
		const actual = await fetchTranscriptWithFallback("RZELBd78SDc", ["ja", "en", undefined], {
			fetch: fetchMock as typeof fetch,
			youtubeFetchTranscript,
		});

		expect(actual).toEqual([{ text: "自分が", offset: 440, duration: 8560 }]);
		expect(watchCount).toBeGreaterThanOrEqual(2);
	});

	it("youtube-transcript には優先言語と無指定のみ投げる", async () => {
		const youtubeFetchTranscript = vi.fn().mockRejectedValue(new Error("blocked"));
		const fetchMock = vi.fn(async () => new Response("", { status: 404 }));

		await fetchTranscriptWithFallback("RZELBd78SDc", ["ja", "en", "es", undefined], {
			fetch: fetchMock as typeof fetch,
			youtubeFetchTranscript,
		});

		expect(youtubeFetchTranscript).toHaveBeenCalledTimes(2);
		expect(youtubeFetchTranscript).toHaveBeenNthCalledWith(1, "RZELBd78SDc", { lang: "ja" });
		expect(youtubeFetchTranscript).toHaveBeenNthCalledWith(2, "RZELBd78SDc", undefined);
	});
});
