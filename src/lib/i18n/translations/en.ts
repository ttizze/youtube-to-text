import type { Translation } from './ja';

export const en: Translation = {
	lang: 'en',
	langName: 'English',

	// Meta / SEO
	siteName: 'YouTube Subtitle Extractor',
	siteDescription:
		'Easily extract subtitles and captions from YouTube videos. Copy or download in text or SRT format. Free online tool.',
	keywords:
		'YouTube,subtitles,extract,captions,SRT,text,download,transcript,free,online',

	// UI
	pageTitle: 'YouTube Subtitle Extractor',
	urlPlaceholder: 'Enter YouTube URL',
	fetchButton: 'Get Subtitles',
	fetchingButton: 'Fetching...',
	viewModeText: 'Text',
	viewModeSrt: 'SRT',
	copyButton: 'Copy',
	copiedButton: 'Copied!',
	downloadText: 'Download as Text',
	downloadSrt: 'Download as SRT',

	// Errors
	errorUrlRequired: 'URL is required',
	errorInvalidUrl: 'Invalid YouTube URL',
	errorNoSubtitles: 'This video has no subtitles',
	errorFetchFailed: 'Failed to fetch subtitles. This video may not have subtitles available.'
};
