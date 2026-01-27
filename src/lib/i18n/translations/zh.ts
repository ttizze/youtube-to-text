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
	errorFetchFailed: '获取字幕失败。此视频可能没有可用的字幕。'
};
