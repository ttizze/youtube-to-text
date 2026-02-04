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
	errorFetchFailed: 'Failed to fetch subtitles. This video may not have subtitles available.',

	// FAQ
	faq: [
		{
			question: 'How do I extract subtitles from a YouTube video?',
			answer: 'Simply paste the YouTube video URL into the input field and click "Get Subtitles". The tool will automatically extract available subtitles.'
		},
		{
			question: 'What formats can I download subtitles in?',
			answer: 'You can download subtitles in plain text format (.txt) or SRT subtitle format (.srt) which includes timestamps.'
		},
		{
			question: 'Is this tool free to use?',
			answer: 'Yes, this tool is completely free to use with no registration required.'
		},
		{
			question: 'Why are subtitles not available for some videos?',
			answer: 'Some videos may not have subtitles enabled by the uploader, or the subtitles may be auto-generated and not available for extraction.'
		}
	]
};
