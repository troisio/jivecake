import i18n from 'i18next';
import fr from 'i18n/fr/translation.json';
import ko from 'i18n/ko/translation.json';
import es from 'i18n/es/translation.json';
import { SUPPORTED_LANGUAGE_IDS } from 'common/models';

i18n.init({
  preload: SUPPORTED_LANGUAGE_IDS,
  fallbackLng: 'en',
  initImmediate: false,
  resources: {
    ko: {
      translation: ko
    },
    fr: {
      translation: fr
    },
    es: {
      translation: es
    }
  },
  interpolation: {
    escapeValue: false
  }
});

export const T = i18n.t.bind(i18n);
