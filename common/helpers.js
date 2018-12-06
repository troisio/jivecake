import { Language } from 'common/models';

export const OBJECT_ID_REGEX_PORTION = /[a-f0-9]{24}/i;

export const getUserLanguage = (user = null, navigator = null) => {
	let result = null;

	if (user !== null) {
		if (user.selectedLanguage !== null) {
			result = user.selectedLanguage;
		} else if (user.lastLanguage !== null) {
			result = user.lastLanguage;
		}
	}

	if (navigator !== null && result === null) {
		if (navigator.languages) {
			result = navigator.languages[0];
		}

		if (navigator.language) {
			result = navigator.language;
		}
	}

	if (result !== null) {
		if (result.startsWith('fr')) {
			return Language.fr;
		}

		if (result.startsWith('ko')) {
			return Language.ko;
		}
	}

	return Language.en;
}

export const getNavigatorLanguage = (navigator = null) => {
	return getUserLanguage(null, navigator);
}
