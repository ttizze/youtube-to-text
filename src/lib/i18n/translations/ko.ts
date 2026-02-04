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
	errorFetchFailed: '자막을 가져오지 못했습니다. 이 동영상에는 자막이 없을 수 있습니다.',

	// FAQ
	faq: [
		{
			question: 'YouTube 동영상에서 자막을 어떻게 추출하나요?',
			answer: 'YouTube 동영상 URL을 입력란에 붙여넣고 "자막 가져오기" 버튼을 클릭하세요. 도구가 자동으로 사용 가능한 자막을 추출합니다.'
		},
		{
			question: '어떤 형식으로 자막을 다운로드할 수 있나요?',
			answer: '일반 텍스트 형식(.txt) 또는 타임스탬프가 포함된 SRT 자막 형식(.srt)으로 다운로드할 수 있습니다.'
		},
		{
			question: '이 도구는 무료인가요?',
			answer: '네, 이 도구는 가입 없이 완전히 무료로 사용할 수 있습니다.'
		},
		{
			question: '일부 동영상에서 자막을 사용할 수 없는 이유는 무엇인가요?',
			answer: '일부 동영상은 업로더가 자막을 활성화하지 않았거나, 자동 생성 자막을 추출할 수 없는 경우가 있습니다.'
		}
	]
};
