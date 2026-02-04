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
	errorFetchFailed: 'Error al obtener subtítulos. Este video puede no tener subtítulos disponibles.',

	// FAQ
	faq: [
		{
			question: '¿Cómo extraigo subtítulos de un video de YouTube?',
			answer: 'Simplemente pega la URL del video de YouTube en el campo de entrada y haz clic en "Obtener Subtítulos". La herramienta extraerá automáticamente los subtítulos disponibles.'
		},
		{
			question: '¿En qué formatos puedo descargar los subtítulos?',
			answer: 'Puedes descargar subtítulos en formato de texto plano (.txt) o en formato de subtítulos SRT (.srt) que incluye marcas de tiempo.'
		},
		{
			question: '¿Es gratuita esta herramienta?',
			answer: 'Sí, esta herramienta es completamente gratuita y no requiere registro.'
		},
		{
			question: '¿Por qué no están disponibles los subtítulos para algunos videos?',
			answer: 'Algunos videos pueden no tener subtítulos habilitados por el creador, o los subtítulos automáticos pueden no estar disponibles para extracción.'
		}
	]
};
