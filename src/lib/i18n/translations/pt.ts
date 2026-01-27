import type { Translation } from './ja';

export const pt: Translation = {
	lang: 'pt',
	langName: 'Português',

	// Meta / SEO
	siteName: 'Extrator de Legendas do YouTube',
	siteDescription:
		'Extraia facilmente legendas e captions de vídeos do YouTube. Copie ou baixe em formato de texto ou SRT. Ferramenta online gratuita.',
	keywords:
		'YouTube,legendas,extrair,captions,SRT,texto,baixar,transcrição,grátis,online',

	// UI
	pageTitle: 'Extrator de Legendas do YouTube',
	urlPlaceholder: 'Digite a URL do YouTube',
	fetchButton: 'Obter Legendas',
	fetchingButton: 'Obtendo...',
	viewModeText: 'Texto',
	viewModeSrt: 'SRT',
	copyButton: 'Copiar',
	copiedButton: 'Copiado!',
	downloadText: 'Baixar como Texto',
	downloadSrt: 'Baixar como SRT',

	// Errors
	errorUrlRequired: 'URL é obrigatória',
	errorInvalidUrl: 'URL do YouTube inválida',
	errorNoSubtitles: 'Este vídeo não tem legendas',
	errorFetchFailed: 'Falha ao obter legendas. Este vídeo pode não ter legendas disponíveis.'
};
