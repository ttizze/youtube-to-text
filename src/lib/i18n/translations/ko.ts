import type { Translation } from './ja';

export const ko: Translation = {
	lang: 'ko',
	langName: '한국어',

	// Meta / SEO
	siteName: 'YouTube 자막 추출기',
	siteDescription:
		'YouTube 동영상에서 자막을 쉽게 추출하세요. 텍스트 또는 SRT 형식으로 복사하거나 다운로드할 수 있습니다. 무료 온라인 도구.',
	keywords:
		'YouTube,자막,추출,캡션,SRT,텍스트,다운로드,스크립트,무료,온라인',

	// UI
	pageTitle: 'YouTube 자막 추출기',
	urlPlaceholder: 'YouTube URL을 입력하세요',
	fetchButton: '자막 가져오기',
	fetchingButton: '가져오는 중...',
	viewModeText: '텍스트',
	viewModeSrt: 'SRT',
	copyButton: '복사',
	copiedButton: '복사됨!',
	downloadText: '텍스트로 다운로드',
	downloadSrt: 'SRT로 다운로드',

	// Errors
	errorUrlRequired: 'URL이 필요합니다',
	errorInvalidUrl: '유효하지 않은 YouTube URL입니다',
	errorNoSubtitles: '이 동영상에는 자막이 없습니다',
	errorFetchFailed: '자막을 가져오지 못했습니다. 이 동영상에는 자막이 없을 수 있습니다.'
};
