import { supportedLangs } from '$lib/i18n';

export function match(param: string): boolean {
	return supportedLangs.includes(param);
}
