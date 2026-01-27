import type { Translation } from './ja';

export const es: Translation = {
	lang: 'es',
	langName: 'Español',

	// Meta / SEO
	siteName: 'Extractor de Subtítulos de YouTube',
	siteDescription:
		'Extrae fácilmente subtítulos y captions de videos de YouTube. Copia o descarga en formato de texto o SRT. Herramienta gratuita en línea.',
	keywords:
		'YouTube,subtítulos,extraer,captions,SRT,texto,descargar,transcripción,gratis,online',

	// UI
	pageTitle: 'Extractor de Subtítulos de YouTube',
	urlPlaceholder: 'Ingresa la URL de YouTube',
	fetchButton: 'Obtener Subtítulos',
	fetchingButton: 'Obteniendo...',
	viewModeText: 'Texto',
	viewModeSrt: 'SRT',
	copyButton: 'Copiar',
	copiedButton: '¡Copiado!',
	downloadText: 'Descargar como Texto',
	downloadSrt: 'Descargar como SRT',

	// Errors
	errorUrlRequired: 'Se requiere URL',
	errorInvalidUrl: 'URL de YouTube inválida',
	errorNoSubtitles: 'Este video no tiene subtítulos',
	errorFetchFailed: 'Error al obtener subtítulos. Este video puede no tener subtítulos disponibles.'
};
