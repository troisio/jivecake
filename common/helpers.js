export const getUserLanguage = (user, navigator = null) => {
	if (user.selectedLanguage !== null) {
		return user.selectedLanguage;
	}

	if (user.lastLanguage !== null) {
		return user.lastLanguage;
	}

	if (navigator !== null) {
		if (navigator.languages) {
			return navigator.languages[0];
		}

		if (navigator.language) {
			return navigator.language;
		}
	}

	return 'en';
}
