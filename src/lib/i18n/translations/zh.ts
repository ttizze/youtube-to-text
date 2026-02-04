import type { Translation } from './ja';

export const zh: Translation = {
	lang: 'zh',
	langName: '中文',

	// Meta / SEO
	siteName: 'YouTube 字幕提取器',
	siteDescription:
		'轻松提取 YouTube 视频的字幕。可复制或下载为文本或 SRT 格式。免费在线工具。',
	keywords:
		'YouTube,字幕,提取,caption,SRT,文本,下载,转录,免费,在线',

	// UI
	pageTitle: 'YouTube 字幕提取器',
	urlPlaceholder: '输入 YouTube 网址',
	fetchButton: '获取字幕',
	fetchingButton: '获取中...',
	viewModeText: '文本',
	viewModeSrt: 'SRT',
	copyButton: '复制',
	copiedButton: '已复制!',
	downloadText: '下载为文本',
	downloadSrt: '下载为 SRT',

	// Errors
	errorUrlRequired: '请输入网址',
	errorInvalidUrl: '无效的 YouTube 网址',
	errorNoSubtitles: '此视频没有字幕',
	errorFetchFailed: '获取字幕失败。此视频可能没有可用的字幕。',

	// FAQ
	faq: [
		{
			question: '如何从 YouTube 视频中提取字幕？',
			answer: '只需将 YouTube 视频网址粘贴到输入框中，然后点击"获取字幕"。工具将自动提取可用的字幕。'
		},
		{
			question: '可以下载哪些格式的字幕？',
			answer: '您可以下载纯文本格式（.txt）或包含时间戳的 SRT 字幕格式（.srt）。'
		},
		{
			question: '这个工具免费吗？',
			answer: '是的，这个工具完全免费，无需注册。'
		},
		{
			question: '为什么某些视频没有字幕？',
			answer: '某些视频可能未被上传者启用字幕，或者自动生成的字幕无法提取。'
		}
	]
};
