export const ja = {
	lang: 'ja',
	langName: '日本語',

	// Meta / SEO
	siteName: 'YouTube 字幕抽出',
	siteDescription:
		'YouTubeの動画から字幕・キャプションを簡単に抽出。テキストやSRT形式でコピー・ダウンロードできる無料ツール。',
	keywords:
		'YouTube,字幕,抽出,キャプション,SRT,テキスト,ダウンロード,transcript,subtitle,無料',

	// UI
	pageTitle: 'YouTube 字幕抽出',
	urlPlaceholder: 'YouTube URLを入力',
	fetchButton: '字幕を取得',
	fetchingButton: '取得中...',
	viewModeText: 'テキスト',
	viewModeSrt: 'SRT',
	copyButton: 'コピー',
	copiedButton: 'コピーしました',
	downloadText: 'テキストでダウンロード',
	downloadSrt: 'SRTでダウンロード',

	// Errors
	errorUrlRequired: 'URLが必要です',
	errorInvalidUrl: '無効なYouTube URLです',
	errorNoSubtitles: 'この動画には字幕がありません',
	errorFetchFailed: '字幕の取得に失敗しました。この動画には字幕がないか、取得できません。'
};

export type Translation = {
	lang: string;
	langName: string;
	siteName: string;
	siteDescription: string;
	keywords: string;
	pageTitle: string;
	urlPlaceholder: string;
	fetchButton: string;
	fetchingButton: string;
	viewModeText: string;
	viewModeSrt: string;
	copyButton: string;
	copiedButton: string;
	downloadText: string;
	downloadSrt: string;
	errorUrlRequired: string;
	errorInvalidUrl: string;
	errorNoSubtitles: string;
	errorFetchFailed: string;
};
