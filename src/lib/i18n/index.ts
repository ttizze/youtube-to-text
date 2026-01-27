import { ja, type Translation } from './translations/ja';
import { en } from './translations/en';
import { es } from './translations/es';
import { pt } from './translations/pt';
import { ko } from './translations/ko';
import { zh } from './translations/zh';

export const translations: Record<string, Translation> = {
	en,
	ja,
	es,
	pt,
	ko,
	zh
};

export const supportedLangs = Object.keys(translations) as Array<keyof typeof translations>;
export const defaultLang = 'en';

export function getTranslation(lang: string): Translation {
	return translations[lang] ?? translations[defaultLang];
}

export type { Translation };
