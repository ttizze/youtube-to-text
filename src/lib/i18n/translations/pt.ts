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
	errorFetchFailed: 'Falha ao obter legendas. Este vídeo pode não ter legendas disponíveis.',

	// FAQ
	faq: [
		{
			question: 'Como extraio legendas de um vídeo do YouTube?',
			answer: 'Basta colar a URL do vídeo do YouTube no campo de entrada e clicar em "Obter Legendas". A ferramenta extrairá automaticamente as legendas disponíveis.'
		},
		{
			question: 'Em quais formatos posso baixar as legendas?',
			answer: 'Você pode baixar legendas em formato de texto simples (.txt) ou em formato de legenda SRT (.srt) que inclui marcas de tempo.'
		},
		{
			question: 'Esta ferramenta é gratuita?',
			answer: 'Sim, esta ferramenta é completamente gratuita e não requer registro.'
		},
		{
			question: 'Por que as legendas não estão disponíveis para alguns vídeos?',
			answer: 'Alguns vídeos podem não ter legendas habilitadas pelo criador, ou as legendas automáticas podem não estar disponíveis para extração.'
		}
	]
};
