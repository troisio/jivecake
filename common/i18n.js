import i18n from 'i18next';
import fr from 'common/translation/fr.json';
import ko from 'common/translation/ko.json';

export const getT = new Promise((resolve, reject) => {
  i18n.init({
    debug: true,
    preload: ['ko', 'fr'],
    fallbackLng: 'en',
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
  }, function(err, t) {
    if (err) {
      reject(err);
    } else {
      resolve(t);
    }
  });
});
