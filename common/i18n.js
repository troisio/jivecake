import i18n from 'i18next';
import fr from 'common/translation/fr.json';
import ko from 'common/translation/ko.json';
import { Language } from 'common/models';

i18n.init({
  preload: [Language.ko, Language.fr],
  fallbackLng: 'en',
  initImmediate: false,
  resources: {
    ko: {
      translation: ko
    },
    fr: {
      translation: fr
    }
  },
  interpolation: {
    escapeValue: false
  }
});

export const T = i18n.t.bind(i18n);
