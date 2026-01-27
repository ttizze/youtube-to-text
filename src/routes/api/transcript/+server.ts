import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

function extractVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/^([a-zA-Z0-9_-]{11})$/
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

function vttToSrt(vtt: string): string {
	const lines = vtt.split('\n');
	const srtLines: string[] = [];
	let counter = 1;
	let i = 0;

	// Skip WEBVTT header
	while (i < lines.length && !lines[i].includes('-->')) {
		i++;
	}

	while (i < lines.length) {
		const line = lines[i].trim();

		if (line.includes('-->')) {
			// Convert timestamp format: 00:00:00.000 --> 00:00:00.000 to 00:00:00,000 --> 00:00:00,000
			const timestamp = line.replace(/\./g, ',').replace(/<[^>]*>/g, '');
			srtLines.push(String(counter));
			srtLines.push(timestamp);
			counter++;
			i++;

			// Collect text lines until empty line or next timestamp
			const textLines: string[] = [];
			while (i < lines.length) {
				const textLine = lines[i].trim();
				if (textLine === '' || textLine.includes('-->')) {
					break;
				}
				// Remove VTT formatting tags
				const cleanText = textLine.replace(/<[^>]*>/g, '');
				if (cleanText) {
					textLines.push(cleanText);
				}
				i++;
			}
			srtLines.push(textLines.join('\n'));
			srtLines.push('');
		} else {
			i++;
		}
	}

	return srtLines.join('\n');
}

function vttToText(vtt: string): string {
	const lines = vtt.split('\n');
	const textLines: string[] = [];
	let i = 0;

	// Skip WEBVTT header
	while (i < lines.length && !lines[i].includes('-->')) {
		i++;
	}

	while (i < lines.length) {
		const line = lines[i].trim();

		if (line.includes('-->')) {
			i++;
			// Collect text lines
			while (i < lines.length) {
				const textLine = lines[i].trim();
				if (textLine === '' || textLine.includes('-->')) {
					break;
				}
				const cleanText = textLine.replace(/<[^>]*>/g, '');
				if (cleanText) {
					textLines.push(cleanText);
				}
				i++;
			}
		} else {
			i++;
		}
	}

	return textLines.join('\n');
}

export const POST: RequestHandler = async ({ request }) => {
	const { url } = await request.json();

	if (!url) {
		return json({ error: 'URLが必要です' }, { status: 400 });
	}

	const videoId = extractVideoId(url);
	if (!videoId) {
		return json({ error: '無効なYouTube URLです' }, { status: 400 });
	}

	const tempId = randomUUID();
	const tempPath = join(tmpdir(), tempId);
	const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

	try {
		// Try to download Japanese subtitles first, then fall back to auto-generated
		const cmd = `yt-dlp --write-auto-sub --sub-lang ja --skip-download -o "${tempPath}" "${youtubeUrl}" 2>&1`;
		await execAsync(cmd, { timeout: 30000 });

		// Check if VTT file was created
		const vttPath = `${tempPath}.ja.vtt`;
		let vttContent: string;

		try {
			vttContent = await readFile(vttPath, 'utf-8');
		} catch {
			return json({ error: 'この動画には字幕がありません' }, { status: 404 });
		}

		const srt = vttToSrt(vttContent);
		const text = vttToText(vttContent);

		// Cleanup temp file
		try {
			await unlink(vttPath);
		} catch {
			// Ignore cleanup errors
		}

		return json({ srt, text, videoId });
	} catch (error) {
		console.error('Transcript fetch error:', error);
		return json(
			{ error: '字幕の取得に失敗しました。この動画には字幕がないか、取得できません。' },
			{ status: 500 }
		);
	}
};
